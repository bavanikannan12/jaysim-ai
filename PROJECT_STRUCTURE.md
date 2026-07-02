# ClearPitch Project Structure

## Complete File Tree

```
p1/
│
├── backend/                          # Node.js + Express Backend
│   ├── package.json                  # Backend dependencies
│   ├── server.js                     # Main server file
│   ├── .env.example                  # Environment variables template
│   │
│   ├── routes/
│   │   └── simulation.js             # API route definitions
│   │
│   ├── controllers/
│   │   └── simulationController.js   # Business logic for simulations
│   │
│   ├── services/
│   │   └── geminiService.js          # Gemini AI integration
│   │
│   └── data/
│       └── scenarios.js              # 7 simulation scenarios
│
├── frontend/                         # React Frontend
│   ├── package.json                  # Frontend dependencies
│   │
│   ├── public/
│   │   └── index.html                # HTML template
│   │
│   └── src/
│       ├── index.js                  # React entry point
│       ├── App.js                    # Main App component
│       │
│       ├── components/
│       │   ├── HomePage.js           # Scenario selection screen
│       │   ├── SimulationSetup.js    # Pre-simulation setup
│       │   ├── SimulationInterface.js # Chat interface
│       │   └── FeedbackDisplay.js    # Feedback screen
│       │
│       └── styles/
│           └── App.css               # All application styles
│
├── .gitignore                        # Git ignore rules
├── README.md                         # Full documentation
├── SETUP_GUIDE.md                    # Quick start guide
└── PROJECT_STRUCTURE.md              # This file
```

## File Descriptions

### Backend Files

#### `server.js` (Main Backend)
- Express server setup
- CORS configuration
- Gemini service initialization
- API route mounting
- Health check endpoint

#### `routes/simulation.js`
- API endpoint definitions
- Route handlers binding
- Endpoints:
  - GET `/api/simulation/scenarios`
  - GET `/api/simulation/scenarios/:scenarioId`
  - POST `/api/simulation/start`
  - POST `/api/simulation/message`
  - POST `/api/simulation/end`

#### `controllers/simulationController.js`
- Business logic for all simulation operations
- Scenario retrieval
- Session management
- Message handling
- Feedback generation

#### `services/geminiService.js`
- Gemini AI API integration
- Conversation history management
- Session state tracking
- Feedback parsing
- Core AI functionality:
  - `startSimulation()` - Initialize AI conversation
  - `continueSimulation()` - Process user messages
  - `generateFeedback()` - Create structured feedback

#### `data/scenarios.js`
- 7 pre-built simulation scenarios
- Each scenario includes:
  - Title and description
  - Client context
  - Industry and background
  - Constraints
  - Personality type
  - Initial prompt

### Frontend Files

#### `App.js` (Main Component)
- Application state management
- View routing (home, setup, simulation, feedback)
- API calls to backend
- Error handling
- Loading states

#### Components:

**`HomePage.js`**
- Displays all available scenarios
- Scenario selection interface
- Grid layout of scenario cards

**`SimulationSetup.js`**
- Shows selected scenario details
- Session length selection (5, 15, 30 min)
- Displays client context
- Start button to begin simulation

**`SimulationInterface.js`**
- Real-time chat interface
- Message history display
- Text input for responses
- Send/End session controls
- Auto-scroll to latest message

**`FeedbackDisplay.js`**
- 4-section feedback display:
  1. What Went Well (positive)
  2. What Didn't Land (negative)
  3. What to Improve (suggestions)
  4. Action Items (next steps)
- Retry/New session buttons

#### `styles/App.css`
- Complete application styling
- Responsive design
- Color scheme (purple gradient theme)
- Component-specific styles
- Mobile-friendly layouts

## Data Flow

### 1. Scenario Selection Flow
```
User clicks scenario
  ↓
HomePage → App.js
  ↓
App.js sets selectedScenario
  ↓
Switches view to 'setup'
  ↓
Shows SimulationSetup component
```

### 2. Simulation Start Flow
```
User clicks "Start Simulation"
  ↓
SimulationSetup → App.js
  ↓
POST /api/simulation/start
  ↓
Backend: simulationController.startSimulation()
  ↓
geminiService.startSimulation()
  ↓
Gemini AI creates client persona
  ↓
Returns sessionId + initial message
  ↓
App.js switches to 'simulation' view
```

### 3. Conversation Flow
```
User types message
  ↓
SimulationInterface sends to backend
  ↓
POST /api/simulation/message
  ↓
geminiService.continueSimulation()
  ↓
Gemini generates client response
  ↓
Response displayed in chat
```

