import React from 'react';
import PropTypes from 'prop-types';
import { PageHeader, Grid } from 'react-bootstrap';
import Navigation from '../Components/Navigation';
import Footer from '../Components/Footer';
import Loading from '../Components/Loading';


function ViewBase(props) {
  const {
    match, pageHeader, children, isLoading,
  } = props;
  return (
    <Grid>
      <Navigation
        page={match.url}
      />
      <PageHeader>
        {pageHeader}
      </PageHeader>
      {isLoading && <Loading />}
      {!isLoading && children}
      <Footer />
    </Grid>
  );
}

ViewBase.propTypes = {
  match: PropTypes.shape({
    url: PropTypes.string.isRequired,
  }).isRequired,
  pageHeader: PropTypes.string.isRequired,
  isLoading: PropTypes.bool,
  children: PropTypes.node,
};

ViewBase.defaultProps = {
  isLoading: false,
  children: null,
};


export default ViewBase;
