import React, {Component} from 'react';
import EnterWallet from './Views/EnterWallet';
import ShowGoods from './Views/ShowGoods';


export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isWalletRequest: true,
      walletInfo: null,
    }
  }

  onWalletInfo(walletInfo) {
    this.setState({
      walletInfo,
      isWalletRequest: false,
    });
  }

  onExitGoods() {
    this.setState({
      isWalletRequest: true,
    });
  }

  render() {
    const { isWalletRequest, walletInfo } = this.state;
    return (
      isWalletRequest
        ? (
          <EnterWallet
            onWalletInfo={walletInfo => this.onWalletInfo(walletInfo)}
          />
        ) : (
          <ShowGoods
            walletInfo={walletInfo}
            onWalletInfo={walletInfo => this.onWalletInfo(walletInfo)}
            onCancel={() => this.onExitGoods()}
          />
        )
    );
  }
}
