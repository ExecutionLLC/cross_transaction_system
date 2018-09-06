import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Image } from 'react-bootstrap';

import './style.css';
import logo from './img-01.png';
import TokenFileControl from '../../Components/TokenFileControl';
import userActions from '../../actions/user_actions';

class Login extends Component {
  constructor(props) {
    super(props);
    this.props.dispatch(userActions.logout());
  }

  onText(contents) {
    const { dispatch } = this.props;
    dispatch(userActions.login(contents));
  }

  render() {
    const { loggingIn, error } = this.props;

    return (
      <div className="limiter">
        <div className="container-login100">
          <div className="wrap-login100">
            <div className="login100-pic js-tilt" data-tilt>
              <Image src={logo} alt="logo" />
            </div>
            <form className="login100-form validate-form">
              <span className="login100-form-title">
                Вход
              </span>
              <div
                className="container-login100-form-btn"
                style={{ paddingBottom: '20px' }}
              >
                <TokenFileControl
                  className="login100-form-btn"
                  onText={contents => this.onText(contents)}
                />
              </div>
              <div
                className="form-group"
                style={{ paddingBottom: '180px', textAlign: 'center' }}
              >
                {error
                && (
                  <div className="alert alert-danger" role="alert">
                    Не получилось войти. Попробуйте другой токен
                  </div>
                )}
                {loggingIn
                && (
                  <img
                    alt="loading"
                    src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA=="
                  />
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { loggingIn, error } = state.authentication;
  return {
    loggingIn,
    error,
  };
}

export default connect(mapStateToProps)(Login);
