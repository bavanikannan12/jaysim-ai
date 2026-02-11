import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

function SimulationInterface({
  scenario,
  sessionLength,
  sessionId,
  initialGreeting,
  onEnd,
}) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionActive, setSessionActive] = useState(true);
  const chatWindowRef = useRef(null);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    // Show the AI's greeting when component loads
    if (initialGreeting) {
      setMessages([
        {
          sender: scenario.context.clientName,
          text: initialGreeting,
          type: "client",
        },
      ]);
    }
  }, [initialGreeting, scenario.context.clientName]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage = inputMessage;
    setInputMessage("");

    // Add user message to chat
    setMessages((prev) => [
      ...prev,
      {
        sender: "You",
        text: userMessage,
        type: "user",
      },
    ]);

    setLoading(true);

    try {
      const response = await axios.post("/api/simulation/message", {
        sessionId: sessionId,
        message: userMessage,
      });

      // Add client response
      setMessages((prev) => [
        ...prev,
        {
          sender: scenario.context.clientName,
          text: response.data.message,
          type: "client",
        },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          sender: "System",
          text: "Error: Failed to get response. Please try again.",
          type: "client",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEndSimulation = () => {
    setSessionActive(false);
    onEnd();
  };

  return (
    <div className="simulation-container">
      <div className="simulation-header">
        <h2>{scenario.title}</h2>
        <div className="client-info">
          Client: {scenario.context.clientName} | Session: {sessionLength} mins
        </div>
      </div>

      <div className="chat-window" ref={chatWindowRef}>
        {messages.length === 0 && (
          <div className="message client">
            <div className="sender">{scenario.context.clientName}</div>
            <div>Loading...</div>
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
            <div>Typing...</div>
          </div>
        )}
      </div>

      {sessionActive && (
        <>
          <div className="input-area">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your response... (Press Enter to send, Shift+Enter for new line)"
              disabled={loading}
            />
            <button
              onClick={handleSendMessage}
              disabled={loading || !inputMessage.trim()}
            >
              Send
            </button>
          </div>

          <div className="simulation-controls">
            <button className="btn btn-secondary" onClick={handleEndSimulation}>
              End Session & Get Feedback
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default SimulationInterface;
