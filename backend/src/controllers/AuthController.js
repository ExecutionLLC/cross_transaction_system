const Express = require('express');
const BaseController = require('./BaseController');

class AuthController extends BaseController {
  get(request, response) {
    const requestId = this._generateIdAndWriteRequestLog(request);
    this._sendJsonAndWriteResponseLog(requestId, response, request.tokenData);
  }

  createRouter() {
    const router = new Express();

    router.get('/', this.get.bind(this));

    return router;
  }
}

module.exports = AuthController;
