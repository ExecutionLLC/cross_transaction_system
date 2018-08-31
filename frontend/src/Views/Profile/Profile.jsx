import React, { Component } from 'react';
import ViewBase from '../ViewBase';


class Profile extends Component {
  render() {
    return (
      <ViewBase {...this.props} pageHeader="Profile" />
    );
  }
}


export default Profile;
