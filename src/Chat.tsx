import React, { useState, useEffect, useRef } from 'react';

interface ChatProps {
  username: string;
}

const Chat: React.FC<ChatProps> = ({ username }) => {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const ws = useRef<WebSocket | null>(null);

  

  const sendMessage = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN && input.trim()) {
      const message = `${username}: ${input}`;
      ws.current.send(message);
      setInput('');
    } else {
      console.error('WebSocket is not open or input is empty');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', position: 'fixed', right: 0, top: '64px', width: '300px', height: 'calc(100vh - 64px)', borderLeft: '1px solid black', padding: '10px', boxSizing: 'border-box' }}>
      <div style={{ flex: 1, overflowY: 'scroll', marginBottom: '10px' }}>
        {messages.map((msg, index) => (
          <div key={index}>{msg}</div>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            sendMessage();
          }
        }}
        placeholder="Type your message here..."
        style={{ marginBottom: '10px' }}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default Chat;