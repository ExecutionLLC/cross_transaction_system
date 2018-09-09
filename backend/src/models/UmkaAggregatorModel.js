const BaseModel = require('./BaseModel');

class UmkaAggregatorModel extends BaseModel {
  getMinInsDate() {
    const request = this._chaincodeApi.createQueryRequest('getUserKeyValue', ['minInsDate']);
    return this._chaincodeApi.sendQueryRequest(request).then(result => new Date(result));
  }

  setMinInsDate(date) {
    const request = this._chaincodeApi.createInvokeRequest('setUserKeyValue', ['minInsDate', (+date).toString()]);
    return this._chaincodeApi.sendInvokeRequest(request, true);
  }
}

module.exports = UmkaAggregatorModel;
