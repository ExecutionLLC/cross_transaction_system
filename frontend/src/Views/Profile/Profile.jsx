import React, { Component } from 'react';
import {
  Grid, Row, Col,
  Panel,
  ListGroup, ListGroupItem,
} from 'react-bootstrap';
import ViewBase from '../ViewBase';
import API from '../../API/API';
import ErrorPanel from '../../Components/ErrorPanel';


class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      profileError: null,
      profileData: null,
    };
  }

  componentDidMount() {
    this.setState({
      isLoading: true,
      profileError: null,
      profileData: null,
    });
    API.getProfile()
      .then((profileData) => {
        this.setState({
          isLoading: false,
          profileError: null,
          profileData,
        });
      })
      .catch((error) => {
        this.setState({
          isLoading: false,
          profileError: error,
          profileData: null,
        });
      });
  }

  renderCardedContent(title, content) {
    return (
      <Panel>
        <Panel.Heading>{title}</Panel.Heading>
        <Panel.Body>
          {content}
        </Panel.Body>
      </Panel>
    );
  }

  renderCardInfo(title, { count, amount }) {
    return this.renderCardedContent(
      title,
      (
        <ListGroup>
          <ListGroupItem>
            <Row>
              <Col sm={6}>
                Количество
              </Col>
              <Col sm={6}>
                {count}
              </Col>
            </Row>
          </ListGroupItem>
          <ListGroupItem>
            <Row>
              <Col sm={6}>
                Сумма
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
    return this.renderCardedContent('Статистика', null);
  }

  renderProfileData() {
    const { profileData } = this.state;
    return (
      <Grid>
        <Row>
          <Col sm={6}>
            {this.renderStat()}
          </Col>
          <Col sm={6}>
            {this.renderCardInfo('Свои сервисы, свои карты', profileData.ownServicesOwnCards)}
          </Col>
        </Row>
        <Row>
          <Col sm={6}>
            {this.renderCardInfo('Свои сервисы, чужие карты', profileData.ownServicesOtherCards)}
          </Col>
          <Col sm={6}>
            {this.renderCardInfo('Чужие сервисы, свои карты', profileData.otherServicesOwnCards)}
          </Col>
        </Row>
      </Grid>
    );
  }

  render() {
    const { isLoading, profileError, profileData } = this.state;
    return (
      <ViewBase {...this.props} pageHeader="Profile" isLoading={isLoading}>
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
