const AsyncInitializedObject = require('../common/AsyncInitializedObject');

class BaseService extends AsyncInitializedObject {
  constructor(models) {
    super();
    this._models = models;
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
