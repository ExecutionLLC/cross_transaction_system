import React from 'react';
import PropTypes from 'prop-types';
import { PageHeader, Grid } from 'react-bootstrap';
import Navigation from '../Components/Navigation';


function ViewBase(props) {
  const { match, pageHeader, children } = props;
  return (
    <Grid>
      <Navigation
        page={match.url}
      />
      <PageHeader>
        {pageHeader}
      </PageHeader>
      {children}
    </Grid>
  );
}

ViewBase.propTypes = {
  match: PropTypes.shape({
    url: PropTypes.string.isRequired,
  }).isRequired,
  pageHeader: PropTypes.string.isRequired,
  children: PropTypes.node,
};

ViewBase.defaultProps = {
  children: null,
};


export default ViewBase;
