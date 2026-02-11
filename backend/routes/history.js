const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');

// Get all sessions
router.get('/sessions', historyController.getAllSessions.bind(historyController));

// Get a specific session with messages
router.get('/sessions/:sessionId', historyController.getSessionById.bind(historyController));

// Continue a previous session
router.post('/sessions/:sessionId/continue', historyController.continueSession.bind(historyController));

// Delete a session
router.delete('/sessions/:sessionId', historyController.deleteSession.bind(historyController));

// Generate scenarios from history
router.post('/generate-scenarios', historyController.generateScenariosFromHistory.bind(historyController));

module.exports = router;
