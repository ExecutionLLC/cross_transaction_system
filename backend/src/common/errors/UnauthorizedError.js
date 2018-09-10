const HttpStatusCodes = require('http-status-codes');
const ServerError = require('./ServerError');

class UnauthorizedError extends ServerError {
  constructor(message) {
    super(message || 'Unauthorized', HttpStatusCodes.UNAUTHORIZED);
    this.name = 'UnauthorizedError';
  }
}

module.exports = UnauthorizedError;
