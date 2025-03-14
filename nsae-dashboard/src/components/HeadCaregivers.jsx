import React, { useState, useEffect } from "react";
import supabase from '../utils/supabaseClient';
import { reportService } from '../services/ReportService';
import '../styles/HeadCaregiver.css';
import ChatApp from "./ChatApp"; 

function HeadCaregivers() {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [reviewNotes, setReviewNotes] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);
  const [userEmails, setUserEmails] = useState({});
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

  // Initialize data on component mount
  useEffect(() => {
    fetchReports();
  }, []);

  // Format user display name
  const formatUserName = (userId, role = '') => {
    // First check if we have this user's email in our state
    if (userEmails[userId]) {
      return userEmails[userId];
    }    
    return 'Unknown';
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

  const confirmDeleteReport = (report) => {
    setReportToDelete(report);
    setShowConfirmDelete(true);
  };

  const handleDeleteReport = async () => {
    try {
      if (!reportToDelete || !reportToDelete.id) {
        throw new Error("No report selected for deletion");
      }

      await reportService.deleteReport(reportToDelete.id);
      alert("Report deleted successfully!");
      setShowConfirmDelete(false);
      setReportToDelete(null);
      setSelectedReport(null);
      fetchReports();
    } catch (error) {
      console.error("Error deleting report:", error);
      alert(`Failed to delete report: ${error.message}`);
    }
  };

  // Filter reports based on status
  const filteredReports = filter === 'all'
    ? reports
    : reports.filter(report => {
        if (filter === 'pending') {
          return !report.status || report.status === 'pending';
        }
        return report.status === filter;
      });

  return (
    <div className="headcaregiver-page">
      <h1>Head Caregiver Dashboard</h1>
      <p className="role-description">
        As Head Caregiver, you have full access to all animal reports and can review, approve, or delete any report.
      </p>
      
      <div className="filter-header">
        <div className="filter-controls">
          <button 
            className={filter === 'all' ? 'active' : ''} 
            onClick={() => setFilter('all')}
          >
            All Reports ({reports.length})
          </button>
          <button 
            className={filter === 'pending' ? 'active' : ''} 
            onClick={() => setFilter('pending')}
          >
            Pending ({reports.filter(r => !r.status || r.status === 'pending').length})
          </button>
          <button 
            className={filter === 'approved' ? 'active' : ''} 
            onClick={() => setFilter('approved')}
          >
            Approved ({reports.filter(r => r.status === 'approved').length})
          </button>
          <button 
            className={filter === 'rejected' ? 'active' : ''} 
            onClick={() => setFilter('rejected')}
          >
            Rejected ({reports.filter(r => r.status === 'rejected').length})
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

      {isLoading ? (
        <div className="loading-indicator">
          <div className="loading-spinner"></div>
          <p>Loading reports...</p>
        </div>
      ) : (
        <div className="reports-container">
          <div className="reports-list">
            {filteredReports.length === 0 ? (
              <p>No {filter !== 'all' ? filter : ''} reports found.</p>
            ) : (
              filteredReports.map(report => (
                <div 
                  key={report.id} 
                  className={`report-card vertical-layout ${selectedReport?.id === report.id ? 'selected' : ''}`}
                  onClick={() => setSelectedReport(report)}
                >
                  {report.image_url && (
                    <div className="image-container">
                      <img src={report.image_url} alt="Reported Animal" className="report-thumbnail" />
                    </div>
                  )}
                  <div className="report-summary">
                    <h3>
                      <span className="animal-type-tag">{report.animal_type}</span>
                      {report.health_status && (
                        <span className={`status-badge status-${report.health_status.toLowerCase()}`}>
                          {report.health_status == 'Healthy' ? 'Healthy':
                          report.health_status == 'Injured' ? 'Injured':
                          report.health_status == 'Sick' ? 'Sick':
                          report.health_status == 'needs attention' ? 'Needs Attention':
                          report.health_status == 'critical' ? 'Critical': ''}
                        </span>
                      )}

                    </h3>
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
            {showChat && (<div className="chat-container">
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
              
              
              <div className="report-info-grid">
                <div className="info-item">
                <span className={`value health-status ${selectedReport.health_status || 'unknown'}`}>
                  {selectedReport.health_status === 'healthy' ? 'Healthy' : 
                  selectedReport.health_status === 'needs_attention' ? 'Needs Medical Attention' : 
                  selectedReport.health_status === 'critical' ? 'Critical Condition' : 
                  'Status Not Reported'}
                </span>
              </div>
                  {selectedReport.medical_needs && (
                  <div className="info-item">
                    <span className="label">Medical Needs:</span>
                    <span className="value">{selectedReport.medical_needs}</span>
                  </div>                   
                  )}
                  
                <div className="info-item">
                  <span className="label">Location:</span>
                  <span className="value">{selectedReport.location}</span>
                </div>
                
                <div className="info-item">
                  <span className="label">Date Reported:</span>
                  <span className="value">{new Date(selectedReport.created_at).toLocaleString()}</span>
                </div>
                
                <div className="info-item">
                  <span className="label">Description:</span>
                  <span className="value">{selectedReport.description || 'No description provided'}</span>
                </div>
                
                {selectedReport.status && selectedReport.status !== 'pending' && (
                  <>
                    <div className="info-item">
                      <span className="label">Reviewed By:</span>
                      <span className="value">
                        {userEmails[selectedReport.caregiver_id] || formatUserName(selectedReport.caregiver_id, 'Caregiver')}
                      </span>
                    </div>
                    
                    <div className="info-item">
                      <span className="label">Reviewed On:</span>
                      <span className="value">{selectedReport.reviewed_at ? new Date(selectedReport.reviewed_at).toLocaleString() : 'Unknown'}</span>
                    </div>
                    
                    {selectedReport.caregiver_notes && (
                      <div className="info-item">
                        <span className="label">Notes:</span>
                        <span className="value">{selectedReport.caregiver_notes}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
              
              <div className="review-controls">
                <h4>{selectedReport.status ? 'Update Review' : 'Review This Report'}</h4>
                
                <div className="form-group">
                  <label htmlFor="review-notes">Notes (optional):</label>
                  <textarea 
                    id="review-notes" 
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Add notes about this report..."
                  />
                </div>
                
                <div className="button-group">
                  <button 
                    className="approve-button" 
                    onClick={() => handleReviewReport(selectedReport.id, 'approved')}
                  >
                    {selectedReport.status === 'approved' ? 'Update Approval' : 'Approve Report'}
                  </button>
                  <button 
                    className="reject-button" 
                    onClick={() => handleReviewReport(selectedReport.id, 'rejected')}
                  >
                    {selectedReport.status === 'rejected' ? 'Update Rejection' : 'Reject Report'}
                  </button>
                </div>
              </div>
              
              <div className="danger-zone">
                <h4>Danger Zone</h4>
                <button 
                  className="delete-button"
                  onClick={() => confirmDeleteReport(selectedReport)}
                >
                  Delete This Report
                </button>
              </div>
              
              <button 
                className="close-button"
                onClick={() => setSelectedReport(null)}
              >
                Close Details
              </button>
            </div>
          )}
        </div>
      )}
      
      {showConfirmDelete && reportToDelete && (
        <div className="confirm-dialog-overlay">
          <div className="confirm-dialog">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to permanently delete this report?</p>
            <p><strong>Animal Type:</strong> {reportToDelete.animal_type}</p>
            <p><strong>Location:</strong> {reportToDelete.location}</p>
            <div className="confirm-actions">
              <button 
                className="confirm-delete"
                onClick={handleDeleteReport}
              >
                Yes, Delete It
              </button>
              <button 
                className="cancel-delete"
                onClick={() => {
                  setShowConfirmDelete(false);
                  setReportToDelete(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HeadCaregivers;