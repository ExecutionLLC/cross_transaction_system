import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import Loading from './Loading';


class SwitchButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      errorText: null,
      isLoading: false,
    };
  }

  onClick() {
    const { onClick } = this.props;
    const clickResult = onClick();
    this.setState({
      isLoading: true,
    });
    clickResult
      .then(() => {
        this.setState({
          isLoading: false,
          errorText: null,
        });
      })
      .catch((errorText) => {
        this.setState({
          isLoading: false,
          errorText,
        });
      });
  }

  render() {
    const {
      isActive,
      activeButtonText, inactiveButtonText,
      activeStatusText, inactiveStatusText,
    } = this.props;
    const { isLoading, errorText } = this.state;
    return (
      <div>
        {isLoading
          ? <Loading />
          : (
            <Button
              onClick={() => this.onClick()}
              disabled={isLoading}
            >
              {isActive ? activeButtonText : inactiveButtonText}
            </Button>
          )
        }
        {errorText || (isActive ? activeStatusText : inactiveStatusText)}
      </div>
    );
  }
}

SwitchButton.propTypes = {
  isActive: PropTypes.bool.isRequired,
  activeButtonText: PropTypes.string.isRequired,
  inactiveButtonText: PropTypes.string.isRequired,
  activeStatusText: PropTypes.string.isRequired,
  inactiveStatusText: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};


export default SwitchButton;
