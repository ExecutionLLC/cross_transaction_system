const BaseService = require('./BaseService');
const Utils = require('../common/Utils');

class TransactionService extends BaseService {
  constructor(models, services) {
    super(models, services);
    this._transactionModel = this._models.transactionModel;
  }

  add(transaction) {
    Utils.checkObjProperties(
      transaction,
      [
        'processingName',
        'serviceName',
        'operatorName',
        'walletId',
        'amount',
        'comment',
      ],
    );

    if (!transaction.timestamp) {
      // eslint-disable-next-line no-param-reassign
      transaction.timestamp = +(new Date());
    }

    return this._transactionModel.add(transaction);
  }
}

module.exports = TransactionService;
