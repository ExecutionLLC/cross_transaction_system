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
    api.enterWallet(this.state.walletId);
  }

  render() {
    const {
      walletId,
      isLoading,
      error,
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
                {error.message}
              </Text>
            )}
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
