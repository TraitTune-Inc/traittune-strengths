// client/src/components/PromptRegister.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const PromptRegister = () => {
  const navigate = useNavigate();

  const handleRegister = () => {
    navigate('/register');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      <h2>To view your test results, please register or log in.</h2>
      <p>
        If you already have an account, please login. Otherwise, register to create a new account and save your results.
      </p>
      <div style={styles.buttonContainer}>
        <button onClick={handleRegister} style={styles.button}>
          Register
        </button>
        <button onClick={handleLogin} style={styles.button}>
          Log In
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '500px',
    margin: '50px auto',
    padding: '30px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    textAlign: 'center',
    backgroundColor: '#fff',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  buttonContainer: {
    marginTop: '30px',
    display: 'flex',
    justifyContent: 'space-around',
  },
  button: {
    padding: '10px 20px',
    margin: '0 10px',
    fontSize: '1em',
    cursor: 'pointer',
    backgroundColor: '#76c7c0',
    border: 'none',
    borderRadius: '5px',
    color: '#fff',
    transition: 'background-color 0.3s',
  },
};

export default PromptRegister;
