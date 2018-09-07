import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  FormGroup, HelpBlock,
  Grid, Row, Col,
} from 'react-bootstrap';
import API from '../../API/API';
import Loading from '../../Components/Loading';
import OperatorsSelect from './OperatorsSelect';
import AddItemButton from '../../Components/AddItemButton';


class AddingOperator extends Component {
  constructor(props) {
    super(props);
    const { operators } = this.props;
    this.state = {
      currentOperatorId: operators.length > 0 ? operators[0]._id : -1,
      error: null,
      isLoading: false,
    };
  }

  onAddOperatorOpen() {
    const { operators } = this.props;
    this.setState({
      currentOperatorId: operators.length > 0 ? operators[0]._id : -1,
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

  renderAddContent() {
    const { operators } = this.props;
    const { currentOperatorId, isLoading, error } = this.state;
    const disabled = isLoading;
    return (
      <div>
        {
          operators.length < 1 ? (
            <Grid>
              <Row>
                <Col sm={6}>
                  Нет доступных операторов для добавления
                </Col>
              </Row>
            </Grid>
          ) : (
            <Grid>
              <Row>
                <Col sm={6}>
                  Выберите из доступных операторов:
                </Col>
              </Row>
              <Row>
                <Col sm={6}>
                  <OperatorsSelect
                    operators={operators}
                    currentOperator={currentOperatorId}
                    onSelect={operatorId => this.onSelect(operatorId)}
                    disabled={disabled}
                  />
                </Col>
              </Row>
              <Row>
                <Col sm={6}>
                  {isLoading && <Loading />}
                  {error && (
                    <FormGroup
                      validationState="error"
                    >
                      <HelpBlock>{error}</HelpBlock>
                    </FormGroup>
                  )}
                </Col>
              </Row>
            </Grid>
          )
        }
      </div>
    );
  }

  render() {
    const { operators } = this.props;
    return (
      <AddItemButton
        caption="Добавить оператора"
        onOpen={() => this.onAddOperatorOpen()}
        onSubmit={() => this.onAddOperatorSubmit()}
        renderSubmitBtn={operators.length > 0}
      >
        {this.renderAddContent()}
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
