import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SwitchButton from '../../Components/SwitchButton';
import API from '../../API/API';


class ToggleActive extends Component {
  onClick() {
    const { serviceId, isActive, onSwitchResult } = this.props;
    return API.setServiceActive(serviceId, !isActive)
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
          activeButtonText="Остановить"
          inactiveButtonText="Запустить"
          activeStatusText="Запущен"
          inactiveStatusText="Остановлен"
          onClick={() => this.onClick()}
          activeToolTipText="Остановить сервис"
          inactiveToolTipText="Запустить сервис"
        />
      </div>
    );
  }
}

ToggleActive.propTypes = {
  isActive: PropTypes.bool.isRequired,
  serviceId: PropTypes.string.isRequired,
  onSwitchResult: PropTypes.func.isRequired,
};


export default ToggleActive;
