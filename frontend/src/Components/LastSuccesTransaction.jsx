import React from 'react';
import PropTypes from 'prop-types';
import { Panel } from 'react-bootstrap';


function LastSuccessTransaction(props) {
  const { title, transactionId } = props;
  return (
    <Panel bsStyle="success">
      <Panel.Heading>
        <Panel.Title componentClass="h3">
          {title}
        </Panel.Title>
      </Panel.Heading>
      <Panel.Body>
        Transaction id=
        {transactionId}
      </Panel.Body>
    </Panel>
  );
}

LastSuccessTransaction.propTypes = {
  title: PropTypes.string.isRequired,
  transactionId: PropTypes.string.isRequired,
};


export default LastSuccessTransaction;
