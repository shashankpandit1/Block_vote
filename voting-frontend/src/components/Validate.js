// src/components/Validate.js
import React, { useState } from 'react';
import axios from 'axios';

const Validate = () => {
  const [validationMessage, setValidationMessage] = useState('');

  const handleValidate = async () => {
    try {
      const response = await axios.get('http://localhost:4000/validate');
      setValidationMessage(`Blockchain integrity is ${response.data.isValid ? 'valid' : 'corrupted'}.`);
    } catch (error) {
      console.error('Error validating blockchain', error);
      setValidationMessage('Failed to validate blockchain.');
    }
  };

  return (
    <div>
      <h2>Validate Blockchain</h2>
      <button onClick={handleValidate}>Validate Blockchain</button>
      {validationMessage && <p>{validationMessage}</p>}
    </div>
  );
};

export default Validate;
