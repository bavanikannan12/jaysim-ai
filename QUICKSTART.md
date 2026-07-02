# 🚀 ClearPitch Quick Start (5 Minutes)

## What You Have
A complete client simulation platform with:
- ✅ Backend (Node.js + Express + Gemini AI)
- ✅ Frontend (React)
- ✅ 7 realistic scenarios
- ✅ AI-driven conversations
- ✅ Structured feedback system

---

## 🎯 3 Steps to Start

### Step 1: Get Your API Key (2 minutes)
1. Visit: https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key

### Step 2: Install & Configure (2 minutes)

**Option A - Automatic (Windows):**
```bash
# Double-click: install.bat
# Then edit backend\.env and paste your API key
```

**Option B - Manual:**
```bash
# Backend
cd backend
npm install
copy .env.example .env
# Edit .env and add your API key

# Frontend (new terminal)
cd frontend
npm install
```

### Step 3: Run (1 minute)

**Option A - Automatic (Windows):**
```bash
# Double-click: start-clearpitch.bat
```

**Option B - Manual:**
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm start
```

✅ **Done!** Browser opens to http://localhost:3000

---

## 🎮 How to Use

1. **Choose a scenario** (try "Internal Discussion" first)
2. **Select session length** (15 min recommended)
3. **Click "Start Simulation"**
4. **Chat with the AI client** naturally
5. **Click "End Session"** to get feedback
6. **Review your feedback** in 4 sections

---

## 📁 Project Structure

```
p1/
├── backend/          → Node.js server + AI integration
├── frontend/         → React UI
├── install.bat       → Automatic installation (Windows)
├── start-clearpitch.bat  → Start both servers (Windows)
├── README.md         → Full documentation
└── SETUP_GUIDE.md    → Detailed setup instructions
```

---

## 🔧 Troubleshooting

### Backend won't start?
- Check `backend/.env` exists
- Verify API key has no extra spaces
- Ensure port 5000 is free

### Frontend can't connect?
- Make sure backend is running first
- Visit: http://localhost:5000/api/health
- Should see: `{"status": "ok", "aiServiceReady": true}`

### Need detailed help?
- See `SETUP_GUIDE.md` for step-by-step instructions
- See `README.md` for full documentation
- See `PROJECT_STRUCTURE.md` for code explanation

---

## 🎯 What to Try First

1. **Scenario**: "Internal Discussion" (easiest)
2. **Length**: 15 minutes
3. **Approach**: Just talk naturally about the problem
4. **Focus**: Listen to feedback, not perfection

---

## 📊 What Each File Does

| File | Purpose |
|------|---------|
| `backend/server.js` | Main API server |
| `backend/services/geminiService.js` | AI integration |
| `backend/data/scenarios.js` | All 7 scenarios |
| `frontend/src/App.js` | Main React app |
| `frontend/src/components/` | UI components |

---

## 💡 Tips

- Start simple, don't overthink
- Read feedback carefully - it's personalized
- Retry scenarios to see improvement
- Use before real client calls

---

## 🚀 Next Steps

After your first session:
1. Try different scenarios
2. Experiment with session lengths
3. Focus on "Action Items" from feedback
4. Practice regularly

---

**Ready?** Run `install.bat` then `start-clearpitch.bat` and you're live!
