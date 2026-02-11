import React, { useEffect, useState } from 'react';
import axios from 'axios';

function HomePage({ onSelectScenario }) {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchScenarios();
  }, []);

  const fetchScenarios = async () => {
    try {
      const response = await axios.get('/api/simulation/scenarios');
      setScenarios(response.data.scenarios);
      setLoading(false);
    } catch (err) {
      setError('Failed to load scenarios. Please make sure the backend server is running.');
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading scenarios...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="home-container">
      <div className="home-intro">
        <h2>Choose Your Practice Scenario</h2>
        <p>
          Select a simulation to practice your problem-solving and client communication skills.
          Each scenario presents realistic challenges that mirror real-world client interactions.
        </p>
      </div>

      <div className="scenarios-grid">
        {scenarios.map((scenario) => (
          <div
            key={scenario.id}
            className="scenario-card"
            onClick={() => onSelectScenario(scenario)}
          >
            <h3>{scenario.title}</h3>
            <p>{scenario.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HomePage;
