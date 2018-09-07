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


class ShowGoods extends Component {
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
      error: null,
      buyingGoodName: good.name,
    });
    api.buyGood(id, good.cost, good.name)
      .then(res => {
        this.setState({
          isLoading: false,
          error: null,
        });
        this.props.onWalletInfo(res.walletInfo);
      })
      .catch(error => {
        this.setState({
          isLoading: false,
          error: {
            message: error.message,
          },
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
    const { error } = this.state;
    const { walletInfo: { balance }, onCancel } = this.props;
    return (
      <Container>
        <Header>
          <Left>
            <Button
              onPress={onCancel}
            >
              <Text>
                &lt; Завершить
              </Text>
            </Button>
          </Left>
          <Body>
          <Title>Выбор товара</Title>
          </Body>
        </Header>
        <Content>
          <Text>
            {`Баланс: ${balance}`}
          </Text>
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


export default ShowGoods;
