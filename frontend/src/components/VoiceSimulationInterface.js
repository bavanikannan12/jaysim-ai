import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function VoiceSimulationInterface({ scenario, sessionLength, sessionId, initialGreeting, continuedMessages, onEnd }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionActive, setSessionActive] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [autoListen, setAutoListen] = useState(false);

  const chatWindowRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthesisRef = useRef(window.speechSynthesis);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
        // Auto-send if enabled
        if (autoListen) {
          handleSendMessage(transcript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    // Cleanup
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      synthesisRef.current.cancel();
    };
  }, []);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    // Check if this is a continued session with existing messages
    if (continuedMessages && continuedMessages.length > 0) {
      const formattedMessages = continuedMessages.map(msg => ({
        sender: msg.role === 'user' ? 'You' : scenario.context.clientName,
        text: msg.content,
        type: msg.role === 'user' ? 'user' : 'client'
      }));
      setMessages(formattedMessages);
      return;
    }

    // Auto-start conversation with AI greeting (use the greeting from startSimulation)
    if (messages.length === 0 && initialGreeting) {
      // Small delay to let UI load
      setTimeout(() => {
        setMessages([{
          sender: scenario.context.clientName,
          text: initialGreeting,
          type: 'client'
        }]);

        // Speak the greeting
        if (voiceEnabled) {
          setTimeout(() => speakText(initialGreeting), 500);
        }
      }, 500);
    }
  }, [initialGreeting, continuedMessages]); // Run when initialGreeting or continuedMessages is available

  const startListening = async () => {
    if (recognitionRef.current && !isListening) {
      try {
        // Request microphone permission first
        await navigator.mediaDevices.getUserMedia({ audio: true });
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error starting recognition:', error);
        alert('Microphone access denied. Please allow microphone permission and try again.');
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const speakText = (text) => {
    if (!voiceEnabled || !text) return;

    // Cancel any ongoing speech
    synthesisRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Optimize for natural conversation
    utterance.rate = 0.95; // Slightly slower for clarity
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Select best available voice
    const voices = synthesisRef.current.getVoices();

    // Priority order for best voice quality
    const preferredVoice = voices.find(voice =>
      // Google voices are generally best
      voice.name.includes('Google US English') ||
      voice.name.includes('Google UK English') ||
      voice.name.includes('Microsoft David') ||
      voice.name.includes('Microsoft Zira') ||
      voice.name.includes('Samantha') || // macOS
      voice.name.includes('Karen') || // macOS
      voice.name.includes('Natural') ||
      (voice.lang === 'en-US' && voice.localService === false) // Cloud voices
    ) || voices.find(v => v.lang.startsWith('en-')) || voices[0];

    if (preferredVoice) {
      utterance.voice = preferredVoice;
      console.log('Using voice:', preferredVoice.name);
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      // Auto-listen for next response if enabled
      if (autoListen && sessionActive) {
        setTimeout(() => startListening(), 800);
      }
    };

    utterance.onerror = (error) => {
      console.error('Speech synthesis error:', error);
      setIsSpeaking(false);
    };

    synthesisRef.current.speak(utterance);
  };

  const handleSendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim() || loading) return;

    const userMessage = messageText;
    setInputMessage('');

    // Add user message to chat
    setMessages(prev => [...prev, {
      sender: 'You',
      text: userMessage,
      type: 'user'
    }]);

    setLoading(true);

    try {
      const response = await axios.post('/api/simulation/message', {
        sessionId: sessionId,
        message: userMessage
      });

      const clientResponse = response.data.message;

      // Add client response
      setMessages(prev => [...prev, {
        sender: scenario.context.clientName,
        text: clientResponse,
        type: 'client'
      }]);

      // Speak the client's response
      if (voiceEnabled) {
        speakText(clientResponse);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        sender: 'System',
        text: 'Error: Failed to get response. Please try again.',
        type: 'client'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleEndSimulation = () => {
    synthesisRef.current.cancel();
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setSessionActive(false);
    onEnd();
  };

  const toggleVoice = () => {
    if (voiceEnabled) {
      synthesisRef.current.cancel();
    }
    setVoiceEnabled(!voiceEnabled);
  };

  const toggleAutoListen = () => {
    setAutoListen(!autoListen);
  };

  return (
    <div className="simulation-container voice-enabled">
      <div className="simulation-header">
        <h2>{scenario.title}</h2>
        <div className="client-info">
          <span>🎤 Voice Call: {scenario.context.clientName}</span>
          <span className="session-length">Session: {sessionLength} min</span>
        </div>
      </div>

      <div className="voice-controls">
        <button
          className={`voice-btn ${voiceEnabled ? 'active' : ''}`}
          onClick={toggleVoice}
          title="Toggle voice output"
        >
          {voiceEnabled ? '🔊' : '🔇'}
        </button>
        <button
          className={`voice-btn ${autoListen ? 'active' : ''}`}
          onClick={toggleAutoListen}
          title="Automatically listen after AI responds"
        >
          {autoListen ? '🔄 Auto' : '🔄'}
        </button>
        {isSpeaking && <span className="status-indicator speaking">Speaking...</span>}
        {isListening && <span className="status-indicator listening">Listening...</span>}
      </div>

      <div className="chat-window" ref={chatWindowRef}>
        {messages.length === 0 && (
          <div className="message client">
            <div className="sender">{scenario.context.clientName}</div>
            <div>Connecting...</div>
          </div>
        )}

        {messages.map((message, index) => (
          <div key={index} className={`message ${message.type}`}>
            <div className="sender">{message.sender}</div>
            <div>{message.text}</div>
          </div>
        ))}

        {loading && (
          <div className="message client">
            <div className="sender">{scenario.context.clientName}</div>
            <div>Thinking...</div>
          </div>
        )}
      </div>

      {sessionActive && (
        <>
          <div className="input-area voice-input">
            <button
              className={`mic-button ${isListening ? 'listening' : ''}`}
              onClick={isListening ? stopListening : startListening}
              disabled={loading}
              title={isListening ? 'Stop listening' : 'Start speaking'}
            >
              {isListening ? '⏹' : '🎤'}
            </button>

            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Message..."
              disabled={loading || isListening}
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={loading || !inputMessage.trim() || isListening}
              className="send-button"
            >
              ↑
            </button>
          </div>

          <div className="simulation-controls">
            <button className="btn btn-secondary" onClick={handleEndSimulation}>
              End Call
            </button>
          </div>
        </>
      )}

      {!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) && (
        <div className="voice-warning">
          Voice input requires Chrome or Edge browser
        </div>
      )}
    </div>
  );
}

export default VoiceSimulationInterface;
