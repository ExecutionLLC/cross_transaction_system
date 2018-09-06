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
    externalServiceIsActive,
    name, startDate, isActive,
    onActivateToggleResult, onExpandToggle,
  } = props;

  function onSwitch() {
    return API.setOperatorActive(serviceId, operatorId, !isActive)
      .then((setOperatorActiveResult) => {
        onActivateToggleResult(setOperatorActiveResult);
      })
      .catch((apiError) => {
        onActivateToggleResult();
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
        <Col sm={4}>
          {'Подключен с '}
          {startDate}
        </Col>
        <Col sm={4}>
          {'ВНЕШНИЙ СЕРВИС АКТИВЕН {'}
          {externalServiceIsActive}
          {'}'}
        </Col>
        <Col sm={4}>
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
  onActivateToggleResult: PropTypes.func.isRequired,
  externalServiceIsActive: PropTypes.bool.isRequired,
};

Operator.defaultProps = {
  isExpanded: false,
};


export default Operator;
