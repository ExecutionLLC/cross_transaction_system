import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import ViewBase from '../ViewBase';


class MyServices extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      loadingError: null,
      isAddingService: false,
      addindOperatorToService: null,
      myServices: null,
    };
  }

  render() {
    return (
      <ViewBase {...this.props} pageHeader="Мои сервисы">
        <Button>
          Добавить сервис
        </Button>
      </ViewBase>
    );
  }
}


export default MyServices;
