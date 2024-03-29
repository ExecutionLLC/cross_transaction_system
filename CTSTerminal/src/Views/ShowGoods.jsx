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
  }

  renderGood(good) {
    const { onBuy } = this.props;
    return (
      <Card
        key={good.name}
      >
        <View style={{flex: 1, flexDirection: 'row'}}>
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
                onPress={() => onBuy(good)}
              >
                <Text style={{textAlign: 'center'}}>
                  {`${good.cost} руб.\nКупить`}
                </Text>
              </TouchableHighlight>
            </View>
          </View>
        </View>
      </Card>
    );
  }

  renderGoods() {
    return goods.map(good => this.renderGood(good));
  }

  render() {
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
