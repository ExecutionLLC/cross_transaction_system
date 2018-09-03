import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Panel } from 'react-bootstrap';


class ExpandableListItem extends Component {
  render() {
    const { header, content } = this.props;

    return (
      <Panel expanded onToggle={() => {}}>
        <Panel.Heading>
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
};


export default ExpandableListItem;
