const BaseModel = require('./BaseModel');

class TransactionModel extends BaseModel {
  add(transaction) {
    const request = this._chaincodeApi.createInvokeRequest('addTransaction', [JSON.stringify(transaction)]);
    return this._chaincodeApi.sendInvokeRequest(request);
  }
}

module.exports = TransactionModel;
