const AsyncInitializedObject = require('../common/AsyncInitializedObject');

class BaseService extends AsyncInitializedObject {
  constructor(models, services) {
    super();
    this._models = models;
    this._services = services;
  }

  start() {
    return new Promise((resolve) => {
      resolve();
    });
  }

  stop() {
    return new Promise((resolve) => {
      resolve();
    });
  }
}

module.exports = BaseService;
