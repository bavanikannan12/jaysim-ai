const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const geminiService = require('./services/geminiService');
const simulationRoutes = require('./routes/simulation');
const historyRoutes = require('./routes/history');
const { initializeDatabase } = require('./database/models');

// Load environment variables
dotenv.config();

// Initialize database
initializeDatabase();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize Gemini service
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    geminiService.initialize(apiKey);
    console.log('✓ Gemini AI service initialized');
  } else {
    console.warn('⚠ GEMINI_API_KEY not found. AI features will not work.');
    console.warn('  Please add GEMINI_API_KEY to your .env file');
  }
} catch (error) {
  console.error('✗ Failed to initialize Gemini service:', error.message);
}

// Routes
app.use('/api/simulation', simulationRoutes);
app.use('/api/history', historyRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'ClearPitch Backend is running',
    aiServiceReady: geminiService.isInitialized()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'ClearPitch API Server',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      scenarios: '/api/simulation/scenarios',
      start: 'POST /api/simulation/start',
      message: 'POST /api/simulation/message',
      end: 'POST /api/simulation/end'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log('\n=================================');
  console.log('🚀 ClearPitch Backend Server');
  console.log('=================================');
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at: http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log('=================================\n');
});
