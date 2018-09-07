import React, { Component } from 'react';
import { Text, Image, View } from 'react-native';
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
      error: null,
    };
  }

  onBuy(name) {
    const good = goods.find(g => g.name === name);
    console.log(good);
  }

  renderGood(good) {
    return (
      <Card
        key={good.name}
      >
        <View style={{flex: 1, flexDirection: 'row'}}>
          <View style={{width: '60%'}}>
            {<Image source={good.image} style={{width: '100%', flex: 1}} />}
          </View>
          <View style={{width: '40%'}}>
            <Text>
            {`${good.name} - ${good.cost} руб.`}
            </Text>
            <Button style={{width: '100%'}}>
              <Text>
                Купить
              </Text>
            </Button>
          </View>
        </View>
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
