import React, { useState } from 'react';
import axios from 'axios';
import './Register.css'; // You can create a CSS file to style the registration form

const Register = () => {
  const [voterName, setVoterName] = useState('');
  const [aadharNumber, setAadharNumber] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [age, setAge] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate the fields
    if (!voterName || !aadharNumber || !mobileNumber || !age) {
      setError('All fields are required.');
      return;
    }

    try {
      // Make the API call to register the voter
      const response = await axios.post('http://localhost:4000/register', {
        voterName,
        aadharNumber,
        mobileNumber,
        age,
      });

      // Assuming the response has voterDetails (including loginId and password)
      const { voterDetails, loginId, password } = response.data;

      // Store voter details (including loginId and password) in localStorage for later use
      localStorage.setItem('voterDetails', JSON.stringify({ loginId, password }));

      setSuccessMessage('Registration successful! You can now log in.');

      // Clear the form
      setVoterName('');
      setAadharNumber('');
      setMobileNumber('');
      setAge('');
      setError('');
    } catch (err) {
      setError('Error registering voter. Please try again.');
    }
  };

  return (
    <div className="register-container">
      <h2>Register as a Voter</h2>

      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="voterName">Voter Name</label>
          <input
            type="text"
            id="voterName"
            value={voterName}
            onChange={(e) => setVoterName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="aadharNumber">Aadhar Number</label>
          <input
            type="text"
            id="aadharNumber"
            value={aadharNumber}
            onChange={(e) => setAadharNumber(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="mobileNumber">Mobile Number</label>
          <input
            type="text"
            id="mobileNumber"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="age">Age</label>
          <input
            type="number"
            id="age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
          />
        </div>

        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
