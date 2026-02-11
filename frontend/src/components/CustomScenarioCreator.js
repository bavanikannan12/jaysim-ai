import React, { useState } from 'react';

function CustomScenarioCreator({ onCreateScenario }) {
  const [formData, setFormData] = useState({
    callType: '',
    clientName: '',
    industry: '',
    callContext: '',
    clientPersonality: '',
    yourRole: '',
    challengeOrGoal: ''
  });

  const callTypes = [
    'Initial Client Kickoff',
    'Weekly Status Update',
    'Problem Discussion / Blocker',
    'Scope Change Negotiation',
    'Feature Request Discussion',
    'Project Delay Explanation',
    'Budget Discussion',
    'Executive Presentation',
    'Technical Architecture Discussion'
  ];

  const personalities = [
    'Friendly and collaborative',
    'Professional and direct',
    'Skeptical and questioning',
    'Rushed and impatient',
    'Detail-oriented and thorough',
    'Non-technical and needs simple explanations',
    'Technical and asks deep questions',
    'Frustrated about current issues'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreateScenario(formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="scenario-creator-container">
      <div className="creator-header">
        <h2>Create Your Mock Client Call</h2>
        <p>Describe your upcoming client call and practice with an AI-powered client simulation</p>
      </div>

      <form onSubmit={handleSubmit} className="scenario-form">
        <div className="form-group">
          <label>Type of Call *</label>
          <select
            name="callType"
            value={formData.callType}
            onChange={handleChange}
            required
          >
            <option value="">Select call type...</option>
            {callTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Client/Company Name *</label>
            <input
              type="text"
              name="clientName"
              value={formData.clientName}
              onChange={handleChange}
              placeholder="e.g., TechCorp Inc."
              required
            />
          </div>

          <div className="form-group">
            <label>Industry *</label>
            <input
              type="text"
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              placeholder="e.g., E-commerce, Healthcare"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Your Role *</label>
          <input
            type="text"
            name="yourRole"
            value={formData.yourRole}
            onChange={handleChange}
            placeholder="e.g., Developer, Project Lead, Consultant"
            required
          />
        </div>

        <div className="form-group">
          <label>Client Personality *</label>
          <select
            name="clientPersonality"
            value={formData.clientPersonality}
            onChange={handleChange}
            required
          >
            <option value="">Select personality...</option>
            {personalities.map(personality => (
              <option key={personality} value={personality}>{personality}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Call Context / Background *</label>
          <textarea
            name="callContext"
            value={formData.callContext}
            onChange={handleChange}
            placeholder="Describe the situation: What's the current status? What happened? Any constraints?"
            rows="3"
            required
          />
        </div>

        <div className="form-group">
          <label>Your Challenge or Goal for This Call *</label>
          <textarea
            name="challengeOrGoal"
            value={formData.challengeOrGoal}
            onChange={handleChange}
            placeholder="What do you need to accomplish? What are you worried about? What's the main challenge?"
            rows="3"
            required
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Start Mock Call Practice
          </button>
        </div>
      </form>

      <div className="example-hint">
        <h4>💡 Example Scenario</h4>
        <p><strong>Call Type:</strong> Project Delay Explanation</p>
        <p><strong>Client:</strong> RetailMax | <strong>Industry:</strong> Retail</p>
        <p><strong>Context:</strong> Backend integration is taking 2 weeks longer than estimated due to undocumented APIs</p>
        <p><strong>Goal:</strong> Explain the delay, maintain trust, propose revised timeline</p>
      </div>
    </div>
  );
}

export default CustomScenarioCreator;
