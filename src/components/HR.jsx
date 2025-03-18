import React, { useEffect, useState } from "react";
import supabase from "../utils/supabaseClient"; 
import "../styles/HR.css";
import ChatApp from './ChatApp';

function HR() {
  const [totalDonations, setTotalDonations] = useState(0);
  const [animalReports, setAnimalReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  // Add loading state
  const [loading, setLoading] = useState(true);  
  const [selectedAnimalType, setSelectedAnimalType] = useState("All");
  // List of meetings to display
  const [meetingsList, setMeetingsList] = useState([]); 
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  // Track if the form is shown
  const [showForm, setShowForm] = useState(false); 
  const [meetingDetails, setMeetingDetails] = useState({
    id: null,
    time: "",
    place: "",
    topic: "",
    emails: [],
  });
  // List of user emails
  const [userEmails, setUserEmails] = useState([]); 
  // Track selected emails
  const [selectedEmails, setSelectedEmails] = useState([]); 
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
    // Fetch meetings when the component is mounted
    fetchMeetings();
    // Fetch user emails when the component is mounted 
    fetchUserEmails(); 
  }, []);

  // Toggle email selection
  const toggleEmailSelection = (email) => {
    setSelectedEmails((prevSelectedEmails) =>
      prevSelectedEmails.includes(email)
    // Deselect
        ? prevSelectedEmails.filter((selectedEmail) => selectedEmail !== email) 
        // Select
        : [...prevSelectedEmails, email] 
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
        // Refresh meetings list after update
        fetchMeetings(); 
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
        // Refresh meetings list after creation
        fetchMeetings(); 
      }
    }
  };

  // Function to reset the form
  const resetForm = () => {
    setMeetingDetails({ id: null, time: "", place: "", topic: "", emails: [] });
     // Reset selected emails
    setSelectedEmails([]);
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
      // Remove deleted meeting
      setMeetingsList(meetingsList.filter((meeting) => meeting.id !== id)); 
    }

    // Clear message after 3 seconds
    setTimeout(() => setMessage(""), 3000); 
  };

  // Fetch total donations from the donations table
  useEffect(() => {
    const fetchTotalDonations = async () => {
      const { data, error } = await supabase
        .from("donations")
        .select("amount");

      if (error) {
        console.error("Error fetching donations:", error);
      } else {
        const total = data.reduce((sum, donation) => sum + donation.amount, 0);
        setTotalDonations(total);
      }
    };

    fetchTotalDonations();
  }, []);

  // Fetch animal reports from the animal_reports table
  useEffect(() => {
    const fetchAnimalReports = async () => {
      const { data, error } = await supabase
        .from("animal_reports")
        .select("*");

      if (error) {
        console.error("Error fetching animal reports:", error);
      } else {
        // Log the fetched data
        console.log("Fetched animal reports:", data); 
        setAnimalReports(data);
        // Initially, show all reports
        setFilteredReports(data); 
      }
      // Set loading to false once fetching is complete
      setLoading(false);  
    };

    fetchAnimalReports();
  }, []);

  const handleLoginRedirect = () => {
    window.open("https://app.supabase.io/", "_blank");
  };

  // Filter reports based on selected animal type
  const handleAnimalFilter = (event) => {
    const selectedType = event.target.value;
    setSelectedAnimalType(selectedType);

    if (selectedType === "All") {
      // Show all reports
      setFilteredReports(animalReports); 
    } else {
      const filtered = animalReports.filter((report) =>
        report.animal_type.toLowerCase() === selectedType.toLowerCase()
      );
      // Show filtered reports based on selection
      setFilteredReports(filtered); 
    }
  };

  return (
    <div className="hr-page">
      <h1 className="hr-header">HR Dashboard</h1>
      <div className="hr-dashboard">
        <p>Welcome, HR! Here you can view reports and manage the organization.</p>
        <h2>Total Donations: ${totalDonations.toFixed(2)}</h2>
        <button onClick={handleLoginRedirect} className="hr-login-btn">
          Login to Supabase
        </button>
      </div>

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

      {/* List of Meetings */}
      <div className="meeting-list">
        <h2>Upcoming Meetings</h2>
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

      {/* Message display */}
      {message && <p className="message">{message}</p>}

      {/* Chat Toggle Button */}
      <button 
        className="chat-toggle-button" 
        onClick={() => setShowChat(prev => !prev)}
      >
        {showChat ? "Close Chat" : "Organization Chat"}
      </button>

      {/* Chat Window */}
      {showChat && (
        <div className="chat-container">
          <ChatApp />
        </div>
      )}

      {/* Animal Filter Dropdown */}
      <div className="animal-filter">
        <label htmlFor="animal-type">Filter by Animal Type: </label>
        <select
          id="animal-type"
          value={selectedAnimalType}
          onChange={handleAnimalFilter}
        >
          <option value="All">All</option>
          <option value="Dog">Dog</option>
          <option value="Cat">Cat</option>
          <option value="Bird">Bird</option>
          <option value="Reptile">Reptile</option>
          <option value="Small Mammal">Small Mammal</option>
          <option value="Wildlife">Wildlife</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Check if loading is true */}
      {loading ? (
        <div>Loading animal reports...</div>
      ) : (
        <div className="animal-reports">
          <h2>Current Animal Reports</h2>
          <div className="report-list">
            {filteredReports.length === 0 ? (
              <p>No reports available.</p>
            ) : (
              filteredReports.map((report) => (
                <div key={report.id} className="report-card">
                  <h3>{report.animal_type}</h3>
                  <p><strong>Location:</strong> {report.location}</p>
                  <p><strong>Description:</strong> {report.description}</p>
                  <p><strong>Status:</strong> {report.status || "Pending"}</p>
                  <p><strong>Caregiver Notes:</strong> {report.caregiver_notes || "N/A"}</p>
                  <p><strong>Reported On:</strong> {new Date(report.created_at).toLocaleDateString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default HR;