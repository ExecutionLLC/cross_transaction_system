import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SwitchButton from '../../Components/SwitchButton';
import API from '../../API/API';


class ToggleActive extends Component {
  onClick() {
    const { serviceId, isActive, onSwitch } = this.props;
    return API.setServiceActive(serviceId, !isActive)
      .then((services) => {
        onSwitch(services);
      })
      .catch((error) => {
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
        />
      </div>
    );
  }
}

ToggleActive.propTypes = {
  isActive: PropTypes.bool.isRequired,
  serviceId: PropTypes.string.isRequired,
  onSwitch: PropTypes.func.isRequired,
};


export default ToggleActive;
