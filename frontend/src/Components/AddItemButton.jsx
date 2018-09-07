import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import ExpandableListItem from './ExpandableListItem';


class AddItemButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isExpanded: false,
      isDisabled: false,
    };
  }

  onToggle(expand) {
    const { isExpanded } = this.state;
    this.setState({
      isExpanded: !isExpanded,
    });
    const { onOpen } = this.props;
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
        <ExpandableListItem
          header={caption}
          content={(
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
          bsStyle="primary"
          isExpanded={isExpanded}
          onExpandToggle={expand => this.onToggle(expand)}
        />
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
