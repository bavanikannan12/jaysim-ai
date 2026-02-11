import React from 'react';

function FeedbackDisplay({ feedback, onNewSession, onRetry }) {
  return (
    <div className="feedback-container">
      <div className="feedback-header">
        <h2>Session Feedback</h2>
        <p>Here's how you did in this simulation</p>
      </div>

      <div className="feedback-section positive">
        <h3>✓ What Went Well</h3>
        <p>{feedback.whatWentWell || 'Loading feedback...'}</p>
      </div>

      <div className="feedback-section negative">
        <h3>✗ What Didn't Land</h3>
        <p>{feedback.whatDidntLand || 'Loading feedback...'}</p>
      </div>

      <div className="feedback-section improve">
        <h3>→ What to Improve Next Time</h3>
        <p>{feedback.whatToImprove || 'Loading feedback...'}</p>
      </div>

      <div className="feedback-section action">
        <h3>⚡ Action Items</h3>
        <p>{feedback.actionItems || 'Loading feedback...'}</p>
      </div>

      <div className="feedback-actions">
        <button className="btn btn-secondary" onClick={onRetry}>
          Retry This Scenario
        </button>
        <button className="btn btn-primary" onClick={onNewSession}>
          Try Another Scenario
        </button>
      </div>
    </div>
  );
}

export default FeedbackDisplay;
