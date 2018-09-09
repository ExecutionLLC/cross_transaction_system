const AsyncInitializedObject = require('../common/AsyncInitializedObject');

class BaseModel extends AsyncInitializedObject {
  constructor(chaincodeApi) {
    super();
    this._chaincodeApi = chaincodeApi;
  }
}

module.exports = BaseModel;
