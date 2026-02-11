const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Session, Message } = require('../database/models');

class GeminiService {
  constructor() {
    this.genAI = null;
    this.model = null;
    this.conversationHistory = new Map(); // Store conversation history per session
    this.sessionScenarios = new Map(); // Store scenario data per session
  }

  /**
   * Detect assistant-y phrases that break roleplay.
   */
  isOutOfCharacterClientReply(text) {
    if (!text) return false;
    const t = String(text).toLowerCase();
    return (
      t.includes('how can i help') ||
      t.includes('i can help') ||
      t.includes('i can assist') ||
      t.includes("i'm here to help") ||
      t.includes('as an ai') ||
      t.includes('as a language model') ||
      t.includes('i am an ai') ||
      t.includes('chatbot')
    );
  }

  /**
   * One-shot regeneration with stricter instruction (doesn't touch chat history).
   */
  async regenerateInClientVoice(fullSystemInstruction, userMessage, previousBadReply) {
    const retryPrompt = `${fullSystemInstruction}

The user just said: "${userMessage}"

Your last reply was NOT acceptable because it sounded like an assistant: "${previousBadReply}"

Rewrite your reply as the CLIENT. Do NOT offer help/assistance. Ask 1-2 specific client questions about the topic, constraints, timeline, risks, or next steps. 2-4 sentences. Output only the reply text.`;

    const result = await this.model.generateContent({
      contents: [{ role: 'user', parts: [{ text: retryPrompt }] }],
      generationConfig: {
        maxOutputTokens: 600,
        temperature: 0.6,
        topP: 0.9,
        topK: 40,
      },
    });
    return result.response.text();
  }

  initialize(apiKey) {
    if (!apiKey) {
      throw new Error('Gemini API key is required');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-2.0-flash - latest stable model
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }

  isInitialized() {
    return this.genAI !== null && this.model !== null;
  }

  /**
   * Generate quick practice scenarios
   */
  async generateQuickScenarios() {
    const varietySeed = Date.now();
    const prompt = `Generate 6 realistic client call practice scenarios for software developers, PMs, and consultants.
Request ID for variety: ${varietySeed}

IMPORTANT: Create FRESH scenarios each time. Vary widely across:
- Industries: use different ones each generation (e.g. Logistics, Media, Agriculture, Legal, Travel, Manufacturing, Energy)
- Company names: invent unique names, avoid generic ones like TechCorp
- Situations: mix technical, business, and interpersonal challenges
- Client personalities: different temperaments and priorities

Return ONLY a valid JSON array, no markdown or extra text. Rules:
- Use double quotes for all keys and string values
- No trailing commas
- Escape any quotes inside strings with backslash
- Keep background/description text brief to avoid parsing issues

[
  {
    "id": "quick-1",
    "title": "Project Delay Discussion",
    "description": "Explain backend delays to concerned client",
    "context": {
      "clientName": "TechCorp",
      "industry": "E-commerce",
      "background": "Payment gateway integration delayed 2 weeks",
      "constraints": "Fixed launch date, investor pressure",
      "personality": "Concerned but professional"
    },
    "prompt": "Address the delay and present revised timeline"
  }
]

Generate 6 unique scenarios with ids quick-1 through quick-6. Be creative and varied.`;

    try {
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 1.2,
          topK: 40,
          topP: 0.95,
        },
      });
      let rawText = result.response.text().trim();

      // Strip markdown code blocks if present
      const codeBlockMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = codeBlockMatch ? codeBlockMatch[1].trim() : rawText;

      const arrayMatch = jsonStr.match(/\[[\s\S]*\]/);
      if (!arrayMatch) {
        throw new Error('Failed to parse scenarios JSON');
      }

