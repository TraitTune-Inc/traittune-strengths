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
        <Link to="https://webapp.traittune.com" style={{ textDecoration: 'none', color: '#333' }}>
          TraitTune (Strengths)
        </Link>
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
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px 20px',
  borderBottom: '1px solid #ddd',
  backgroundColor: '#fff',
};

const logoStyle = {
  fontSize: '1.5em',
};

const navStyle = {
  display: 'flex',
  gap: '15px',
  alignItems: 'center',
};

const linkStyle = {
  textDecoration: 'none',
  color: '#333',
  fontSize: '1em',
};

const logoutButtonStyle = {
  padding: '5px 10px',
  fontSize: '1em',
  cursor: 'pointer',
  backgroundColor: '#ff4d4d',
  border: 'none',
  borderRadius: '5px',
  color: '#fff',
  transition: 'background-color 0.3s',
};

export default Header;
