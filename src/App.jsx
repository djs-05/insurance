import React, { useState, useEffect, useRef } from "react";
import "./App.css";

function App() {
  const [input, setInput] = useState("");
  const [chats, setChats] = useState([{ id: 0, title: "New Chat", messages: [] }]);
  const [activeChatId, setActiveChatId] = useState(0);
  const [editingChatId, setEditingChatId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false); // ✅ New state

  const messagesEndRef = useRef(null);
  const activeChat = chats.find((chat) => chat.id === activeChatId);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && input.trim() && !isBotTyping) {
      e.preventDefault();

      const userMessage = { sender: "user", text: input };
      const botMessage = { sender: "bot", text: "" };
      const fullResponse =
        "My toaster clearly believes it's an avant-garde performance artist.";

      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === activeChatId
            ? { ...chat, messages: [...chat.messages, userMessage, botMessage] }
            : chat
        )
      );

      setInput("");
      setIsBotTyping(true);

      let index = 0;
      const typingSpeed = 12;

      const typeInterval = setInterval(() => {
        index++;
        if (index <= fullResponse.length) {
          const currentText = fullResponse.slice(0, index);
          setChats((prevChats) =>
            prevChats.map((chat) => {
              if (chat.id === activeChatId) {
                const updatedMessages = [...chat.messages];
                updatedMessages[updatedMessages.length - 1] = {
                  sender: "bot",
                  text: currentText,
                };
                return { ...chat, messages: updatedMessages };
              }
              return chat;
            })
          );
        } else {
          clearInterval(typeInterval);
          setIsBotTyping(false);
        }
      }, typingSpeed);
    }
  };

  const handleNewChat = () => {
    const titles = chats.map((chat) => chat.title);
    const baseName = "New Chat";
    let newTitle = baseName;
    let counter = 1;

    while (titles.includes(newTitle)) {
      newTitle = `${baseName} ${counter}`;
      counter++;
    }

    const newId = Date.now();
    const newChat = { id: newId, title: newTitle, messages: [] };

    setChats([...chats, newChat]);
    setActiveChatId(newId);
  };

  const handleSelectChat = (id) => setActiveChatId(id);
  const handleDeleteChat = (id) => {
    if (isBotTyping) return;

    setChats((prev) => prev.filter((chat) => chat.id !== id));
    if (id === activeChatId) {
      setTimeout(() => {
        const remaining = chats.filter((c) => c.id !== id);
        if (remaining.length) setActiveChatId(remaining[0].id);
      }, 0);
    }
  };

  const handleEditChatTitle = (id, title) => {
    setEditingChatId(id);
    setEditingTitle(title);
  };

  const handleTitleKeyDown = (e, id) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === id ? { ...chat, title: editingTitle.trim() || "Untitled" } : chat
        )
      );
      setEditingChatId(null);
    }
  };

  return (
    <div className="chat-app">
      <div className="chat-header">Simple Chat UI</div>

      <div className="chat-main">
        {/* Sidebar */}
        <div className="chat-history">
          <div className="chat-history-title">
            <span>Chat History</span>
            <button className="new-chat-btn" onClick={handleNewChat}>
              ＋ New Chat
            </button>
          </div>

          <div className="chat-list">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={`chat-item ${chat.id === activeChatId ? "active" : ""}`}
              >
                {editingChatId === chat.id ? (
                  <input
                    className="edit-chat-input"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onKeyDown={(e) => handleTitleKeyDown(e, chat.id)}
                    onBlur={() => setEditingChatId(null)}
                    autoFocus
                  />
                ) : (
                  <div
                    className="chat-item-title"
                    onClick={() => handleSelectChat(chat.id)}
                    onDoubleClick={() => handleEditChatTitle(chat.id, chat.title)}
                  >
                    {chat.title}
                  </div>
                )}

                <button
                  className="delete-chat-btn"
                  onClick={() => handleDeleteChat(chat.id)}
                  title="Delete chat"
                  disabled={isBotTyping}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* ✅ Info Button */}
          <button className="info-button" onClick={() => setIsInfoOpen(true)}>
            User Manual
          </button>
        </div>

        {/* Chat area */}
        <div className="chat-container">
          <div className="chat-messages">
            {activeChat?.messages.map((msg, index) => (
              <div
                key={index}
                className={`chat-message ${msg.sender === "user" ? "user" : "bot"} ${
                  index === activeChat.messages.length - 1 && msg.sender === "bot" && isBotTyping
                    ? "typing"
                    : ""
                }`}
              >
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-container">
            <textarea
              className="chat-input"
              placeholder={isBotTyping ? "Bot is typing..." : "Type a message..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={isBotTyping}
            />
          </div>
        </div>
      </div>

      {/* ✅ Info Box */}
      {isInfoOpen && (
        <div className="info-popup">
          <div className="info-header">
            <button className="close-info" onClick={() => setIsInfoOpen(false)}>
              ×
            </button>
          </div>
          <div className="info-content">
            <p>
              This website
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
