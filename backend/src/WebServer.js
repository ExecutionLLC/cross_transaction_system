const bodyParser = require('body-parser');
const cors = require('cors');
const Express = require('express');
const Http = require('http');

const { AuthTokenHelper } = require('./common/AuthTokenHelper');
const config = require('./common/Config');
const LoggersContainer = require('./common/LoggersContainer');
const RequestResponseHelper = require('./common/RequestResponseHelper');
const UnauthorizedError = require('./common/errors/UnauthorizedError');

class WebServer {
  constructor(models, services, controllers) {
    this._config = config.webserver;

    this._models = models;
    this._services = services;
    this._controllers = controllers;

    this._httpServer = Http.createServer();

    this._logger = LoggersContainer.getLogger('WebServer');
  }

  start() {
    return this._services.start()
      .then(() => this._controllers.createRouter())
      .then(apiRouter => this._createApp(apiRouter))
      .then(app => this._startHttpServer(app));
  }

  stop() {
    return new Promise((resolve, reject) => {
      this._httpServer.close();
      this._services.stop().then(resolve, reject);
    });
  }

  _createApp(apiRouter) {
    return new Promise((resolve) => {
      const app = new Express();

      app.use(cors());

      if (this._config.useTokens) {
        app.use((request, response, next) => {
          const token = request.header('x-access-token');
          if (!token) {
            next(new UnauthorizedError('Token is empty'));
          } else {
            const { tokensSecret } = this._config;
            AuthTokenHelper
              .decodeAndVerifyAuthToken(token, tokensSecret)
              .then((tokenData) => {
                request.tokenData = tokenData;
                next();
              }).catch(next);
          }
        });
      }

      app.use(bodyParser.json());
      app.use('/', apiRouter);
      app.use(this._handleErrors.bind(this));

      resolve(app);
    });
  }

  _startHttpServer(app) {
    return new Promise((resolve) => {
      const { port } = this._config;

      this._httpServer.on('request', app);
      this._httpServer.listen(port, () => {
        this._logger.info(`Server listening on port ${port}`);
      });
      resolve();
    });
  }

  // eslint-disable-next-line no-unused-vars
  _handleErrors(error, request, response, next) {
    RequestResponseHelper
      .sendErrorAndWriteResponseLogAndErrorLog(this._logger, null, response, error);
  }
}

module.exports = WebServer;
