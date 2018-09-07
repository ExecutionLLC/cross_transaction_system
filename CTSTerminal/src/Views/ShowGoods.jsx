import React, { Component } from 'react';
import { Text, Image, View, TouchableOpacity, ActivityIndicator } from 'react-native';
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
  Card,
  CardItem,
} from 'native-base';
import SmallSpinner from '../Components/SmallSpinner';
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


class EnterWallet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      buyingGoodName: null,
      error: null,
    };
  }

  onBuy(good) {
    const { walletInfo: { id } } = this.props;
    this.setState({
      isLoading: true,
      isError: null,
      buyingGoodName: good.name,
    });
    api.buyGood(id, good.cost, good.name)
      .then(res => {
        console.log('res', res);
        this.setState({
          isLoading: false,
          isError: null,
        });
        this.props.onWalletInfo(res.walletInfo);
      })
      .catch(err => {
        console.log('err', err);
        this.setState({
          isLoading: false,
          isError: err,
        });
      });
  }

  renderGood(good) {
    const { isLoading, buyingGoodName } = this.state;
    const { walletInfo: { balance } } = this.props;
    return (
      <Card
        key={good.name}
      >
        <View style={{flex: 1, flexDirection: 'row', opacity: isLoading ? 0.2 : 1}}>
          <View style={{width: '60%'}}>
            {<Image source={good.image} style={{width: '100%', flex: 1}} />}
          </View>
          <View style={{width: '40%'}}>
            <Text>
              {`${good.name} - ${good.cost} руб.`}
            </Text>
            <TouchableOpacity disabled={true}>
              <Text>
                {`${good.name} - ${good.cost} руб.`}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.1}>
              <Text>
                {`${good.name} - ${good.cost} руб.`}
              </Text>
            </TouchableOpacity>
            <Button
              style={{width: '100%'}}
              onPress={() => this.onBuy(good)}
            >
              <Text>
                Купить
              </Text>
            </Button>
          </View>
        </View>
        {balance < good.cost && (
          <View
            style={{
              position: 'absolute',
              alignItems: 'center',
              justifyContent: 'center',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              backgroundColor: 'red',
              opacity: 0.5,
            }}
          />
        )}
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
    const { walletInfo: { balance } } = this.props;
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
          {this.renderGoods()}
        </Content>
      </Container>
    );
  }
}


export default EnterWallet;
