const Express = require('express');
const BaseController = require('./BaseController');

class ProcessingController extends BaseController {
  constructor(services) {
    super(services);
    this._transactionService = this._services.transactionService;
  }

  add(request, response) {
    const requestId = this._generateIdAndWriteRequestLog(request);

    const transaction = request.body;

    this._transactionService
      .add(transaction)
      .then((transactionId) => {
        this._sendJsonAndWriteResponseLog(requestId, response, { transactionId });
      })
      .catch((error) => {
        this._sendErrorAndWriteResponseLogAndErrorLog(requestId, response, error);
      });
  }

  createRouter() {
    const router = new Express();

    router.post('/', this.add.bind(this));

    return router;
  }
}

module.exports = ProcessingController;
