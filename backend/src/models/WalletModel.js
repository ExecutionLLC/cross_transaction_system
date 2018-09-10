const BaseModel = require('./BaseModel');

class WalletModel extends BaseModel {
  get(processingName, walletId, offset, limit) {
    const offsetArg = offset ? offset.toString() : '0';
    const limitArg = limit ? limit.toString() : '50';
    const requestArgs = [processingName, walletId, offsetArg, limitArg];
    const request = this._chaincodeApi.createQueryRequest('getWallet', requestArgs);
    return this._chaincodeApi.sendQueryRequest(request);
  }

  add(wallet) {
    const request = this._chaincodeApi.createInvokeRequest('addWallet', [JSON.stringify(wallet)]);
    return this._chaincodeApi.sendInvokeRequest(request, true);
  }

  isWalletExists(processingName, walletId) {
    const request = this._chaincodeApi.createQueryRequest('isWalletExists', [processingName, walletId]);
    return this._chaincodeApi.sendQueryRequest(request);
  }

  updateWalletBalance(processingName, walletId, balanceTimestamp, balance) {
    const requestArgs = [processingName, walletId, balanceTimestamp.toString(), balance.toString()];
    const request = this._chaincodeApi.createInvokeRequest('updateWalletBalance', requestArgs);
    return this._chaincodeApi.sendInvokeRequest(request);
  }
}

module.exports = WalletModel;
