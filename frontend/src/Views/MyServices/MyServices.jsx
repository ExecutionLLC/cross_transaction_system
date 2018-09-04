import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';
import ViewBase from '../ViewBase';
import API from '../../API/API';
import ErrorPanel from '../../Components/ErrorPanel';
import ExpandableListItem from '../../Components/ExpandableListItem';
import AddingServiceData from './AddingServiceData';
import Operator from './Operator';
import utils from '../../utils/utils';


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
      changingServicesOperatorsHash: Object.create(null),
      errorServicesOperatorsHash: Object.create(null),
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

  onServiceOperatorActiveToggle(serviceId, operatorId, isActive) {
    const toggleChanging = (isChanging) => {
      const { changingServicesOperatorsHash } = this.state;
      this.setState({
        changingServicesOperatorsHash: {
          ...changingServicesOperatorsHash,
          [serviceId]: {
            ...changingServicesOperatorsHash[serviceId],
            [operatorId]: isChanging,
          },
        },
      });
    };

    const toggleError = (error) => {
      const { errorServicesOperatorsHash } = this.state;
      this.setState({
        errorServicesOperatorsHash: {
          ...errorServicesOperatorsHash,
          [serviceId]: {
            ...errorServicesOperatorsHash[serviceId],
            [operatorId]: error,
          },
        },
      });
    };

    toggleChanging(true);
    API.setOperatorActive(serviceId, operatorId, isActive)
      .then((services) => {
        toggleChanging(false);
        toggleError(null);
        this.setState({
          myServices: services,
        });
      })
      .catch((error) => {
        toggleChanging(false);
        toggleError(error.message);
      });
  }

  renderServiceOperators(serviceOperators, serviceId, expandedHash, changingHash, errorsHash) {
    const { operatorsHash } = this.state;
    return serviceOperators.map(
      operator => (
        <Operator
          key={operator._id}
          name={operatorsHash[operator._id].name}
          isActive={operator.isActive}
          startDate={`${new Date(operator.startDate)}`}
          isExpanded={expandedHash[operator._id]}
          isChanging={changingHash[operator._id]}
          error={errorsHash[operator._id]}
          onExpandToggle={expanded => (
            this.onExpandServiceOperatorToggle(serviceId, operator._id, expanded)
          )}
          onActivateToggle={active => (
            this.onServiceOperatorActiveToggle(serviceId, operator._id, active)
          )}
        />
      ),
    );
  }

  renderServiceContent(service) {
    const {
      expandedServicesOperatorsHash, changingServicesOperatorsHash, errorServicesOperatorsHash,
    } = this.state;
    return (
      <div>
        <Row>
          <Col sm={12}>
            {service.description}
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
            {this.renderServiceOperators(
              service.operators,
              service._id,
              expandedServicesOperatorsHash[service._id] || Object.create(null),
              changingServicesOperatorsHash[service._id] || Object.create(null),
              errorServicesOperatorsHash[service._id] || Object.create(null),
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
