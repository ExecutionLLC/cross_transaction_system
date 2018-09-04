const BaseModel = require('./BaseModel');

class ProcessingModel extends BaseModel {
  get(name) {
    const request = this._chaincodeApi.createQueryRequest('getProcessing', [name]);
    return this._chaincodeApi.sendQueryRequest(request);
  }

  addProcessing(processing) {
    const request = this._chaincodeApi.createInvokeRequest('addProcessing', [JSON.stringify(processing)]);
    return this._chaincodeApi.sendInvokeRequest(request, true);
  }

  isProcessingExists(name) {
    const request = this._chaincodeApi.createQueryRequest('isProcessingExists', [name]);
    return this._chaincodeApi.sendQueryRequest(request);
  }
}

module.exports = ProcessingModel;
