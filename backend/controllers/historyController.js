const { Session, Message } = require('../database/models');
const geminiService = require('../services/geminiService');

class HistoryController {
  /**
   * Get all conversation sessions
   */
  async getAllSessions(req, res) {
    try {
      const sessions = await Session.findAll({
        order: [['updatedAt', 'DESC']],
        attributes: ['id', 'sessionId', 'scenarioTitle', 'scenarioDescription', 'sessionLength', 'status', 'startedAt', 'endedAt', 'createdAt', 'updatedAt'],
      });

      res.json({
        success: true,
        sessions: sessions,
      });
    } catch (error) {
      console.error('Error fetching sessions:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get a specific session with all messages
   */
  async getSessionById(req, res) {
    try {
      const { sessionId } = req.params;

      const session = await Session.findOne({
        where: { sessionId },
        include: [{
          model: Message,
          as: 'messages',
          order: [['timestamp', 'ASC']],
        }],
      });

      if (!session) {
        return res.status(404).json({
          success: false,
          error: 'Session not found',
        });
      }

      res.json({
        success: true,
        session: session,
      });
    } catch (error) {
      console.error('Error fetching session:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Continue a previous session
   */
  async continueSession(req, res) {
    try {
      const { sessionId } = req.params;

      // Find the session
      const session = await Session.findOne({
        where: { sessionId },
        include: [{
          model: Message,
          as: 'messages',
          order: [['timestamp', 'ASC']],
        }],
      });

      if (!session) {
        return res.status(404).json({
          success: false,
          error: 'Session not found',
        });
      }

      // Update session status to active
      await session.update({ status: 'active' });

      // Restore the conversation in geminiService memory
      const scenario = session.scenarioData;
      const messages = session.messages || [];

      // Find initial greeting
      const initialGreeting = messages.find(m => m.isInitialGreeting);
      const conversationMessages = messages.filter(m => !m.isInitialGreeting);

      // Restore session in geminiService
      geminiService.restoreSession(
        sessionId,
        scenario,
        session.sessionLength,
        initialGreeting ? initialGreeting.content : null,
        conversationMessages.map(m => ({
          role: m.role,
          parts: [{ text: m.content }],
        }))
      );

      res.json({
        success: true,
        sessionId: sessionId,
        scenario: scenario,
        sessionLength: session.sessionLength,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
          isInitialGreeting: m.isInitialGreeting,
          timestamp: m.timestamp,
        })),
      });
    } catch (error) {
      console.error('Error continuing session:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Delete a session and its messages
   */
  async deleteSession(req, res) {
    try {
      const { sessionId } = req.params;

      // Delete messages first (due to foreign key)
      await Message.destroy({ where: { sessionId } });

      // Delete session
      const deleted = await Session.destroy({ where: { sessionId } });

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'Session not found',
        });
      }

      res.json({
        success: true,
        message: 'Session deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting session:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Generate new scenarios based on conversation history
   */
  async generateScenariosFromHistory(req, res) {
    try {
      // Check if Gemini is initialized
      if (!geminiService.isInitialized()) {
        return res.status(503).json({
          success: false,
          error: 'AI service not initialized. Please configure API key.',
        });
      }

      // Get recent completed sessions
      const recentSessions = await Session.findAll({
        where: { status: 'completed' },
        order: [['endedAt', 'DESC']],
        limit: 5,
        include: [{
          model: Message,
          as: 'messages',
        }],
      });

      if (recentSessions.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No completed sessions found. Complete some simulations first.',
        });
      }

      // Generate new scenarios based on history
      const scenarios = await geminiService.generateScenariosFromHistory(recentSessions);

      res.json({
        success: true,
        scenarios: scenarios,
      });
    } catch (error) {
      console.error('Error generating scenarios from history:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}

module.exports = new HistoryController();
