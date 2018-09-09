import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SwitchButton from '../../Components/SwitchButton';
import API from '../../API/API';


class ToggleActive extends Component {
  onClick() {
    const {
      operatorId, serviceId,
      isActive, onSwitchResult,
    } = this.props;
    return API.setExternalServiceState(operatorId, serviceId, !isActive)
      .then((services) => {
        onSwitchResult(services);
      })
      .catch((error) => {
        onSwitchResult();
        throw error.message;
      });
  }

  render() {
    const { isActive } = this.props;
    return (
      <div>
        <SwitchButton
          isActive={isActive}
          activeButtonText="Запретить"
          inactiveButtonText="Разрешить"
          activeStatusText="Разрешена обработка карт"
          inactiveStatusText="Запрещена обработка карт"
          onClick={() => this.onClick()}
          activeToolTipText="Запретить обработку карт"
          inactiveToolTipText="Разрешить обработку карт"
        />
      </div>
    );
  }
}

ToggleActive.propTypes = {
  isActive: PropTypes.bool.isRequired,
  operatorId: PropTypes.string.isRequired,
  serviceId: PropTypes.string.isRequired,
  onSwitchResult: PropTypes.func.isRequired,
};


export default ToggleActive;
