import React from 'react';
import PropTypes from 'prop-types';
import { Nav, Navbar, NavItem } from 'react-bootstrap';


function Navigation(props) {
  const tabs = [
    {
      url: '/profile',
      title: 'Profile',
    },
    {
      url: '/myservices',
      title: 'My services',
    },
    {
      url: '/otherservices',
      title: 'Other services',
    },
    {
      url: '/cards',
      title: 'Cards',
    },
  ];

  return (
    <Navbar>
      <Nav>
        {tabs.map(tab => (
          <NavItem
            key={tab.url}
            href={tab.url}
            active={tab.url === props.page}
          >
            {tab.title}
          </NavItem>
        ))}
      </Nav>
    </Navbar>
  );
}

Navigation.propTypes = {
  page: PropTypes.string.isRequired,
};


export default Navigation;
