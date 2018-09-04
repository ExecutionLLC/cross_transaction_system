import React from 'react';
import PropTypes from 'prop-types';
import { FormControl } from 'react-bootstrap';


function OperatorsSelect(props) {
  const { operators } = props;
  return (
    <FormControl
      componentClass="select"
      onChange={evt => props.onSelect(evt.target.value)}
    >
      {operators.map(operator => (
        <option
          key={operator._id}
          value={operator._id}
        >
          {operator.name}
        </option>
      ))}
    </FormControl>
  );
}

OperatorsSelect.propTypes = {
  operators: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    }).isRequired,
  ).isRequired,
  onSelect: PropTypes.func.isRequired,
};


export default OperatorsSelect;
