import React, { useState, useEffect } from "react";
import supabase from "../utils/supabaseClient";
import "../styles/MeetingDetails.css";

function MeetingDetails() {
  const [meetingDetails, setMeetingDetails] = useState([]);
  const [error, setError] = useState("");

  // Function to fetch meetings from the database
  const fetchMeetingDetails = async () => {
    const { data, error } = await supabase
      .from("meetings")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setError("Failed to fetch meeting details: " + error.message);
    } else {
      setMeetingDetails(data);
    }
  };

  useEffect(() => {
    fetchMeetingDetails(); // Initial fetch

    // Set up real-time subscription to listen for changes in 'meetings' table
    const subscription = supabase
      .channel("meetings") // Subscription channel
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "meetings" },
        (payload) => {
          console.log("New meeting update received:", payload);
          fetchMeetingDetails(); // Re-fetch meetings when there’s an update
        }
      )
      .subscribe();

    // Cleanup function to unsubscribe
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return (
    <div className="meeting-details">
      <h2>Meeting Details</h2>
      {error && <p className="error">{error}</p>}
      {meetingDetails.length > 0 ? (
        meetingDetails.map((meeting, index) => (
          <div key={index} className="meeting-item">
            <p><strong>Time:</strong> {meeting.time}</p>
            <p><strong>Place:</strong> {meeting.place}</p>
            <p><strong>Topic:</strong> {meeting.topic}</p>
          </div>
        ))
      ) : (
        <p>No meeting details available.</p>
      )}
    </div>
  );
}

export default MeetingDetails;
