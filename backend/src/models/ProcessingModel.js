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

  addService(service) {
    const request = this._chaincodeApi.createInvokeRequest('addService', [JSON.stringify(service)]);
    return this._chaincodeApi.sendInvokeRequest(request, true);
  }

  addOperator(operator) {
    const request = this._chaincodeApi.createInvokeRequest('addOperator', [JSON.stringify(operator)]);
    return this._chaincodeApi.sendInvokeRequest(request, true);
  }

  isProcessingExists(name) {
    const request = this._chaincodeApi.createQueryRequest('isProcessingExists', [name]);
    return this._chaincodeApi.sendQueryRequest(request);
  }

  isServiceExists(processingName, name) {
    const request = this._chaincodeApi.createQueryRequest('isServiceExists', [processingName, name]);
    return this._chaincodeApi.sendQueryRequest(request);
  }

  isOperatorExists(serviceProcessingName, serviceName, parentProcessingName) {
    const requestArgs = [serviceProcessingName, serviceName, parentProcessingName];
    const request = this._chaincodeApi.createQueryRequest('isOperatorExists', requestArgs);
    return this._chaincodeApi.sendQueryRequest(request);
  }
}

module.exports = ProcessingModel;
