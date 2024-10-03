// client/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Questionnaire from './components/Questionnaire';
import Results from './components/Results';
import Login from './components/Login'; // Import the Login component
import Register from './components/Register'; // Import the Register component
import PromptRegister from './components/PromptRegister'; // Import the PromptRegister component
import PrivateRoute from './components/PrivateRoute'; // Import the PrivateRoute component

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Questionnaire />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/prompt-register" element={<PromptRegister />} />
        {/* Protected route for results */}
        <Route
          path="/results"
          element={
            <PrivateRoute>
              <Results />
            </PrivateRoute>
          }
        />
        {/* Redirect unknown routes to the home page */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
