import React, { useState } from "react";
import "./App.css";

function App() {
  const [input, setInput] = useState("");
  const [stack, setStack] = useState([]);
  const [messages, setMessages] = useState([]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && input.trim()) {
      e.preventDefault();

      // Push input to stack
      setStack((prevStack) => [...prevStack, input]);

      // Add user message and bot response
      setMessages((prev) => [
        ...prev,
        { sender: "user", text: input },
        { sender: "bot", text: "Hello, World!" },
      ]);

      setInput("");
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">Simple Chat UI</div>

      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat-message ${
              msg.sender === "user" ? "user" : "bot"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div className="chat-input-container">
        <textarea
          className="chat-input"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
        />
      </div>
    </div>
  );
}

export default App;
