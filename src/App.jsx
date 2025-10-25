import React, { useState, useEffect, useRef } from "react";
import "./App.css";

function App() {
  const [input, setInput] = useState("");
  const [chats, setChats] = useState([{ id: 0, title: "New Chat", messages: [] }]);
  const [activeChatId, setActiveChatId] = useState(1);
  const [editingChatId, setEditingChatId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");

  const messagesEndRef = useRef(null);
  const activeChat = chats.find((chat) => chat.id === activeChatId);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && input.trim()) {
      e.preventDefault();

      const newMessages = [
        ...activeChat.messages,
        { sender: "user", text: input },
        { sender: "bot", text: "Hello, World!" },
      ];

      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === activeChatId ? { ...chat, messages: newMessages } : chat
        )
      );

      setInput("");
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages]);

  const handleNewChat = () => {
    // Collect all existing chat titles
    const titles = chats.map((chat) => chat.title);

    // Base name
    const baseName = "New Chat";
    let newTitle = baseName;
    let counter = 1;

    // Keep incrementing until a unique title is found
    while (titles.includes(newTitle)) {
      newTitle = `${baseName} ${counter}`;
      counter++;
    }

    // Create new chat
    const newId = Date.now();
    const newChat = { id: newId, title: newTitle, messages: [] };

    setChats([...chats, newChat]);
    setActiveChatId(newId);
  };


  const handleSelectChat = (id) => {
    setActiveChatId(id);
  };

  const handleDeleteChat = (id) => {
    setChats((prev) => prev.filter((chat) => chat.id !== id));
    // if deleting active chat, switch to the first available one
    if (id === activeChatId && chats.length > 1) {
      const nextChat = chats.find((c) => c.id !== id);
      setActiveChatId(nextChat.id);
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
                className={`chat-item ${
                  chat.id === activeChatId ? "active" : ""
                }`}
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
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className="chat-container">
          <div className="chat-messages">
            {activeChat?.messages.map((msg, index) => (
              <div
                key={index}
                className={`chat-message ${
                  msg.sender === "user" ? "user" : "bot"
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
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
