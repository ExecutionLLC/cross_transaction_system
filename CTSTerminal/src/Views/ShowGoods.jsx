import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Text, Image, View, TouchableHighlight, ActivityIndicator } from 'react-native';
import {
  Container,
  Header,
  Right,
  Content,
  Body,
  Title,
  Button,
  Card,
  Icon,
} from 'native-base';
import api from '../API/api';


const goodsImages = {
  americano: require('../images/americano.jpg'),
  latte: require('../images/latte.jpg'),
  espresso: require('../images/espresso.jpg'),
};

const goods = [
  {
    name: 'Латте',
    cost: 150,
    picture: 'latte.jpg',
    image: goodsImages.latte,
  },
  {
    name: 'Американо',
    cost: 100,
    picture: 'americano.jpg',
    image: goodsImages.americano,
  },
  {
    name: 'Эспрессо',
    cost: 80,
    picture: 'espresso.jpg',
    image: goodsImages.espresso,
  },
];


class ShowGoods extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false, // TODO there will be no 'loading' state
      buyingGoodName: null,
      error: null,
    };
    this.api = api.URLedAPI(props.settings.url);
  }

  onBuy(good) {
    // TODO just call back with selected good
    // const { walletInfo: { id } } = this.props;
    // this.setState({
    //   isLoading: true,
    //   error: null,
    //   buyingGoodName: good.name,
    // });
    // this.api.buyGood(id, good.cost, good.name)
    //   .then(res => {
    //     this.setState({
    //       isLoading: false,
    //       error: null,
    //     });
    //     this.props.onWalletInfo(res.walletInfo);
    //   })
    //   .catch(error => {
    //     this.api.enterWallet(id)
    //       .then(walletInfo => {
    //         this.setState({
    //           isLoading: false,
    //           error: {
    //             message: error.message,
    //           },
    //         });
    //         this.props.onWalletInfo(walletInfo);
    //       })
    //       .catch(() => {
    //         this.setState({
    //           isLoading: false,
    //           error: {
    //             message: error.message,
    //           },
    //         });
    //       });
    //   });
  }

  renderGood(good) {
    const { isLoading, buyingGoodName } = this.state;
    return (
      <Card
        key={good.name}
      >
        <View style={{flex: 1, flexDirection: 'row', opacity: isLoading ? 0.2 : 1}}>
          <View style={{width: '60%'}}>
            {<Image source={good.image} style={{width: '100%', flex: 1}} />}
          </View>
          <View style={{width: '40%', flex: 1, flexDirection: 'column', alignItems: 'center'}}>
            <View style={{height: '30%', justifyContent: 'center'}}>
              <Text style={{width: '100%', textAlign: 'center'}}>
                {good.name}
              </Text>
            </View>
            <View style={{height: '70%', width: '80%'}}>
              <TouchableHighlight
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100%',
                  height: '80%',
                  backgroundColor: '#eee'
                }}
                onPress={() => this.onBuy(good)}
                disabled={isLoading}
              >
                <Text style={{textAlign: 'center'}}>
                  {`${good.cost} руб.\nКупить`}
                </Text>
              </TouchableHighlight>
            </View>
          </View>
        </View>
        {isLoading && buyingGoodName === good.name && (
          <ActivityIndicator
            size='large'
            style={{
              position: 'absolute',
              alignItems: 'center',
              justifyContent: 'center',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
            }}
          />
        )}
      </Card>
    );
  }

  renderGoods() {
    return goods.map(good => this.renderGood(good));
  }

  render() {
    const { error } = this.state;
    const { onSettings } = this.props;
    return (
      <Container>
        <Header>
          <Body>
            <Title>Выбор товара</Title>
          </Body>
          <Right>
            <Button
              transparent
              onPress={onSettings}
            >
              <Icon name='menu' />
            </Button>
          </Right>
        </Header>
        <Content>
          {error && (
            <Text>
              {`Ошибка: ${error.message}`}
            </Text>
          )}
          {this.renderGoods()}
        </Content>
      </Container>
    );
  }
}


function mapStateToProps(state) {
  const { settings } = state;
  return { settings };
}

export default connect(mapStateToProps)(ShowGoods);
