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
        'X-Access-Token': token, // Base64.encode(JSON.stringify(idPart))
      },
      json: true,
    },
  )
    // .then(handleResponse)
    .then((user) => {
      // login successful if there's a jwt token in the response
      if (user.name) {
        // store user details and jwt token in local storage to
        // keep user logged in between page refreshes
        localStorage.setItem('user', JSON.stringify(user));
      }
      return user;
    });
}

function logout() {
  // remove user from local storage to log user out
  localStorage.removeItem('user');
}

function handleResponse(response) {
  return response.text().then((text) => {
    const data = text && JSON.parse(text);
    if (!response.ok) {
      if (response.status === 401) {
        // auto logout if 401 response returned from api
        logout();
        // eslint-disable-next-line
        location.reload(true);
      }

      const error = (data && data.message) || response.statusText;
      return Promise.reject(error);
    }
    return data;
  });
}

export const userService = {
  login,
  logout,
};
