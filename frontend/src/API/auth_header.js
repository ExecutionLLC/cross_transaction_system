export function getAuthHeader() {
  // return authorization header with jwt token
  const user = JSON.parse(localStorage.getItem('user'));

  if (user && user.token) {
    return {
      'X-Access-Token': user.token,
    };
  }
  return {};
}
