const BaseService = require('./BaseService');
const ConflictError = require('../common/errors/ConflictError');
const NotFoundError = require('../common/errors/NotFoundError');
const Utils = require('../common/Utils');

class WalletService extends BaseService {
  constructor(models, services) {
    super(models, services);
    this._processingModel = this._models.processingModel;
    this._walletModel = this._models.walletModel;
  }

  get(processingName, walletId, offset, limit) {
    return this._walletModel
      .isWalletExists(processingName, walletId)
      .then((isExists) => {
        if (!isExists) {
          throw new NotFoundError('Wallet not found');
        }

        return this._walletModel.get(processingName, walletId, offset, limit);
      });
  }

  add(wallet) {
    Utils.checkObjProperties(wallet, ['processingName', 'id', 'balance']);

    const { processingName, id: walletId } = wallet;
    return this._processingModel
      .isProcessingExists(processingName)
      .then((isExists) => {
        if (!isExists) {
          throw new NotFoundError('Processing not found');
        }

        return this._walletModel.isWalletExists(processingName, walletId);
      })
      .then((isExists) => {
        if (isExists) {
          throw new ConflictError('Wallet already exists');
        }

        return this._walletModel.addWallet(wallet);
      });
  }
}

module.exports = WalletService;
