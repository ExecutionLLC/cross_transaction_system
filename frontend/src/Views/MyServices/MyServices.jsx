import React, { Component } from 'react';
import { Form, FormControl, ControlLabel } from 'react-bootstrap';
import ViewBase from '../ViewBase';
import API from '../../API/API';
import ErrorPanel from '../../Components/ErrorPanel';
import ExpandableListItem from '../../Components/ExpandableListItem';
import AddItemButton from '../../Components/AddItemButton';


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
      expandedServicesHash: Object.create(null),
      expandedServicesOperatorsHash: Object.create(null),
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

  onServiceExpandToggle(serviceId, expand) {
    const { expandedServicesHash } = this.state;
    this.setState({
      expandedServicesHash: {
        ...expandedServicesHash,
        [serviceId]: expand,
      },
    });
  }

  renderService(service) {
    const id = service._id;
    const { expandedServicesHash } = this.state;
    const isExpanded = expandedServicesHash[id];
    return (
      <ExpandableListItem
        key={id}
        header={service.name}
        content={service.description}
        isExpanded={isExpanded}
        onExpandToggle={expand => this.onServiceExpandToggle(id, expand)}
      />
    );
  }

  renderServices() {
    const { myServices } = this.state;
    return myServices.map(service => this.renderService(service));
  }

  renderAddServiceControls() {
    return (
      <Form>
        <ControlLabel>Название</ControlLabel>
        <FormControl
          type="text"
        />
        <ControlLabel>Описание</ControlLabel>
        <FormControl
          type="text"
        />
        <ControlLabel>Мининальный баланс</ControlLabel>
        <FormControl
          type="number"
        />
        <ControlLabel>Максимальное движение вредств за сутки</ControlLabel>
        <FormControl
          type="number"
        />
      </Form>
    );
  }

  render() {
    const {
      isLoading, loadingError, myServices,
    } = this.state;
    return (
      <ViewBase {...this.props} pageHeader="Мои сервисы" isLoading={isLoading}>
        {loadingError && <ErrorPanel title="Ошибка загрузки" content={loadingError} />}
        <AddItemButton
          caption="Добавить сервис"
          onSubmit={() => true}
        >
          {this.renderAddServiceControls()}
        </AddItemButton>
        {myServices && this.renderServices()}
      </ViewBase>
    );
  }
}


export default MyServices;
