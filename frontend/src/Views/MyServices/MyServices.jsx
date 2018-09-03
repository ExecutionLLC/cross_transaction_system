import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import ViewBase from '../ViewBase';
import API from '../../API/API';
import ErrorPanel from '../../Components/ErrorPanel';


class MyServices extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      loadingError: null,
      isAddingService: false,
      addindOperatorToService: null,
      operators: null,
      myServices: null,
    };
  }

  componentDidMount() {
    this.setState({
      isLoading: true,
    });
    API.getOperators()
      .then((operators) => {
        this.setState({
          operators,
        });
        return API.getMyServices()
          .then((myServices) => {
            this.setState({
              isLoading: false,
              loadingError: false,
              myServices,
            });
          })
          .catch(() => {
            this.setState({
              isLoading: false,
              loadingError: 'Не загрузился список собственных сервисов',
            });
          });
      })
      .catch(() => {
        this.setState({
          isLoading: false,
          loadingError: 'Не загрузился список операторов',
        });
      });
  }

  render() {
    const {
      isLoading, loadingError, operators, myServices,
    } = this.state;
    return (
      <ViewBase {...this.props} pageHeader="Мои сервисы" isLoading={isLoading}>
        {loadingError && <ErrorPanel title="Ошибка загрузки" content={loadingError} />}
        {operators && JSON.stringify(operators)}
        {myServices && JSON.stringify(myServices)}
        <Button>
          Добавить сервис
        </Button>
      </ViewBase>
    );
  }
}


export default MyServices;
