import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

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
          email = `${email} (Volunteer)`; // Append "Volunteer" to email if not in the list
        }
        setUserEmail(email); // Set the email
      }
    };

    fetchSession();

    // Listen for changes in the auth session
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          let email = session.user.email;
          if (!predefinedEmails.includes(email)) {
            email = `${email} (Volunteer)`; // Append "Volunteer" if email is not in the predefined list
          }
          setUserEmail(email); // Set email when session changes
        } else {
          setUserEmail(""); // Clear email when user logs out
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
        sender: userEmail || "Guest", // Use user email or Guest if not logged in
        role: "User", // Set the role based on your requirement
      },
    ]);

    if (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message: " + error.message);
    } else {
      setNewMessage(""); // Reset the message input after sending
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
      supabase.removeChannel(subscription); // Clean up the channel subscription
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
            <div
              key={index}
              style={{
                textAlign: msg.sender === userEmail ? "right" : "left",
                marginBottom: "10px",
              }}
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
      <input
        type="text"
        placeholder="Type a message..."
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        style={{ width: "80%", padding: "5px", marginTop: "10px" }}
      />
      <button
        onClick={sendMessage}
        style={{ padding: "5px 10px", marginLeft: "5px" }}
      >
        Send
      </button>
    </div>
  );
}

export default ChatApp;