const Express = require('express');
const BaseController = require('./BaseController');
const tryToFixWalletId = require('../common/WalletMapping');

class WalletController extends BaseController {
  constructor(services) {
    super(services);
    this._walletService = this._services.walletService;
  }

  get(request, response) {
    const requestId = this._generateIdAndWriteRequestLog(request);

    const { processingName, walletId } = request.params;
    const { offset, limit } = request.query;

    const fixedWalletId = tryToFixWalletId(walletId);

    this._walletService
      .get(processingName, fixedWalletId, offset, limit)
      .then((wallet) => {
        const fixedWallet = Object.assign({}, wallet, { id: walletId });
        this._sendJsonAndWriteResponseLog(requestId, response, fixedWallet);
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
