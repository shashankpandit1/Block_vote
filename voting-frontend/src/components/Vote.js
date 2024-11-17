import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Vote.css'; // Optional: You can create a CSS file to style the vote form

const Vote = () => {
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Load candidates when the component mounts
  useEffect(() => {
    axios.get('http://localhost:4000/candidates')
      .then((response) => {
        setCandidates(response.data);
      })
      .catch((err) => {
        setError('Failed to load candidates.');
      });
  }, []);

  // Handle vote submission
  const handleVote = async () => {
    if (!selectedCandidate) {
      setError('Please select a candidate to vote for.');
      return;
    }

    // Get the voter details from localStorage
    const voterDetails = JSON.parse(localStorage.getItem('voterDetails'));

    if (!voterDetails || !voterDetails.privateKey) {
      setError('Voter details are missing.');
      return;
    }

    const voteData = {
      voterId: voterDetails.voterId,
      candidate: selectedCandidate,
      privateKey: voterDetails.privateKey,
    };

    try {
      // Submit the vote to the backend
      await axios.post('http://localhost:4000/vote', voteData);
      setSuccessMessage('Vote cast successfully!');
      setError('');
    } catch (err) {
      setError('Failed to cast vote. Please try again.');
    }
  };

  return (
    <div className="vote-container">
      <h2>Cast Your Vote</h2>

      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      <div className="candidate-list">
        {candidates.length > 0 ? (
          candidates.map((candidate) => (
            <div key={candidate.id} className="candidate-item">
              <input
                type="radio"
                id={candidate.id}
                name="candidate"
                value={candidate.name}
                onChange={() => setSelectedCandidate(candidate.name)}
              />
              <label htmlFor={candidate.id}>{candidate.name}</label>
            </div>
          ))
        ) : (
          <p>Loading candidates...</p>
        )}
      </div>

      <button onClick={handleVote}>Submit Vote</button>
    </div>
  );
};

export default Vote;
