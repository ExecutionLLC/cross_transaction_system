import React, {Component} from 'react';
import EnterWallet from './Views/EnterWallet';
import ShowGoods from './Views/ShowGoods';
import Settings from './Views/Settings';


export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isWalletRequest: true,
      isSettings: false,
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

  onSettings() {
    this.setState({
      isSettings: true,
    });
  }

  onExitSettings() {
    this.setState({
      isSettings: false,
    });
  }

  onUrl(url) {
    this.setState({
      isSettings: false,
    });
  }

  render() {
    const { isWalletRequest, isSettings, walletInfo } = this.state;
    return (
      isSettings
        ? (
          <Settings
            url="http://192.168.1.101:3001/"
            onUrl={url => this.onUrl(url)}
            onCancel={() => this.onExitSettings()}
          />
        ) : (
          isWalletRequest
            ? (
              <EnterWallet
                onWalletInfo={walletInfo => this.onWalletInfo(walletInfo)}
                onSettings={() => this.onSettings()}
              />
            ) : (
              <ShowGoods
                walletInfo={walletInfo}
                onWalletInfo={walletInfo => this.onWalletInfo(walletInfo)}
                onCancel={() => this.onExitGoods()}
              />
            )
        )
    );
  }
}
