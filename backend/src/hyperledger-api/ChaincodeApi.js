const EventEmitter = require('events');
const FabricClient = require('fabric-client');
const HttpStatusCodes = require('http-status-codes');

const AsyncInitializedObject = require('../common/AsyncInitializedObject');
const ChaincodeApiError = require('../common/errors/ChaincodeApiError');
const config = require('../common/Config');
const TransactionTimeoutError = require('../common/errors/TransactionTimeoutError');

const DEFAULT_TRANSACTION_TIMEOUT_MS = 30 * 1000;

const ENDORSER_TRANSACTION_CODE = 3;
const METADATA_VALIDATION_CODES_INDEX = 2;
const TX_STATUS_VALID = 'VALID';
const TX_STATUS_VALID_CODE = 0;

class ChaincodeApi extends AsyncInitializedObject {
  constructor() {
    super();

    const {
      storePath,
      channelName,
      chaincodeId,
      ordererUrl,
      peerUrl,
      eventhubUrl,
      username,
    } = config.hyperledger;

    this._fabricClient = new FabricClient();
    this._channel = this._fabricClient.newChannel(channelName);
    const peer = this._fabricClient.newPeer(peerUrl);
    this._channel.addPeer(peer);
    const orderer = this._fabricClient.newOrderer(ordererUrl);
    this._channel.addOrderer(orderer);
    this._eventHub = this._fabricClient.newEventHub();
    this._eventHub.setPeerAddr(eventhubUrl);

    this._chaincodeId = chaincodeId;
    this._storePath = storePath;
    this._username = username;

    this._eventEmitter = new EventEmitter();
  }

  _init() {
    return FabricClient.newDefaultKeyValueStore({ path: this._storePath }).then((storeState) => {
      this._fabricClient.setStateStore(storeState);

      const cryptoSuite = FabricClient.newCryptoSuite();
      const cryptoStore = FabricClient.newCryptoKeyStore({ path: this._storePath });
      cryptoSuite.setCryptoKeyStore(cryptoStore);
      this._fabricClient.setCryptoSuite(cryptoSuite);

      this._logger.info('Store successfully loaded');

      // get the enrolled user from persistence, this user will sign all requests
      return this._fabricClient.getUserContext(this._username, true);
    }).then((user) => {
      if (user && user.isEnrolled()) {
        this._logger.info('User loaded from store');
      } else {
        throw new Error('Failed to get user');
      }

      this._eventHub.registerBlockEvent(
        block => this._onBlockEvent(block),
        error => this._onEventHubError(error),
      );
      this._eventHub.connect();
    });
  }

  _parseAndEmitChaincodeEvents(block) {
    const envelopeDataArray = block.data.data;
    const validationCodeArray = block.metadata.metadata[METADATA_VALIDATION_CODES_INDEX];

    envelopeDataArray.forEach((envelope, index) => {
      if (validationCodeArray[index] !== TX_STATUS_VALID_CODE) {
        // we handle only valid transactions
        return;
      }

      const envelopePayload = envelope.payload;
      const channelHeader = envelopePayload.header.channel_header;

      if (channelHeader.type === ENDORSER_TRANSACTION_CODE) {
        const transaction = envelopePayload.data;
        const chaincodeActionPayload = transaction.actions[0].payload;
        const proposalResponsePayload = chaincodeActionPayload.action.proposal_response_payload;
        const transactionEvent = proposalResponsePayload.extension.events;

        if (transactionEvent && transactionEvent.chaincode_id) {
          this._onChaincodeEvent(transactionEvent);
        }
      }
    }, this);
  }

  _onBlockEvent(block) {
    this._logger.debug(`got new block event:\n${JSON.stringify(block.header, null, 2)}`);
    const {
      number: blockNumber,
      data_hash: blockHash,
      previous_hash: prevBlockHash,
    } = block.header;
    this._eventEmitter.emit('BLOCK_EVENT', blockNumber, blockHash, prevBlockHash);

    this._parseAndEmitChaincodeEvents(block);
  }

  _onTransactionEvent(transactionId, transactionStatus) {
    this._logger.info(`got new transaction event: ${transactionId} ${transactionStatus}`);
    this._eventEmitter.emit('TRANSACTION_EVENT', transactionId, transactionStatus);
  }

  _onChaincodeEvent(chaincodeEventObj) {
    const { event_name: chaincodeEventName, payload } = chaincodeEventObj;
    const chaincodeEventData = JSON.parse(payload.toString());
    this._logger.info(`got new chaincode event (${chaincodeEventName}): ${JSON.stringify(chaincodeEventData, null, 2)}`);
    this._eventEmitter.emit('CHAINCODE_EVENT', chaincodeEventName, chaincodeEventData);
  }

