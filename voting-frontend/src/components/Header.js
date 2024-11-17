// Header.js
import React from 'react';
import { Link } from 'react-router-dom';

const Header = ({ loggedIn, onLogout }) => {
  return (
    <header>
      <h1>Voting System</h1>
      <nav>
        <Link to="/vote">Vote</Link>
        <Link to="/results">Results</Link>
        <Link to="/mine">Mine Votes</Link>
        {!loggedIn ? (
          <>
            <Link to="/register">Register</Link>
            <Link to="/login">Login</Link>
          </>
        ) : (
          <button onClick={onLogout}>Logout</button>
        )}
      </nav>
    </header>
  );
};

export default Header;
