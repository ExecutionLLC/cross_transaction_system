import React, { Component } from 'react';
import { Text, TouchableHighlight } from 'react-native';
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
    const disabled = !walletId;
    return (
      <Container>
        <Header>
          <Body>
            <Title>Ввод кошелька</Title>
          </Body>
        </Header>
        <Content contentContainerStyle={{flex: 1, justifyContent: 'center'}}>
          <Form style={{margin: 20}}>
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
              <TouchableHighlight
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100%',
                  height: 50,
                  backgroundColor: '#eee'
                }}
                disabled={disabled}
                onPress={() => this.onSubmit()}
              >
                <Text style={{color: disabled ? 'lightgray' : null, textAlign: 'center'}}>Ввод</Text>
              </TouchableHighlight>
            )}
          </Form>
        </Content>
      </Container>
    );
  }
}


export default EnterWallet;
