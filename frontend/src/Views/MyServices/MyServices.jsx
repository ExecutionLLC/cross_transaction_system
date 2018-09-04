import React, { Component } from 'react';
import ViewBase from '../ViewBase';
import API from '../../API/API';
import ErrorPanel from '../../Components/ErrorPanel';
import ExpandableListItem from '../../Components/ExpandableListItem';
import AddingServiceData from './AddingServiceData';


class MyServices extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      loadingError: null,
      // addindOperatorToService: null, TODO uncomment and handle
      // operators: null, TODO uncomment and handle
      myServices: null,
      expandedServicesHash: Object.create(null),
      // expandedServicesOperatorsHash: Object.create(null), TODO uncomment and handle
    };
  }

  componentDidMount() {
    this.setState({
      isLoading: true,
    });
    API.getOperators()
      .then((/* operators TODO uncomment and handle */) => {
        this.setState({
          // operators, TODO uncomment and handle
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

  onServiceAdded(services) {
    this.setState({
      myServices: services,
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

  render() {
    const {
      isLoading, loadingError, myServices,
    } = this.state;
    return (
      <ViewBase {...this.props} pageHeader="Мои сервисы" isLoading={isLoading}>
        {loadingError && <ErrorPanel title="Ошибка загрузки" content={loadingError} />}
        <AddingServiceData
          onServiceAdded={services => this.onServiceAdded(services)}
        />
        {myServices && this.renderServices()}
      </ViewBase>
    );
  }
}


export default MyServices;
