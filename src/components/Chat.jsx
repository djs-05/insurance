import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './Chat.css';

function Chat({ messages, isBotTyping, input, setInput, handleKeyDown, plansCount }) {
  const messagesEndRef = React.useRef(null);
  const [displayedText, setDisplayedText] = React.useState('');
  const [isAnimating, setIsAnimating] = React.useState(false);

  const lastBotMessage = React.useMemo(() => {
    return [...messages].reverse().find((msg) => msg.sender === 'bot');
  }, [messages]);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  React.useEffect(() => {
    if (!lastBotMessage) {
      setDisplayedText('');
      return;
    }

    const fullText = lastBotMessage.text;
    setDisplayedText('');
    setIsAnimating(true);

    let currentIndex = 0;
    const intervalSpeed = 15; // milliseconds per character

    const interval = setInterval(() => {
      if (currentIndex < fullText.length) {
        setDisplayedText(fullText.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsAnimating(false);
        clearInterval(interval);
      }
    }, intervalSpeed);

    return () => clearInterval(interval);
  }, [lastBotMessage]);

  return (
    <div className="chat-container">
      <div className="plans-counter">Plans left: {plansCount}</div>

      {lastBotMessage ? (
        <div className={`chat-message bot ${isAnimating ? 'typing' : ''}`}>
          <div className="message-invisible">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {lastBotMessage.text}
            </ReactMarkdown>
          </div>
          <div className="message-visible">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {displayedText}
            </ReactMarkdown>
          </div>
        </div>
      ) : (
        <div className="chat-placeholder">No bot messages yet.</div>
      )}
      <div ref={messagesEndRef} />

      <textarea
        className="chat-input"
        placeholder={isBotTyping ? 'Bot is typing...' : 'Type a message...'}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
        disabled={isBotTyping}
      />
    </div>
  );
}

export default Chat;
