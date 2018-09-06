import React, { Component } from 'react';
import { Router, Switch, Route } from 'react-router-dom';
import PrivateRoute from './Components/PrivateRoute';
import Profile from './Views/Profile/Profile';
import MyServices from './Views/MyServices/MyServices';
import OtherServices from './Views/OtherServices/OtherServices';
import Cards from './Views/Cards/Cards';
import Login from './Views/Login/Login';
import { history } from './API/history';


class App extends Component {
  componentDidMount() {
    document.title = 'Cross transaction system';
  }

  render() {
    return (
      <Router history={history}>
        <Switch>
          <PrivateRoute exact path="/profile" component={Profile} />
          <PrivateRoute exact path="/myservices" component={MyServices} />
          <PrivateRoute exact path="/otherservices" component={OtherServices} />
          <PrivateRoute exact path="/cards" component={Cards} />
          <Route path="/auth" component={Login} />
          <Route component={Login} />
        </Switch>
      </Router>
    );
  }
}

export default App;
