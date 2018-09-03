import React from 'react';
import PropTypes from 'prop-types';
import { Panel } from 'react-bootstrap';


function ErrorPanel(props) {
  const { title, content } = props;
  return (
    <Panel bsStyle="danger">
      <Panel.Heading>
        <Panel.Title componentClass="h3">
          {title}
        </Panel.Title>
      </Panel.Heading>
      <Panel.Body style={{ wordBreak: 'break-word' }}>
        {content}
      </Panel.Body>
    </Panel>
  );
}

ErrorPanel.propTypes = {
  title: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
};


export default ErrorPanel;
