const AsyncInitializedObject = require('../common/AsyncInitializedObject');
const RequestResponseHelper = require('../common/RequestResponseHelper');

class BaseController extends AsyncInitializedObject {
  constructor(services) {
    super();
    this._services = services;
  }

  _generateIdAndWriteRequestLog(request, logLevel) {
    return RequestResponseHelper.generateIdAndWriteRequestLog(this._logger, request, logLevel);
  }

  _sendOkAndWriteResponseLog(requestId, response) {
    RequestResponseHelper.sendOkAndWriteResponseLog(this._logger, requestId, response);
  }

  _sendJsonAndWriteResponseLog(requestId, response, data, statusCode, logLevel) {
    RequestResponseHelper.sendJsonAndWriteResponseLog(
      this._logger, requestId, response, data, statusCode, logLevel,
    );
  }

  _sendErrorAndWriteResponseLogAndErrorLog(requestId, response, error, errorHttpStatusCode) {
    RequestResponseHelper.sendErrorAndWriteResponseLogAndErrorLog(
      this._logger, requestId, response, error, errorHttpStatusCode,
    );
  }
}

module.exports = BaseController;
