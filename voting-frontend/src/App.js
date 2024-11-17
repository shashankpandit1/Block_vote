// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
// Import VotePage
import './App.css';
import Vote from './components/Vote';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if the user is logged in by checking localStorage
    const voterDetails = localStorage.getItem('voterDetails');
    setIsLoggedIn(!!voterDetails);
  }, []);

  const handleLogout = () => {
    // Clear the user details and log out
    localStorage.removeItem('voterDetails');
    setIsLoggedIn(false);
  };

  return (
    <Router>
      <div className="App">
        <h1>Online Voting System</h1>
        <div className="navigation-buttons">
          <Link to="/register">
            <button>Register</button>
          </Link>
          <Link to="/login">
            <button>Login</button>
          </Link>
          {isLoggedIn && (
            <button onClick={handleLogout}>Logout</button>
          )}
        </div>

        <Routes>
          <Route path="/register" element={<Register />} />
          <Route
            path="/login"
            element={
              isLoggedIn ? (
                <Navigate to="/vote" />
              ) : (
                <Login setIsLoggedIn={setIsLoggedIn} />
              )
            }
          />
          <Route
            path="/vote"
            element={
              isLoggedIn ? <Vote /> : <Navigate to="/login" />
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
