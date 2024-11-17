import React, { useState } from 'react';
import axios from 'axios';
import './Login.css'; // Optional: You can create a CSS file to style the login form

const Login = () => {
  const [loginId, setLoginId] = useState(''); // login ID will be the mobile number
  const [password, setPassword] = useState(''); // password will be the Aadhar number (hashed)
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   // Validate input fields
  //   if (!loginId || !password) {
  //     setError('Both login ID and password are required.');
  //     return;
  //   }

  //   try {
  //     // Make the API call to log in the voter
  //     const response = await axios.post('http://localhost:4000/login', {
  //       loginId, // Send mobile number as login ID
  //       password, // Send Aadhar number (hashed) as password
  //     });

  //     // Store the public key in localStorage (or any other way you want)
  //     localStorage.setItem('publicKey', response.data.publicKey);

  //     setSuccessMessage('Login successful! You can now cast your vote.');

  //     // Clear form fields
  //     setLoginId('');
  //     setPassword('');
  //     setError('');
  //   } catch (err) {
  //     setError('Error logging in. Please check your credentials and try again.');
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Validate input fields
    if (!loginId || !password) {
      setError('Both login ID and password are required.');
      return;
    }
  
    try {
      // Make the API call to log in the voter
      const response = await axios.post('http://localhost:4000/login', {
        loginId,  // loginId = Aadhar number (plain text)
        password, // password = Aadhar number entered by the user
      });
  
      if (response.data.publicKey) {
        // Store the public key in localStorage
        localStorage.setItem('publicKey', response.data.publicKey);
        setSuccessMessage('Login successful! You can now cast your vote.');
  
        // Clear form fields
        setLoginId('');
        setPassword('');
        setError('');
      }
    } catch (err) {
      setError('Error logging in. Please check your credentials and try again.');
      console.error('Error during login:', err);
    }
  };
  

  return (
    <div className="login-container">
      <h2>Login</h2>

      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="loginId">Login ID (Mobile Number)</label>
          <input
            type="text"
            id="loginId"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password (Aadhar Number)</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
