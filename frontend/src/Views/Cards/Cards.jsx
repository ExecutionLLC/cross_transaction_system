import React, { Component } from 'react';
import {
  Form, FormGroup,
  ControlLabel, FormControl,
  Button,
} from 'react-bootstrap';
import ViewBase from '../ViewBase';
import Loading from '../../Components/Loading';
import ErrorPanel from '../../Components/ErrorPanel';
import API from '../../API/API';


class Cards extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cardNumber: '',
      isLoading: false,
      error: null,
      cards: null,
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
    API.getCards(cardNumber)
      .then((cards) => {
        this.setState({
          isLoading: false,
          error: null,
          cards,
        });
      })
      .catch((error) => {
        this.setState({
          isLoading: false,
          error: error.message,
          cards: null,
        });
      });
  }

  renderCards() {
    const { cards } = this.state;
    return JSON.stringify(cards);
  }

  render() {
    const {
      cardNumber, isLoading, error, cards,
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
        {cards && this.renderCards()}
      </ViewBase>
    );
  }
}


export default Cards;
