import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Form, FormGroup, FormControl, ControlLabel, HelpBlock,
} from 'react-bootstrap';
import API from '../../API/API';
import AddItemButton from '../../Components/AddItemButton';
import Loading from '../../Components/Loading';


class AddingServiceData extends Component {
  static makeDefaultData() {
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
      data: AddingServiceData.makeDefaultData(),
      error: null,
      isLoading: false,
      isLiveValidation: false,
    };
  }

  onAddServiceOpen() {
    this.setState({
      data: AddingServiceData.makeDefaultData(),
      error: null,
      isLoading: false,
      isLiveValidation: false,
    });
  }

  onAddServiceSubmit() {
    if (!this.validate()) {
      this.setState({
        isLiveValidation: true,
      });
      return false;
    }
    this.setState({
      isLoading: true,
      error: null,
    });
    const {
      data: {
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
      .then((serviceAddResult) => {
        this.setState(
          {
            isLoading: false,
          },
          () => {
            const { onServiceAddResult } = this.props;
            onServiceAddResult(serviceAddResult);
          },
        );
        return true;
      })
      .catch((apiError) => {
        let error;
        if (apiError.code === API.ERRORS.ALREADY_EXISTS) {
          error = {
            name: 'Сервис существует',
          };
        } else {
          error = {
            message: `Ошибка добавления сервиса: ${apiError.message}`,
          };
        }
        this.setState(
          {
            isLoading: false,
            error,
          },
          () => {
            const { onServiceAddResult } = this.props;
            onServiceAddResult();
          },
        );
        return false;
      });
  }

  onDataChange() {
    const { isLiveValidation } = this.state;
    if (isLiveValidation) {
      this.validate();
    }
  }

  validate() {
    const {
      data: {
        name, description, minBalance, maxTransfer,
      },
    } = this.state;

    const setError = (error) => {
      this.setState({ error });
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

  renderFormGroup(content, groupError) {
    return (
      <FormGroup
        validationState={groupError ? 'error' : null}
      >
        {content}
        {groupError && <HelpBlock>{groupError}</HelpBlock>
        }
      </FormGroup>
    );
  }

  renderAddServiceControls() {
    const {
      data: {
        name, description,
        minBalance, maxTransfer,
      },
      error,
      isLoading,
    } = this.state;

    const disabled = isLoading;

    const setData = (newData) => {
      const { data } = this.state;
      this.setState(
        {
          data: {
            ...data,
            ...newData,
          },
        },
        () => {
          this.onDataChange();
        },
      );
    };
    function wrapOnChange(f) {
      return event => f(event.target.value);
    }

    /* eslint-disable no-shadow */
    return (
      <Form>
        {this.renderFormGroup(
          <div>
            <ControlLabel>Название</ControlLabel>
            <FormControl
              type="text"
              value={name}
              disabled={disabled}
              onChange={wrapOnChange(name => setData({ name }))}
            />
          </div>,
          error && error.name,
        )}
        {this.renderFormGroup(
          <div>
            <ControlLabel>Описание</ControlLabel>
            <FormControl
              type="text"
              value={description}
              disabled={disabled}
              onChange={wrapOnChange(description => setData({ description }))}
            />
          </div>,
          error && error.description,
        )}
        {this.renderFormGroup(
          <div>
            <ControlLabel>Мининальный баланс</ControlLabel>
            <FormControl
              type="number"
              value={minBalance}
              disabled={disabled}
              onChange={wrapOnChange(minBalance => setData({ minBalance: +minBalance }))}
            />
          </div>,
          error && error.minBalance,
        )}
        {this.renderFormGroup(
          <div>
            <ControlLabel>Максимальное движение вредств за сутки</ControlLabel>
            <FormControl
              type="number"
              value={maxTransfer}
              disabled={disabled}
              onChange={wrapOnChange(maxTransfer => setData({ maxTransfer: +maxTransfer }))}
            />
          </div>,
          error && error.maxTransfer,
        )}
        {isLoading && <Loading />}
        {error && error.message && (
          <FormGroup
            validationState="error"
          >
            <HelpBlock>{error.message}</HelpBlock>
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
  onServiceAddResult: PropTypes.func.isRequired,
};


export default AddingServiceData;
