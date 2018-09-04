const HttpStatusCodes = require('http-status-codes');
const ServerError = require('./errors/ServerError');

const DEFAULT_REQUEST_LOG_LEVEL = 'verbose';
const DEFAULT_RESPONSE_LOG_LEVEL = 'verbose';

let NEXT_REQUEST_ID = 1;

class RequestResponseHelper {
  static _generateRequestId() {
    return NEXT_REQUEST_ID++;
  }

  static sendOk(response) {
    response.status(HttpStatusCodes.OK);
    response.end();
  }

  static sendJson(response, data, statusCode) {
    response.status(statusCode || HttpStatusCodes.OK);
    response.json(data);
    response.end();
  }

  static sendError(response, error, errorHttpStatusCode) {
    const statusCode = errorHttpStatusCode || HttpStatusCodes.INTERNAL_SERVER_ERROR;
    const errorMessage = (error && error.message) ? error.message : 'Unknown error';

    response.status(statusCode);
    response.json({ error: errorMessage });
    response.end();
  }

  static writeRequestLog(logger, requestId, request, logLevel) {
    const {
      method, originalUrl, params, body,
    } = request;
    const paramsAsString = JSON.stringify(params);
    const bodyAsString = JSON.stringify(body);
    logger.log(
      logLevel || DEFAULT_REQUEST_LOG_LEVEL,
      `REQUEST (${requestId}) (method = "${method}"; URL = "${originalUrl}"; params = "${paramsAsString}"; body = "${bodyAsString}")`,
    );
  }

  static generateIdAndWriteRequestLog(logger, request, logLevel) {
    const requestId = RequestResponseHelper._generateRequestId();
    RequestResponseHelper.writeRequestLog(logger, requestId, request, logLevel);
    return requestId;
  }

  static writeResponseLog(logger, requestId, response, data, logLevel) {
    const { statusCode } = response;
    logger.log(
      logLevel || DEFAULT_RESPONSE_LOG_LEVEL,
      `RESPONSE (${requestId}) (statusCode = ${statusCode}; json = "${JSON.stringify(data)}")`,
    );
  }

  static writeResponseLogAndErrorLog(logger, requestId, response, error) {
    const { statusCode } = response;
    const errorMessage = (error && error.message) ? error.message : 'Unknown error';

    logger.error(
      `RESPONSE (${requestId}) (statusCode = ${statusCode}; errorMessage = "${errorMessage}")`,
    );
    if (error && error.stack) {
      logger.debug(`${error.stack}`);
    }
  }

  static sendOkAndWriteResponseLog(logger, requestId, response) {
    RequestResponseHelper.sendOk(response);
    RequestResponseHelper.writeResponseLog(logger, requestId, response, null);
  }

  static sendJsonAndWriteResponseLog(logger, requestId, response, data, statusCode, logLevel) {
    RequestResponseHelper.sendJson(response, data, statusCode);
    RequestResponseHelper.writeResponseLog(logger, requestId, response, data, logLevel);
  }

  static sendErrorAndWriteResponseLogAndErrorLog(logger, requestId, response, error) {
    const errorHttpStatusCode = error instanceof ServerError
      ? error.httpStatusCode
      : HttpStatusCodes.INTERNAL_SERVER_ERROR;

    RequestResponseHelper.sendError(response, error, errorHttpStatusCode);
    RequestResponseHelper.writeResponseLogAndErrorLog(logger, requestId, response, error);
  }
}

module.exports = RequestResponseHelper;
