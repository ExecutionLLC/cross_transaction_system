import fetchival from 'fetchival';


function enterWallet(walletId) {
  let req;
  const mustSuccess = walletId.length % 2;
  if (mustSuccess) {
    req = fetchival('https://httpbin.org/anything').get({ walletId }).then(res => JSON.stringify(res).length);
  } else {
    req = fetchival('https://httpbin.org/status/500').get({ walletId });
  }
  req
    .then(json => console.log('qqq', json))
    .catch(err => console.log('eee', err));
}


export default {
  enterWallet,
};
