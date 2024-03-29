const BaseService = require('./BaseService');
const ConflictError = require('../common/errors/ConflictError');
const NotFoundError = require('../common/errors/NotFoundError');
const Utils = require('../common/Utils');

class ProcessingService extends BaseService {
  constructor(models, services) {
    super(models, services);
    this._processingModel = this._models.processingModel;
  }

  get(processingName) {
    return this._processingModel.isProcessingExists(processingName).then((isExists) => {
      if (!isExists) {
        throw new NotFoundError('Processing not found');
      }

      return this._processingModel.get(processingName);
    });
  }

  getOperatorsList(processingName) {
    return this._processingModel.getOperatorsList(processingName);
  }

  addProcessing(processing) {
    Utils.checkObjProperties(processing, ['name']);

    const { name } = processing;
    return this._processingModel.isProcessingExists(name).then((isExists) => {
      if (isExists) {
        throw new ConflictError('Processing already exists');
      }

      return this._processingModel.addProcessing(processing);
    });
  }

  addService(processingName, service) {
    Utils.checkObjProperties(
      service,
      [
        'name',
        'minBalanceLimit',
        'maxPerDayLimit',
        'isActive',
      ],
    );

    const { name } = service;
    const serviceInfo = Object.assign({}, service, { parentProcessingName: processingName });

    return this._processingModel
      .isProcessingExists(processingName)
      .then((isExists) => {
        if (!isExists) {
          throw new NotFoundError('Processing not found');
        }
        return this._processingModel.isServiceExists(processingName, name);
      })
      .then((isExists) => {
        if (isExists) {
          throw new ConflictError('Service already exists');
        }

        return this._processingModel.addService(serviceInfo);
      });
  }

  addOperator(processingName, serviceName, operator) {
    Utils.checkObjProperties(
      operator,
      [
        'parentProcessingName',
        'isActive',
      ],
    );

    const { parentProcessingName } = operator;
    const operatorInfo = Object.assign(
      {},
      operator,
      {
        serviceProcessingName: processingName,
        serviceName,
      },
    );

    return this._processingModel
      .isServiceExists(processingName, serviceName)
      .then((isExists) => {
        if (!isExists) {
          throw new NotFoundError('Service not found');
        }

        return this._processingModel.isOperatorExists(
          processingName,
          serviceName,
          parentProcessingName,
        );
      })
      .then((isExists) => {
        if (isExists) {
          throw new ConflictError('Operator already exists');
        }

        return this._processingModel.addOperator(operatorInfo);
      });
  }

  setServiceState(processingName, serviceName, isActive) {
    return this._processingModel
      .isServiceExists(processingName, serviceName)
      .then((isExists) => {
        if (!isExists) {
          throw new NotFoundError('Service not found');
        }

        return this._processingModel
          .setServiceState(
            processingName,
            serviceName,
            isActive,
          );
      });
  }

  setOperatorState(serviceProcessingName, serviceName, parentProcessingName, isActive) {
    return this._processingModel
      .isOperatorExists(serviceProcessingName, serviceName, parentProcessingName)
      .then((isExists) => {
        if (!isExists) {
          throw new NotFoundError('Operator not found');
        }

        return this._processingModel
          .setOperatorState(
            serviceProcessingName,
            serviceName,
            parentProcessingName,
            isActive,
          );
      });
  }

  setExternalServiceState(serviceProcessingName, serviceName, parentProcessingName, isActive) {
    return this._processingModel
      .isExternalServiceExists(serviceProcessingName, serviceName, parentProcessingName)
      .then((isExists) => {
        if (!isExists) {
          throw new NotFoundError('External service not found');
        }

        return this._processingModel
          .setExternalServiceState(
            serviceProcessingName,
            serviceName,
            parentProcessingName,
            isActive,
          );
      });
  }

  getProcessingStats(processingName, startTimestamp, endTimestamp) {
    return this._processingModel
      .isProcessingExists(processingName)
      .then((isExists) => {
        if (!isExists) {
          throw new NotFoundError('Processing not found');
        }
        const startTimestampFixed = startTimestamp || +(new Date());
        const endTimestampFixed = endTimestamp || startTimestampFixed;
        return this._processingModel
          .getProcessingStats(processingName, startTimestampFixed, endTimestampFixed);
      });
  }
}

module.exports = ProcessingService;
