import React, { Component } from 'react';
import { PageHeader, Panel } from 'react-bootstrap';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <PageHeader>
          Page header
        </PageHeader>
        <Panel bsStyle="danger">
          <Panel.Heading>
            <Panel.Title componentClass="h3">Panel title</Panel.Title>
          </Panel.Heading>
          <Panel.Body>Panel body</Panel.Body>
        </Panel>
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
      </div>
    );
  }
}

export default App;
