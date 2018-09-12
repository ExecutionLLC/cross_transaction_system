import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Text, TouchableHighlight, View } from 'react-native';
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
  Left,
  Icon,
} from 'native-base';
import QRCodeScanner from 'react-native-qrcode-scanner';
import SmallSpinner from '../Components/SmallSpinner';
import api from '../API/api';


class EnterWallet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      walletId: '',
      isLoading: false,
      error: null,
      success: false,
    };
    this.api = api.URLedAPI(props.settings.url);
    this.QRCodeScanner = null;
  }

  onWalletChange(walletId) {
    this.setState({
      walletId
    });
  }

  onWalletInfo(walletInfo) {
    const { good, onBack } = this.props;
    if (walletInfo.balance < good.cost) {
      this.setState(
        {
          isLoading: false,
          error: {
            message: `Недостаточно средств, баланс ${walletInfo.balance}р`,
          }
        },
        () => {
          this.QRCodeScanner.reactivate();
        }
      );
      return;
    }
    this.api.buyGood(
      walletInfo.id,
      good.cost,
      good.name
    )
      .then(
        () => {
          this.setState({
            isLoading: false,
            error: null,
            success: true,
          });
        },
      )
      .catch((error) => {
        this.setState(
          {
            isLoading: false,
            error: {
              message: `сервер вернул "${error.message}"`,
            }
          },
          () => {
            this.QRCodeScanner.reactivate();
          }
        );
      });
  }

  onSubmit() {
    this.setState({
      isLoading: true,
      error: null,
    });
    this.api.enterWallet(this.state.walletId)
      .then(walletInfo => {
        this.onWalletInfo(walletInfo);
      })
      .catch(error => {
        if (error.code === api.ERRORS.NOT_FOUND) {
          this.setState(
            {
              isLoading: false,
              error: {
                message: 'Кошелёк не найден',
                walletError: true,
              },
            },
            () => {
              this.QRCodeScanner.reactivate();
            }
          );
        } else {
          this.setState(
            {
              isLoading: false,
              error,
            },
            () => {
              this.QRCodeScanner.reactivate();
            }
          );
        }
      });
  }

  onScan(code) {
    const walletId = code.replace(/\s/g, '').slice(3, -1);
    if (walletId === this.state.walletId) {
      setTimeout(
        () => {
          this.QRCodeScanner.reactivate();
        },
        1000
      );
      return;
    }
    this.setState(
      {
        walletId,
      },
      () => {
        this.onSubmit();
      }
    );
  }

  render() {
    const {
      walletId,
      isLoading,
      error,
      success,
    } = this.state;
    const { onBack, good } = this.props;
    const disabled = !walletId;
    return (
      <Container>
        <Header>
          <Left>
            <Button
              transparent
              onPress={onBack}
            >
              <Icon name='arrow-back' />
            </Button>
          </Left>
          <Body style={{flex: 3}}>
            <Title>Введите № кошелька</Title>
          </Body>
        </Header>
        <Content>
          {!success && (
            <QRCodeScanner
              ref={node => { this.QRCodeScanner = node; }}
              onRead={(event) => this.onScan(event.data)}
              showMarker={true}
            />
          )}
          <Form style={{margin: 20, marginTop: 10}}>
            {!success &&
              <Text style={{ marginBottom: 20 }}>
                {`Сумма покупки: ${good.cost}р`}
              </Text>
            }
            {!success &&
              <Item regular error={error && error.walletError} style={{marginBottom: 20}}>
                <Input
                  placeholder="№ кошелька"
                  autoCorrect={false}
                  autoCapitalize="none"
                  value={walletId}
                  disabled={isLoading}
                  onChangeText={walletId => this.onWalletChange(walletId)}
                />
              </Item>
            }
            {error && (
              <Text style={{marginBottom: 20}}>
                {`Ошибка: ${error.message}`}
              </Text>
            )}
            {isLoading ? (
              <SmallSpinner />
            ) : (
              success
                ? (
                  <View style={{marginTop: 20}}>
                    <Text style={{color: 'green', marginBottom: 20}}>
                      Спасибо за покупку
                    </Text>
                    <TouchableHighlight
                      style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '100%',
                        height: 50,
                        backgroundColor: '#eee'
                      }}
                      disabled={disabled}
                      onPress={onBack}
                    >
                      <Text style={{textAlign: 'center'}}>ОК</Text>
                    </TouchableHighlight>
                  </View>
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
                )
            )}
          </Form>
        </Content>
      </Container>
    );
  }
}


function mapStateToProps(state) {
  const { settings } = state;
  return { settings };
}

export default connect(mapStateToProps)(EnterWallet);
