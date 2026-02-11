import React, { useState } from 'react';

function SimulationSetup({ scenario, onStart, onBack }) {
  const [selectedLength, setSelectedLength] = useState(15);

  const sessionLengths = [5, 15, 30, 60, 120];

  const handleStart = () => {
    onStart(selectedLength);
  };

  return (
    <div className="setup-container">
      <div className="setup-header">
        <h2>{scenario.title}</h2>
        <p>{scenario.description}</p>
      </div>

      <div className="context-section">
        <h3>Scenario Context</h3>
        <div className="context-item">
          <strong>Client:</strong> {scenario.context.clientName}
        </div>
        <div className="context-item">
          <strong>Industry:</strong> {scenario.context.industry}
        </div>
        <div className="context-item">
          <strong>Background:</strong> {scenario.context.background}
        </div>
        <div className="context-item">
          <strong>Constraints:</strong> {scenario.context.constraints}
        </div>
        <div className="context-item">
          <strong>Client Type:</strong> {scenario.context.personality}
        </div>
      </div>

      <div className="context-section">
        <h3>Your Challenge</h3>
        <p>{scenario.prompt}</p>
      </div>

      <div className="session-length">
        <h3>Session Length</h3>
        <div className="length-options">
          {sessionLengths.map((length) => (
            <button
              key={length}
              className={`length-btn ${selectedLength === length ? 'selected' : ''}`}
              onClick={() => setSelectedLength(length)}
            >
              {length >= 60 ? `${length / 60} hour${length > 60 ? 's' : ''}` : `${length} minutes`}
            </button>
          ))}
        </div>
      </div>

      <div className="action-buttons">
        <button className="btn btn-secondary" onClick={onBack}>
          Back to Scenarios
        </button>
        <button className="btn btn-primary" onClick={handleStart}>
          Start Simulation
        </button>
      </div>
    </div>
  );
}

export default SimulationSetup;
