import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Panel, Glyphicon } from 'react-bootstrap';


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
      status,
      bsStyle,
    } = this.props;

    return (
      <Panel
        expanded={isExpanded}
        bsStyle={bsStyle || (status ? 'success' : 'default')}
        onToggle={() => {}}
      >
        <Panel.Heading onClick={this.onExpandToggle}>
          <div style={{ margin: '5px 5px' }}>
            {isExpanded
              ? <Glyphicon glyph="triangle-bottom" />
              : <Glyphicon glyph="triangle-right" />
            }
            <span style={{ paddingLeft: '10px' }}>{header}</span>
          </div>

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
  status: PropTypes.bool,
  bsStyle: PropTypes.string,
};

ExpandableListItem.defaultProps = {
  isExpanded: false,
  onExpandToggle: null,
  status: null,
  bsStyle: null,
};


export default ExpandableListItem;
