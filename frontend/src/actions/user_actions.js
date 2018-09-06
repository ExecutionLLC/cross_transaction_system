import userConstants from '../constants/user_constants';
import userService from '../API/user_service';
import history from '../API/history';


function login(token) {
  function request(user) { return { type: userConstants.LOGIN_REQUEST, user }; }
  function success(user) { return { type: userConstants.LOGIN_SUCCESS, user }; }
  function failure(error) { return { type: userConstants.LOGIN_FAILURE, error }; }

  return (dispatch) => {
    dispatch(request({}));

    userService.login(token)
      .then(
        (user) => {
          dispatch(success({
            ...user,
            token,
          }));
          // eslint-disable-next-line no-restricted-globals
          history.push('/profile');
        },
        (error) => {
          dispatch(failure(error.toString()));
        },
      );
  };
}

function logout() {
  userService.logout();
  return { type: userConstants.LOGOUT };
}

const userActions = {
  login,
  logout,
};

export default userActions;
