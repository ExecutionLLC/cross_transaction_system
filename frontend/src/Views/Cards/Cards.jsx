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
import SelfExpandableListItem from '../../Components/SelfExpandableListItem';


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
    API.getWallet(cardNumber, 0, 10)
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
          <Col sm={2}>
            {`${operation.date}`}
          </Col>
          <Col sm={2}>
            {operation.operation}
          </Col>
          <Col sm={3}>
            {operation.serviceId}
          </Col>
          <Col sm={3}>
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
      <SelfExpandableListItem
        key={operation.transactionId}
        header={renderHeader()}
        content={renderContent()}
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
          <Col sm={3}>
            Карта:
          </Col>
          <Col sm={3}>
            {cardNumber}
          </Col>
          <Col sm={3}>
            Баланс:
          </Col>
          <Col sm={3}>
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
