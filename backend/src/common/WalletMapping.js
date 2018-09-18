const WALLET_MAPPING = {
};

function tryToFixWalletId(walletId) {
  const walletIdStr = walletId.toString();

  if (walletIdStr.length === 9) {
    return `0${walletIdStr}`;
  }
  if (walletIdStr.length === 13) {
    return `0${walletIdStr.slice(3, 12)}`;
  }

  if (WALLET_MAPPING[walletIdStr] !== undefined) {
    return WALLET_MAPPING[walletIdStr];
  }

  return walletIdStr;
}

module.exports = tryToFixWalletId;
