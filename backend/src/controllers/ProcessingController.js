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
    this._processingService.get(name).then((processing) => {
      this._sendJsonAndWriteResponseLog(requestId, response, processing);
    }).catch((error) => {
      this._sendErrorAndWriteResponseLogAndErrorLog(requestId, response, error);
    });
  }

  addProcessing(request, response) {
    const requestId = this._generateIdAndWriteRequestLog(request);

    const processing = request.body;

    this._processingService.addProcessing(processing).then(() => {
      this._sendOkAndWriteResponseLog(requestId, response);
    }).catch((error) => {
      this._sendErrorAndWriteResponseLogAndErrorLog(requestId, response, error);
    });
  }

  createRouter() {
    const router = new Express();

    router.get('/:name', this.get.bind(this));
    router.post('/', this.addProcessing.bind(this));

    return router;
  }
}

module.exports = ProcessingController;