import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import "../styles/ChatApp.css"; // Import the CSS file

// Supabase Setup
const SUPABASE_URL = "https://ueswvkitrkkkmemrxpir.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlc3d2a2l0cmtra21lbXJ4cGlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2NzI3NDEsImV4cCI6MjA1NjI0ODc0MX0.21_qSMwhFGgXx4k6VnI5BUkSsD1eFKzQmAAzR9pHrX4";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function ChatApp() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [userEmail, setUserEmail] = useState(""); // State to hold the user's email

  // Array of predefined emails
  const predefinedEmails = [
    "headcare@example.com",
    "boardmember@example.com",
    "handler@example.com",
    "ceo@example.com",
    "reptile-caregiver@example.com",
    "dog-caregiver@example.com",
    "cat-caregiver@example.com",
  ];

  // Get user info from session
  useEffect(() => {
    const fetchSession = async () => {
      // Get session from Supabase auth
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Check if email is in the predefined list, else add "Volunteer" label
        let email = session.user.email;
        if (!predefinedEmails.includes(email)) {
          // Append "Volunteer" to email if not in the list
          email = `${email} (Volunteer)`; 
        }
        setUserEmail(email); 
      }
    };

    fetchSession();

    // Listen for changes in the auth session
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          let email = session.user.email;
          if (!predefinedEmails.includes(email)) {
            // Append "Volunteer" if email is not in the predefined list
            email = `${email} (Volunteer)`; 
          }
          // Set email when session changes
          setUserEmail(email); 
        } else {
          // Clear email when user logs out
          setUserEmail(""); 
        }
      }
    );

    // Automatically clean up when the component unmounts
    return () => {
      // No need to manually unsubscribe, Supabase will handle this
    };
  }, []);

  // Fetch Messages from Supabase
  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
    } else {
      setMessages(data);
    }
  };

  // Send a New Message
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const { error } = await supabase.from("messages").insert([
      {
        text: newMessage,
        sender: userEmail || "Guest", 
        role: "User", 
      },
    ]);

    if (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message: " + error.message);
    } else {
      setNewMessage(""); 
      fetchMessages(); 
    }
  };

  // Listen for New Messages in Real-time
  useEffect(() => {
    fetchMessages();

    const subscription = supabase
      .channel("messages")
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, fetchMessages)
      .subscribe();

    return () => {
      supabase.removeChannel(subscription); // Clean up the channel subscription
    };
  }, []);

  return (
    <div className="chat-app">
      <h2>Organization Chat</h2>

      {/* Message Display */}
      <div className="chat-messages">
        {messages.length > 0 ? (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`chat-message ${msg.sender === userEmail ? "chat-message-right" : "chat-message-left"}`}
            >
              <strong>{msg.sender}:</strong>
              <p>{msg.text}</p>
            </div>
          ))
        ) : (
          <p>No messages yet.</p>
        )}
      </div>

      {/* Message Input */}
      <div className="chat-input">
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default ChatApp;