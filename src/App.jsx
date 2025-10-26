import React, { useState } from "react";
import "./App.css";
import Chat from "./components/Chat";
import UserForm from "./components/UserForm";
import { getPlans, sendChatMessage } from "./api";

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isBotTyping, setIsBotTyping] = useState(false);

  const [plans, setPlans] = useState([]);
  const [showForm, setShowForm] = useState(true);

  const handleFormSubmit = async (formData) => {
    setShowForm(false);

    // Fetch plans with county ID
    const fetchedPlans = await getPlans(formData.countyId);
    console.log("Fetched plans:", fetchedPlans);
    setPlans(fetchedPlans);

    // Send initial message to the bot with user info and plan IDs
    const initialMessage = `I am ${formData.age} years old, ${
      formData.sex
    }, and live in county ${
      formData.countyId
    }. Current plan ids: ${JSON.stringify(fetchedPlans)}`;
    await sendUserMessage(initialMessage);
  };

  const sendUserMessage = async (userText) => {
    setIsBotTyping(true);

    try {
      // Convert CURRENT messages to API format (before adding the new user message)
      const history = messages.map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text,
      }));

      const response = await sendChatMessage(history, userText);

      // Add both user message and bot response to state
      const userMessage = { sender: "user", text: userText };
      const botMessage = { sender: "bot", text: response };
      setMessages((prevMessages) => [...prevMessages, userMessage, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const userMessage = { sender: "user", text: userText };
      const errorMessage = {
        sender: "bot",
        text: "Sorry, I encountered an error. Please try again.",
      };
      setMessages((prevMessages) => [
        ...prevMessages,
        userMessage,
        errorMessage,
      ]);
    } finally {
      setIsBotTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && input.trim() && !isBotTyping) {
      e.preventDefault();
      const userText = input;
      setInput("");
      sendUserMessage(userText);
    }
  };

  return (
    <div className="chat-app">
      <div className="chat-main">
        {showForm ? (
          <UserForm onSubmit={handleFormSubmit} />
        ) : (
          <Chat
            messages={messages}
            isBotTyping={isBotTyping}
            input={input}
            setInput={setInput}
            handleKeyDown={handleKeyDown}
            plansCount={plans.length}
          />
        )}
      </div>
    </div>
  );
}

export default App;
