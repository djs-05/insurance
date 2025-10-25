import React, { useState, useEffect, useRef } from "react";
import "./App.css";

function App() {
  const [input, setInput] = useState("");
  const [chats, setChats] = useState([{ id: 0, title: "New Chat", messages: [] }]);
  const [activeChatId, setActiveChatId] = useState(0);
  const [editingChatId, setEditingChatId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  // Popup position & size state
  const [popupPos, setPopupPos] = useState({ left: 0, top: 0 });
  const [popupSize, setPopupSize] = useState({ width: 360, height: 220 });

  const popupRef = useRef(null);
  const draggingRef = useRef({ active: false, offsetX: 0, offsetY: 0 });
  const resizingRef = useRef({ active: false, startX: 0, startY: 0, startW: 0, startH: 0 });

  const messagesEndRef = useRef(null);
  const activeChat = chats.find((chat) => chat.id === activeChatId);

  // center the popup when it opens
  useEffect(() => {
    if (isInfoOpen) {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const width = popupSize.width;
      const height = popupSize.height;
      setPopupPos({
        left: Math.max(20, Math.round((w - width) / 2)),
        top: Math.max(20, Math.round((h - height) / 2)),
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInfoOpen]); // run when opening

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages]);

  // Global mousemove/mouseup handlers for dragging & resizing
  useEffect(() => {
    function onMouseMove(e) {
      // dragging
      if (draggingRef.current.active) {
        const left = e.clientX - draggingRef.current.offsetX;
        const top = e.clientY - draggingRef.current.offsetY;
        // optional bounds (keep popup within viewport)
        const maxLeft = window.innerWidth - 40;
        const maxTop = window.innerHeight - 40;
        setPopupPos({
          left: Math.min(Math.max(0, left), Math.max(0, maxLeft)),
          top: Math.min(Math.max(0, top), Math.max(0, maxTop)),
        });
      }

      // resizing
      if (resizingRef.current.active) {
        const dx = e.clientX - resizingRef.current.startX;
        const dy = e.clientY - resizingRef.current.startY;
        const newW = Math.max(220, Math.round(resizingRef.current.startW + dx));
        const newH = Math.max(120, Math.round(resizingRef.current.startH + dy));
        const maxW = Math.round(window.innerWidth * 0.9);
        const maxH = Math.round(window.innerHeight * 0.8);
        setPopupSize({
          width: Math.min(newW, maxW),
          height: Math.min(newH, maxH),
        });
      }
    }

    function onMouseUp() {
      if (draggingRef.current.active) {
        draggingRef.current.active = false;
        document.body.style.userSelect = "";
      }
      if (resizingRef.current.active) {
        resizingRef.current.active = false;
        document.body.style.userSelect = "";
      }
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  const handleHeaderMouseDown = (e) => {
    // start dragging only when left mouse button
    if (e.button !== 0) return;
    const rect = popupRef.current.getBoundingClientRect();
    draggingRef.current = {
      active: true,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    };
    document.body.style.userSelect = "none";
  };

  const handleResizeMouseDown = (e) => {
    if (e.button !== 0) return;
    resizingRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      startW: popupSize.width,
      startH: popupSize.height,
    };
    document.body.style.userSelect = "none";
    e.stopPropagation();
  };

  // Chat input enter handling & bot typing simulation (kept unchanged)
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

          {/* Info Button */}
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

      {/* Draggable + Resizable Info Box (Overlay) */}
      {isInfoOpen && (
        <div className="info-popup-overlay" onMouseDown={(e) => e.stopPropagation()}>
          <div
            ref={popupRef}
            className="info-popup"
            style={{
              left: popupPos.left,
              top: popupPos.top,
              width: popupSize.width,
              height: popupSize.height,
            }}
          >
            <div className="info-header" onMouseDown={handleHeaderMouseDown}>
              <h3 style={{ margin: 0 }}>User Manual</h3>
              <button
                className="close-info"
                onClick={() => setIsInfoOpen(false)}
                title="Close"
              >
                ×
              </button>
            </div>

            <div className="info-content" style={{ overflow: "auto", height: "calc(100% - 56px)" }}>
              <p>Hello World</p>
            </div>

            {/* Resize handle */}
            <div
              className="resize-handle"
              onMouseDown={handleResizeMouseDown}
              role="button"
              aria-label="Resize"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
