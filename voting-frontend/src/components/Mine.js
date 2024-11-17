import React, { useState } from 'react';
import axios from 'axios';

const Mine = () => {
  const [isMining, setIsMining] = useState(false);
  const [error, setError] = useState('');
  const [mined, setMined] = useState(false);

  const handleMineVotes = async () => {
    setIsMining(true);
    setError('');
    setMined(false);

    try {
      const response = await axios.get('http://localhost:4000/mine'); // Adjust endpoint if needed
      if (response.status === 200) {
        setMined(true);
      }
    } catch (err) {
      setError('Failed to mine votes. Please try again.');
    } finally {
      setIsMining(false);
    }
  };

  return (
    <div>
      <h2>Mine Votes</h2>
      <div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {mined && <p style={{ color: 'green' }}>Votes have been mined successfully!</p>}
      </div>
      <button onClick={handleMineVotes} disabled={isMining}>
        {isMining ? 'Mining...' : 'Mine Votes'}
      </button>
    </div>
  );
};

export default Mine;
