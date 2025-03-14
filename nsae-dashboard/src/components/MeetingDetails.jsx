import React from 'react';

function MeetingDetails({ meetingsList }) {
  return (
    <div className="meeting-details">
      <h3>Upcoming Meetings</h3>
      {meetingsList.length > 0 ? (
        <ul>
          {meetingsList.map((meeting) => (
            <li key={meeting.id}>
              <span>{meeting.time} - {meeting.place} - {meeting.topic}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p>No meetings found.</p>
      )}
    </div>
  );
}

export default MeetingDetails;