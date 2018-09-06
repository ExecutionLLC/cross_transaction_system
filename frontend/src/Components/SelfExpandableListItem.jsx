import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ExpandableListItem from './ExpandableListItem';


class SelfExpandableListItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isExpanded: false,
    };
  }

  onToggleExpanded(expanded) {
    this.setState({
      isExpanded: expanded,
    });
  }

  render() {
    const { header, content } = this.props;
    const { isExpanded } = this.state;
    return (
      <ExpandableListItem
        header={header}
        content={content}
        isExpanded={isExpanded}
        onExpandToggle={(expanded) => this.onToggleExpanded(expanded)}
      />
    );
  }
}


SelfExpandableListItem.propTypes = {
  header: PropTypes.node.isRequired,
  content: PropTypes.node.isRequired,
};


export default SelfExpandableListItem;
