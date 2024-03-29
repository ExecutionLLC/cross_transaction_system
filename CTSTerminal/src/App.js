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
    super(props);
    this.state = {
      isWalletRequest: false,
      isSettings: !props.settings.url,
      selectedGood: null,
    }
  }

  onWalletDone() {
    this.setState({
      isWalletRequest: false,
    });
  }

  onBuy(good) {
    this.setState({
      isWalletRequest: true,
      selectedGood: good,
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

  onDoneSettings() {
    this.setState({
      isSettings: false,
    });
  }

  render() {
    const { isWalletRequest, isSettings, selectedGood } = this.state;
    return (
      isSettings
        ? (
          <Settings
            onDone={() => this.onDoneSettings()}
            onCancel={() => this.onExitSettings()}
          />
        ) : (
          isWalletRequest
            ? (
              <EnterWallet
                good={selectedGood}
                onBack={() => this.onWalletDone()}
              />
            ) : (
              <ShowGoods
                onSettings={() => this.onSettings()}
                onBuy={(good) => this.onBuy(good)}
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
