import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CustomScenarioCreator from './CustomScenarioCreator';

function ScenarioSelector({ onSelectScenario, onGoToHistory }) {
  const [activeTab, setActiveTab] = useState('quick');
  const [quickScenarios, setQuickScenarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (activeTab === 'quick' && quickScenarios.length === 0) {
      loadQuickScenarios();
    }
  }, [activeTab,quickScenarios.length]);

  const loadQuickScenarios = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('/api/simulation/scenarios');
      if (response.data.success) {
        setQuickScenarios(response.data.scenarios);
      } else {
        setError(response.data.error);
      }
    } catch (err) {
      setError('Failed to load scenarios. Please make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const generateNewScenarios = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`/api/simulation/quick-scenarios?t=${Date.now()}`);
      if (response.data.success && response.data.scenarios) {
        setQuickScenarios(response.data.scenarios);
      } else {
        setError(response.data.error || 'Failed to generate scenarios');
      }
    } catch (err) {
      const message =
        err.response?.data?.error ||
        (err.response?.status === 503
          ? 'AI service not ready. Please configure API key in backend.'
          : 'Failed to generate new scenarios. Make sure backend is running.');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="scenario-selector-container">
      <div className="scenario-selector-header">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'quick' ? 'active' : ''}`}
            onClick={() => setActiveTab('quick')}
          >
            Choose Quick Scenario
          </button>
          <button
            className={`tab ${activeTab === 'custom' ? 'active' : ''}`}
            onClick={() => setActiveTab('custom')}
          >
            Create Custom Scenario
          </button>
        </div>
        {onGoToHistory && (
          <button
            className="btn-icon history-icon history-icon-body"
            onClick={onGoToHistory}
            title="View History"
          >
            📋
          </button>
        )}
      </div>

      {activeTab === 'quick' && (
        <div className="quick-scenarios">
          <div className="quick-intro">
            <h2>Practice with AI-Generated Scenarios</h2>
            <p>Choose from realistic client call scenarios to practice your communication skills</p>
          </div>

          {loading && <div className="loading">Generating scenarios...</div>}
          {error && <div className="error">{error}</div>}

          {!loading && !error && (
            <div className="scenarios-grid">
              {quickScenarios.map((scenario) => (
                <div
                  key={scenario.id}
                  className="scenario-card"
                  onClick={() => onSelectScenario(scenario)}
                >
                  <h3>{scenario.title}</h3>
                  <p>{scenario.description}</p>
                  <div className="scenario-meta">
                    <span className="client-name">{scenario.context.clientName}</span>
                    <span className="industry">{scenario.context.industry}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && quickScenarios.length > 0 && (
            <div className="refresh-action">
              <button className="btn btn-secondary" onClick={generateNewScenarios}>
                🔄 Generate New Scenarios
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'custom' && (
        <CustomScenarioCreator onCreateScenario={onSelectScenario} />
      )}
    </div>
  );
}

export default ScenarioSelector;
