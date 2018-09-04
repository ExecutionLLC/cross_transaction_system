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
      .then((services) => {
        this.setState(
          {
            isLoading: false,
          },
          () => {
            const { onServiceAdded } = this.props;
            onServiceAdded(services);
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
        this.setState({
          isLoading: false,
          error,
        });
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

  renderAddServiceControls() {
    const {
      data: {
        name, description,
        minBalance, maxTransfer,
      },
      error,
      isLoading,
    } = this.state;

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

    function renderFormGroup(content, groupError) {
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
          error && error.name,
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
          error && error.description,
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
          error && error.minBalance,
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
  onServiceAdded: PropTypes.func.isRequired,
};


export default AddingServiceData;