      let scenarios;
      try {
        scenarios = JSON.parse(arrayMatch[0]);
      } catch (parseErr) {
        // Repair trailing commas (common LLM JSON error)
        const repaired = arrayMatch[0].replace(/,(\s*[}\]])/g, '$1');
        try {
          scenarios = JSON.parse(repaired);
        } catch {
          throw new Error('Failed to parse scenarios JSON. The AI returned invalid JSON.');
        }
      }

      if (!Array.isArray(scenarios) || scenarios.length === 0) {
        throw new Error('AI did not return a valid scenarios array');
      }

      return scenarios;
    } catch (error) {
      console.error('Error generating quick scenarios:', error);
      throw new Error(error.message || 'Failed to generate scenarios');
    }
  }

  /**
   * Generate a custom scenario based on user input
   */
  async generateCustomScenario(userInput) {
    const { callType, clientName, industry, callContext, clientPersonality, yourRole, challengeOrGoal } = userInput;

    const prompt = `You are an expert at creating realistic client call simulation scenarios.

Based on this information, create a detailed client scenario:

- Call Type: ${callType}
- Client Name: ${clientName}
- Industry: ${industry}
- Your Role: ${yourRole}
- Client Personality: ${clientPersonality}
- Context: ${callContext}
- Challenge/Goal: ${challengeOrGoal}

Generate a realistic scenario in EXACTLY this JSON format (no markdown, just raw JSON):
{
  "id": "custom-${Date.now()}",
  "title": "${callType} with ${clientName}",
  "description": "Brief one-sentence description of the call scenario",
  "context": {
    "clientName": "${clientName}",
    "industry": "${industry}",
    "background": "Detailed background information incorporating the context provided",
    "constraints": "Realistic constraints or limitations for this scenario",
    "personality": "${clientPersonality}"
  },
  "prompt": "What the client expects you to address or discuss in this call"
}

Make it realistic and specific to the context provided. The scenario should feel like a real upcoming client call.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();

      // Extract JSON from response (in case there's markdown formatting)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to parse scenario JSON from AI response');
      }

      const scenario = JSON.parse(jsonMatch[0]);
      return scenario;
    } catch (error) {
      console.error('Error generating custom scenario:', error);
      throw new Error('Failed to generate custom scenario: ' + error.message);
    }
  }

  /**
   * Start a new simulation session
   */
  async startSimulation(sessionId, scenario, sessionLength) {
    const systemPrompt = `You are a client named ${scenario.context.clientName} on a ${sessionLength}-minute business call.

Your background: ${scenario.context.background}
Your personality: ${scenario.context.personality}
Your constraints: ${scenario.context.constraints}
Topic to discuss: ${scenario.prompt}

CONVERSATION RULES:
1. Write 2-4 sentences per response (minimum 30 words)
2. First few turns: casual small talk, ask about their day
3. After small talk: naturally transition to business topic
4. Be realistic - have concerns, ask questions, push back sometimes
5. Sound like a real person on a phone call
6. Stay IN CHARACTER as the client. You are NOT an assistant, coach, or interviewer.
7. NEVER say things like "How can I help?", "How can I help you further?", "I'm here to help", "I can assist", or anything implying you provide support/services.
8. Do NOT mention that you are an AI, model, chatbot, or simulation.
9. Behave like a real client: you have goals, concerns, constraints, and you want updates/clarity. Ask specific questions, request timelines, tradeoffs, and next steps.
10. Keep the tone professional and natural (no overly generic customer-support phrases).`;

    // Initialize conversation history for this session
    this.conversationHistory.set(sessionId, []);
    this.sessionSystemPrompts = this.sessionSystemPrompts || new Map();
    this.sessionSystemPrompts.set(sessionId, systemPrompt);

    // Use a natural greeting - don't rely on AI for this first message
    const greetings = [
      `Hey! How's it going? I've had such a busy week - been swamped with ${scenario.context.background.split('.')[0].toLowerCase() || 'work stuff'}. But I'm glad we could finally connect! How have you been?`,
      `Hi there! Good to finally talk to you. Things have been pretty hectic on my end lately, but that's the nature of the business, right? Anyway, how are you doing today?`,
      `Hey! Thanks for making time for this call. It's been one of those weeks, you know? We've got a lot going on. But before we dive in, how's everything on your side?`,
      `Hi! Great to connect with you. I've been looking forward to this chat. How's your week been going so far?`
    ];

    // Pick a random greeting
    let response = greetings[Math.floor(Math.random() * greetings.length)];

    // DEBUG - log the greeting being sent
    console.log('=== STARTING SIMULATION ===');
    console.log('Session ID:', sessionId);
    console.log('Greeting being sent:', response);
    console.log('Greeting length:', response.length);
    console.log('===========================');

    // Store the initial greeting separately (not in chat history)
    // Gemini API requires history to start with 'user' role
    this.sessionInitialGreetings = this.sessionInitialGreetings || new Map();
    this.sessionInitialGreetings.set(sessionId, response);

    // Store scenario for later use
    this.sessionScenarios.set(sessionId, scenario);

    // Save session to database
    try {
      await Session.create({
        sessionId: sessionId,
        scenarioId: scenario.id || null,
        scenarioTitle: scenario.title,
        scenarioDescription: scenario.description,
        scenarioData: scenario,
        sessionLength: sessionLength,
        status: 'active',
      });

      // Save initial greeting as first message
      await Message.create({
        sessionId: sessionId,
        role: 'model',
        content: response,
        isInitialGreeting: true,
      });

      console.log('Session saved to database:', sessionId);
    } catch (dbError) {
      console.error('Error saving session to database:', dbError);
      // Continue even if DB save fails - session will work but won't be persisted
    }

    return {
      message: response,
      sessionId: sessionId
    };
  }

  /**
   * Continue an existing simulation conversation
   */
  async continueSimulation(sessionId, userMessage) {
    if (!this.conversationHistory.has(sessionId)) {
      throw new Error('Session not found. Please start a new simulation.');
    }

    // Get the system prompt for this session
    const systemPrompt = this.sessionSystemPrompts?.get(sessionId) || '';

    // Get the initial greeting (sent before any user message)
    const initialGreeting = this.sessionInitialGreetings?.get(sessionId) || '';

    // Build history: Gemini requires it to start with 'user' role
    // For the first message, we need to structure it properly
    const existingHistory = this.conversationHistory.get(sessionId);
    let chatHistory = [];

    if (existingHistory.length === 0 && initialGreeting) {
      // First user message: include context about the greeting in system prompt
      // The history will start with this user message
    } else {
      chatHistory = existingHistory;
    }

    // Build the full system instruction
    const fullSystemInstruction = systemPrompt + (initialGreeting ? `\n\nYou already greeted the user with: "${initialGreeting}". Continue the conversation naturally from there.` : '');

    const chat = this.model.startChat({
      systemInstruction: {
        parts: [{ text: fullSystemInstruction }]
      },
      history: chatHistory,
      generationConfig: {
        maxOutputTokens: 1000, // Allow longer responses
        temperature: 0.8,
      },
    });

    let response = '';

    try {
      console.log('=== Sending message to Gemini ===');
      console.log('User message:', userMessage);
      console.log('History length:', chatHistory.length);
      console.log('System instruction length:', fullSystemInstruction.length);

      const result = await chat.sendMessage(userMessage);
      response = result.response.text();
      console.log('AI Response:', response);
    } catch (error) {
      console.error('=== Gemini API Error ===');
      console.error('Error message:', error.message);
      console.error('Full error:', error);
      // Re-throw the error so it's not hidden
      throw new Error('AI service error: ' + error.message);
    }

    // If response is empty, throw an error
    if (!response || response.trim().length === 0) {
      throw new Error('AI returned empty response');
    }

    // If the model slips into assistant language, regenerate once in strict client voice.
    if (this.isOutOfCharacterClientReply(response)) {
      try {
        const regenerated = await this.regenerateInClientVoice(
          fullSystemInstruction,
          userMessage,
          response
        );
        if (regenerated && regenerated.trim().length > 0 && !this.isOutOfCharacterClientReply(regenerated)) {
          response = regenerated;
        }
      } catch (regenErr) {
        console.error('Failed to regenerate in client voice:', regenErr?.message || regenErr);
        // fall back to original response if regeneration fails
      }
    }

    // Update history
    this.conversationHistory.get(sessionId).push(
      { role: 'user', parts: [{ text: userMessage }] },
      { role: 'model', parts: [{ text: response }] }
    );

    // Save messages to database
    try {
      await Message.bulkCreate([
        { sessionId, role: 'user', content: userMessage },
        { sessionId, role: 'model', content: response },
      ]);
    } catch (dbError) {
      console.error('Error saving messages to database:', dbError);
    }

    return {
      message: response,
      sessionId: sessionId
    };
  }

  /**
   * Generate structured feedback for the simulation
   */
  async generateFeedback(sessionId, scenario) {
    if (!this.conversationHistory.has(sessionId)) {
      throw new Error('Session not found');
    }

    // Include initial greeting in the conversation log
    const initialGreeting = this.sessionInitialGreetings?.get(sessionId) || '';
    const historyLog = this.conversationHistory.get(sessionId)
      .filter(msg => msg.role === 'user' || msg.role === 'model')
      .map(msg => `${msg.role}: ${msg.parts[0].text}`)
      .join('\n');

    const conversationLog = initialGreeting
      ? `model: ${initialGreeting}\n${historyLog}`
      : historyLog;

    const feedbackPrompt = `You are an expert coach evaluating a client communication simulation.

Scenario Context:
- Scenario: ${scenario.title}
- Client: ${scenario.context.clientName} (${scenario.context.industry})
- Challenge: ${scenario.description}

Full Conversation:
${conversationLog}

Provide structured feedback in EXACTLY this format (use these exact section headers):

## What Went Well
[List 2-3 specific strengths in their thinking and communication. Be specific and reference actual moments from the conversation.]

## What Didn't Land
[Identify 2-3 areas where reasoning, framing, or tone caused friction or missed the mark. Focus on impact, not judgment.]

## What to Improve Next Time
[Provide 2-3 clear, behavioral suggestions. Use concrete examples like:
- "Frame the problem before proposing solutions"
- "Explicitly acknowledge client urgency"
- "State tradeoffs earlier in the explanation"]

## Action Items
[Provide 2-3 prescriptive next steps, such as:
- Retry this scenario with a different client personality
- Try a more complex scenario
- Practice a 90-second executive explanation]

Keep each section concise and actionable.`;

    const result = await this.model.generateContent(feedbackPrompt);
    const feedback = result.response.text();
    const parsedFeedback = this.parseFeedback(feedback);

    // Save feedback to database and mark session as completed
    try {
      await Session.update(
        {
          status: 'completed',
          feedback: parsedFeedback,
          endedAt: new Date(),
        },
        { where: { sessionId } }
      );
      console.log('Session marked as completed:', sessionId);
    } catch (dbError) {
      console.error('Error updating session in database:', dbError);
    }

    // Clear this session's data from memory after feedback
    this.conversationHistory.delete(sessionId);
    if (this.sessionInitialGreetings) {
      this.sessionInitialGreetings.delete(sessionId);
    }
    if (this.sessionScenarios) {
      this.sessionScenarios.delete(sessionId);
    }

    return parsedFeedback;
  }

  /**
   * Parse the feedback into structured sections
   */
  parseFeedback(feedbackText) {
    const sections = {
      whatWentWell: '',
      whatDidntLand: '',
      whatToImprove: '',
      actionItems: ''
    };

    // Split by sections
    const wentWellMatch = feedbackText.match(/##\s*What Went Well\s*([\s\S]*?)(?=##|$)/i);
    const didntLandMatch = feedbackText.match(/##\s*What Didn't Land\s*([\s\S]*?)(?=##|$)/i);
    const improveMatch = feedbackText.match(/##\s*What to Improve Next Time\s*([\s\S]*?)(?=##|$)/i);
    const actionMatch = feedbackText.match(/##\s*Action Items\s*([\s\S]*?)(?=##|$)/i);

    if (wentWellMatch) sections.whatWentWell = wentWellMatch[1].trim();
    if (didntLandMatch) sections.whatDidntLand = didntLandMatch[1].trim();
    if (improveMatch) sections.whatToImprove = improveMatch[1].trim();
    if (actionMatch) sections.actionItems = actionMatch[1].trim();

    return sections;
  }

  /**
   * Clear a specific session
   */
  clearSession(sessionId) {
    this.conversationHistory.delete(sessionId);
    if (this.sessionSystemPrompts) {
      this.sessionSystemPrompts.delete(sessionId);
    }
    if (this.sessionInitialGreetings) {
      this.sessionInitialGreetings.delete(sessionId);
    }
    if (this.sessionScenarios) {
      this.sessionScenarios.delete(sessionId);
    }
  }

  /**
   * Restore a session from database for continuing conversation
   */
  restoreSession(sessionId, scenario, sessionLength, initialGreeting, conversationHistory) {
    // Rebuild system prompt
    const systemPrompt = `You are a client named ${scenario.context.clientName} on a ${sessionLength}-minute business call.

Your background: ${scenario.context.background}
Your personality: ${scenario.context.personality}
Your constraints: ${scenario.context.constraints}
Topic to discuss: ${scenario.prompt}

CONVERSATION RULES:
1. Write 2-4 sentences per response (minimum 30 words)
2. First few turns: casual small talk, ask about their day
3. After small talk: naturally transition to business topic
4. Be realistic - have concerns, ask questions, push back sometimes
5. Sound like a real person on a phone call
6. Stay IN CHARACTER as the client. You are NOT an assistant, coach, or interviewer.
7. NEVER say things like "How can I help?", "How can I help you further?", "I'm here to help", "I can assist", or anything implying you provide support/services.
8. Do NOT mention that you are an AI, model, chatbot, or simulation.
9. Behave like a real client: you have goals, concerns, constraints, and you want updates/clarity. Ask specific questions, request timelines, tradeoffs, and next steps.
10. Keep the tone professional and natural (no overly generic customer-support phrases).`;

    // Initialize maps if needed
    this.sessionSystemPrompts = this.sessionSystemPrompts || new Map();
    this.sessionInitialGreetings = this.sessionInitialGreetings || new Map();

    // Restore session data in memory
    this.conversationHistory.set(sessionId, conversationHistory || []);
    this.sessionSystemPrompts.set(sessionId, systemPrompt);
    this.sessionScenarios.set(sessionId, scenario);

    if (initialGreeting) {
      this.sessionInitialGreetings.set(sessionId, initialGreeting);
    }

    console.log('Session restored:', sessionId);
  }

  /**
   * Generate new scenarios based on conversation history
   */
  async generateScenariosFromHistory(recentSessions) {
    // Build context from recent sessions
    const historyContext = recentSessions.map(session => {
      const scenario = session.scenarioData;
      const messageCount = session.messages?.length || 0;
      const feedback = session.feedback;

      return `
Scenario: ${scenario.title}
Industry: ${scenario.context?.industry || 'N/A'}
Client Personality: ${scenario.context?.personality || 'N/A'}
Messages exchanged: ${messageCount}
${feedback?.whatToImprove ? `Areas to improve: ${feedback.whatToImprove}` : ''}
`;
    }).join('\n---\n');

    const prompt = `Based on the user's recent practice session history, generate 3 new personalized scenarios that would help them improve.

Recent Practice History:
${historyContext}

Generate scenarios that:
1. Address areas where the user needs improvement
2. Gradually increase in difficulty
3. Cover different aspects of client communication
4. Are realistic and specific

Return EXACTLY this JSON array format (no markdown, just raw JSON):
[
  {
    "id": "suggested-1",
    "title": "Scenario title",
    "description": "Brief description",
    "context": {
      "clientName": "Client name",
      "industry": "Industry",
      "background": "Background context",
      "constraints": "Constraints",
      "personality": "Client personality type"
    },
    "prompt": "What the user should address",
    "reason": "Why this scenario was suggested based on history"
  }
]

Generate 3 unique scenarios.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();

      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('Failed to parse scenarios JSON');
      }

      const scenarios = JSON.parse(jsonMatch[0]);
      return scenarios;
    } catch (error) {
      console.error('Error generating scenarios from history:', error);
      throw new Error('Failed to generate scenarios from history: ' + error.message);
    }
  }
}

module.exports = new GeminiService();
