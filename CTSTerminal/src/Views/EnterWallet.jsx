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
      walletId: '',
      balance: null,
      isLoading: false,
      error: null,
    };
  }

  onWalletChange(walletId) {
    this.setState({
      walletId
    });
  }

  onSubmit() {
    this.setState({
      isLoading: true,
      balance: null,
      error: null,
    });
    api.enterWallet(this.state.walletId)
      .then(walletInfo => {
        this.setState({
          isLoading: false,
          error: null,
          balance: walletInfo.balance,
        });
      })
      .catch(error => {
        this.setState({
          isLoading: false,
          error,
          balance: null,
        });
      });
  }

  render() {
    const {
      walletId,
      isLoading,
      error,
      balance,
    } = this.state;
    return (
      <Container>
        <Header>
          <Body>
            <Title>Ввод кошелька</Title>
          </Body>
        </Header>
        <Content>
          <Form>
            <Item error={error && error.walletError}>
              <Input
                placeholder="Кошелёк"
                autoCorrect={false}
                autoCapitalize="none"
                value={walletId}
                disabled={isLoading}
                onChangeText={walletId => this.onWalletChange(walletId)}
              />
            </Item>
            {error && (
              <Text>
                Error:
                {`${error}`}
              </Text>
            )}
            {balance != null && <Text>{`${balance}`}</Text>}
            {isLoading ? (
              <SmallSpinner />
            ) : (
              <Button
                block
                onPress={() => this.onSubmit()}
              >
                <Text>Ввод</Text>
              </Button>
            )
            }
          </Form>
        </Content>
      </Container>
    );
  }
}


export default EnterWallet;
