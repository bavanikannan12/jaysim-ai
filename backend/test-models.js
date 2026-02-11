const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function listModels() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('Error: GEMINI_API_KEY not found in .env file');
      return;
    }

    console.log('Testing API Key:', apiKey.substring(0, 20) + '...');
    console.log('\nFetching available models...\n');

    const genAI = new GoogleGenerativeAI(apiKey);

    // Try to list models
    const models = await genAI.listModels();

    console.log('✓ API Key is valid!');
    console.log('\nAvailable models:');
    console.log('='.repeat(50));

    for await (const model of models) {
      console.log('\nModel:', model.name);
      console.log('  Display Name:', model.displayName);
      console.log('  Supported Methods:', model.supportedGenerationMethods?.join(', '));
    }

  } catch (error) {
    console.error('\n✗ Error:', error.message);
    console.error('\nFull error:', error);
  }
}

listModels();
