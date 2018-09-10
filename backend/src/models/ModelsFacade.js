const AsyncInitializedObject = require('../common/AsyncInitializedObject');
const BaseModel = require('./BaseModel');
const ChaincodeApi = require('../hyperledger-api/ChaincodeApi');
const ProcessingModel = require('./ProcessingModel');
const TransactionModel = require('./TransactionModel');
const UmkaAggregatorModel = require('./UmkaAggregatorModel');
const Utils = require('../common/Utils');
const WalletModel = require('./WalletModel');

class ModelsFacade extends AsyncInitializedObject {
  constructor() {
    super();

    this._chaincodeApi = new ChaincodeApi();

    this.processingModel = new ProcessingModel(this._chaincodeApi);
    this.transactionModel = new TransactionModel(this._chaincodeApi);
    this.umkaAggregatorModel = new UmkaAggregatorModel(this._chaincodeApi);
    this.walletModel = new WalletModel(this._chaincodeApi);
  }

  _init() {
    return this._initChaincodeApi()
      .then(() => {
        const modelsInitPromises = this.getAllModels().map(model => model.init());
        Promise.all(modelsInitPromises);
      });
  }

  getAllModels() {
    return Utils.collectInstancesOf(this, BaseModel);
  }

  _initChaincodeApi() {
    return this._chaincodeApi.init();
  }
}

module.exports = ModelsFacade;
