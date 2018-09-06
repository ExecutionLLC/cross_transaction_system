import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormGroup, HelpBlock } from 'react-bootstrap';
import API from '../../API/API';
import AddItemButton from '../../Components/AddItemButton';
import Loading from '../../Components/Loading';
import OperatorsSelect from './OperatorsSelect';


class AddingOperator extends Component {
  constructor(props) {
    super(props);
    const { operators } = this.props;
    this.state = {
      currentOperatorId: operators[0]._id,
      error: null,
      isLoading: false,
    };
  }

  onAddOperatorOpen() {
    const { operators } = this.props;
    this.setState({
      currentOperatorId: operators[0]._id,
      error: null,
      isLoading: false,
    });
  }

  onAddOperatorSubmit() {
    this.setState({
      isLoading: true,
      error: null,
    });
    const { serviceId, onOperatorAddResult } = this.props;
    const { currentOperatorId } = this.state;
    return API.addOperator(serviceId, currentOperatorId)
      .then((operatorAddResult) => {
        this.setState(
          {
            isLoading: false,
          },
          () => {
            onOperatorAddResult(operatorAddResult);
          },
        );
        return true;
      })
      .catch((apiError) => {
        this.setState(
          {
            isLoading: false,
            error: `Ошибка добавления сервиса: ${apiError.message}`,
          },
          () => onOperatorAddResult(),
        );
        return false;
      });
  }

  onSelect(currentOperatorId) {
    this.setState({
      currentOperatorId,
    });
  }

  render() {
    const { operators } = this.props;
    const { currentOperatorId, isLoading, error } = this.state;
    const disabled = isLoading;
    return (
      <AddItemButton
        caption="Добавить оператора"
        onOpen={() => this.onAddOperatorOpen()}
        onSubmit={() => this.onAddOperatorSubmit()}
      >
        <OperatorsSelect
          operators={operators}
          currentOperator={currentOperatorId}
          onSelect={operatorId => this.onSelect(operatorId)}
          disabled={disabled}
        />
        {isLoading && <Loading />}
        {error && (
          <FormGroup
            validationState="error"
          >
            <HelpBlock>{error}</HelpBlock>
          </FormGroup>
        )}
      </AddItemButton>
    );
  }
}

AddingOperator.propTypes = {
  operators: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    }).isRequired,
  ).isRequired,
  serviceId: PropTypes.string.isRequired,
  onOperatorAddResult: PropTypes.func.isRequired,
};


export default AddingOperator;
