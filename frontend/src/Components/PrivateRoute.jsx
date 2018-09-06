import React from 'react';
import { Route, Redirect } from 'react-router-dom';

const PrivateRoute = ({ component: Component, ...rest }) => {
  console.log('render private route ', localStorage.getItem('user'));
  return (
    <Route
      {...rest}
      render={props => (
        localStorage.getItem('user')
          ? (
            <Component {...props} />
          )
          : (
            <Redirect
              to={{
                pathname: '/auth',
                state: { from: props.location }
              }}
            />
          )
      )}
    />
  );
};

export default PrivateRoute;
