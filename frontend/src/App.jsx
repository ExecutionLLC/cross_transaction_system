import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Profile from './Views/Profile/Profile';
import MyServices from './Views/MyServices/MyServices';
import OtherServices from './Views/OtherServices/OtherServices';
import Cards from './Views/Cards/Cards';
import Login from './Views/Login/Login';

/* global document */


class App extends Component {
  componentDidMount() {
    document.title = 'Cross transaction system';
  }

  render() {
    return (
      <Router>
        <Switch>
          <Route path="/profile" component={Profile} />
          <Route path="/myservices" component={MyServices} />
          <Route path="/otherservices" component={OtherServices} />
          <Route path="/cards" component={Cards} />
          <Route path="/auth" component={Login} />
          <Route component={Profile} />
        </Switch>
      </Router>
    );
  }
}

export default App;
