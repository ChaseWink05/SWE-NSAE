import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../utils/supabaseClient";
import "../styles/CEOPage.css";

function CEOPage() {
  const [meetingDetails, setMeetingDetails] = useState({
    id: null, // To store the meeting ID for editing
    time: "",
    place: "",
    topic: "",
  });
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showPreviousMeetings, setShowPreviousMeetings] = useState(false); // Track if previous meetings are shown
  const [meetingsList, setMeetingsList] = useState([]); // List of meetings to select from
  const navigate = useNavigate();

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
  }, []);

  const handleMeetingSubmit = async () => {
    const { time, place, topic, id } = meetingDetails;

    if (!time || !place || !topic) {
      setMessage("❌ Please provide all fields (Time, Place, and Topic).");
      return;
    }

    if (id) {
      // If there's an id, update the existing meeting
      const { error } = await supabase
        .from("meetings")
        .update({ time, place, topic })
        .eq("id", id);

      if (error) {
        console.error("Supabase error:", error);
        setMessage("❌ Failed to update meeting: " + (error.message || "Unknown error"));
      } else {
        setMessage("✅ Meeting updated successfully!");
        resetForm();
        fetchMeetings(); // Refresh meetings list after update
      }
    } else {
      // If there's no id, create a new meeting
      const { error } = await supabase
        .from("meetings")
        .insert([{ time, place, topic, created_at: new Date().toISOString() }]);

      if (error) {
        console.error("Supabase error:", error);
        setMessage("❌ Failed to save meeting: " + (error.message || "Unknown error"));
      } else {
        setMessage("✅ Meeting created successfully!");
        resetForm();
        fetchMeetings(); // Refresh meetings list after creation
      }
    }
  };

  // Function to reset the form
  const resetForm = () => {
    setMeetingDetails({ id: null, time: "", place: "", topic: "" });
    setShowForm(false);
    setTimeout(() => setMessage(""), 3000);
  };

  // Function to handle editing a meeting
  const handleEditMeeting = (meeting) => {
    setMeetingDetails({
      id: meeting.id,
      time: meeting.time,
      place: meeting.place,
      topic: meeting.topic,
    });
    setShowForm(true); // Show form for editing
  };

  // Function to delete a meeting
  const handleDeleteMeeting = async (id) => {
    const { error } = await supabase.from("meetings").delete().eq("id", id);

    if (error) {
      console.error("Error deleting meeting:", error);
      setMessage("❌ Failed to delete meeting.");
    } else {
      setMessage("✅ Meeting deleted successfully!");
      // Remove the deleted meeting from the list
      setMeetingsList(meetingsList.filter((meeting) => meeting.id !== id));
    }

    setTimeout(() => setMessage(""), 3000); // Clear the message after 3 seconds
  };

  return (
    <div className="ceo-page">
      <h2 className="ceo-header">CEO Dashboard</h2>

      {/* Combined Section for Create Meeting and View/Edit Previous Meeting */}
      <div className="meeting-section">
        {/* Create Meeting Button */}
        <button
          className="create-meeting-btn"
          onClick={() => setShowForm(!showForm)}
        >
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
            <button className="submit-meeting-btn" onClick={handleMeetingSubmit}>
              {meetingDetails.id ? "Update Meeting" : "Save Meeting Details"}
            </button>
          </div>
        )}

        {/* View/Edit Previous Meeting Button */}
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
                    <button onClick={() => handleEditMeeting(meeting)}>Edit</button>
                    <button onClick={() => handleDeleteMeeting(meeting.id)}>Delete</button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No meetings found.</p>
            )}
          </div>
        )}
      </div>

      {/* Message should always be visible */}
      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default CEOPage;
