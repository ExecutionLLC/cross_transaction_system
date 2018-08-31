const AsyncInitializedObject = require('../common/AsyncInitializedObject');

class BaseModel extends AsyncInitializedObject {
  constructor(db) {
    super();
    this._db = db;
  }
}

module.exports = BaseModel;
