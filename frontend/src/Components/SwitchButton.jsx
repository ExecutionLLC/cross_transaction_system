import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Row, Col, Glyphicon } from 'react-bootstrap';
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
      <Row>
        <Col sm={3}>
          {isLoading
            ? <Loading />
            : (
              <Button
                onClick={() => this.onClick()}
                disabled={isLoading}
              >
                <Glyphicon
                  glyph={isActive ? 'stop' : 'play'}
                  style={{ paddingRight: '10px', color: isActive ? 'red' : 'green' }}
                />
                {isActive ? activeButtonText : inactiveButtonText}
              </Button>
            )
          }
        </Col>
        <Col sm={9}>
          {errorText || (isActive ? activeStatusText : inactiveStatusText)}
        </Col>
      </Row>
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
