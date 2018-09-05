import React, { Component } from 'react';
import './style.css';
import logo from './img-01.png';
import { Image } from 'react-bootstrap';
import TokenFileControl from '../../Components/TokenFileControl';
import API from '../../API/API';

import { withRouter } from 'react-router-dom'
// this also works with react-router-native

// const Button = withRouter(({ history }) => (
//   <button
//     type='button'
//     onClick={() => {  }}
//   >
//     Click Me!
//   </button>
// ))

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      authError: null,
      authResponseData: null,
    };
  }

  onText(contents) {
    const { history } = this.props;
    console.log(contents);

    this.setState({
      isLoading: true,
      authError: null,
      authResponseData: null,
    });

    API.auth(contents)
      .then((response) => {
        this.setState(prevState => (
          {
            ...prevState,
            isLoading: false,
            authError: null,
            authResponseData: response,
          }
        ));
        history.push({
          pathname: '/profile',
          state: { processingName: response.name },
        });
      })
      .catch((error) => {
        this.setState(prevState => (
          {
            ...prevState,
            isLoading: false,
            authError: error,
            authResponseData: null,
          }
        ));
      });
  }

  render() {
    return (
      <div className="limiter">
        <div className="container-login100">
          <div className="wrap-login100">
            <div className="login100-pic js-tilt" data-tilt>
              <Image src={logo} alt="IMG" />
            </div>
            <form className="login100-form validate-form">
              <span className="login100-form-title">
                Login
              </span>
              <div
                className="container-login100-form-btn"
                style={{ paddingBottom: '200px' }}
              >
                <TokenFileControl
                  className="login100-form-btn"
                  onText={contents => this.onText(contents)}
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(Login);
