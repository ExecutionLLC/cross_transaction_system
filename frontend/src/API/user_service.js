import request from 'request-promise';
import config from '../config';

function getBaseUrl() {
  return config.API_BASE_URL;
}

function login(token) {
  return request.get(
    `${getBaseUrl()}auth`,
    {
      headers: {
        'X-Access-Token': token,
      },
      json: true,
    },
  )
    .then((user) => {
      // login successful if there's a jwt token in the response
      if (user.name) {
        // store user details and jwt token in local storage to
        // keep user logged in between page refreshes
        localStorage.setItem('user', JSON.stringify({
          ...user,
          token,
        }));
      }
      return user;
    });
}

function logout() {
  // remove user from local storage to log user out
  localStorage.removeItem('user');
}

export const userService = {
  login,
  logout,
};
