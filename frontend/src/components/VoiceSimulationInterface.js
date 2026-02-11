import React, {
  useState,
  useEffect,
  useRef,
  useCallback
} from 'react';
import axios from 'axios';

function VoiceSimulationInterface({
  scenario,
  sessionLength,
  sessionId,
  initialGreeting,
  continuedMessages,
  onEnd
}) {
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

  // ------------------------
  // Speech Initialization
  // ------------------------
  useEffect(() => {
    const recognitionAvailable =
      'webkitSpeechRecognition' in window ||
      'SpeechRecognition' in window;

    if (recognitionAvailable) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
    }

    const synth = synthesisRef.current;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synth) {
        synth.cancel();
      }
    };
  }, []);

  // ------------------------
  // Scroll to bottom
  // ------------------------
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop =
        chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  // ------------------------
  // Speak Text (Fixed with useCallback)
  // ------------------------
  const speakText = useCallback(
    (text) => {
      if (!voiceEnabled || !text) return;

      synthesisRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      const voices = synthesisRef.current.getVoices();
      const preferredVoice =
        voices.find((v) => v.lang.startsWith('en-')) || voices[0];

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      synthesisRef.current.speak(utterance);
    },
    [voiceEnabled]
  );

  // ------------------------
  // Greeting / Continue Session
  // ------------------------
  useEffect(() => {
    if (continuedMessages && continuedMessages.length > 0) {
      const formatted = continuedMessages.map((msg) => ({
        sender:
          msg.role === 'user'
            ? 'You'
            : scenario.context.clientName,
        text: msg.content,
        type: msg.role === 'user' ? 'user' : 'client'
      }));

      setMessages(formatted);
      return;
    }

    if (messages.length === 0 && initialGreeting) {
      setTimeout(() => {
        setMessages([
          {
            sender: scenario.context.clientName,
            text: initialGreeting,
            type: 'client'
          }
        ]);

        if (voiceEnabled) {
          speakText(initialGreeting);
        }
      }, 500);
    }
  }, [
    initialGreeting,
    continuedMessages,
    scenario.context.clientName,
    messages.length,
    voiceEnabled,
    speakText
  ]);

  // ------------------------
  // Send Message
  // ------------------------
  const handleSendMessage = async (
    messageText = inputMessage
  ) => {
    if (!messageText.trim() || loading) return;

    setInputMessage('');

    setMessages((prev) => [
      ...prev,
      { sender: 'You', text: messageText, type: 'user' }
    ]);

    setLoading(true);

    try {
      const response = await axios.post(
        '/api/simulation/message',
        {
          sessionId,
          message: messageText
        }
      );

      const clientResponse = response.data.message;

      setMessages((prev) => [
        ...prev,
        {
          sender: scenario.context.clientName,
          text: clientResponse,
          type: 'client'
        }
      ]);

      if (voiceEnabled) {
        speakText(clientResponse);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'System',
          text: 'Error: Failed to get response.',
          type: 'client'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ------------------------
  // End Simulation
  // ------------------------
  const handleEndSimulation = () => {
    synthesisRef.current.cancel();
    recognitionRef.current?.stop();
    setSessionActive(false);
    onEnd();
  };

  return (
    <div className="simulation-container voice-enabled">
      <div className="simulation-header">
        <h2>{scenario.title}</h2>
        <div className="client-info">
          🎤 Voice Call: {scenario.context.clientName}
        </div>
      </div>

      <div className="chat-window" ref={chatWindowRef}>
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.type}`}>
            <div className="sender">{msg.sender}</div>
            <div>{msg.text}</div>
          </div>
        ))}
      </div>

      {sessionActive && (
        <div className="input-area">
          <textarea
            value={inputMessage}
            onChange={(e) =>
              setInputMessage(e.target.value)
            }
          />
          <button onClick={handleSendMessage}>
            Send
          </button>
          <button onClick={handleEndSimulation}>
            End Call
          </button>
        </div>
      )}
    </div>
  );
}

export default VoiceSimulationInterface;
