import React, { useState } from 'react';
import axios from 'axios';
import ScenarioSelector from './components/ScenarioSelector';
import SimulationSetup from './components/SimulationSetup';
import VoiceSimulationInterface from './components/VoiceSimulationInterface';
import FeedbackDisplay from './components/FeedbackDisplay';
import HistoryPage from './components/HistoryPage';
import './styles/App.css';

function App() {
  const [currentView, setCurrentView] = useState('select');
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [sessionLength, setSessionLength] = useState(15);
  const [initialGreeting, setInitialGreeting] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [continuedMessages, setContinuedMessages] = useState(null);

  const handleSelectScenario = async (scenarioOrFormData) => {
    // If it's a form data object (has callType), generate scenario first
    if (scenarioOrFormData.callType) {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.post('/api/simulation/generate-scenario', scenarioOrFormData);

        if (response.data.success) {
          setSelectedScenario(response.data.scenario);
          setCurrentView('setup');
        } else {
          setError(response.data.error || 'Failed to generate scenario');
        }
      } catch (err) {
        console.error('Error generating scenario:', err);
        setError(
          err.response?.data?.error ||
          'Failed to generate scenario. Make sure backend is running and API key is configured.'
        );
      } finally {
        setLoading(false);
      }
    } else {
      // It's already a scenario, just use it
      setSelectedScenario(scenarioOrFormData);
      setCurrentView('setup');
    }
  };

  const handleStartSimulation = async (length) => {
    setSessionLength(length);
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/simulation/start', {
        scenario: selectedScenario,
        sessionLength: length
      });

      if (response.data.success) {
        setSessionId(response.data.sessionId);
        setInitialGreeting(response.data.message);
        setCurrentView('simulation');
      } else {
        setError(response.data.error || 'Failed to start simulation');
      }
    } catch (err) {
      console.error('Error starting simulation:', err);
      setError(
        err.response?.data?.error ||
        'Failed to start simulation. Make sure backend is running and API key is configured.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEndSimulation = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/simulation/end', {
        sessionId: sessionId,
        scenario: selectedScenario
      });

      if (response.data.success) {
        setFeedback(response.data.feedback);
        setCurrentView('feedback');
      } else {
        setError(response.data.error || 'Failed to generate feedback');
      }
    } catch (err) {
      console.error('Error ending simulation:', err);
      setError(err.response?.data?.error || 'Failed to generate feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToHome = () => {
    setCurrentView('select');
    setSelectedScenario(null);
    setSessionId(null);
    setInitialGreeting(null);
    setFeedback(null);
    setError(null);
    setContinuedMessages(null);
  };

  const handleRetryScenario = () => {
    setCurrentView('setup');
    setSessionId(null);
    setInitialGreeting(null);
    setFeedback(null);
    setError(null);
    setContinuedMessages(null);
  };

  const handleGoToHistory = () => {
    setCurrentView('history');
    setError(null);
  };

  const handleContinueSession = (sessionData) => {
    setSelectedScenario(sessionData.scenario);
    setSessionId(sessionData.sessionId);
    setSessionLength(sessionData.sessionLength);
    setContinuedMessages(sessionData.messages);
    // Find the initial greeting from messages
    const greeting = sessionData.messages?.find(m => m.isInitialGreeting);
    setInitialGreeting(greeting?.content || null);
    setCurrentView('simulation');
  };

  const handleSelectSuggestedScenario = (scenario) => {
    setSelectedScenario(scenario);
    setCurrentView('setup');
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <div className="header-title">
            <h1 onClick={handleBackToHome} style={{ cursor: 'pointer' }}>JaySim</h1>
            <p>Practice Client Communication & Problem Solving</p>
          </div>
        </div>
      </header>

      {error && <div className="error">{error}</div>}
      {loading && <div className="loading">Processing...</div>}

      {!loading && currentView === 'select' && (
        <ScenarioSelector
          onSelectScenario={handleSelectScenario}
          onGoToHistory={handleGoToHistory}
        />
      )}

      {!loading && currentView === 'setup' && selectedScenario && (
        <SimulationSetup
          scenario={selectedScenario}
          onStart={handleStartSimulation}
          onBack={handleBackToHome}
        />
      )}

      {!loading && currentView === 'simulation' && selectedScenario && sessionId && (
        <VoiceSimulationInterface
          scenario={selectedScenario}
          sessionLength={sessionLength}
          sessionId={sessionId}
          initialGreeting={initialGreeting}
          continuedMessages={continuedMessages}
          onEnd={handleEndSimulation}
        />
      )}

      {!loading && currentView === 'feedback' && feedback && (
        <FeedbackDisplay
          feedback={feedback}
          onNewSession={handleBackToHome}
          onRetry={handleRetryScenario}
        />
      )}

      {!loading && currentView === 'history' && (
        <HistoryPage
          onContinueSession={handleContinueSession}
          onBack={handleBackToHome}
          onSelectSuggestedScenario={handleSelectSuggestedScenario}
        />
      )}
    </div>
  );
}

export default App;
