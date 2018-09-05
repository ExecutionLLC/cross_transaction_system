import React from 'react';
import PropTypes from 'prop-types';
import {
  Grid, Row, Col,
} from 'react-bootstrap';
import ExpandableListItem from '../../Components/ExpandableListItem';
import SwitchButton from '../../Components/SwitchButton';
import API from '../../API/API';


function Operator(props) {
  const {
    serviceId, operatorId,
    isExpanded,
    name, startDate, isActive,
    onActivateToggle, onExpandToggle,
  } = props;

  function onSwitch() {
    return API.setOperatorActive(serviceId, operatorId, !isActive)
      .then((services) => {
        onActivateToggle(services);
      })
      .catch((apiError) => {
        throw apiError.message;
      });
  }

  function renderSwitch() {
    return (
      <SwitchButton
        isActive={isActive}
        activeButtonText="Приостановить"
        inactiveButtonText="Продолжить"
        activeStatusText="Оператор активен"
        inactiveStatusText="Оператор приостановлен"
        onClick={onSwitch}
      />
    );
  }

  const content = (
    <Grid>
      <Row>
        <Col sm={6}>
          {'Подключен с '}
          {startDate}
        </Col>
        <Col sm={6}>
          {renderSwitch()}
        </Col>
      </Row>
    </Grid>
  );

  return (
    <ExpandableListItem
      isExpanded={isExpanded}
      onExpandToggle={onExpandToggle}
      header={name}
      content={content}
    />
  );
}

Operator.propTypes = {
  serviceId: PropTypes.string.isRequired,
  operatorId: PropTypes.string.isRequired,
  isExpanded: PropTypes.bool,
  name: PropTypes.string.isRequired,
  startDate: PropTypes.string.isRequired,
  isActive: PropTypes.bool.isRequired,
  onExpandToggle: PropTypes.func.isRequired,
  onActivateToggle: PropTypes.func.isRequired,
};

Operator.defaultProps = {
  isExpanded: false,
};


export default Operator;
