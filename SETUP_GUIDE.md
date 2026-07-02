# Quick Setup Guide for ClearPitch

Follow these steps to get ClearPitch running in 5 minutes.

## Step 1: Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

## Step 2: Configure Backend

1. Open the `backend` folder
2. Find the file `.env.example`
3. Create a new file called `.env` (copy from `.env.example`)
4. Open `.env` and replace `your_gemini_api_key_here` with your actual API key

Your `.env` file should look like:
```
GEMINI_API_KEY=AIzaSyC...your_key_here
PORT=5000
```

## Step 3: Install Dependencies

### Backend
```bash
cd backend
npm install
```

### Frontend (open new terminal)
```bash
cd frontend
npm install
```

## Step 4: Start the Application

### Terminal 1 - Backend
```bash
cd backend
npm start
```

You should see:
```
🚀 ClearPitch Backend Server
Server running on port 5000
✓ Gemini AI service initialized
```

### Terminal 2 - Frontend
```bash
cd frontend
npm start
```

Browser should automatically open to http://localhost:3000

## Step 5: Test the Application

1. You should see the ClearPitch home page with 7 scenarios
2. Click on "Internal Discussion" to start
3. Select session length (15 minutes recommended for first try)
4. Click "Start Simulation"
5. Type a message and interact with the AI client
6. Click "End Session & Get Feedback" when done
7. Review your structured feedback

## Troubleshooting

### "AI service not initialized" error
- Check your `.env` file exists in the `backend` folder
- Verify your API key is correct (no extra spaces)
- Restart the backend server

### Backend won't start - "Port already in use"
- Another application is using port 5000
- Change the port in `.env`: `PORT=5001`
- Update frontend proxy in `frontend/package.json` to match

### Frontend shows "Failed to load scenarios"
- Make sure backend is running first
- Check backend URL in browser: http://localhost:5000/api/health
- Should show: `{"status": "ok", "aiServiceReady": true}`

### "Cannot find module" errors
- Delete `node_modules` folder
- Delete `package-lock.json`
- Run `npm install` again

## Quick Commands Reference

### Start Backend
```bash
cd backend
npm start
```

### Start Backend (with auto-reload during development)
```bash
cd backend
npm run dev
```

### Start Frontend
```bash
cd frontend
npm start
```

### Check Backend Health
Open in browser: http://localhost:5000/api/health

## Tips for First Time Users

1. **Start with "Internal Discussion"** - It's the easiest scenario
2. **Use 15-minute sessions** - Good balance for practice
3. **Don't overthink** - Just start talking naturally
4. **Read the feedback carefully** - It's specific to your conversation
5. **Retry scenarios** - You'll improve each time

## Next Steps

After you've completed your first simulation:
- Try different scenarios to practice various situations
- Experiment with different session lengths
- Pay attention to the "Action Items" in feedback
- Use this before real client calls to prepare

## Need Help?

Check the full README.md for detailed documentation and API information.
