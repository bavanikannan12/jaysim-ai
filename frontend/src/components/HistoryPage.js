import React, { useState, useEffect } from 'react';
import axios from 'axios';

function HistoryPage({ onContinueSession, onBack, onSelectSuggestedScenario }) {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [suggestedScenarios, setSuggestedScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/history/sessions');
      if (response.data.success) {
        setSessions(response.data.sessions);
      }
    } catch (err) {
      setError('Failed to load history');
      console.error('Error fetching sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessionDetails = async (sessionId) => {
    try {
      const response = await axios.get(`/api/history/sessions/${sessionId}`);
      if (response.data.success) {
        setSelectedSession(response.data.session);
      }
    } catch (err) {
      setError('Failed to load session details');
      console.error('Error fetching session:', err);
    }
  };

  const handleContinueSession = async (sessionId) => {
    try {
      const response = await axios.post(`/api/history/sessions/${sessionId}/continue`);
      if (response.data.success) {
        onContinueSession(response.data);
      }
    } catch (err) {
      setError('Failed to continue session');
      console.error('Error continuing session:', err);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to delete this session?')) {
      return;
    }

    try {
      await axios.delete(`/api/history/sessions/${sessionId}`);
      setSessions(sessions.filter(s => s.sessionId !== sessionId));
      if (selectedSession?.sessionId === sessionId) {
        setSelectedSession(null);
      }
    } catch (err) {
      setError('Failed to delete session');
      console.error('Error deleting session:', err);
    }
  };

  const handleGenerateSuggestions = async () => {
    try {
      setLoadingSuggestions(true);
      const response = await axios.post('/api/history/generate-scenarios');
      if (response.data.success) {
        setSuggestedScenarios(response.data.scenarios);
      }
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to generate suggestions');
      }
      console.error('Error generating suggestions:', err);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Group sessions by day
  const groupSessionsByDay = (sessions) => {
    const groups = {
      today: [],
      yesterday: [],
      thisWeek: [],
      lastWeek: [],
      older: [],
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const twoWeeksAgo = new Date(today);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    sessions.forEach(session => {
      const sessionDate = new Date(session.createdAt);
      const sessionDay = new Date(sessionDate.getFullYear(), sessionDate.getMonth(), sessionDate.getDate());

      if (sessionDay.getTime() === today.getTime()) {
        groups.today.push(session);
      } else if (sessionDay.getTime() === yesterday.getTime()) {
        groups.yesterday.push(session);
      } else if (sessionDay > weekAgo) {
        groups.thisWeek.push(session);
      } else if (sessionDay > twoWeeksAgo) {
        groups.lastWeek.push(session);
      } else {
        groups.older.push(session);
      }
    });

    return groups;
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFullDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: { className: 'badge-active', label: 'In Progress' },
      completed: { className: 'badge-completed', label: 'Completed' },
      abandoned: { className: 'badge-abandoned', label: 'Abandoned' },
    };
    const badge = badges[status] || badges.active;
    return <span className={`status-badge ${badge.className}`}>{badge.label}</span>;
  };

  const renderSessionCard = (session, showDate = false) => (
    <div
      key={session.sessionId}
      className={`session-card ${selectedSession?.sessionId === session.sessionId ? 'selected' : ''}`}
      onClick={() => fetchSessionDetails(session.sessionId)}
    >
      <div className="session-card-header">
        <h4>{session.scenarioTitle}</h4>
        {getStatusBadge(session.status)}
      </div>
      <p className="session-description">{session.scenarioDescription}</p>
      <div className="session-meta">
        <span>{session.sessionLength} min</span>
        <span>{showDate ? formatFullDate(session.createdAt) : formatTime(session.createdAt)}</span>
      </div>
      <div className="session-actions">
        <button
          className="btn btn-small btn-primary"
          onClick={(e) => {
            e.stopPropagation();
            handleContinueSession(session.sessionId);
          }}
        >
          Continue
        </button>
        <button
          className="btn btn-small btn-danger"
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteSession(session.sessionId);
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );

  const renderDayGroup = (title, sessions, showDate = false) => {
    if (sessions.length === 0) return null;
    return (
      <div className="day-group">
        <h4 className="day-title">{title}</h4>
        <div className="day-sessions">
          {sessions.map(session => renderSessionCard(session, showDate))}
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="loading">Loading history...</div>;
  }

  const groupedSessions = groupSessionsByDay(sessions);

  return (
    <div className="history-container">
      <div className="history-header">
        <button
          type="button"
          className="history-back-btn"
          onClick={onBack}
          title="Back to Home"
          aria-label="Back to Home"
        >
          ←
        </button>
        <h2>Conversation History</h2>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="history-content">
        <div className="sessions-list">
          {sessions.length === 0 ? (
            <div className="no-sessions">
              <div className="no-sessions-icon">💬</div>
              <p>No conversation history yet.</p>
              <p>Start a simulation to begin building your history!</p>
              <button className="btn btn-primary" onClick={onBack}>
                Start New Session
              </button>
            </div>
          ) : (
            <div className="sessions-by-day">
              {renderDayGroup('Today', groupedSessions.today)}
              {renderDayGroup('Yesterday', groupedSessions.yesterday)}
              {renderDayGroup('This Week', groupedSessions.thisWeek)}
              {renderDayGroup('Last Week', groupedSessions.lastWeek)}
              {renderDayGroup('Older', groupedSessions.older, true)}
            </div>
          )}
        </div>

        {selectedSession && (
          <div className="session-details">
            <div className="session-details-header">
              <h3>{selectedSession.scenarioTitle}</h3>
              <button
                className="btn-close"
                onClick={() => setSelectedSession(null)}
              >
                ✕
              </button>
            </div>
            <div className="conversation-preview">
              <h4>Conversation</h4>
              <div className="messages-list">
                {selectedSession.messages?.map((msg, index) => (
                  <div key={index} className={`message ${msg.role}`}>
                    <span className="message-role">
                      {msg.role === 'model' ? selectedSession.scenarioData?.context?.clientName || 'Client' : 'You'}
                    </span>
                    <p>{msg.content}</p>
                  </div>
                ))}
              </div>
            </div>

            {selectedSession.feedback && (
              <div className="feedback-preview">
                <h4>Feedback</h4>
                <div className="feedback-section">
                  <strong>What Went Well:</strong>
                  <p>{selectedSession.feedback.whatWentWell}</p>
                </div>
                <div className="feedback-section">
                  <strong>Areas to Improve:</strong>
                  <p>{selectedSession.feedback.whatToImprove}</p>
                </div>
              </div>
            )}

            <div className="session-details-actions">
              <button
                className="btn btn-primary"
                onClick={() => handleContinueSession(selectedSession.sessionId)}
              >
                Continue Conversation
              </button>
            </div>
          </div>
        )}
      </div>

      {sessions.filter(s => s.status === 'completed').length > 0 && (
        <div className="suggestions-section">
          <h3>🎯 Personalized Scenarios</h3>
          <p>Get AI-generated scenarios based on your practice history</p>

          <button
            className="btn btn-primary"
            onClick={handleGenerateSuggestions}
            disabled={loadingSuggestions}
          >
            {loadingSuggestions ? 'Generating...' : 'Generate Suggested Scenarios'}
          </button>

          {suggestedScenarios.length > 0 && (
            <div className="suggested-scenarios">
              {suggestedScenarios.map((scenario, index) => (
                <div key={index} className="suggested-card">
                  <h4>{scenario.title}</h4>
                  <p>{scenario.description}</p>
                  {scenario.reason && (
                    <p className="suggestion-reason">
                      <em>💡 {scenario.reason}</em>
                    </p>
                  )}
                  <button
                    className="btn btn-primary btn-small"
                    onClick={() => onSelectSuggestedScenario(scenario)}
                  >
                    Start This Scenario
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default HistoryPage;
