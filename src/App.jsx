import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import Chat from "./components/Chat";
import UserForm from "./components/UserForm";
import { getPlans } from "./api";

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isBotTyping, setIsBotTyping] = useState(false);

  const [plans, setPlans] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [showForm, setShowForm] = useState(true);

  const handleFormSubmit = async (formData) => {
    setUserInfo(formData);
    setShowForm(false);

    // Fetch plans with county ID
    const fetchedPlans = await getPlans(formData.countyId);
    console.log("Fetched plans:", fetchedPlans);
    setPlans(fetchedPlans);

    // Send initial greeting
    sendBotMessage(`Hello! I'm here to help you find the best insurance plans for your needs.`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && input.trim() && !isBotTyping) {
      e.preventDefault();

      const userMessage = { sender: "user", text: input };
      const botMessage = { sender: "bot", text: "" };
      const fullResponse = `| Light  |        |            |        |         |          | Dark    |
| ------ | ------ | ---------- | ------ | ------- | -------- | ------- |
| Lydian | Ionian | Mixolydian | Dorian | Aeolian | Phrygian | Locrian |\n
**bold text**\n
link: [OSU](https://www.osu.edu)\n
- Item 1\n
\t- Item 2\n
\t- Item 3\n
`;

      setMessages((prevMessages) => [...prevMessages, userMessage, botMessage]);

      setInput("");
      setIsBotTyping(true);

      let index = 0;
      const typingSpeed = 12;

      const typeInterval = setInterval(() => {
        index++;
        if (index <= fullResponse.length) {
          const currentText = fullResponse.slice(0, index);
          setMessages((prevMessages) => {
            const updatedMessages = [...prevMessages];
            updatedMessages[updatedMessages.length - 1] = {
              sender: "bot",
              text: currentText,
            };
            return updatedMessages;
          });
        } else {
          clearInterval(typeInterval);
          setIsBotTyping(false);
        }
      }, typingSpeed);
    }
  };

  function sendBotMessage(inputMessage) {
    const botMessage = { sender: "bot", text: inputMessage };
    setMessages((prevMessages) => [...prevMessages, botMessage]);
  }

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
