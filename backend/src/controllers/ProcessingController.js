const Express = require('express');
const BaseController = require('./BaseController');

class ProcessingController extends BaseController {
  constructor(services) {
    super(services);
    this._processingService = this._services.processingService;
  }

  get(request, response) {
    const requestId = this._generateIdAndWriteRequestLog(request);

    const { name } = request.params;

    this._processingService
      .get(name)
      .then((processing) => {
        this._sendJsonAndWriteResponseLog(requestId, response, processing);
      })
      .catch((error) => {
        this._sendErrorAndWriteResponseLogAndErrorLog(requestId, response, error);
      });
  }

  getOperatorsList(request, response) {
    const requestId = this._generateIdAndWriteRequestLog(request);

    const { name } = request.params;

    return this._processingService
      .getOperatorsList(name)
      .then((operatorsList) => {
        this._sendJsonAndWriteResponseLog(requestId, response, operatorsList);
      })
      .catch((error) => {
        this._sendErrorAndWriteResponseLogAndErrorLog(requestId, response, error);
      });
  }

  addProcessing(request, response) {
    const requestId = this._generateIdAndWriteRequestLog(request);

    const processing = request.body;

    this._processingService
      .addProcessing(processing)
      .then((transactionId) => {
        this._sendJsonAndWriteResponseLog(requestId, response, { transactionId });
      })
      .catch((error) => {
        this._sendErrorAndWriteResponseLogAndErrorLog(requestId, response, error);
      });
  }

  addService(request, response) {
    const requestId = this._generateIdAndWriteRequestLog(request);

    const { name } = request.params;
    const service = request.body;

    this._processingService
      .addService(name, service)
      .then((transactionId) => {
        this._sendJsonAndWriteResponseLog(requestId, response, { transactionId });
      })
      .catch((error) => {
        this._sendErrorAndWriteResponseLogAndErrorLog(requestId, response, error);
      });
  }

  addOperator(request, response) {
    const requestId = this._generateIdAndWriteRequestLog(request);

    const { name, serviceName } = request.params;
    const operator = request.body;

    this._processingService
      .addOperator(name, serviceName, operator)
      .then((transactionId) => {
        this._sendJsonAndWriteResponseLog(requestId, response, { transactionId });
      })
      .catch((error) => {
        this._sendErrorAndWriteResponseLogAndErrorLog(requestId, response, error);
      });
  }

  setServiceState(request, response) {
    const requestId = this._generateIdAndWriteRequestLog(request);

    const { name, serviceName } = request.params;
    const { isActive } = request.body;

    this._processingService
      .setServiceState(name, serviceName, isActive)
      .then((transactionId) => {
        this._sendJsonAndWriteResponseLog(requestId, response, { transactionId });
      })
      .catch((error) => {
        this._sendErrorAndWriteResponseLogAndErrorLog(requestId, response, error);
      });
  }

  setOperatorState(request, response) {
    const requestId = this._generateIdAndWriteRequestLog(request);

    const { name, serviceName, parentProcessingName } = request.params;
    const { isActive } = request.body;

    this._processingService
      .setOperatorState(name, serviceName, parentProcessingName, isActive)
      .then((transactionId) => {
        this._sendJsonAndWriteResponseLog(requestId, response, { transactionId });
      })
      .catch((error) => {
        this._sendErrorAndWriteResponseLogAndErrorLog(requestId, response, error);
      });
  }

  setExternalServiceState(request, response) {
    const requestId = this._generateIdAndWriteRequestLog(request);

    const { name, serviceProcessingName, serviceName } = request.params;
    const { isActive } = request.body;

    this._processingService
      .setExternalServiceState(serviceProcessingName, serviceName, name, isActive)
      .then((transactionId) => {
        this._sendJsonAndWriteResponseLog(requestId, response, { transactionId });
      })
      .catch((error) => {
        this._sendErrorAndWriteResponseLogAndErrorLog(requestId, response, error);
      });
  }

  getProcessingStats(request, response) {
    const requestId = this._generateIdAndWriteRequestLog(request);

    const { name } = request.params;
    const { startTimestamp, endTimestamp } = request.query;

    this._processingService
      .getProcessingStats(name, startTimestamp, endTimestamp)
      .then((processingStats) => {
        this._sendJsonAndWriteResponseLog(requestId, response, processingStats);
      })
      .catch((error) => {
        this._sendErrorAndWriteResponseLogAndErrorLog(requestId, response, error);
      });
  }

  createRouter() {
    const router = new Express();

    router.get('/:name', this.get.bind(this));
    router.get('/:name/operatorsList', this.getOperatorsList.bind(this));
    router.get('/:name/stats', this.getProcessingStats.bind(this));
    router.post('/', this.addProcessing.bind(this));
    router.post('/:name/services', this.addService.bind(this));
    router.post('/:name/services/:serviceName/operators', this.addOperator.bind(this));
    router.put('/:name/services/:serviceName', this.setServiceState.bind(this));
    router.put('/:name/services/:serviceName/operators/:parentProcessingName', this.setOperatorState.bind(this));
    router.put('/:name/externalServices/:serviceProcessingName/:serviceName', this.setExternalServiceState.bind(this));

    return router;
  }
}

module.exports = ProcessingController;
