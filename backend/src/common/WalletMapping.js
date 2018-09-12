const WALLET_MAPPING = {
  '0150007279': '24378400246845',
  '0150007280': '24378500246845',
  '0150007163': '24366800246845',
};

function tryToFixWalletId(walletId) {
  const walletIdStr = walletId.toString();

  if (WALLET_MAPPING[walletIdStr] !== undefined) {
    return WALLET_MAPPING[walletIdStr];
  }

  return walletIdStr;
}

module.exports = tryToFixWalletId;
