import React, {Component} from 'react';
import EnterWallet from './Views/EnterWallet';
import ShowGoods from './Views/ShowGoods';


export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isWalletRequest: true,
      balance: null,
    }
  }

  onWalletBalance(balance) {
    this.setState({
      balance,
      isWalletRequest: false,
    });
  }

  render() {
    const { isWalletRequest, balance } = this.state;
    return (
      isWalletRequest
        ? (
          <EnterWallet
            onWalletBalance={balance => this.onWalletBalance(balance)}
          />
        ) : (
          <ShowGoods
            balance={balance}
            onWalletBalance={balance => this.onWalletBalance(balance)}
          />
        )
    );
  }
}
