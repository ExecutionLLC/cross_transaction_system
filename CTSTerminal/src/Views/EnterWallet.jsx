import React, { Component } from 'react';
import { Text } from 'react-native';
import {
  Container,
  Header,
  Form,
  Item,
  Input,
  Content,
  Body,
  Title,
  Button,
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
    const { onWalletInfo } = this.props;
    this.setState({
      isLoading: true,
      error: null,
    });
    api.enterWallet(this.state.walletId)
      .then(walletInfo => {
        this.setState({
          isLoading: false,
          error: null,
        });
        onWalletInfo(walletInfo);
      })
      .catch(error => {
        if (error.code === api.ERRORS.NOT_FOUND) {
          this.setState({
            isLoading: false,
            error: {
              message: 'Кошелёк не найден',
              walletError: true,
            },
          });
        } else {
          this.setState({
            isLoading: false,
            error,
          });
        }
      });
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
                {`Ошибка: ${error.message}`}
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
