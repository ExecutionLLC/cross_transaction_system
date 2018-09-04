const BaseService = require('./BaseService');
const ConflictError = require('../common/errors/ConflictError');
const NotFoundError = require('../common/errors/NotFoundError');

class ProcessingService extends BaseService {
  constructor(models) {
    super(models);
    this._processingModel = this._models.processingModel;
  }

  get(name) {
    return this._processingModel.isProcessingExists(name).then((isExists) => {
      if (!isExists) {
        throw new NotFoundError('Processing not found');
      }

      return this._processingModel.get(name);
    });
  }

  addProcessing(processing) {
    const { name } = processing;
    return this._processingModel.isProcessingExists(name).then((isExists) => {
      if (isExists) {
        throw new ConflictError('Processing already exists');
      }

      return this._processingModel.addProcessing(processing);
    });
  }
}

module.exports = ProcessingService;
