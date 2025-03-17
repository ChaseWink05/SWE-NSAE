import { useState, useEffect } from 'react';
import supabase from '../utils/supabaseClient';
import reportService from '../services/ReportService';
import '../styles/Caregiver.css';
import ChatApp from "./ChatApp"; 
import MeetingDetails from "./MeetingDetails";

function Caregivers() {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [reviewNotes, setReviewNotes] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [caregiver, setCaregiver] = useState({
    email: '',
    specialization: null
  });
  const [meetingsList, setMeetingsList] = useState([]); // List of meetings to display
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const [userEmails, setUserEmails] = useState({});
  

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
   // Format user display name
   const formatUserName = (userId, role = '') => {
    // First check if we have this user's email in our state
    if (userEmails[userId]) {
      return userEmails[userId];
    }    
    return 'Unknown';
  };

  useEffect(() => {
    checkCaregiver();
  }, []);

  useEffect(() => {
    if (caregiver.specialization) {
      fetchReports();
    }
  }, [caregiver.specialization]);

  const checkCaregiver = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !user.email) return;

      const email = user.email.toLowerCase();
      let specialization = null;

      if (email === 'reptile-caregiver@example.com') {
        specialization = 'Reptile';
      } else if (email === 'dog-caregiver@example.com') {
        specialization = 'Dog';
      } else if (email === 'cat-caregiver@example.com') {
        specialization = 'Cat';
      } else if (email === 'bird-caregiver@nsae.com') {
        specialization = 'Bird';
      } else if (email === 'mammal-caregiver@nsae.com') {
        specialization = 'Small Mammal';
      } else if (email === 'wildlife-caregiver@nsae.com') {
        specialization = 'Wildlife';
      } else if (email === 'other-caregiver@nsae.com') {
        specialization = 'Other';
      } else if (email === 'admin-caregiver@example.com') {
        specialization = 'all';
      } else {
        specialization = 'all';
      }

      setCaregiver({ email: email, specialization: specialization });
    } catch (error) {
      console.error("Error checking caregiver:", error);
    }
  };

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      console.log("Head Caregiver fetching all reports");
      
      // Get all reports using the existing service method
      const data = await reportService.getAllReports();
      
      if (data && data.length > 0) {
        console.log(`Fetched ${data.length} reports, attempting to get user emails`);
        
        // Extract all unique user IDs (both volunteers and caregivers)
        const volunteerIds = data
          .filter(r => r.volunteer_id)
          .map(r => r.volunteer_id);
          
        const caregiverIds = data
          .filter(r => r.caregiver_id)
          .map(r => r.caregiver_id);
          
        const uniqueUserIds = [...new Set([...volunteerIds, ...caregiverIds])];
        
        if (uniqueUserIds.length > 0) {
          try {
            // Try to fetch user emails directly from auth.users (requires proper permissions)
            const { data: userData, error: authError } = await supabase.auth.admin.listUsers({
              perPage: 100 
            });
            
            if (!authError && userData?.users) {
              const emailMap = {};
              
              userData.users.forEach(user => {
                if (uniqueUserIds.includes(user.id)) {
                  emailMap[user.id] = user.email;
                }
              });
              
              console.log("Found email mappings:", emailMap);
              setUserEmails(emailMap);
            } else {
              console.log("Couldn't access auth users directly:", authError);
            }
          } catch (error) {
            console.warn("Couldn't fetch user emails:", error);
          }
        }
      }
      
      console.log(`Fetched ${data?.length || 0} total reports`);
      setReports(data || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
      alert("Failed to load reports. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewReport = async (reportId, status) => {
    try {
      await reportService.reviewReport(reportId, status, reviewNotes);
      alert(`Report ${status === 'approved' ? 'approved' : 'rejected'} successfully!`);
      setSelectedReport(null);
      setReviewNotes('');
      fetchReports();
    } catch (error) {
      console.error("Error reviewing report:", error);
      alert("Failed to update report status. Please try again.");
    }
  };

  const filteredReports = filter === 'all'
    ? reports
    : reports.filter(report => {
        if (filter === 'pending') {
          return !report.status || report.status === 'pending';
        }
        return report.status === filter;
      });

  return (
    <div className="caregiver-page">
      <h1>Caregiver Dashboard</h1>

      {caregiver.specialization && (
        <div className="specialization-badge">
          <p>
            You are responsible for: 
            <strong>
              {caregiver.specialization === 'all' 
                ? 'All Animals' 
                : `${caregiver.specialization} Reports`}
            </strong>
          </p>
        </div>
      )}
      <MeetingDetails meetingsList={meetingsList} />
      <div className="filter-header">
        <div className="filter-controls">
          <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>
            All Reports
          </button>
          <button className={filter === 'pending' ? 'active' : ''} onClick={() => setFilter('pending')}>
            Pending
          </button>
          <button className={filter === 'approved' ? 'active' : ''} onClick={() => setFilter('approved')}>
            Approved
          </button>
          <button className={filter === 'rejected' ? 'active' : ''} onClick={() => setFilter('rejected')}>
            Rejected
          </button>
        </div>
        <button className='refresh-button' onClick={fetchReports}>
          Refresh
        </button>

        {/* Chat Toggle Button */}
        <button className="chat-toggle-button" onClick={() => setShowChat(prev => !prev)}>
          {showChat ? "Close Chat" : "Organization Chat"}
        </button>
      </div>

      <div className="reports-container">
        <div className="reports-list">
          {isLoading ? (
            <p>Loading reports...</p>
          ) : filteredReports.length === 0 ? (
            <p>No {filter !== 'all' ? filter : ''} reports found.</p>
          ) : (
            filteredReports.map(report => (
              <div key={report.id} className={`report-card vertical-layout ${selectedReport?.id === report.id ? 'selected' : ''}`} onClick={() => setSelectedReport(report)}>
                {report.image_url && (
                  <div className="image-container">
                    <img src={report.image_url} alt="Reported Animal" className="report-thumbnail" />
                  </div>
                )}
                <div className="report-summary">
                  <h3>{report.animal_type}</h3>
                  {report.health_status && (
                    <p className={`health-status ${report.health_status}`}>
                      <strong>Health:</strong> 
                      {report.health_status === 'healthy' ? ' Healthy' : 
                      report.health_status === 'needs_attention' ? ' Needs Medical Attention' : 
                      report.health_status === 'critical' ? ' Critical Condition' : 
                      ' Unknown'}
                    </p>
                  )}
                  <p><strong>Location:</strong> {report.location}</p>
                  <p><strong>Date:</strong> {new Date(report.created_at).toLocaleDateString()}</p>
                  <p><strong>Status:</strong> <span className={`status-badge status-${(report.status || 'pending').toLowerCase()}`}>
                    {report.status ? (report.status.charAt(0).toUpperCase() + report.status.slice(1)) : 'Pending'}
                  </span></p>
                  <p><strong>Volunteer:</strong> {userEmails[report.volunteer_id] || formatUserName(report.volunteer_id, 'Volunteer')}</p>
                  </div>
              </div>
            ))
          )}
        </div>

        {/* Chat Window Appears Next to Reports */}
        {showChat && (
          <div className="chat-container">
            <ChatApp />
          </div>
        )}

        {selectedReport && (
          <div className="report-detail">
            <h2>Report Details</h2>

            <div className="detail-header">
                <h3>{selectedReport.animal_type} reported by {userEmails[selectedReport.volunteer_id] || formatUserName(selectedReport.volunteer_id, 'Volunteer')}</h3>
                <span className={`status-badge status-${(selectedReport.status || 'pending').toLowerCase()}`}>
                  {selectedReport.status 
                    ? (selectedReport.status.charAt(0).toUpperCase() + selectedReport.status.slice(1)) 
                    : 'Pending'}
                </span>
              </div>
            {selectedReport.image_url && (
              <img src={selectedReport.image_url} alt="Reported Animal" className="report-image-large" />
            )}

              <div className="health-status-section">
                  <h4>Health Status:</h4>
                  <p className={`health-status ${selectedReport.health_status || 'unknown'}`}>
                    {selectedReport.health_status === 'healthy' ? 'Healthy' : 
                    selectedReport.health_status === 'needs_attention' ? 'Needs Medical Attention' : 
                    selectedReport.health_status === 'critical' ? 'Critical Condition' : 
                    'Status Not Reported'}
                  </p>
                </div>
                
                {/* Show medical needs if any */}
                {selectedReport.medical_needs && (
                  <div className="medical-needs-section">
                    <h4>Medical Needs:</h4>
                    <p>{selectedReport.medical_needs}</p>
                  </div>
                )}
            <p><strong>Location:</strong> {selectedReport.location}</p>
            <p><strong>Date Reported:</strong> {new Date(selectedReport.created_at).toLocaleString()}</p>
            <p><strong>Description:</strong> {selectedReport.description || 'No description provided'}</p>

            {/* Approval/Reject Buttons */}
            {selectedReport.status === 'pending' || !selectedReport.status ? (
              <div className="review-controls">
                <h4>Review This Report</h4>
                <textarea id="review-notes" value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} placeholder="Add notes about this report..." />
                <div className="button-group">
                  <button className="approve-button" onClick={() => handleReviewReport(selectedReport.id, 'approved')}>
                    Approve Report
                  </button>
                  <button className="reject-button" onClick={() => handleReviewReport(selectedReport.id, 'rejected')}>
                    Reject Report
                  </button>
                </div>
              </div>
            ) : null}

            <button className="close-button" onClick={() => setSelectedReport(null)}>
              Close Details
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Caregivers;