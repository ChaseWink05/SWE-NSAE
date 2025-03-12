import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Supabase Setup
const SUPABASE_URL = "https://ueswvkitrkkkmemrxpir.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlc3d2a2l0cmtra21lbXJ4cGlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2NzI3NDEsImV4cCI6MjA1NjI0ODc0MX0.21_qSMwhFGgXx4k6VnI5BUkSsD1eFKzQmAAzR9pHrX4";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function ChatApp({ isCaregiver }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // Get user info from localStorage
  const userEmail = localStorage.getItem("user_email");
  const userRole = localStorage.getItem("user_role");

  // Determine sender info based on user role
  const sender = isCaregiver ? "Caregiver" : userEmail || "Guest";
  const role = isCaregiver ? "Admin" : userRole || "Guest";

  // Fetch Messages from Supabase
  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) console.error("Error fetching messages:", error);
    else setMessages(data);
  };

  // Send a New Message
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const { error } = await supabase.from("messages").insert([
      { text: newMessage, sender: sender, role: role },
    ]);

    if (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message: " + error.message);
    } else {
      setNewMessage("");
      fetchMessages(); // Refresh messages
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
      supabase.removeChannel(subscription);
    };
  }, []);

  return (
    <div style={{ maxWidth: "600px", margin: "20px auto", textAlign: "center" }}>
      <h2>Organization Chat</h2>

      {/* Message Display */}
      <div
        style={{
          border: "1px solid #ccc",
          height: "300px",
          overflowY: "auto",
          padding: "10px",
          background: "#f9f9f9",
        }}
      >
        {messages.length > 0 ? (
          messages.map((msg, index) => (
            <div key={index} style={{ textAlign: sender === msg.sender ? "right" : "left", marginBottom: "10px" }}>
              <strong>{msg.sender} ({msg.role}):</strong>
              <p>{msg.text}</p>
            </div>
          ))
        ) : (
          <p>No messages yet.</p>
        )}
      </div>

      {/* Message Input */}
      <input
        type="text"
        placeholder="Type a message..."
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        style={{ width: "80%", padding: "5px", marginTop: "10px" }}
      />
      <button onClick={sendMessage} style={{ padding: "5px 10px", marginLeft: "5px" }}>
        Send
      </button>
    </div>
  );
}

export default ChatApp;
