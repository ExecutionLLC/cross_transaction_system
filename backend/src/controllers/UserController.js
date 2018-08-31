const Express = require('express');
const BaseController = require('./BaseController');

class UserController extends BaseController {
  constructor(services) {
    super(services);
    this._userService = this._services.userService;
  }

  get(request, response) {
    const requestId = this._generateIdAndWriteRequestLog(request);

    const { username } = request.params;
    this._userService.get(username).then((user) => {
      this._sendJsonAndWriteResponseLog(requestId, response, user);
    }).catch((error) => {
      this._sendErrorAndWriteResponseLogAndErrorLog(requestId, response, error);
    });
  }

  add(request, response) {
    const requestId = this._generateIdAndWriteRequestLog(request);

    const { username } = request.params;
    const { password } = request.body;

    this._userService.add(username, password).then(() => {
      this._sendOkAndWriteResponseLog(requestId, response);
    }).catch((error) => {
      this._sendErrorAndWriteResponseLogAndErrorLog(requestId, response, error);
    });
  }

  update(request, response) {
    const requestId = this._generateIdAndWriteRequestLog(request);

    const { username } = request.params;
    const { password } = request.body;

    this._userService.update(username, password).then(() => {
      this._sendOkAndWriteResponseLog(requestId, response);
    }).catch((error) => {
      this._sendErrorAndWriteResponseLogAndErrorLog(requestId, response, error);
    });
  }

  remove(request, response) {
    const requestId = this._generateIdAndWriteRequestLog(request);

    const { username } = request.params;

    this._userService.remove(username).then(() => {
      this._sendOkAndWriteResponseLog(requestId, response);
    }).catch((error) => {
      this._sendErrorAndWriteResponseLogAndErrorLog(requestId, response, error);
    });
  }

  createRouter() {
    const router = new Express();

    router.get('/:username', this.get.bind(this));
    router.post('/:username', this.add.bind(this));
    router.put('/:username', this.update.bind(this));
    router.delete('/:username', this.remove.bind(this));

    return router;
  }
}

module.exports = UserController;
