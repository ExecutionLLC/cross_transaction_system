import React, { Component } from 'react';
import { Button, Panel } from 'react-bootstrap';
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

  renderService(service) {
    return (
      <Panel key={service._id} expanded={false} onToggle={() => {}}>
        <Panel.Heading>{service.name}</Panel.Heading>
        <Panel.Collapse>
          <Panel.Body>
            {service.description}
          </Panel.Body>
        </Panel.Collapse>
      </Panel>
    );
  }

  renderServices() {
    const { myServices } = this.state;
    return myServices.map(service => this.renderService(service));
  }

  render() {
    const {
      isLoading, loadingError, myServices,
    } = this.state;
    return (
      <ViewBase {...this.props} pageHeader="Мои сервисы" isLoading={isLoading}>
        {loadingError && <ErrorPanel title="Ошибка загрузки" content={loadingError} />}
        <Button>
          Добавить сервис
        </Button>
        {myServices && this.renderServices()}
      </ViewBase>
    );
  }
}


export default MyServices;
