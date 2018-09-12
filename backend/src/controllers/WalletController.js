const Express = require('express');
const BaseController = require('./BaseController');

const WALLET_MAPPING = {
  '0150007279': '24378400246845',
  '0150007280': '24378500246845',
  '0150007163': '24366800246845',
};

class WalletController extends BaseController {
  constructor(services) {
    super(services);
    this._walletService = this._services.walletService;
  }

  get(request, response) {
    const requestId = this._generateIdAndWriteRequestLog(request);

    const { processingName, walletId } = request.params;
    const { offset, limit } = request.query;

    const walletIdStr = walletId.toString();
    let walletIdStrFixed = walletIdStr;
    if (WALLET_MAPPING[walletIdStrFixed] !== undefined) {
      walletIdStrFixed = WALLET_MAPPING[walletIdStrFixed];
    }

    this._walletService
      .get(processingName, walletIdStrFixed, offset, limit)
      .then((wallet) => {
        this._sendJsonAndWriteResponseLog(requestId, response, wallet);
      })
      .catch((error) => {
        this._sendErrorAndWriteResponseLogAndErrorLog(requestId, response, error);
      });
  }

  add(request, response) {
    const requestId = this._generateIdAndWriteRequestLog(request);

    const wallet = request.body;

    this._walletService
      .add(wallet)
      .then((transactionId) => {
        this._sendJsonAndWriteResponseLog(requestId, response, { transactionId });
      })
      .catch((error) => {
        this._sendErrorAndWriteResponseLogAndErrorLog(requestId, response, error);
      });
  }

  createRouter() {
    const router = new Express();

    router.get('/:processingName/:walletId', this.get.bind(this));
    router.post('/', this.add.bind(this));

    return router;
  }
}

module.exports = WalletController;
