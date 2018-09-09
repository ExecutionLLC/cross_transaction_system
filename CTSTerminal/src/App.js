import React, {Component} from 'react';
import { connect } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider } from 'react-redux';
import EnterWallet from './Views/EnterWallet';
import ShowGoods from './Views/ShowGoods';
import Settings from './Views/Settings';
import SmallSpinner from './Components/SmallSpinner';
import configureStore from './configureStore';


const { store, persistor } = configureStore();


class AppWStorage extends Component {
  constructor(props) {
    console.log(props);
    super(props);
    this.state = {
      isWalletRequest: true,
      isSettings: !props.settings.url,
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
      isSettings
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
        )
    );
  }
}

function mapStateToProps(state) {
  const { settings } = state;
  return { settings };
}

const AppWStorageConnected = connect(mapStateToProps)(AppWStorage);



export default class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <PersistGate loading={<SmallSpinner />} persistor={persistor}>
          <AppWStorageConnected />
        </PersistGate>
      </Provider>
    );
  }
}
