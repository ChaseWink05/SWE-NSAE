import { useState, useEffect } from 'react';
import supabase from '../utils/supabaseClient';
import reportService from '../services/ReportService';
import '../styles/Caregiver.css';
import ChatApp from "./ChatApp"; // Import the chat component

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
      } else if (email === 'bird-caregiver@example.com') {
        specialization = 'Bird';
      } else if (email === 'smallmammal-caregiver@example.com') {
        specialization = 'Small Mammal';
      } else if (email === 'wildlife-caregiver@example.com') {
        specialization = 'Wildlife';
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
      let data;
      if (!caregiver.specialization || caregiver.specialization === 'all') {
        data = await reportService.getAllReports();
      } else {
        data = await reportService.getReportsByAnimalType(caregiver.specialization);
      }
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
                  <p><strong>Location:</strong> {report.location}</p>
                  <p><strong>Date:</strong> {new Date(report.created_at).toLocaleDateString()}</p>
                  <p><strong>Status:</strong> <span className={`status-badge status-${(report.status || 'pending').toLowerCase()}`}>
                    {report.status ? (report.status.charAt(0).toUpperCase() + report.status.slice(1)) : 'Pending'}
                  </span></p>
                  <p><strong>Volunteer:</strong> {report.volunteers?.full_name || report.volunteers?.email || 'Unknown'}</p>
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
            {selectedReport.image_url && (
              <img src={selectedReport.image_url} alt="Reported Animal" className="report-image-large" />
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
