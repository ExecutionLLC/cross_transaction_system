import React, { Component } from 'react';
import {
  Form, FormGroup,
  ControlLabel, FormControl,
  Button, Glyphicon,
  Row, Col,
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

  renderTransaction(transaction) {
    function renderHeader() {
      return (
        <Row>
          <Col sm={2}>
            {new Date(transaction.timestamp)
              .toLocaleDateString(
                'ru-RU',
                {
                  /* eslint-disable object-property-newline */
                  year: 'numeric', month: 'long', day: 'numeric',
                  hour: 'numeric', minute: 'numeric',
                  /* eslint-enable object-property-newline */
                },
              )
            }
          </Col>
          <Col sm={2}>
            {transaction.comment}
          </Col>
          <Col sm={2}>
            {transaction.operatorName}
          </Col>
          <Col sm={2}>
            {transaction.processingName}
          </Col>
          <Col sm={2}>
            {transaction.servicename}
          </Col>
          <Col sm={1}>
            {transaction.amount}
          </Col>
          <Col sm={1}>
            <Glyphicon glyph="ok-sign" />
          </Col>
        </Row>
      );
    }

    function renderContent() {
      return transaction.id;
    }

    return (
      <SelfExpandableListItem
        key={transaction.id}
        header={renderHeader()}
        content={renderContent()}
      />
    );
  }

  renderOperations() {
    const { card: { transactions } } = this.state;
    return transactions.map(transaction => this.renderTransaction(transaction));
  }

  renderCard() {
    const { card: { id, balance, balanceVirtualDiff } } = this.state;
    return (
      <div>
        <Row>
          <Col sm={3}>
            Карта:
          </Col>
          <Col sm={3}>
            {id}
          </Col>
          <Col sm={3}>
            Баланс:
          </Col>
          <Col sm={3}>
            {`${balance + balanceVirtualDiff}`}
          </Col>
        </Row>
        <Row>
          {this.renderOperations()}
        </Row>
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
