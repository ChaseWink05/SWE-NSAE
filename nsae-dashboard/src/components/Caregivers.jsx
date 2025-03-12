import { useState, useEffect } from 'react';
import supabase from '../utils/supabaseClient';
import reportService from '../services/ReportService';
import '../styles/Caregiver.css';

function Caregivers() {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [reviewNotes, setReviewNotes] = useState('');
  const [caregiver, setCaregiver] = useState({
    email: '',
    specialization: null
  });

  // Initialize data on component mount
  useEffect(() => {
    checkCaregiver();
    // fetchReports will be called after specialization is set
  }, []);

  // Fetch reports when specialization changes
  useEffect(() => {
    if (caregiver.specialization) {
      console.log("Specialization set to:", caregiver.specialization, "- fetching reports");
      fetchReports();
    }
  }, [caregiver.specialization]);

  const checkCaregiver = async () => {
    try {
      // Get the current user from Supabase auth
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || !user.email) {
        console.error("No authenticated user found");
        return;
      }
      
      const email = user.email.toLowerCase();
      console.log("Checking specialization for authenticated email:", email);
      
      let specialization = null;
      
      // Exact email matching for caregiver specialization
      if (email === 'reptile-caregiver@example.com') {
        specialization = 'Reptile';
        console.log("Matched reptile caregiver");
      } else if (email === 'dog-caregiver@example.com') {
        specialization = 'Dog';
        console.log("Matched dog caregiver");
      } else if (email === 'cat-caregiver@example.com') {
        specialization = 'Cat';
        console.log("Matched cat caregiver");
      } else if (email === 'bird-caregiver@example.com') {
        specialization = 'Bird';
      } else if (email === 'smallmammal-caregiver@example.com') {
        specialization = 'Small Mammal';
      } else if (email === 'wildlife-caregiver@example.com') {
        specialization = 'Wildlife';
      } else if (email === 'admin-caregiver@example.com') {
        specialization = 'all';
        console.log("Admin caregiver - showing all reports");
      } else {
        specialization = 'all';  // Default to all for unknown caregivers
        console.log("Unknown caregiver type - defaulting to all animals");
      }
      
      console.log("Final specialization:", specialization);
      
      setCaregiver({
        email: email,
        specialization: specialization
      });
    } catch (error) {
      console.error("Error checking caregiver:", error);
    }
  };

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching reports with specialization:", caregiver.specialization);
      
      let data;
      if (!caregiver.specialization || caregiver.specialization === 'all') {
        // Admin or unknown specialization - show all reports
        console.log("Fetching ALL reports (admin view)");
        data = await reportService.getAllReports();
      } else {
        // Filter reports by animal type
        console.log(`Fetching reports for ${caregiver.specialization} only`);
        data = await reportService.getReportsByAnimalType(caregiver.specialization);
      } 
      
      console.log(`Fetched ${data?.length || 0} reports:`, data);
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

  // Filter reports based on status
  const filteredReports = filter === 'all'
    ? reports
    : reports.filter(report => {
        if (filter === 'pending') {
          // Consider both null and 'pending' status as pending
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
          <button 
            className={filter === 'all' ? 'active' : ''} 
            onClick={() => setFilter('all')}
          >
            All Reports
          </button>
          <button 
            className={filter === 'pending' ? 'active' : ''} 
            onClick={() => setFilter('pending')}
          >
            Pending
          </button>
          <button 
            className={filter === 'approved' ? 'active' : ''} 
            onClick={() => setFilter('approved')}
          >
            Approved
          </button>
          <button 
            className={filter === 'rejected' ? 'active' : ''} 
            onClick={() => setFilter('rejected')}
          >
            Rejected
          </button>
        </div>
        <button className='refresh-button' onClick={fetchReports}>
          Refresh
        </button>
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
                    </h3>
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

          {selectedReport && (
            <div className="report-detail">
              <h2>Report Details</h2>
              
              <div className="detail-header">
                <h3>{selectedReport.animal_type} reported by {selectedReport.volunteers?.full_name || selectedReport.volunteers?.email || 'Unknown'}</h3>
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
                      <span className="value">{selectedReport.caregivers?.full_name || selectedReport.caregivers?.email || 'Unknown'}</span>
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
              
              {(selectedReport.status === 'pending' || !selectedReport.status) && (
                <div className="review-controls">
                  <h4>Review This Report</h4>
                  
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
                      Approve Report
                    </button>
                    <button 
                      className="reject-button" 
                      onClick={() => handleReviewReport(selectedReport.id, 'rejected')}
                    >
                      Reject Report
                    </button>
                  </div>
                </div>
              )}
              
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
    </div>
  );
}

export default Caregivers;