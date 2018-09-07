import React from 'react';
import PropTypes from 'prop-types';
import {
  Grid, Row, Col,
  OverlayTrigger, Tooltip, Glyphicon
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
        activeStatusText=""
        inactiveStatusText=""
        onClick={onSwitch}
        activeToolTipText="Приостановить работу с оператором"
        inactiveToolTipText="Возобновить работу с оператором"
      />
    );
  }

  const content = (
    <Grid>
      <Row>
        <Col sm={8}>
          <Row>
            <Col sm={6}>
              {'Дата подключения: '}
            </Col>
            <Col sm={6}>
              {startDate}
            </Col>
          </Row>

          <Row>
            <Col sm={6}>
              <span>
                {'Внешний сервис активен: '}
                <OverlayTrigger
                  placement="top"
                  overlay={(
                    <Tooltip id="tooltip">
                      Разрешает ли оператор оплачивать своими картами услуги/продукцию
                      данного сервиса
                    </Tooltip>
                  )}
                >
                  <Glyphicon glyph="info-sign" style={{ fontSize: '14px', color: '#5692c4' }} />
                </OverlayTrigger>
              </span>
            </Col>
            <Col sm={6}>
              <div style={{ color: externalServiceIsActive ? 'green' : 'red' }}>
                {`${externalServiceIsActive ? 'ДА' : 'НЕТ'}`}
              </div>
            </Col>
          </Row>

          <Row>
            <Col sm={6}>
              {'Оператор подключен: '}
            </Col>
            <Col sm={6}>
              <div style={{ color: isActive ? 'green' : 'red' }}>
                {`${isActive ? 'ДА' : 'НЕТ'}`}
              </div>
            </Col>
          </Row>

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
      header={`ОПЕРАТОР: ${name}`}
      content={content}
      status={externalServiceIsActive && isActive}
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
