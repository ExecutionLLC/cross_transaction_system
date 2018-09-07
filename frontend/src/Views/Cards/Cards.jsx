import React, { Component } from 'react';
import {
  Form, FormGroup,
  ControlLabel, FormControl,
  Button, Glyphicon,
  Grid, Row, Col, Table, Image, Well,
} from 'react-bootstrap';
import ViewBase from '../ViewBase';
import Loading from '../../Components/Loading';
import ErrorPanel from '../../Components/ErrorPanel';
import API from '../../API/API';
import cardImage from './credit-card.png';


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

  renderTransaction(transaction) {
    return (
      <tr>
        <td>
          {
            new Date(transaction.timestamp).toLocaleDateString(
              'ru-RU',
              {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
              },
            )
          }
        </td>
        <td>{transaction.comment}</td>
        <td>{transaction.operatorName}</td>
        <td>{transaction.processingName}</td>
        <td>{transaction.serviceName}</td>
        <td>{transaction.amount}</td>
        <td><Glyphicon glyph="ok-sign" style={{ color: 'green' }} /></td>
        <td>{transaction.id}</td>
      </tr>
    );
  }

  renderOperations() {
    const { card: { transactions } } = this.state;
    return (
      <div
        style={{ marginTop: '20px' }}
      >
        <Table striped bordered condensed hover>
          <thead>
            <tr>
              <th>Дата</th>
              <th>Комментарий</th>
              <th>Оператор</th>
              <th>Процессинг</th>
              <th>Сервис</th>
              <th>Движение</th>
              <th>Статус</th>
              <th>#</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(transaction => this.renderTransaction(transaction))}
          </tbody>
        </Table>
      </div>
    );
  }

  renderCard() {
    const { card: { id, balance, balanceVirtualDiff } } = this.state;
    return (
      <div style={{ marginTop: '15px' }}>
        <Well>
          <Grid>
            <Row>
              <Col sm={6}>
                <Row>
                  <Col sm={6}>
                    Карта:
                  </Col>
                  <Col sm={6}>
                    {id}
                  </Col>
                </Row>
                <Row>
                  <Col sm={6}>
                    Баланс:
                  </Col>
                  <Col sm={6}>
                    {`${balance + balanceVirtualDiff} руб`}
                  </Col>
                </Row>
              </Col>
              <Col sm={4}>
                <Image
                  src={cardImage}
                  alt="cardImage"
                  responsive
                  style={{ maxHeight: '80px' }}
                />
              </Col>
            </Row>
          </Grid>
        </Well>
        {this.renderOperations()}
      </div>
    );
  }

  render() {
    const {
      cardNumber, isLoading, error, card,
    } = this.state;
    return (
      <ViewBase {...this.props} pageHeader="Карты">
        <Form
          onSubmit={(event) => { this.onSearch(); event.preventDefault(); }}
        >
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
