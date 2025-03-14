import React, { useState } from "react";
import MeetingDetails from "./MeetingDetails";
import ChatApp from "./ChatApp";
import "../styles/BoardMembers.css";

function BoardMembers() {
  const [showChat, setShowChat] = useState(false);

  return (
    <div className="board-members-page">
      <h1>Board Members Page</h1>
      <p>Welcome, Board Members! Here you can view reports and manage the organization.</p>

      <div className="meeting-details-section">
        <h2>Meeting Details</h2>
        <MeetingDetails />
      </div>

      <div className="chat-section">
        <h2>Chat</h2>
        <button 
          className="chat-toggle-button" 
          onClick={() => setShowChat(prev => !prev)}
        >
          {showChat ? "Close Chat" : "Organization Chat"}
        </button>
        {showChat && (
          <div className="chat-container">
            <ChatApp />
          </div>
        )}
      </div>
    </div>
  );
}

export default BoardMembers;