const AsyncInitializedObject = require('../common/AsyncInitializedObject');

class BaseModel extends AsyncInitializedObject {
  constructor(db, chaincodeApi) {
    super();
    this._db = db;
    this._chaincodeApi = chaincodeApi;
  }
}

module.exports = BaseModel;
