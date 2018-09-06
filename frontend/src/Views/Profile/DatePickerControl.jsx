import React, { Component } from 'react';
import { Button } from 'react-bootstrap';

class DatePickerControl extends Component {
  render() {
    const { value, placeholder, ...rest } = this.props;
    return (
      <Button {...rest} className="select-date-button">
        {value || placeholder}
      </Button>
    );
  }
}

export default DatePickerControl;
