// client/src/components/Header.jsx
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Header = () => {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header style={headerStyle}>
      <div style={logoStyle}>
        <a href="https://webapp.traittune.com" style={{ textDecoration: 'none', color: '#333' }}>
          TraitTune (Strengths)
        </a>
      </div>
      <nav style={navStyle}>
        {isAuthenticated ? (
          <>
            <span>Welcome, {user?.username}</span>
            <Link to="/results" style={linkStyle}>
              Results
            </Link>
            <button onClick={handleLogout} style={logoutButtonStyle}>
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" style={linkStyle}>
            Login
          </Link>
        )}
      </nav>
    </header>
  );
};

const headerStyle = {
  // Add your header styles here
};

const logoStyle = {
  // Add your logo styles here
};

const navStyle = {
  // Add your nav styles here
};

const linkStyle = {
  // Add your link styles here
};

const logoutButtonStyle = {
  // Add your logout button styles here
};

export default Header;
