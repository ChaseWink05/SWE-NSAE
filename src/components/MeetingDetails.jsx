import React from 'react';

// MeetingDetails component
function MeetingDetails({ meetingsList }) {
  return (
    <div className="meeting-details">
      <h3>Upcoming Meetings</h3>
      {/* Check if there are any meetings in the list */}
      {meetingsList.length > 0 ? (
        <ul>
          {/* Map through the meetingsList and display each meeting */}
          {meetingsList.map((meeting) => (
            <li key={meeting.id}>
              <span>{meeting.time} - {meeting.place} - {meeting.topic}</span>
            </li>
          ))}
        </ul>
      ) : (
        // Display a message if no meetings are found
        <p>No meetings found.</p>
      )}
    </div>
  );
}

export default MeetingDetails;