### 4. Feedback Flow
```
User clicks "End Session"
  ↓
SimulationInterface → App.js
  ↓
POST /api/simulation/end
  ↓
geminiService.generateFeedback()
  ↓
AI analyzes full conversation
  ↓
Returns 4-part structured feedback
  ↓
App.js switches to 'feedback' view
```

## API Communication

All API calls use Axios and follow this pattern:

```javascript
// Request
POST http://localhost:5000/api/simulation/start
Body: {
  scenarioId: "client-clarification",
  sessionLength: 15
}

// Response
{
  success: true,
  sessionId: "sim_1234567890_abc123",
  message: "Welcome! I'm ready to discuss...",
  scenario: { ... }
}
```

## Environment Configuration

### Backend `.env`
```
GEMINI_API_KEY=your_api_key_here
PORT=5000
```

### Frontend Proxy
Configured in `frontend/package.json`:
```json
"proxy": "http://localhost:5000"
```

This allows frontend to call `/api/simulation/...` without full URL.

## State Management

### App.js State
```javascript
currentView      // 'home' | 'setup' | 'simulation' | 'feedback'
selectedScenario // Selected scenario object
sessionId        // Current simulation session ID
sessionLength    // 5, 15, or 30 minutes
feedback         // AI-generated feedback object
loading          // Loading state
error            // Error message
```

### SimulationInterface State
```javascript
messages         // Chat message history
inputMessage     // Current user input
loading          // Waiting for AI response
sessionActive    // Is session still active
```

## Key Features Implementation

### ✅ Single-Screen Focus
- Only one main component visible at a time
- Controlled via `currentView` state in App.js
- No complex navigation or dashboards

### ✅ AI-Driven Conversations
- Gemini API handles all AI interactions
- Maintains conversation history per session
- Client persona consistency throughout session

### ✅ Structured Feedback
- 4-part feedback format enforced
- AI generates specific, actionable feedback
- Parsed into separate sections for display

### ✅ Session Management
- Unique session IDs for each simulation
- Conversation history tracked server-side
- Cleanup after feedback generation

### ✅ Realistic Scenarios
- 7 diverse scenario types
- Real-world client personalities
- Authentic constraints and contexts

## Technology Choices

### Why React?
- Component-based architecture
- Easy state management
- Fast development
- Good for single-page apps

### Why Express?
- Minimal, flexible
- Easy API creation
- Good middleware support
- Node.js ecosystem

### Why Gemini?
- Free tier available
- Good conversation capabilities
- Easy integration
- Handles context well

## Development Workflow

1. **Start Backend First**
   ```bash
   cd backend
   npm install
   npm start
   ```

2. **Then Start Frontend**
   ```bash
   cd frontend
   npm install
   npm start
   ```

3. **Access Application**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000
   - Health Check: http://localhost:5000/api/health

## Future Extension Points

### Easy to Add:
- More scenarios (just edit `scenarios.js`)
- New feedback sections (modify feedback prompt)
- Different session lengths (update UI options)

### Requires Code Changes:
- Voice input (need Web Speech API)
- User accounts (need database + auth)
- Session history (need persistent storage)
- Analytics (need tracking + database)

## Common Customizations

### Add New Scenario
Edit `backend/data/scenarios.js`:
```javascript
{
  id: 'my-new-scenario',
  title: 'Scenario Title',
  description: 'Brief description',
  context: {
    clientName: 'Company Name',
    industry: 'Industry',
    background: '...',
    constraints: '...',
    personality: '...'
  },
  prompt: 'Your challenge...'
}
```

### Change Color Scheme
Edit `frontend/src/styles/App.css`:
```css
/* Main gradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Primary button color */
.btn-primary {
  background: #667eea;
}
```

### Modify Feedback Format
Edit `backend/services/geminiService.js` in `generateFeedback()` function.

## Performance Considerations

- Conversation history stored in memory (Map)
- Sessions auto-cleaned after feedback
- No persistent storage in MVP
- API calls are async/await
- Frontend updates optimistically

## Security Notes

- API key stored in `.env` (never commit!)
- CORS enabled for development
- No authentication in MVP
- Sessions not persistent (memory-only)

## Testing Recommendations

1. **Test scenario flow**: Home → Setup → Simulation → Feedback
2. **Test API health**: Visit `/api/health`
3. **Test error cases**: Start without API key
4. **Test conversation**: Multiple message exchanges
5. **Test feedback**: Complete full session

---

This structure follows the MVP requirements from the PRD while remaining simple and maintainable.
