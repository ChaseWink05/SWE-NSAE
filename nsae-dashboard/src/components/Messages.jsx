import React, { useState } from "react";

function Messages() {
  const [messages, setMessages] = useState([]);

  const sendMessage = (msg) => {
    setMessages([...messages, msg]);
  };

  return (
    <div>
      <h2>Messages</h2>
      <input type="text" placeholder="Write a message..." onKeyDown={(e) => {
        if (e.key === "Enter") sendMessage(e.target.value);
      }} />
      <ul>
        {messages.map((msg, index) => <li key={index}>{msg}</li>)}
      </ul>
    </div>
  );
}

export default Messages;
