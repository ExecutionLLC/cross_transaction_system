const winston = require('winston');
const config = require('./Config');

const { format } = winston;


class LoggersContainer {
  constructor() {
    this._config = config.logging;
    this._initTransports();
    this._loggers = Object.create(null);
  }

  _initTransports() {
    this._transports = [];

    const consoleLoglevel = this._config.console.loglevel;
    const fileLoglevel = this._config.file.loglevel;
    const filePath = this._config.file.path;

    if (consoleLoglevel) {
      const consoleTransport = new winston.transports.Console({
        level: consoleLoglevel,
        handleException: true,
        format: format.combine(
          format.colorize(),
          LoggersContainer._getDefaultFormat(),
        ),
      });
      consoleTransport.setMaxListeners(0);
      this._transports.push(consoleTransport);
    }

    if (fileLoglevel && filePath) {
      const fileTransport = new winston.transports.File({
        filename: filePath,
        level: fileLoglevel,
        handleException: true,
        format: LoggersContainer._getDefaultFormat(),
      });
      fileTransport.setMaxListeners(0);
      this._transports.push(fileTransport);
    }
  }

  static _getDefaultFormat() {
    return format.combine(
      format.splat(),
      format.timestamp(),
      format.printf(info => `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`),
    );
  }

  getLogger(name) {
    if (!this._loggers[name]) {
      this._loggers[name] = winston.createLogger({
        format: format.label({ label: name }),
        transports: this._transports,
        exitOnError: false,
      });
    }

    return this._loggers[name];
  }
}

module.exports = new LoggersContainer();
