import React, { Component } from 'react';
import ViewBase from '../ViewBase';
import API from '../../API/API';
import ErrorPanel from '../../Components/ErrorPanel';
import Loading from '../../Components/Loading';


class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      profileError: null,
      profileData: null,
    };
  }

  componentDidMount() {
    this.setState({
      isLoading: true,
      profileError: null,
      profileData: null,
    });
    API.getProfile()
      .then((profileData) => {
        this.setState({
          isLoading: false,
          profileError: null,
          profileData,
        });
      })
      .catch((error) => {
        this.setState({
          isLoading: false,
          profileError: error,
          profileData: null,
        });
      });
  }

  render() {
    const { isLoading, profileError, profileData } = this.state;
    return (
      <ViewBase {...this.props} pageHeader="Profile">
        {isLoading && <Loading />}
        {profileData && JSON.stringify(profileData)}
        {profileError && (
          <ErrorPanel
            title="Ошибка получения данных профиля"
            content={profileError.message}
          />
        )}
      </ViewBase>
    );
  }
}


export default Profile;
