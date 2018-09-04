import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Form, FormGroup, FormControl, ControlLabel, HelpBlock,
} from 'react-bootstrap';
import API from '../../API/API';
import AddItemButton from '../../Components/AddItemButton';
import Loading from '../../Components/Loading';


class AddingServiceData extends Component {
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
      addingServiceData: AddingServiceData.makeDefaultAddingServiceData(),
      addingServiceError: null,
      addingServiceLoading: false,
      addingServiceLiveValidation: false,
    };
  }

  onAddServiceOpen() {
    this.setState({
      addingServiceData: AddingServiceData.makeDefaultAddingServiceData(),
      addingServiceLiveValidation: false,
    });
  }

  onAddServiceSubmit() {
    if (!this.addServiceValidation()) {
      this.setState({
        addingServiceLiveValidation: true,
      });
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
        this.setState(
          {
            addingServiceLoading: false,
          },
          () => {
            const { onServiceAdded } = this.props;
            onServiceAdded(services);
          },
        );
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

  onAddingServiceDataChange() {
    const { addingServiceLiveValidation } = this.state;
    if (addingServiceLiveValidation) {
      this.addServiceValidation();
    }
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
      this.setState(
        {
          addingServiceData: {
            ...addingServiceData,
            ...data,
          },
        },
        () => {
          this.onAddingServiceDataChange();
        },
      );
    };
    function wrapOnChange(f) {
      return event => f(event.target.value);
    }

    function renderFormGroup(content, error) {
      return (
        <FormGroup
          validationState={error ? 'error' : null}
        >
          {content}
          {error && <HelpBlock>{error}</HelpBlock>
          }
        </FormGroup>
      );
    }

    /* eslint-disable no-shadow */
    return (
      <Form>
        {renderFormGroup(
          <div>
            <ControlLabel>Название</ControlLabel>
            <FormControl
              type="text"
              value={name}
              onChange={wrapOnChange(name => setData({ name }))}
            />
          </div>,
          addingServiceError && addingServiceError.name,
        )}
        {renderFormGroup(
          <div>
            <ControlLabel>Описание</ControlLabel>
            <FormControl
              type="text"
              value={description}
              onChange={wrapOnChange(description => setData({ description }))}
            />
          </div>,
          addingServiceError && addingServiceError.description,
        )}
        {renderFormGroup(
          <div>
            <ControlLabel>Мининальный баланс</ControlLabel>
            <FormControl
              type="number"
              value={minBalance}
              onChange={wrapOnChange(minBalance => setData({ minBalance }))}
            />
          </div>,
          addingServiceError && addingServiceError.minBalance,
        )}
        {renderFormGroup(
          <div>
            <ControlLabel>Максимальное движение вредств за сутки</ControlLabel>
            <FormControl
              type="number"
              value={maxTransfer}
              onChange={wrapOnChange(maxTransfer => setData({ maxTransfer }))}
            />
          </div>,
          addingServiceError && addingServiceError.maxTransfer,
        )}
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
    return (
      <AddItemButton
        caption="Добавить сервис"
        onOpen={() => this.onAddServiceOpen()}
        onSubmit={() => this.onAddServiceSubmit()}
      >
        {this.renderAddServiceControls()}
      </AddItemButton>
    );
  }
}

AddingServiceData.propTypes = {
  onServiceAdded: PropTypes.func.isRequired,
};


export default AddingServiceData;
