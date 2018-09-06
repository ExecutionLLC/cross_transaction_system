import React, { Component } from 'react';
import {
  Form, FormGroup,
  ControlLabel, FormControl,
  Button, Glyphicon,
  Grid, Row, Col,
} from 'react-bootstrap';
import ViewBase from '../ViewBase';
import Loading from '../../Components/Loading';
import ErrorPanel from '../../Components/ErrorPanel';
import API from '../../API/API';
import ExpandableListItem from '../../Components/ExpandableListItem';


class Cards extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cardNumber: '',
      isLoading: false,
      error: null,
      card: null,
    };
  }

  onCardNumberChange(cardNumber) {
    this.setState({
      cardNumber,
    });
  }

  onSearch() {
    const { cardNumber } = this.state;
    this.setState({
      isLoading: true,
    });
    API.getCards(cardNumber, 0, 10)
      .then((card) => {
        this.setState({
          isLoading: false,
          error: null,
          card,
        });
      })
      .catch((error) => {
        this.setState({
          isLoading: false,
          error: error.message,
          card: null,
        });
      });
  }

  renderOperation(operation) {
    function renderHeader() {
      return (
        <Row>
          <Col sm={1}>
            {operation.date}
          </Col>
          <Col sm={1}>
            {operation.operation}
          </Col>
          <Col sm={1}>
            {operation.serviceId}
          </Col>
          <Col sm={1}>
            {operation.contragent}
          </Col>
          <Col sm={1}>
            {operation.amount}
          </Col>
          <Col sm={1}>
            <Glyphicon glyph={operation.isActive ? 'ok-sign' : 'remove-sign'} />
          </Col>
        </Row>
      );
    }

    function renderContent() {
      return operation.transactionId;
    }

    return (
      <ExpandableListItem
        header={renderHeader}
        content={renderContent}
      />
    );
  }

  renderOperations() {
    const { card: { operations } } = this.state;
    return operations.map(operation => this.renderOperation(operation));
  }

  renderCard() {
    const { card: { cardNumber, balance } } = this.state;
    return (
      <Grid>
        <Row>
          <Col sm={4}>
            Карта:
          </Col>
          <Col sm={4}>
            {cardNumber}
          </Col>
          <Col sm={4}>
            Баланс:
          </Col>
          <Col sm={4}>
            {balance}
          </Col>
        </Row>
        <Row>
          {this.renderOperations()}
        </Row>
      </Grid>
    );
  }

  render() {
    const {
      cardNumber, isLoading, error, card,
    } = this.state;
    return (
      <ViewBase {...this.props} pageHeader="Карты">
        <Form>
          <FormGroup>
            <ControlLabel>Поиск карты</ControlLabel>
            <FormControl
              type="text"
              value={cardNumber}
              disabled={isLoading}
              onChange={event => this.onCardNumberChange(event.target.value)}
            />
          </FormGroup>
          <Button onClick={() => this.onSearch()}>
            Найти
          </Button>
        </Form>
        {isLoading && <Loading />}
        {error && <ErrorPanel title="Ошибка поиска" content={error} />}
        {card && this.renderCard()}
      </ViewBase>
    );
  }
}


export default Cards;
