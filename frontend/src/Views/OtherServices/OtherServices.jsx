import React, { Component } from 'react';
import { Row, Col, Glyphicon } from 'react-bootstrap';
import ViewBase from '../ViewBase';
import API from '../../API/API';
import ErrorPanel from '../../Components/ErrorPanel';
import ExpandableListItem from '../../Components/ExpandableListItem';
import ToggleActive from './ToggleActive';
import LastSuccessTransaction from '../../Components/LastSuccesTransaction';


class OtherServices extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      loadingError: null,
      otherServices: null,
      expandedServicesHash: Object.create(null),
      lastSuccessTransaction: null,
    };
  }

  componentDidMount() {
    this.setState({
      isLoading: true,
    });
    API.getExternalServices()
      .then((otherServices) => {
        this.setState({
          isLoading: false,
          loadingError: false,
          otherServices,
        });
      })
      .catch(() => {
        this.setState({
          isLoading: false,
          loadingError: 'Не загрузился список внешних сервисов',
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

  onToggleCardActiveResult(toggleCardActiveResult) {
    if (toggleCardActiveResult) {
      const { services, transactionId } = toggleCardActiveResult;
      this.setState({
        otherServices: services,
        lastSuccessTransaction: {
          title: 'Статус карты изменён',
          id: transactionId,
        },
      });
    } else {
      this.setState({
        lastSuccessTransaction: null,
      });
    }
  }

  renderServiceContent(service) {
    const {
      name,
      processingName, processingDescription,
      processingIsAllowed, serviceIsActive,
      serviceLimits: {
        minBalance, maxTransfer,
      },
    } = service;
    return (
      <div>
        <Row>
          <Col sm={8}>
            <Row>
              <Col sm={6}>
                Название сервиса:
              </Col>
              <Col sm={6}>
                {processingDescription}
              </Col>
            </Row>
            <Row>
              <Col sm={6}>
                Минимальный баланс:
              </Col>
              <Col sm={6}>
                {minBalance}
              </Col>
            </Row>
            <Row>
              <Col sm={6}>
                Максимальное движение:
              </Col>
              <Col sm={6}>
                {maxTransfer}
              </Col>
            </Row>
            <Row>
              <Col sm={6}>
                Сервис активен и доступен:
              </Col>
              <Col>
                <Glyphicon
                  glyph={processingIsAllowed ? 'ok-sign' : 'remove-sign'}
                  style={{
                    marginLeft: '16px',
                    color: processingIsAllowed ? 'green' : 'red',
                    fontSize: '16px',
                  }}
                />
              </Col>
            </Row>

          </Col>

          <Col sm={4}>
            <ToggleActive
              isActive={serviceIsActive}
              operatorId={processingName}
              serviceId={name}
              onSwitchResult={switchResult => this.onToggleCardActiveResult(switchResult)}
            />
          </Col>
        </Row>
      </div>
    );
  }

  renderServiceHeader(service) {
    const {
      processingName, name,
      processingIsAllowed, serviceIsActive,
    } = service;
    const serviceIsWorking = processingIsAllowed && serviceIsActive;
    return (
      <span>
        {`${processingName}/${name}`}
        <span style={{ marginLeft: '20px' }}>
          {`СТАТУС: ${serviceIsWorking ? 'Запущен' : 'Остановлен'}`}
          <Glyphicon
            glyph={serviceIsWorking ? 'ok-sign' : 'remove-sign'}
            style={{
              marginLeft: '20px',
              color: serviceIsWorking ? 'green' : 'red',
              fontSize: '18px',
            }}
          />
        </span>
      </span>
    );
  }

  renderService(service) {
    const {
      _id,
      processingIsAllowed, serviceIsActive,
    } = service;
    const serviceIsWorking = processingIsAllowed && serviceIsActive;
    const { expandedServicesHash } = this.state;
    const isExpanded = expandedServicesHash[_id];
    return (
      <ExpandableListItem
        key={_id}
        header={this.renderServiceHeader(service)}
        content={this.renderServiceContent(service)}
        isExpanded={isExpanded}
        onExpandToggle={expand => this.onServiceExpandToggle(_id, expand)}
        status={serviceIsWorking}
      />
    );
  }

  renderServices() {
    const { otherServices } = this.state;
    return otherServices.map(service => this.renderService(service));
  }

  render() {
    const {
      isLoading, loadingError, otherServices,
      lastSuccessTransaction,
    } = this.state;
    return (
      <ViewBase
        {...this.props}
        pageHeader="Внешние сервисы"
        isLoading={isLoading}
      >
        {lastSuccessTransaction && (
          <LastSuccessTransaction
            title={lastSuccessTransaction.title}
            transactionId={lastSuccessTransaction.id}
          />
        )}
        {loadingError && <ErrorPanel title="Ошибка загрузки" content={loadingError} />}
        {!loadingError && otherServices && this.renderServices()}
      </ViewBase>
    );
  }
}


export default OtherServices;
