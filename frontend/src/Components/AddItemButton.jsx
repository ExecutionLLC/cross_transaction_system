import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Glyphicon } from 'react-bootstrap';


class AddItemButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isExpanded: false,
      isDisabled: false,
    };
  }

  onExpandToggle(expand) {
    const { onOpen } = this.props;
    this.setState({
      isExpanded: expand,
    });
    if (expand) {
      onOpen();
    }
  }

  onSubmit() {
    const { onSubmit } = this.props;
    const submitResult = onSubmit();

    const closeIfNeed = (close) => {
      if (close) {
        this.setState({
          isExpanded: false,
        });
      }
    };

    if (submitResult && submitResult.then) {
      this.setState({
        isDisabled: true,
      });
      submitResult
        .then(closeIfNeed)
        .then(() => {
          this.setState({
            isDisabled: false,
          });
        });
    } else {
      closeIfNeed(submitResult);
    }
  }

  render() {
    const { isExpanded, isDisabled } = this.state;
    const { caption, children } = this.props;
    return (
      <div>
        <div>
          <Button
            disabled={isDisabled}
            onClick={() => this.onExpandToggle(!isExpanded)}
          >
            {isExpanded
              ? <Glyphicon glyph="remove" />
              : <Glyphicon glyph="plus" />
            }
          </Button>
          <h3 style={{ display: 'inline' }}>
            {caption}
          </h3>
        </div>
        {isExpanded && (
          <div>
            <div>
              {children}
            </div>
            <div>
              <Button
                disabled={isDisabled}
                onClick={() => this.onSubmit()}
              >
                Добавить
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }
}

AddItemButton.propTypes = {
  caption: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  onOpen: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};


export default AddItemButton;
