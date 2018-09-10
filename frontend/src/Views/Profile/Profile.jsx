import React, { Component } from 'react';
import DatePicker from 'react-bootstrap-date-picker';
import {
  Row, Col,
  Panel,
  ListGroup, ListGroupItem,
} from 'react-bootstrap';

import ViewBase from '../ViewBase';
import API from '../../API/API';
import ErrorPanel from '../../Components/ErrorPanel';
import DatePickerControl from './DatePickerControl';
import './style.css';


class Profile extends Component {
  static defaultDate() {
    return new Date().toISOString();
  }

  constructor(props) {
    super(props);

    this.getDataByDate = this.getDataByDate.bind(this);
    this.handleChange = this.handleChange.bind(this);

    this.state = {
      isLoading: false,
      profileError: null,
      profileData: null,
      date: null,
    };
  }

  componentDidMount() {
    this.getDataByDate(Profile.defaultDate());
  }

  getDataByDate(date) {
    this.setState({
      isLoading: true,
      profileError: null,
      profileData: null,
      date,
    });
    API.getProfile(new Date(date))
      .then((profileData) => {
        this.setState(prevState => (
          {
            ...prevState,
            isLoading: false,
            profileError: null,
            profileData,
          }
        ));
      })
      .catch((error) => {
        this.setState(prevState => (
          {
            ...prevState,
            isLoading: false,
            profileError: error,
            profileData: null,
          }
        ));
      });
  }

  /**
   * Date picker handler
   * @param value {string} ISO String, eg '2018-09-14T05:00:00.000Z'
   * @param formattedValue {string} Formatted String, eg '14/09/2018'
   */
  handleChange(value, formattedValue) {
    this.getDataByDate(value);
  }

  calcTotalValues() {
    const { profileData } = this.state;
    const ownServicesOwnCards = profileData.reduce((acc, item) => {
      return {
        ...acc,
        number: acc.number + item.internalTransactions.number,
        income: acc.income + item.internalTransactions.income,
        outcome: acc.outcome + item.internalTransactions.outcome,
      };
    }, { number: 0, income: 0, outcome: 0 });

    const ownServicesOtherCards = profileData.reduce((acc, item) => {
      return {
        ...acc,
        number: acc.number + item.sourceTransactions.number,
        income: acc.income + item.sourceTransactions.income,
        outcome: acc.outcome + item.sourceTransactions.outcome,
      };
    }, { number: 0, income: 0, outcome: 0 });

    const otherServicesOwnCards = profileData.reduce((acc, item) => {
      return {
        ...acc,
        number: acc.number + item.destinationTransactions.number,
        income: acc.income + item.destinationTransactions.income,
        outcome: acc.outcome + item.destinationTransactions.outcome,
      };
    }, { number: 0, income: 0, outcome: 0 });
    return {
      ownServicesOwnCards,
      ownServicesOtherCards,
      otherServicesOwnCards,
    };
  }

  renderCardedContent(title, content) {
    return (
      <Panel bsStyle="success">
        <Panel.Heading>{title}</Panel.Heading>
        <Panel.Body>
          {content}
        </Panel.Body>
      </Panel>
    );
  }

  // eslint-disable-next-line no-unused-vars
  renderCardInfo(title, { number, income, outcome }) {
    const amount = Math.abs(outcome); // показываем только outcome
    return this.renderCardedContent(
      title,
      (
        <ListGroup>
          <ListGroupItem>
            <Row>
              <Col sm={6}>
                Количество транзакций:
              </Col>
              <Col sm={6}>
                {number}
              </Col>
            </Row>
          </ListGroupItem>
          <ListGroupItem>
            <Row>
              <Col sm={6}>
                Сумма:
              </Col>
              <Col sm={6}>
                {amount}
              </Col>
            </Row>
          </ListGroupItem>
        </ListGroup>
      ),
    );
  }

  renderStat() {
    const {
      date,
      profileData,
    } = this.state;
    // total transaction count
    let totalCount = 0;
    if (profileData) {
      const {
        ownServicesOwnCards,
        ownServicesOtherCards,
        otherServicesOwnCards,
      } = this.calcTotalValues();
      totalCount = ownServicesOwnCards.number
        + ownServicesOtherCards.number
        + otherServicesOwnCards.number;
    }
    return this.renderCardedContent(
      'Статистика за сутки',
      (
        <ListGroup>
          <ListGroupItem>
            <Row>
              <Col md={6}>
                Дата:
              </Col>
              <Col md={6}>
                <DatePicker
                  customControl={<DatePickerControl />}
                  value={date}
                  onChange={this.handleChange}
                />
              </Col>
            </Row>
          </ListGroupItem>
          <ListGroupItem>
            <Row>
              <Col sm={6}>
                Количество транзакций:
              </Col>
              <Col sm={6}>
                {totalCount}
              </Col>
            </Row>
          </ListGroupItem>
        </ListGroup>
      ),
    );
  }

  renderProfileData() {
    const {
      ownServicesOwnCards,
      ownServicesOtherCards,
      otherServicesOwnCards,
    } = this.calcTotalValues();
    return (
      <div>
        <Row>
          <Col sm={6}>
            {this.renderStat()}
          </Col>
          <Col sm={6}>
            {this.renderCardInfo('Свои сервисы, свои карты', ownServicesOwnCards)}
          </Col>
        </Row>
        <Row>
          <Col sm={6}>
            {this.renderCardInfo('Свои сервисы, чужие карты', ownServicesOtherCards)}
          </Col>
          <Col sm={6}>
            {this.renderCardInfo('Чужие сервисы, свои карты', otherServicesOwnCards)}
          </Col>
        </Row>
      </div>
    );
  }

  render() {
    const { isLoading, profileError, profileData } = this.state;
    return (
      <ViewBase {...this.props} pageHeader="Профиль" isLoading={isLoading}>
        {profileData && this.renderProfileData()}
        {profileError && (
          <ErrorPanel
            title="Ошибка получения данных профиля"
            content={profileError.message}
          />
        )}
      </ViewBase>
    );
  }
}


export default Profile;
