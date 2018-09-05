import React from 'react';
import PropTypes from 'prop-types';
import { Nav, Navbar, NavItem, NavDropdown, MenuItem } from 'react-bootstrap';


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
      <Nav pullRight>
        <NavDropdown eventKey={3} title="User name" id="basic-nav-dropdown">
          <MenuItem eventKey={3.1}>Logout</MenuItem>
        </NavDropdown>
      </Nav>
    </Navbar>
  );
}

Navigation.propTypes = {
  page: PropTypes.string.isRequired,
};


export default Navigation;
