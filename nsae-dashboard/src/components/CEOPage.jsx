import React, { useState, useEffect } from "react";
import supabase from "../utils/supabaseClient";
import "../styles/CeoPage.css";
import ChatApp from "./ChatApp";

function CEOPage() {
  const [meetingDetails, setMeetingDetails] = useState({
    id: null,
    time: "",
    place: "",
    topic: "",
    emails: [],
  });
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showPreviousMeetings, setShowPreviousMeetings] = useState(false); // Track if previous meetings are shown
  const [userEmails, setUserEmails] = useState([]); // List of user emails
  const [selectedEmails, setSelectedEmails] = useState([]); // Track selected emails
  const [meetingsList, setMeetingsList] = useState([]); // List of meetings to select from
  const [showChat, setShowChat] = useState(false);

  const predefinedEmails = [
    "ceo@example.com",
    "handler@example.com",
    "volunteer@example.com",
    "boardmember@example.com",
    "reptile-caregiver@example.com",
    "hr@example.com",
    "dog-caregiver@example.com",
    "cat-caregiver@example.com",
    "caregivers@example.com",
    "headcare@example.com",
    "bird-caregiver@nsae.com",
    "wildlife-caregiver@nsae.com",
    "mamal-caregiver@nase.com",
    "other-caregiver@nase.com"
  ];

  // Fetch user emails from Supabase authentication user table
  const fetchUserEmails = async () => {
    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error("Error fetching user emails:", error);
      setMessage("❌ Failed to fetch user emails.");
    } else {
      setUserEmails(data.users.map((user) => user.email));
    }
  };

  // Fetch existing meetings on page load
  const fetchMeetings = async () => {
    const { data, error } = await supabase
      .from("meetings")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching meetings:", error);
      setMessage("❌ Failed to fetch meetings.");
    } else {
      setMeetingsList(data);
    }
  };

  useEffect(() => {
    fetchMeetings(); // Fetch meetings when the component is mounted
    fetchUserEmails(); // Fetch user emails when the component is mounted
  }, []);

  // Toggle email selection
  const toggleEmailSelection = (email) => {
    setSelectedEmails((prevSelectedEmails) =>
      prevSelectedEmails.includes(email)
        ? prevSelectedEmails.filter((selectedEmail) => selectedEmail !== email) // Deselect
        : [...prevSelectedEmails, email] // Select
    );
  };

  // Select all emails except predefined ones
  const selectAllEmails = () => {
    const volunteerEmails = userEmails.filter(email => 
      !predefinedEmails.includes(email) && !email.includes("caregiver")
    );
    setSelectedEmails(volunteerEmails);
  };

  // Function to handle meeting submit
  const handleMeetingSubmit = async () => {
    const { time, place, topic } = meetingDetails;

    if (!time || !place || !topic || selectedEmails.length === 0) {
      setMessage("❌ Please provide all fields (Time, Place, Topic, and Emails).");
      return;
    }

    if (meetingDetails.id) {
      // Update existing meeting
      const { error } = await supabase
        .from("meetings")
        .update({ time, place, topic, emails: selectedEmails })
        .eq("id", meetingDetails.id);

      if (error) {
        console.error("Error updating meeting:", error);
        setMessage("❌ Failed to update meeting.");
      } else {
        setMessage("✅ Meeting updated successfully!");
        resetForm();
        fetchMeetings(); // Refresh meetings list after update
      }
    } else {
      // Create new meeting
      const { error } = await supabase
        .from("meetings")
        .insert([{ time, place, topic, emails: selectedEmails, created_at: new Date().toISOString() }]);

      if (error) {
        console.error("Error saving meeting:", error);
        setMessage("❌ Failed to save meeting.");
      } else {
        setMessage("✅ Meeting created successfully!");
        resetForm();
        fetchMeetings(); // Refresh meetings list after creation
      }
    }
  };

  // Function to reset the form
  const resetForm = () => {
    setMeetingDetails({ id: null, time: "", place: "", topic: "", emails: [] });
    setSelectedEmails([]); // Reset selected emails
    setShowForm(false);
    setTimeout(() => setMessage(""), 3000);
  };

  // Function to delete a meeting
  const handleDeleteMeeting = async (id) => {
    const { error } = await supabase.from("meetings").delete().eq("id", id);

    if (error) {
      console.error("Error deleting meeting:", error);
      setMessage("❌ Failed to delete meeting.");
    } else {
      setMessage("✅ Meeting deleted successfully!");
      setMeetingsList(meetingsList.filter((meeting) => meeting.id !== id)); // Remove deleted meeting
    }

    setTimeout(() => setMessage(""), 3000); // Clear message after 3 seconds
  };

  return (
    <div className="ceo-page">
      <h2 className="ceo-header">CEO Dashboard</h2>
    
        <button className="chat-toggle-button" onClick={() => setShowChat(prev => !prev)}>
          {showChat ? "Close Chat" : "Organization Chat"}
        </button>

        {/* Chat Window */}
        {showChat && (
          <div className="chat-container">
            <ChatApp />
          </div>
        )}
      {/* Create/Update Meeting Button */}
      <button className="create-meeting-btn" onClick={() => setShowForm(!showForm)}>
        {showForm ? "Cancel" : "Create Meeting"}
      </button>

      {/* Form for creating or editing meetings */}
      {showForm && (
        <div className="meeting-form">
          <input
            type="text"
            placeholder="Time of Meeting"
            value={meetingDetails.time}
            onChange={(e) =>
              setMeetingDetails({ ...meetingDetails, time: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Place of Meeting"
            value={meetingDetails.place}
            onChange={(e) =>
              setMeetingDetails({ ...meetingDetails, place: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Topic of Meeting"
            value={meetingDetails.topic}
            onChange={(e) =>
              setMeetingDetails({ ...meetingDetails, topic: e.target.value })
            }
          />

          {/* Display user emails as clickable options */}
          <div className="email-selection">
            <h3>Select Emails</h3>
            <button onClick={selectAllEmails} className="select-all-btn">Select All Volunteers</button>
            <ul>
              {userEmails.map((email) => (
                <li
                  key={email}
                  onClick={() => toggleEmailSelection(email)}
                  className={selectedEmails.includes(email) ? "selected" : ""}
                  style={{ cursor: "pointer", padding: "5px", marginBottom: "5px" }}
                >
                  {email}
                </li>
              ))}
            </ul>
          </div>

          {/* Display selected emails */}
          <div className="selected-emails">
            <h4>Selected Emails:</h4>
            <ul>
              {selectedEmails.map((email, index) => (
                <li key={index}>{email}</li>
              ))}
            </ul>
          </div>

          {/* Submit meeting details */}
          <button className="submit-meeting-btn" onClick={handleMeetingSubmit}>
            {meetingDetails.id ? "Update Meeting" : "Save Meeting Details"}
          </button>
        </div>
      )}

      {/* View/Edit Previous Meetings Button */}
      <button
        className="view-edit-meeting-btn"
        onClick={() => setShowPreviousMeetings(!showPreviousMeetings)}
      >
        {showPreviousMeetings ? "Hide Previous Meetings" : "View/Edit Previous Meeting"}
      </button>

      {/* List of Previous Meetings */}
      {showPreviousMeetings && (
        <div className="meeting-list">
          <h3>Existing Meetings</h3>
          {meetingsList.length > 0 ? (
            <ul>
              {meetingsList.map((meeting) => (
                <li key={meeting.id}>
                  <span>{meeting.time} - {meeting.place} - {meeting.topic}</span>
                  <button onClick={() => handleDeleteMeeting(meeting.id)}>Delete</button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No meetings found.</p>
          )}
        </div>
      )}

      {/* Message display */}
      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default CEOPage;