import React, { Component } from 'react';
import { Text } from 'react-native';
import {
  Container,
  Header,
  Left,
  Form,
  Item,
  Input,
  Content,
  Body,
  Title,
  Button,
  Icon,
} from 'native-base';
import SmallSpinner from '../Components/SmallSpinner';
import api from '../API/api';


class EnterWallet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      error: null,
    };
  }

  render() {
    const { balance } = this.props;
    return (
      <Container>
        <Header>
          <Body>
          <Title>Выбор товара</Title>
          </Body>
        </Header>
        <Content>
          <Text>
            {'Баланс: '}
            {balance}
          </Text>
        </Content>
      </Container>
    );
  }
}


export default EnterWallet;
