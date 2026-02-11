const geminiService = require('../services/geminiService');
const scenarios = require('../data/scenarios');

class SimulationController {
  /**
   * Get all available scenarios
   */
  getScenarios(req, res) {
    try {
      res.json({
        success: true,
        scenarios: scenarios
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get a specific scenario by ID
   */
  getScenarioById(req, res) {
    try {
      const { scenarioId } = req.params;
      const scenario = scenarios.find(s => s.id === scenarioId);

      if (!scenario) {
        return res.status(404).json({
          success: false,
          error: 'Scenario not found'
        });
      }

      res.json({
        success: true,
        scenario: scenario
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Generate quick practice scenarios
   */
  async generateQuickScenarios(req, res) {
    try {
      // Check if Gemini is initialized
      if (!geminiService.isInitialized()) {
        return res.status(503).json({
          success: false,
          error: 'AI service not initialized. Please configure API key.'
        });
      }

      // Generate scenarios using Gemini
      const quickScenarios = await geminiService.generateQuickScenarios();

      res.json({
        success: true,
        scenarios: quickScenarios
      });
    } catch (error) {
      console.error('Error generating quick scenarios:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Generate a custom scenario based on user input
   */
  async generateCustomScenario(req, res) {
    try {
      const { callType, clientName, industry, callContext, clientPersonality, yourRole, challengeOrGoal } = req.body;

      if (!callType || !clientName || !industry || !callContext || !clientPersonality || !yourRole || !challengeOrGoal) {
        return res.status(400).json({
          success: false,
          error: 'All fields are required'
        });
      }

      // Check if Gemini is initialized
      if (!geminiService.isInitialized()) {
        return res.status(503).json({
          success: false,
          error: 'AI service not initialized. Please configure API key.'
        });
      }

      // Generate scenario using Gemini
      const customScenario = await geminiService.generateCustomScenario({
        callType,
        clientName,
        industry,
        callContext,
        clientPersonality,
        yourRole,
        challengeOrGoal
      });

      res.json({
        success: true,
        scenario: customScenario
      });
    } catch (error) {
      console.error('Error generating custom scenario:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Start a new simulation
   */
  async startSimulation(req, res) {
    try {
      const { scenario, sessionLength } = req.body;

      if (!scenario || !sessionLength) {
        return res.status(400).json({
          success: false,
          error: 'scenario and sessionLength are required'
        });
      }

      // Check if Gemini is initialized
      if (!geminiService.isInitialized()) {
        return res.status(503).json({
          success: false,
          error: 'AI service not initialized. Please configure API key.'
        });
      }

      // Generate unique session ID
      const sessionId = `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Start simulation with Gemini
      const result = await geminiService.startSimulation(sessionId, scenario, sessionLength);

      res.json({
        success: true,
        sessionId: result.sessionId,
        message: result.message,
        scenario: scenario
      });
    } catch (error) {
      console.error('Error starting simulation:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
   
    }
  }

  /**
   * Send a message in an ongoing simulation
   */
  async sendMessage(req, res) {
    try {
      const { sessionId, message } = req.body;

      if (!sessionId || !message) {
        return res.status(400).json({
          success: false,
          error: 'sessionId and message are required'
        });
      }

      // Check if Gemini is initialized
      if (!geminiService.isInitialized()) {
        return res.status(503).json({
          success: false,
          error: 'AI service not initialized. Please configure API key.'
        });
      }

      // Continue simulation
      const result = await geminiService.continueSimulation(sessionId, message);

      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * End simulation and get feedback
   */
  async endSimulation(req, res) {
    try {
      const { sessionId, scenario } = req.body;

      if (!sessionId || !scenario) {
        return res.status(400).json({
          success: false,
          error: 'sessionId and scenario are required'
        });
      }

      // Generate feedback
      const feedback = await geminiService.generateFeedback(sessionId, scenario);

      res.json({
        success: true,
        feedback: feedback
      });
    } catch (error) {
      console.error('Error ending simulation:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new SimulationController();
