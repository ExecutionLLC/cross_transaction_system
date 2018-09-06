import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Panel, Button, Glyphicon } from 'react-bootstrap';


class ExpandableListItem extends Component {
  constructor(props) {
    super(props);
    this.onExpandToggle = this.onExpandToggle.bind(this);
  }

  onExpandToggle() {
    const { isExpanded, onExpandToggle } = this.props;
    if (onExpandToggle) {
      onExpandToggle(!isExpanded);
    }
  }

  render() {
    const {
      header, content,
      isExpanded,
    } = this.props;

    return (
      <Panel expanded={isExpanded} onToggle={() => {}}>
        <Panel.Heading>
          <Button
            onClick={this.onExpandToggle}
            bsStyle="link"
          >
            {isExpanded
              ? <Glyphicon glyph="triangle-bottom" />
              : <Glyphicon glyph="triangle-right" />
            }
          </Button>
          {header}
        </Panel.Heading>
        <Panel.Collapse>
          <Panel.Body>
            {content}
          </Panel.Body>
        </Panel.Collapse>
      </Panel>
    );
  }
}

ExpandableListItem.propTypes = {
  header: PropTypes.node.isRequired,
  content: PropTypes.node.isRequired,
  isExpanded: PropTypes.bool,
  onExpandToggle: PropTypes.func,
};

ExpandableListItem.defaultProps = {
  isExpanded: false,
  onExpandToggle: null,
};


export default ExpandableListItem;
