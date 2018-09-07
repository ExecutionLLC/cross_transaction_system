const AsyncInitializedObject = require('../common/AsyncInitializedObject');
const BaseService = require('./BaseService');
const config = require('../common/Config');
const ProcessingService = require('./ProcessingService');
const TransactionService = require('./TransactionService');
const UmkaAggregatorService = require('./UmkaAggregatorService');
const Utils = require('../common/Utils');
const WalletService = require('./WalletService');

class ServicesFacade extends AsyncInitializedObject {
  constructor(models) {
    super();
    this._models = models;
    this.processingService = new ProcessingService(models, this);
    this.transactionService = new TransactionService(models, this);
    this.walletService = new WalletService(models, this);

    this._config = config.services;

    if (this._config.useUmkaAggregator) {
      this.umkaAggregatorService = new UmkaAggregatorService(models, this);
    }
  }

  _init() {
    const servicesInitPromises = this.getAllServices().map(service => service.init());
    return Promise.all(servicesInitPromises);
  }

  getAllServices() {
    return Utils.collectInstancesOf(this, BaseService);
  }

  start() {
    const servicesStartPromises = this.getAllServices().map(service => service.start());
    return Promise.all(servicesStartPromises);
  }

  stop() {
    const servicesStopPromises = this.getAllServices().map(service => service.stop());
    return Promise.all(servicesStopPromises);
  }
}

module.exports = ServicesFacade;
