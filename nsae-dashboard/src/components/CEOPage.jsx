import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../utils/supabaseClient";
import "../styles/CEOPage.css";  // Make sure to import the CSS file

function CEOPage() {
  const [meetingDetails, setMeetingDetails] = useState({
    time: "",
    place: "",
    topic: "",
  });
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);  // State to toggle form visibility
  const navigate = useNavigate();

  // Function to handle meeting submission
  const handleMeetingSubmit = async () => {
    const { time, place, topic } = meetingDetails;

    // Ensure that all fields are filled in
    if (!time || !place || !topic) {
      setMessage("Please provide all fields (time, place, and topic) for the meeting.");
      return;
    }

    // Insert the meeting details into the database
    const { error } = await supabase
      .from("meetings")
      .upsert([{ time, place, topic }]); // Use upsert to add or update the meeting

    if (error) {
      setMessage("Failed to save meeting details: " + error.message);
    } else {
      setMessage("Meeting details saved successfully!");
      setShowForm(false);  // Hide the form after successful submission
    }
  };

  return (
    <div className="ceo-page">
      <h2 className="ceo-header">CEO Dashboard</h2>

      <div className="meeting-section">
        <button
          className="create-meeting-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "Create Meeting"}
        </button>

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
            <button className="submit-meeting-btn" onClick={handleMeetingSubmit}>
              Save Meeting Details
            </button>
            {message && <p className="message">{message}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

export default CEOPage;
