import React from 'react';
import PropTypes from 'prop-types';
import {
  Grid, Row, Col,
  Button,
} from 'react-bootstrap';
import ExpandableListItem from '../../Components/ExpandableListItem';
import Loading from '../../Components/Loading';


function Operator(props) {
  const {
    isExpanded,
    name, startDate, isActive, isChanging, error,
    onActivateToggle, onExpandToggle,
  } = props;

  function renderButton() {
    if (isChanging) {
      return <Loading />;
    }
    if (isActive) {
      return <Button onClick={() => onActivateToggle(false)}>Приостановить</Button>;
    }
    return <Button onClick={() => onActivateToggle(true)}>Продолжить</Button>;
  }

  function renderActivityCaption() {
    if (error) {
      return (
        <span color="red">
          {'Ошибка смены активности: '}
          {error}
        </span>
      );
    }
    if (isChanging) {
      return 'Смена статуса...';
    }
    if (isActive) {
      return 'Оператор активен';
    }
    return 'Оператор приостановлен';
  }

  const content = (
    <Grid>
      <Row>
        <Col sm={6}>
          {'Подключен с '}
          {startDate}
        </Col>
        <Col sm={3}>
          {renderButton()}
        </Col>
        <Col sm={3}>
          {renderActivityCaption()}
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
  isChanging: PropTypes.bool,
  error: PropTypes.string,
  onExpandToggle: PropTypes.func.isRequired,
  onActivateToggle: PropTypes.func.isRequired,
};

Operator.defaultProps = {
  isExpanded: false,
  isChanging: false,
  error: null,
};


export default Operator;
