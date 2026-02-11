const express = require('express');
const router = express.Router();
const simulationController = require('../controllers/simulationController');

// Get all scenarios
router.get('/scenarios', simulationController.getScenarios.bind(simulationController));

// Get specific scenario
router.get('/scenarios/:scenarioId', simulationController.getScenarioById.bind(simulationController));

// Generate quick scenarios
router.get('/quick-scenarios', simulationController.generateQuickScenarios.bind(simulationController));

// Generate custom scenario
router.post('/generate-scenario', simulationController.generateCustomScenario.bind(simulationController));

// Start a new simulation
router.post('/start', simulationController.startSimulation.bind(simulationController));

// Send message in ongoing simulation
router.post('/message', simulationController.sendMessage.bind(simulationController));

// End simulation and get feedback
router.post('/end', simulationController.endSimulation.bind(simulationController));

module.exports = router;
