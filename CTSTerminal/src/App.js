import React, {Component} from 'react';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider } from 'react-redux';
import EnterWallet from './Views/EnterWallet';
import ShowGoods from './Views/ShowGoods';
import Settings from './Views/Settings';
import SmallSpinner from './Components/SmallSpinner';
import configureStore from './configureStore';


const { store, persistor } = configureStore();

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

  onDone() {
    this.setState({
      isSettings: false,
    });
  }

  render() {
    const { isWalletRequest, isSettings, walletInfo } = this.state;
    return (
      <Provider store={store}>
        <PersistGate loading={<SmallSpinner />} persistor={persistor}>
          {isSettings
            ? (
              <Settings
                onDone={() => this.onDone()}
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
            )}
        </PersistGate>
      </Provider>
    );
  }
}
