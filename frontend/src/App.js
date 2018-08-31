import React, { Component } from 'react';
import { PageHeader, Panel } from 'react-bootstrap';

class App extends Component {
  render() {
    return (
      <div>
        <PageHeader>
          Page header
        </PageHeader>
        <Panel bsStyle="danger">
          <Panel.Heading>
            <Panel.Title componentClass="h3">Panel title</Panel.Title>
          </Panel.Heading>
          <Panel.Body>Panel body</Panel.Body>
        </Panel>
      </div>
    );
  }
}

export default App;
