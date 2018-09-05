import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';
import ViewBase from '../ViewBase';
import API from '../../API/API';
import ErrorPanel from '../../Components/ErrorPanel';
import ExpandableListItem from '../../Components/ExpandableListItem';
import AddingServiceData from './AddingServiceData';
import Operator from './Operator';
import utils from '../../utils/utils';
import AddingOperator from './AddingOperator';
import ToggleActive from './ToggleActive';


class MyServices extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      loadingError: null,
      // addindOperatorToService: null, TODO uncomment and handle
      operators: null,
      operatorsHash: null,
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
          operatorsHash: utils.makeHashById(operators),
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

  onExpandServiceOperatorToggle(serviceId, operatorId, isExpanded) {
    const { expandedServicesOperatorsHash } = this.state;
    this.setState({
      expandedServicesOperatorsHash: {
        ...expandedServicesOperatorsHash,
        [serviceId]: {
          ...expandedServicesOperatorsHash[serviceId],
          [operatorId]: isExpanded,
        },
      },
    });
  }

  onServiceOperatorAdded(services) {
    this.setState({
      myServices: services,
    });
  }

  onToggleServiceActive(services) {
    this.setState({
      myServices: services,
    });
  }

  onToggleServiceOperatorActive(services) {
    this.setState({
      myServices: services,
    });
  }

  renderServiceOperators(serviceOperators, serviceId, expandedHash) {
    const { operatorsHash } = this.state;
    return serviceOperators.map(
      (operator) => {
        const operatorId = operator._id;
        return (
          <Operator
            key={operatorId}
            serviceId={serviceId}
            operatorId={operatorId}
            name={operatorsHash[operatorId].name}
            isActive={operator.isActive}
            startDate={`${new Date(operator.startDate)}`}
            isExpanded={expandedHash[operatorId]}
            onExpandToggle={expanded => (
              this.onExpandServiceOperatorToggle(serviceId, operatorId, expanded)
            )}
            onActivateToggle={services => this.onToggleServiceOperatorActive(services)}
          />
        );
      },
    );
  }

  renderServiceContent(service) {
    const { expandedServicesOperatorsHash, operators } = this.state;
    const addedOperatorsHash = utils.makeHashById(service.operators);
    const operatorsToAdd = operators.filter(
      operator => !addedOperatorsHash[operator._id],
    );
    return (
      <div>
        <Row>
          <Col sm={6}>
            {service.description}
          </Col>
          <Col sm={6}>
            <ToggleActive
              isActive={service.isActive}
              serviceId={service._id}
              onSwitch={services => this.onToggleServiceActive(services)}
            />
          </Col>
        </Row>
        <Row>
          <Col sm={3}>
            Минимальный баланс
          </Col>
          <Col sm={3}>
            {service.limits.minBalance}
          </Col>
          <Col sm={3}>
            Максимальное движение
          </Col>
          <Col sm={3}>
            {service.limits.maxTransfer}
          </Col>
        </Row>
        <Row>
          <Col sm={12}>
            {operatorsToAdd.length > 0
              && (
                <AddingOperator
                  operators={operatorsToAdd}
                  serviceId={service._id}
                  onOperatorAdded={services => this.onServiceOperatorAdded(services)}
                />
              )
            }
            {this.renderServiceOperators(
              service.operators,
              service._id,
              expandedServicesOperatorsHash[service._id] || Object.create(null),
            )}
          </Col>
        </Row>
      </div>
    );
  }

  renderService(service) {
    const id = service._id;
    const { expandedServicesHash } = this.state;
    const isExpanded = expandedServicesHash[id];
    return (
      <ExpandableListItem
        key={id}
        header={service.name}
        content={this.renderServiceContent(service)}
        isExpanded={isExpanded}
        onExpandToggle={expand => this.onServiceExpandToggle(id, expand)}
      />
    );
  }

  renderServices() {
    const { myServices } = this.state;
    console.log('state', this.state);
    return myServices.map(service => this.renderService(service));
  }

  render() {
    const {
      isLoading, loadingError, myServices,
    } = this.state;
    return (
      <ViewBase {...this.props} pageHeader="Мои сервисы" isLoading={isLoading}>
        {loadingError && <ErrorPanel title="Ошибка загрузки" content={loadingError} />}
        {!loadingError && (
          <div>
            <AddingServiceData
              onServiceAdded={services => this.onServiceAdded(services)}
            />
            {myServices && this.renderServices()}
          </div>
        )}
      </ViewBase>
    );
  }
}


export default MyServices;
