const LoggersContainer = require('../common/LoggersContainer');

class AsyncInitializedObject {
  constructor() {
    this._logger = LoggersContainer.getLogger(this.constructor.name);
  }

  // common part
  init() {
    return this._init().then(() => this._logger.info('initialized'));
  }

  // private part used for specializations
  _init() {
    return new Promise(resolve => resolve());
  }
}

module.exports = AsyncInitializedObject;
