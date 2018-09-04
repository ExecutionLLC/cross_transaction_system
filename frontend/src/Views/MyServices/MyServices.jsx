import React, { Component } from 'react';
import {
  Form, FormGroup, FormControl, ControlLabel, HelpBlock
} from 'react-bootstrap';
import ViewBase from '../ViewBase';
import API from '../../API/API';
import ErrorPanel from '../../Components/ErrorPanel';
import ExpandableListItem from '../../Components/ExpandableListItem';
import AddItemButton from '../../Components/AddItemButton';
import Loading from '../../Components/Loading';


class MyServices extends Component {
  static makeDefaultAddingServiceData() {
    return {
      name: '',
      description: '',
      minBalance: 0,
      maxTransfer: 0,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      loadingError: null,
      addingServiceData: MyServices.makeDefaultAddingServiceData(),
      addingServiceError: null,
      addingServiceLoading: false,
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

  onAddServiceOpen() {
    this.setState({
      addingServiceData: MyServices.makeDefaultAddingServiceData(),
    });
  }

  onAddServiceSubmit() {
    if (!this.addServiceValidation()) {
      return false;
    }
    this.setState({
      addingServiceLoading: true,
      addingServiceError: null,
    });
    const {
      addingServiceData: {
        name, description, minBalance, maxTransfer,
      },
    } = this.state;
    return API.addService({
      name,
      description,
      limits: {
        minBalance,
        maxTransfer,
      },
    })
      .then((services) => {
        this.setState({
          addingServiceLoading: false,
          myServices: services,
        });
        return true;
      })
      .catch((error) => {
        let addingServiceError;
        if (error.code === API.ERRORS.ALREADY_EXISTS) {
          addingServiceError = {
            name: 'Сервис существует',
          };
        } else {
          addingServiceError = {
            message: `Ошибка добавления сервиса: ${error.message}`,
          };
        }
        this.setState({
          addingServiceLoading: false,
          addingServiceError,
        });
        return false;
      });
  }

  addServiceValidation() {
    const {
      addingServiceData: {
        name, description, minBalance, maxTransfer,
      },
    } = this.state;

    const setError = (error) => {
      this.setState({ addingServiceError: error });
    };

    if (!name) {
      setError({ name: 'Имя не задано' });
      return false;
    }
    if (!description) {
      setError({ description: 'Описание не задано' });
      return false;
    }
    if (!(minBalance >= 0)) {
      setError({ minBalance: 'Минимальный баланс должен быть нулём или больше' });
      return false;
    }
    if (!(maxTransfer >= 0)) {
      setError({ maxTransfer: 'Максимальное движение по счёту должно быть нулём или больше' });
      return false;
    }
    setError(null);
    return true;
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
    const {
      addingServiceData: {
        name, description,
        minBalance, maxTransfer,
      },
      addingServiceError,
      addingServiceLoading,
    } = this.state;

    const setData = (data) => {
      const { addingServiceData } = this.state;
      this.setState({
        addingServiceData: {
          ...addingServiceData,
          ...data,
        },
      });
    };

    function wrapOnChange(f) {
      return event => f(event.target.value);
    }

    /* eslint-disable no-shadow */
    return (
      <Form>
        <FormGroup
          validationState={addingServiceError && addingServiceError.name ? 'error' : null}
        >
          <ControlLabel>Название</ControlLabel>
          <FormControl
            type="text"
            value={name}
            onChange={wrapOnChange(name => setData({ name }))}
          />
          {addingServiceError && addingServiceError.name
          && <HelpBlock>{addingServiceError.name}</HelpBlock>
          }
        </FormGroup>
        <FormGroup
          validationState={addingServiceError && addingServiceError.description ? 'error' : null}
        >
          <ControlLabel>Описание</ControlLabel>
          <FormControl
            type="text"
            value={description}
            onChange={wrapOnChange(description => setData({ description }))}
          />
          {addingServiceError && addingServiceError.description
          && <HelpBlock>{addingServiceError.description}</HelpBlock>
          }
        </FormGroup>
        <FormGroup
          validationState={addingServiceError && addingServiceError.minBalance ? 'error' : null}
        >
          <ControlLabel>Мининальный баланс</ControlLabel>
          <FormControl
            type="number"
            value={minBalance}
            onChange={wrapOnChange(minBalance => setData({ minBalance }))}
          />
          {addingServiceError && addingServiceError.minBalance
          && <HelpBlock>{addingServiceError.minBalance}</HelpBlock>
          }
        </FormGroup>
        <FormGroup
          validationState={addingServiceError && addingServiceError.maxTransfer ? 'error' : null}
        >
          <ControlLabel>Максимальное движение вредств за сутки</ControlLabel>
          <FormControl
            type="number"
            value={maxTransfer}
            onChange={wrapOnChange(maxTransfer => setData({ maxTransfer }))}
          />
          {addingServiceError && addingServiceError.maxTransfer
          && <HelpBlock>{addingServiceError.maxTransfer}</HelpBlock>
          }
        </FormGroup>
        {addingServiceLoading && <Loading />}
        {addingServiceError && addingServiceError.message && (
          <FormGroup
            validationState="error"
          >
            <HelpBlock>{addingServiceError.message}</HelpBlock>
          </FormGroup>
        )}
      </Form>
    );
    /* eslint-disable no-shadow */
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
          onOpen={() => this.onAddServiceOpen()}
          onSubmit={() => this.onAddServiceSubmit()}
        >
          {this.renderAddServiceControls()}
        </AddItemButton>
        {myServices && this.renderServices()}
      </ViewBase>
    );
  }
}


export default MyServices;
