import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Row, Col, Glyphicon, Tooltip, OverlayTrigger } from 'react-bootstrap';
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



  renderButton() {
    const {
      isActive,
      activeButtonText, inactiveButtonText,
    } = this.props;
    const { isLoading } = this.state;
    return (
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
    );
  }

  render() {
    const {
      isActive,
      activeStatusText, inactiveStatusText,
      activeToolTipText, inactiveToolTipText,
    } = this.props;
    const { isLoading, errorText } = this.state;
    const toolTipText = isActive ? activeToolTipText : inactiveToolTipText;
    return (
      <Row>
        <Col sm={6}>
          {isLoading
            ? (<Loading />)
            : (toolTipText ? (
              <OverlayTrigger
                placement="top"
                overlay={(<Tooltip id="tooltip">{toolTipText}</Tooltip>)}
              >
                {this.renderButton()}
              </OverlayTrigger>
            ) : (
              this.renderButton()
            ))
          }
        </Col>
        <Col sm={6}>
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
