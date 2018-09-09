const BaseModel = require('./BaseModel');

class ProcessingModel extends BaseModel {
  get(processingName) {
    const request = this._chaincodeApi.createQueryRequest('getProcessing', [processingName]);
    return this._chaincodeApi.sendQueryRequest(request);
  }

  getOperatorsList(processingName) {
    const request = this._chaincodeApi.createQueryRequest('getOperatorsList', [processingName]);
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

  isExternalServiceExists(serviceProcessingName, serviceName, parentProcessingName) {
    const requestArgs = [serviceProcessingName, serviceName, parentProcessingName];
    const request = this._chaincodeApi.createQueryRequest('isExternalServiceExists', requestArgs);
    return this._chaincodeApi.sendQueryRequest(request);
  }

  setServiceState(processingName, serviceName, isActive) {
    const requestArgs = [
      processingName,
      serviceName,
      isActive.toString(),
    ];
    const request = this._chaincodeApi.createInvokeRequest('setServiceState', requestArgs);
    return this._chaincodeApi.sendInvokeRequest(request, true);
  }

  setOperatorState(serviceProcessingName, serviceName, parentProcessingName, isActive) {
    const requestArgs = [
      serviceProcessingName,
      serviceName,
      parentProcessingName,
      isActive.toString(),
    ];
    const request = this._chaincodeApi.createInvokeRequest('setOperatorState', requestArgs);
    return this._chaincodeApi.sendInvokeRequest(request, true);
  }

  setExternalServiceState(serviceProcessingName, serviceName, parentProcessingName, isActive) {
    const requestArgs = [
      serviceProcessingName,
      serviceName,
      parentProcessingName,
      isActive.toString(),
    ];
    const request = this._chaincodeApi.createInvokeRequest('setExternalServiceState', requestArgs);
    return this._chaincodeApi.sendInvokeRequest(request, true);
  }

  getProcessingStats(processingName, startTimestamp, endTimestamp) {
    const requestArgs = [
      processingName,
      startTimestamp.toString(),
      endTimestamp.toString(),
    ];
    const request = this._chaincodeApi.createQueryRequest('getProcessingStats', requestArgs);
    return this._chaincodeApi.sendQueryRequest(request);
  }
}

module.exports = ProcessingModel;
