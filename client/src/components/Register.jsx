// client/src/components/Register.jsx
import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const { login } = useContext(AuthContext); // Используем контекст
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Получаем tempId из localStorage или устанавливаем undefined
    const tempId = localStorage.getItem('tempId');

    // Формируем payload только с существующими полями
    const payload = { username, email, password };
    if (tempId) {
      payload.tempId = tempId;
    }

    try {
      const res = await axios.post('/api/register', payload);
      login(res.data.token); // Используем функцию login из контекста
      localStorage.removeItem('tempId'); // Удаляем tempId после регистрации
      navigate('/results');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Registration failed.');
    }
  };

  return (
    <div style={styles.container}>
      <h2>Register</h2>
      {error && <p style={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={styles.input}
        />
        <button type="submit" style={styles.button}>
          Register
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '400px',
    margin: '50px auto',
    padding: '20px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    textAlign: 'center',
    backgroundColor: '#fff',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  input: {
    padding: '10px',
    fontSize: '1em',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
  button: {
    padding: '10px',
    fontSize: '1em',
    cursor: 'pointer',
    backgroundColor: '#76c7c0',
    border: 'none',
    borderRadius: '5px',
    color: '#fff',
    transition: 'background-color 0.3s',
  },
  error: {
    color: 'red',
  },
};

export default Register;