  _onEventHubError(error) {
    this._logger.error(`got event hub error: ${error}`);
    process.exit(1);
  }

  _sendProposal(request) {
    return this._channel.sendTransactionProposal(request).then(([proposalResponses, proposal]) => {
      if (!proposalResponses || proposalResponses.length === 0) {
        throw new ChaincodeApiError('Proposal response is empty');
      }

      let numberOfValidResponses = 0;
      proposalResponses.forEach((response) => {
        if (response instanceof Error) {
          this._logger.warn(`found error in proposal responses: ${response}`);
        } else if (!response.response) {
          this._logger.warn('found empty proposal response');
        } else if (response.response.status !== HttpStatusCodes.OK) {
          const statusCode = response.response.status;
          this._logger.warn(`found proposal response with status code != OK (code == ${statusCode})`);
        } else {
          ++numberOfValidResponses;
        }
      });

      if (numberOfValidResponses === 0) {
        throw new ChaincodeApiError('All proposal responses contain errors');
      }

      return {
        proposalResponses,
        proposal,
      };
    });
  }

  _sendTransaction(transactionId, proposalResult, waitTransactionStatus, timeout) {
    return new Promise((resolve, reject) => {
      let resultReturned = false;
      const timeoutHandle = waitTransactionStatus
        ? setTimeout(() => {
          resultReturned = true;
          reject(new TransactionTimeoutError());
        }, timeout) : null;

      const onSuccessEvent = (ignored, transactionStatus) => {
        this._onTransactionEvent(transactionId, transactionStatus);
        this._eventHub.unregisterTxEvent(transactionId);
        clearTimeout(timeoutHandle);

        if (!resultReturned && waitTransactionStatus) {
          if (transactionStatus === TX_STATUS_VALID) {
            resolve(transactionId);
          } else {
            const message = `Transaction status is not "VALID" (status == ${transactionStatus})`;
            reject(new ChaincodeApiError(message));
          }
        }
      };
      const onErrorEvent = (error) => {
        this._eventHub.unregisterTxEvent(transactionId);
        clearTimeout(timeoutHandle);

        if (!resultReturned && waitTransactionStatus) {
          reject(new ChaincodeApiError(`Unexpected event hub error (${error})`));
        }
      };
      this._eventHub.registerTxEvent(transactionId, onSuccessEvent, onErrorEvent);
      this._channel.sendTransaction(proposalResult).then(() => {
        this._logger.info(`transaction "${transactionId}" successfully sent`);
        if (!waitTransactionStatus) {
          resolve(transactionId);
        }
      }).catch((error) => {
        this._eventHub.unregisterTxEvent(transactionId);
        clearTimeout(timeoutHandle);
        reject(error);
      });
    });
  }

  static _normalizeTransientMap(transientMap) {
    if (!transientMap) {
      return transientMap;
    }

    const result = {};
    Object.keys(transientMap).forEach((key) => {
      const value = transientMap[key];
      if (typeof value === 'string' || value instanceof String) {
        result[key] = value;
      } else if (value instanceof Buffer) {
        result[key] = value.toString('base64');
      } else if (value instanceof Object) {
        const json = JSON.stringify(value);
        result[key] = Buffer.from(json).toString('base64');
      } else {
        throw new Error('transient value must be string, or Object, or Buffer');
      }
    });

    return result;
  }

  getEventEmitter() {
    return this._eventEmitter;
  }

  createQueryRequest(functionName, args, transientMap) {
    return {
      chaincodeId: this._chaincodeId,
      fcn: functionName,
      args,
      transientMap: ChaincodeApi._normalizeTransientMap(transientMap),
    };
  }

  sendQueryRequest(request) {
    return this._channel.queryByChaincode(request).then((response) => {
      if (response && response.length === 1) {
        if (response[0] instanceof Error) {
          throw response[0];
        }

        const jsonString = response[0].toString();
        if (!jsonString) {
          return null;
        }

        return JSON.parse(jsonString);
      }
      throw new ChaincodeApiError('Query response is empty');
    });
  }

  createInvokeRequest(functionName, args, transientMap) {
    const txId = this._fabricClient.newTransactionID();
    return {
      chainId: this._channel.getName(),
      chaincodeId: this._chaincodeId,
      fcn: functionName,
      txId,
      args,
      transientMap: ChaincodeApi._normalizeTransientMap(transientMap),
    };
  }

  sendInvokeRequest(request, waitTransactionStatus) {
    return this._sendProposal(request).then((proposalResult) => {
      const transactionId = request.txId.getTransactionID();
      return this._sendTransaction(
        transactionId,
        proposalResult,
        waitTransactionStatus,
        DEFAULT_TRANSACTION_TIMEOUT_MS,
      );
    });
  }
}

module.exports = ChaincodeApi;
