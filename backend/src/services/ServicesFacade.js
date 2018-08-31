const AsyncInitializedObject = require('../common/AsyncInitializedObject');
const BaseService = require('./BaseService');
const UserService = require('./UserService');
const Utils = require('../common/Utils');

class ServicesFacade extends AsyncInitializedObject {
  constructor(models) {
    super();
    this._models = models;
    this.userService = new UserService(models);
  }

  _init() {
    const servicesInitPromises = this.getAllServices().map(service => service.init());
    return Promise.all(servicesInitPromises);
  }

  getAllServices() {
    return Utils.collectInstancesOf(this, BaseService);
  }

  start() {
    const servicesStartPromises = this.getAllServices().map(service => service.start());
    return Promise.all(servicesStartPromises);
  }

  stop() {
    const servicesStopPromises = this.getAllServices().map(service => service.stop());
    return Promise.all(servicesStopPromises);
  }
}

module.exports = ServicesFacade;
