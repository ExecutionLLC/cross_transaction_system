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
import LastSuccessTransaction from '../../Components/LastSuccesTransaction';


class MyServices extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      loadingError: null,
      operators: null,
      operatorsHash: null,
      myServices: null,
      expandedServicesHash: Object.create(null),
      expandedServicesOperatorsHash: Object.create(null),
      lastSuccessTransaction: null,
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

  onServiceAddResult(serviceAddResult) {
    if (serviceAddResult) {
      const { services, transactionId } = serviceAddResult;
      this.setState({
        myServices: services,
        lastSuccessTransaction: {
          title: 'Сервис добавлен',
          id: transactionId,
        },
      });
    } else {
      this.setState({
        lastSuccessTransaction: null,
      });
    }
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

  onServiceOperatorAddResult(operatorAddResult) {
    if (operatorAddResult) {
      const { services, transactionId } = operatorAddResult;
      this.setState({
        myServices: services,
        lastSuccessTransaction: {
          title: 'Оператор добавлен',
          id: transactionId,
        },
      });
    } else {
      this.setState({
        lastSuccessTransaction: null,
      });
    }
  }

  onToggleServiceActiveResult(toggleServiceActiveResult) {
    if (toggleServiceActiveResult) {
      const { services, transactionId } = toggleServiceActiveResult;
      this.setState({
        myServices: services,
        lastSuccessTransaction: {
          title: 'Состояние сервиса изменено',
          id: transactionId,
        },
      });
    } else {
      this.setState({
        lastSuccessTransaction: null,
      });
    }
  }

  onToggleServiceOperatorActiveResult(result) {
    if (result) {
      const { services, transactionId } = result;
      this.setState({
        myServices: services,
        lastSuccessTransaction: {
          title: 'Состояние оператора изменено',
          id: transactionId,
        },
      });
    } else {
      this.setState({
        lastSuccessTransaction: null,
      });
    }
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
            onActivateToggleResult={oepratorToggleResult => (
              this.onToggleServiceOperatorActiveResult(oepratorToggleResult)
            )}
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
              onSwitchResult={switchResult => this.onToggleServiceActiveResult(switchResult)}
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
                  onOperatorAddResult={operatorAddResult => (
                    this.onServiceOperatorAddResult(operatorAddResult)
                  )}
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
    return myServices.map(service => this.renderService(service));
  }

  render() {
    const {
      isLoading, loadingError, myServices,
      lastSuccessTransaction,
    } = this.state;
    return (
      <ViewBase {...this.props} pageHeader="Мои сервисы" isLoading={isLoading}>
        {lastSuccessTransaction && (
          <LastSuccessTransaction
            title={lastSuccessTransaction.title}
            transactionId={lastSuccessTransaction.id}
          />
        )}
        {loadingError && <ErrorPanel title="Ошибка загрузки" content={loadingError} />}
        {!loadingError && (
          <div>
            <AddingServiceData
              onServiceAddResult={serviceAddResult => this.onServiceAddResult(serviceAddResult)}
            />
            {myServices && this.renderServices()}
          </div>
        )}
      </ViewBase>
    );
  }
}


export default MyServices;
