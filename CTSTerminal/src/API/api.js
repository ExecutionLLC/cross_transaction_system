import fetchival from 'fetchival';


function getBaseUrl() {
  return 'http://192.168.1.101:3001/';
}

function getCardProcessingName() {
  return 'УМКА';
}

function getAuthHeaders() {
  return {
    'X-Access-Token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1dWlkIjoiZDUxMGNlNzEtY2U5NS00NTZkLWI1YjUtNGQwZjljYzY5ZmJiIiwidHlwZSI6IlBST0NFU1NJTkciLCJuYW1lIjoi0JrQvtGE0LXQvNCw0L0ifQ.Ec3JzmSGaeBkps4uolaOpxgslvyhpL6iiT8QRsFNlW8',
  };
}

function enterWallet(walletId) {
  return fetchival(
    `${getBaseUrl()}wallet/${getCardProcessingName()}/${walletId}`,
    { headers: { ...getAuthHeaders() }}
  )
    .get()
    .then(walletInfo => ({ id: walletId, balance: walletInfo.balance + walletInfo.balanceVirtualDiff }));
}


export default {
  enterWallet,
  buyGood,
};
