import fetchival from 'fetchival';


class APIError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
    this.message = message;
  }
}


const ERRORS = {
  UNKNOWN: 'UNKNOWN',
  NOT_FOUND: 'NOT_FOUND',
};


function getCardProcessingName() {
  return 'УМКА';
}

function getAuthHeaders() {
  return {
    'X-Access-Token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1dWlkIjoiZDUxMGNlNzEtY2U5NS00NTZkLWI1YjUtNGQwZjljYzY5ZmJiIiwidHlwZSI6IlBST0NFU1NJTkciLCJuYW1lIjoi0JrQvtGE0LXQvNCw0L0ifQ.Ec3JzmSGaeBkps4uolaOpxgslvyhpL6iiT8QRsFNlW8',
  };
}


function URLedAPI(url) {

  function getBaseUrl() {
    return url;
  }

  function translateWalletInfo(apiWalletInfo) {
    return {
      id: apiWalletInfo.id,
      balance: apiWalletInfo.balance + apiWalletInfo.balanceVirtualDiff,
    }
  }

  function enterWallet(walletId) {
    return fetchival(
      `${getBaseUrl()}wallet/${getCardProcessingName()}/${walletId}`,
      { headers: { ...getAuthHeaders() } }
    )
      .get({ limit: 0, offset: 0 })
      .then(translateWalletInfo)
      .catch(error => {
        if (error.response.status === 404) {
          throw new APIError(ERRORS.NOT_FOUND, 'wallet not found');
        } else {
          throw new APIError(ERRORS.UNKNOWN, error.response._bodyText)
        }
      });
  }

  function buyGood(walletId, cost, name) {
    return fetchival(
      `${getBaseUrl()}transaction`,
      { headers: { ...getAuthHeaders() } }
    )
      .post({
        processingName: 'Кофеман',
        serviceName: 'Кофе',
        operatorName: getCardProcessingName(),
        walletId: walletId,
        amount: -cost,
        comment: `Продажа кофе "${name}" в вендинговом автомате`,
      })
      .then(transaction => {
        return enterWallet(walletId)
          .then(walletInfo => ({ transaction, walletInfo }));
      })
      .catch(error => {
        throw new APIError(ERRORS.UNKNOWN, error.response._bodyText)
      });
  }


  function makeMoney(walletId, cost, name) {
    return fetchival(
      `${getBaseUrl()}transaction`,
      { headers: { ...getAuthHeaders() } }
    )
      .post({
        processingName: getCardProcessingName(),
        serviceName: 'Кофе',
        operatorName: getCardProcessingName(),
        walletId: walletId,
        amount: cost,
        comment: `Продажа кофе "${name}" в вендинговом автомате`,
      })
      .then(transaction => {
        return enterWallet(walletId)
          .then(walletInfo => ({ transaction, walletInfo }));
      });
  }

  // makeMoney('001', 1000, 'qwe').then(res => console.log(res));

  return {
    enterWallet,
    buyGood,
    checkBaseUrl
  };
}


function checkBaseUrl(baseUrl) {
  return fetchival(
    `${baseUrl}auth`,
    { headers: { ...getAuthHeaders() }}
  )
    .get()
    .then(res=> res && res.uuid);
}


export default {
  URLedAPI,
  checkBaseUrl,
  ERRORS,
};
