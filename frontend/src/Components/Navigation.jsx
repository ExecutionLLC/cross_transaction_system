import React from 'react';
import PropTypes from 'prop-types';
import {
  Nav,
  Navbar,
  NavItem,
  NavDropdown,
  MenuItem,
} from 'react-bootstrap';
import { getUserName } from '../API/auth_header';
import './Navigation.css';

function Navigation(props) {
  const tabs = [
    {
      url: '/profile',
      title: 'Профиль',
    },
    {
      url: '/myservices',
      title: 'Мои сервисы',
    },
    {
      url: '/otherservices',
      title: 'Внешние сервисы',
    },
    {
      url: '/cards',
      title: 'Карты',
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
        <NavDropdown
          title={getUserName() || ''}
          id="basic-nav-dropdown"
        >
          <MenuItem href="/login">Выйти</MenuItem>
        </NavDropdown>
      </Nav>
    </Navbar>
  );
}

Navigation.propTypes = {
  page: PropTypes.string.isRequired,
};


export default Navigation;
