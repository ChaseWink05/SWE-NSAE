import React, { useState } from "react";

// Messages component
function Messages() {
  // State to store messages
  const [messages, setMessages] = useState([]);

  // Function to send a message
  const sendMessage = (msg) => {
    setMessages([...messages, msg]);
  };

  return (
    <div>
      <h2>Messages</h2>
      {/* Input field to write a message */}
      <input 
        type="text" 
        placeholder="Write a message..." 
        onKeyDown={(e) => {
          if (e.key === "Enter") sendMessage(e.target.value);
        }} 
      />
      {/* List to display messages */}
      <ul>
        {messages.map((msg, index) => <li key={index}>{msg}</li>)}
      </ul>
    </div>
  );
}

export default Messages;