import React from 'react';
import PropTypes from 'prop-types';
import { Nav, Navbar, NavItem } from 'react-bootstrap';


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
    </Navbar>
  );
}

Navigation.propTypes = {
  page: PropTypes.string.isRequired,
};


export default Navigation;
