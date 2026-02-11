# JaySim - Client Simulation Platform

A rehearsal simulator for practicing end-to-end product thinking, solution design, and client communication skills.

## Overview

JaySim is a simulation-based practice environment where developers, QA, designers, and PMs can:
- Practice end-to-end product/solution thinking
- Practice explaining solutions to clients
- Receive clear, actionable feedback
- Improve speed, clarity, and confidence before real client interactions

## Architecture

```
Frontend (React)
   |
   | HTTP (fetch / axios)
   |
Backend (Node + Express)
   |
   | AI API (Gemini)
   |
Database (optional - not in MVP)
```

## Project Structure

```
p1/
├── backend/
│   ├── package.json
│   ├── server.js
│   ├── .env.example
│   ├── routes/
│   │   └── simulation.js
│   ├── controllers/
│   │   └── simulationController.js
│   ├── services/
│   │   └── geminiService.js
│   └── data/
│       └── scenarios.js
│
├── frontend/
│   ├── package.json
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── App.js
│       ├── index.js
│       ├── components/
│       │   ├── HomePage.js
│       │   ├── SimulationSetup.js
│       │   ├── SimulationInterface.js
│       │   └── FeedbackDisplay.js
│       └── styles/
│           └── App.css
│
├── .gitignore
└── README.md
```

## Features

### MVP Features (Implemented)
- ✓ Single-screen UI
- ✓ Scenario picker (by intent)
- ✓ 7 realistic simulations
- ✓ Text input for responses
- ✓ AI-driven conversation (Gemini)
- ✓ 4-part structured feedback:
  - What Went Well
  - What Didn't Land
  - What to Improve Next Time
  - Action Items
- ✓ Session length selection (5, 15, 30 minutes)

### Available Scenarios
1. **Internal Discussion** - Low-stakes team discussion
2. **Client Clarification** - Clarifying ambiguous requirements
3. **Scope Negotiation** - Negotiating scope under timeline pressure
4. **Feature Rejection** - Explaining why a feature shouldn't be built
5. **Executive Presentation** - High-pressure C-level conversation
6. **Ambiguous Problem** - Solving problems with limited information
7. **Cost vs Quality Tradeoff** - Explaining technical tradeoffs

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Gemini API key from Google AI Studio

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file:
   ```bash
   cp .env.example .env
   ```

4. Add your Gemini API key to `.env`:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=5000
   ```

   Get your API key from: https://makersuite.google.com/app/apikey

5. Start the backend server:
   ```bash
   npm start
   ```

   For development with auto-reload:
   ```bash
   npm run dev
   ```

   Backend will run on http://localhost:5000

### Frontend Setup

1. Open a new terminal and navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the React development server:
   ```bash
   npm start
   ```

   Frontend will run on http://localhost:3000

## Usage

1. **Start both servers** (backend on port 5000, frontend on port 3000)

2. **Open your browser** to http://localhost:3000

3. **Choose a scenario** from the home page

4. **Review the context** including client background, constraints, and your challenge

5. **Select session length** (5, 15, or 30 minutes)

6. **Start the simulation** and engage in conversation with the AI client

7. **End the session** when ready to receive structured feedback

8. **Review feedback** in 4 sections:
   - What went well
   - What didn't land
   - What to improve
   - Action items

9. **Retry or try another scenario** to continue practicing

## API Endpoints

### Backend API

- `GET /api/health` - Health check
- `GET /api/simulation/scenarios` - Get all scenarios
- `GET /api/simulation/scenarios/:scenarioId` - Get specific scenario
- `POST /api/simulation/start` - Start a new simulation
- `POST /api/simulation/message` - Send message in ongoing simulation
- `POST /api/simulation/end` - End simulation and get feedback

## Key Design Principles

1. **Psychological Safety**
   - No scores or leaderboards
   - No public visibility of performance
   - Focus on growth, not judgment

2. **Single-Screen Focus**
   - No complex dashboards
   - One session = one simulation
   - Simple, focused experience

3. **Practice > Theory**
   - No lectures or frameworks upfront
   - Learning through repetition and feedback
   - Real-world scenarios

## Future Enhancements (Not in MVP)

- Voice input support
- Session history
- User profiles
- Analytics dashboard
- Organization-wide rollout controls
- Custom scenario builder
- More industry-specific scenarios

## Technology Stack

- **Frontend**: React 18, Axios
- **Backend**: Node.js, Express
- **AI**: Google Gemini API
- **Styling**: Custom CSS

## Troubleshooting

### Backend won't start
- Ensure Node.js is installed: `node --version`
- Check if `.env` file exists with `GEMINI_API_KEY`
- Verify API key is valid

### Frontend can't connect to backend
- Ensure backend is running on port 5000
- Check proxy setting in `frontend/package.json`

### AI responses not working
- Verify Gemini API key is correct
- Check backend console for error messages
- Ensure you have internet connection

### Port already in use
- Backend: Change `PORT` in `.env`
- Frontend: Set `PORT=3001` before running `npm start`

## Contributing

This is an internal product. To contribute:
1. Use it yourself
2. Share feedback based on lived experience
3. Suggest improvements based on real impact

## License

MIT

## Contact

For questions or support, reach out to the development team.
