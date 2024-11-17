import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Results.css'; // Optional: Add your own CSS styles for the results page

const Results = () => {
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch voting results from the backend
    axios.get('http://localhost:4000/results')
      .then((response) => {
        setResults(response.data.results);
      })
      .catch((err) => {
        setError('Failed to load results. Please try again later.');
      });
  }, []);

  return (
    <div className="results-container">
      <h2>Voting Results</h2>

      {error && <div className="error-message">{error}</div>}

      {results ? (
        <div className="results-list">
          {Object.keys(results).length === 0 ? (
            <p>No votes have been cast yet.</p>
          ) : (
            Object.entries(results).map(([candidate, voteCount]) => (
              <div key={candidate} className="result-item">
                <strong>{candidate}:</strong> {voteCount} votes
              </div>
            ))
          )}
        </div>
      ) : (
        <p>Loading results...</p>
      )}
    </div>
  );
};

export default Results;
