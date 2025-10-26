import React, { useState } from "react";
import "./App.css";
import Chat from "./components/Chat";
import UserForm from "./components/UserForm";
import { getPlans, sendChatMessage } from "./api";

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isBotTyping, setIsBotTyping] = useState(false);

  const [currentPlanIds, setCurrentPlanIds] = useState([]);
  const [showForm, setShowForm] = useState(true);
  const [trimmedCount, setTrimmedCount] = useState(null);

  const handleFormSubmit = async (formData) => {
    setShowForm(false);

    // Fetch plans with county ID
    const fetchedPlans = await getPlans(formData.countyId);
    console.log("Fetched plans:", fetchedPlans);
    setCurrentPlanIds(fetchedPlans);

    // Send initial message to the bot with user info and plan IDs
    const initialMessage = `I am ${formData.age} years old, ${
      formData.sex
    }, and live in county ${
      formData.countyId
    }. Current plan ids: ${JSON.stringify(fetchedPlans)}`;
    await sendUserMessage(initialMessage, fetchedPlans);
  };

  const sendUserMessage = async (userText, planIdsToSend = null) => {
    setIsBotTyping(true);

    try {
      // Use the most recent plan IDs from the last bot response, or the provided ones
      const plansToSend = planIdsToSend !== null ? planIdsToSend : currentPlanIds;

      const response = await sendChatMessage(userText, plansToSend);

      // Parse the JSON response
      let botText = response;
      let newPlanIds = currentPlanIds;

      try {
        // Extract JSON from between first { and last }
        let jsonString = response;
        const firstBrace = response.indexOf('{');
        const lastBrace = response.lastIndexOf('}');

        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          jsonString = response.substring(firstBrace, lastBrace + 1);
          console.log("Extracted JSON:", jsonString);
        }

        const parsedResponse = JSON.parse(jsonString);
        botText = parsedResponse.text || response;
        if (parsedResponse.planIds && Array.isArray(parsedResponse.planIds)) {
          newPlanIds = parsedResponse.planIds;
          const previousCount = plansToSend.length;
          const newCount = newPlanIds.length;
          const trimmed = previousCount - newCount;

          if (trimmed > 0) {
            setTrimmedCount(trimmed);
            // Clear the notification after 3 seconds
            setTimeout(() => setTrimmedCount(null), 3000);
          }

          setCurrentPlanIds(newPlanIds);
          console.log("Updated current plan IDs:", newPlanIds);
          console.log(`Trimmed ${trimmed} plans (${previousCount} → ${newCount})`);
        }
      } catch (parseError) {
        console.log("Response is not JSON, using as plain text", parseError);
      }

      // Add both user message and bot response to state
      const userMessage = { sender: "user", text: userText };
      const botMessage = { sender: "bot", text: botText };
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
            plansCount={currentPlanIds.length}
          />
        )}
        {trimmedCount !== null && (
          <div className="trim-notification">
            Narrowed down by {trimmedCount} plan{trimmedCount !== 1 ? 's' : ''}!
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
