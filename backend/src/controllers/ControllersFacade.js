const Express = require('express');
const HttpStatusCodes = require('http-status-codes');
const AsyncInitializedObject = require('../common/AsyncInitializedObject');
const BaseController = require('./BaseController');
const RequestResponseHelper = require('../common/RequestResponseHelper');
const UserController = require('./UserController');
const Utils = require('../common/Utils');

class ControllersFacade extends AsyncInitializedObject {
  constructor(services) {
    super();
    this.userController = new UserController(services);
  }

  _init() {
    const controllersInitPromises = this.getAllControllers().map(controller => controller.init());
    return Promise.all(controllersInitPromises);
  }

  getAllControllers() {
    return Utils.collectInstancesOf(this, BaseController);
  }

  createRouter() {
    const router = new Express();

    router.use('/user', this.userController.createRouter());
    router.use(this._notFoundHandler.bind(this));

    return router;
  }

  _notFoundHandler(request, response) {
    RequestResponseHelper.sendJson(
      response,
      { error: 'Not found' },
      HttpStatusCodes.NOT_FOUND,
    );
    this._logger.warn(`${request.method} ${response.statusCode} ${request.url}`);
  }
}

module.exports = ControllersFacade;
