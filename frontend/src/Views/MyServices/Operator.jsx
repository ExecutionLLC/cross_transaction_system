import React from 'react';
import PropTypes from 'prop-types';
import {
  Grid, Row, Col,
  Button,
} from 'react-bootstrap';
import ExpandableListItem from '../../Components/ExpandableListItem';


function Operator(props) {
  const {
    isExpanded,
    name, startDate, isActive,
    onActivateToggle, onExpandToggle,
  } = props;

  const toggleButton = isActive
    ? <Button onClick={() => onActivateToggle(false)}>Приостановить</Button>
    : <Button onClick={() => onActivateToggle(true)}>Продолжить</Button>;

  const activityCaption = isActive
    ? 'Оператор активен'
    : 'Оператор приостановлен';

  const content = (
    <Grid>
      <Row>
        <Col sm={6}>
          {'Подключен с '}
          {startDate}
        </Col>
        <Col sm={3}>
          {toggleButton}
        </Col>
        <Col sm={3}>
          {activityCaption}
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
