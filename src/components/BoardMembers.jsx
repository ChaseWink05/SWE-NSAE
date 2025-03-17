import React, { useEffect, useState } from "react";
import supabase from "../utils/supabaseClient"; 
import "../styles/BoardMembers.css";
import './ChatApp'
import ChatApp from './ChatApp';

function BoardMembers() {
  const [totalDonations, setTotalDonations] = useState(0);
  const [animalReports, setAnimalReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);  // Add loading state
  const [selectedAnimalType, setSelectedAnimalType] = useState("All");
  const [meetingsList, setMeetingsList] = useState([]); // List of meetings to display
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const [showChat, setShowChat] = useState(false);

  // Check for the current user session on initial load
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
      }
    };

    getSession();

    // Listen for changes in the auth session
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

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
      // Filter meetings based on the user's email
      const filteredMeetings = data.filter(meeting => meeting.emails.includes(user.email));
      setMeetingsList(filteredMeetings);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMeetings(); // Fetch meetings when the user is set
    }
  }, [user]);

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
        console.log("Fetched animal reports:", data); // Log the fetched data
        setAnimalReports(data);
        setFilteredReports(data); // Initially, show all reports
      }
      setLoading(false);  // Set loading to false once fetching is complete
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
      setFilteredReports(animalReports); // Show all reports
    } else {
      const filtered = animalReports.filter((report) =>
        report.animal_type.toLowerCase() === selectedType.toLowerCase()
      );
      setFilteredReports(filtered); // Show filtered reports based on selection
    }
  };

  return (
    <div className="board-members-page">
      <h1 className="board-members-header">Board Members Dashboard</h1>
      <div className="board-members-dashboard">
        <p>Welcome, Board Members! Here you can view reports and manage the organization.</p>
      </div>

      {/* List of Meetings */}
      <div className="meeting-list">
        <h2>Upcoming Meetings</h2>
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
      {message && <p className="message">{message}</p>}
                  <button 
                    className="chat-toggle-button" 
                    onClick={() => setShowChat(prev => !prev)}
                  >
                    {showChat ? "Close Chat" : "Organization Chat"}
                  </button>
            
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

      {/* Message display */}
      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default BoardMembers;