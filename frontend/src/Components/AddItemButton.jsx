import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';


class AddItemButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isExpanded: false,
    };
  }

  onExpandToggle(expand) {
    this.setState({
      isExpanded: expand,
    });
  }

  onSubmit() {
    const { onSubmit } = this.props;
    const submitResult = onSubmit();
    if (submitResult) {
      this.setState({
        isExpanded: false,
      });
    }
  }

  render() {
    const { isExpanded } = this.state;
    const { caption, children } = this.props;
    return (
      <div>
        <div>
          <Button onClick={() => this.onExpandToggle(!isExpanded)}>
            {isExpanded ? 'X' : '+'}
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
              <Button onClick={() => this.onSubmit()}>
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
  onSubmit: PropTypes.func.isRequired,
};


export default AddItemButton;
