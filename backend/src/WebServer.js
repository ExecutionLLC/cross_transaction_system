const bodyParser = require('body-parser');
const cors = require('cors');
const Express = require('express');
const Http = require('http');

const RequestResponseHelper = require('./common/RequestResponseHelper');
const config = require('./common/Config');
const LoggersContainer = require('./common/LoggersContainer');

class WebServer {
  constructor(models, services, controllers) {
    this._config = config.get('webserver');

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

      app.use(bodyParser.json());
      app.use(cors());
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

  _handleErrors(error, request, response) {
    RequestResponseHelper.sendError(response, error);
    const errorMessage = (error && error.message) ? error.message : 'Unknown error';
    this._logger.error(
      `${request.method} ${response.statusCode} ${request.url}: ${errorMessage}`,
    );
    if (error.stack) {
      this._logger.debug(error.stack);
    }
  }
}

module.exports = WebServer;
