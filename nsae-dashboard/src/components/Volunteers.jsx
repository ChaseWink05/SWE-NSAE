import React, { useState, useEffect } from "react";
import "../styles/Volunteer.css";

function Volunteers() {
  // Default profile info
  const [profile, setProfile] = useState({
    name: "",
    hobby: "",
    town: "",
    bio: "",
    image: ""
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reports, setReports] = useState([]);
  const [newReport, setNewReport] = useState({
    animalType: "",
    location: "",
    description: "",
    image: "",
    date: ""
  });
  const [editingReport, setEditingReport] = useState(null); // New state for editing reports
  
  // Load volunteer profile from localStorage on component mount
  useEffect(() => {
    const savedProfile = localStorage.getItem("volunteer");
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
    
    // Load saved reports
    const savedReports = localStorage.getItem("animalReports");
    if (savedReports) {
      setReports(JSON.parse(savedReports));
    }
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prevProfile => ({
      ...prevProfile,
      [name]: value
    }));
  };
  
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProfile(prevProfile => ({
        ...prevProfile,
        image: URL.createObjectURL(e.target.files[0])
      }));
    }
  };
  
  const saveProfile = () => {
    localStorage.setItem("volunteer", JSON.stringify(profile));
    setIsEditing(false);
    alert("Profile updated successfully!");
  };
  
  const handleReportChange = (e) => {
    const { name, value } = e.target;
    // Check if we're editing an existing report
    if (editingReport) {
      setEditingReport({
        ...editingReport,
        [name]: value
      });
    } else {
      setNewReport(prevReport => ({
        ...prevReport,
        [name]: value
      }));
    }
  };
  
  const handleReportImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      if (editingReport) {
        setEditingReport({
          ...editingReport,
          image: URL.createObjectURL(e.target.files[0])
        });
      } else {
        setNewReport(prevReport => ({
          ...prevReport,
          image: URL.createObjectURL(e.target.files[0])
        }));
      }
    }
  };
  
  const submitReport = () => {
    // Determine which report object to use
    const reportData = editingReport || newReport;
    
    if (!reportData.animalType || !reportData.location) {
      alert("Please provide animal type and location");
      return;
    }
    
    let updatedReports;
    
    if (editingReport) {
      // Update existing report
      updatedReports = reports.map(report => 
        report.id === editingReport.id ? editingReport : report
      );
      alert("Report updated successfully!");
    } else {
      // Create new report
      const reportToSave = {
        ...reportData,
        id: Date.now(),
        date: new Date().toLocaleString(),
        status: "Pending"
      };
      updatedReports = [...reports, reportToSave];
      alert("Report submitted successfully!");
    }
    
    setReports(updatedReports);
    localStorage.setItem("animalReports", JSON.stringify(updatedReports));
    
    // Reset form
    setNewReport({
      animalType: "",
      location: "",
      description: "",
      image: "",
      date: ""
    });
    
    setEditingReport(null);
    setShowReportForm(false);
  };
  
  // New function to handle editing a report
  const startEditReport = (report) => {
    setEditingReport(report);
    setShowReportForm(true);
  };
  
  // New function to handle deleting a report
  const deleteReport = (reportId) => {
    if (window.confirm("Are you sure you want to delete this report?")) {
      const updatedReports = reports.filter(report => report.id !== reportId);
      setReports(updatedReports);
      localStorage.setItem("animalReports", JSON.stringify(updatedReports));
      alert("Report deleted successfully");
    }
  };
  
  // Cancel editing or creating a report
  const cancelReportForm = () => {
    setShowReportForm(false);
    setEditingReport(null);
  };

  return (
    <div className="volunteer-page">
      <h1>Volunteer Dashboard</h1>
      
      <div className="volunteer-profile">
        <h2>Your Profile</h2>
        
        {!isEditing ? (
          <div className="profile-view">
            {profile.image && <img src={profile.image} alt="Profile" className="profile-image" />}
            <h3>{profile.name || "No name provided"}</h3>
            <p><strong>Hobby:</strong> {profile.hobby || "Not specified"}</p>
            <p><strong>Town:</strong> {profile.town || "Not specified"}</p>
            <p><strong>Bio:</strong> {profile.bio || "No bio provided"}</p>
            <button onClick={() => setIsEditing(true)} className="edit-button">
              Edit Profile
            </button>
          </div>
        ) : (
          <div className="profile-edit">
            <div className="form-group">
              <label>Name:</label>
              <input 
                type="text" 
                name="name" 
                value={profile.name} 
                onChange={handleChange} 
              />
            </div>
            
            <div className="form-group">
              <label>Hobby:</label>
              <input 
                type="text" 
                name="hobby" 
                value={profile.hobby} 
                onChange={handleChange} 
              />
            </div>
            
            <div className="form-group">
              <label>Town:</label>
              <input 
                type="text" 
                name="town" 
                value={profile.town} 
                onChange={handleChange} 
              />
            </div>
            
            <div className="form-group">
              <label>Bio:</label>
              <textarea 
                name="bio" 
                value={profile.bio} 
                onChange={handleChange} 
              />
            </div>
            
            <div className="form-group">
              <label>Profile Picture:</label>
              <input 
                type="file" 
                onChange={handleImageChange} 
              />
              {profile.image && <img src={profile.image} alt="Profile Preview" className="image-preview" />}
            </div>
            
            <div className="button-group">
              <button onClick={saveProfile} className="save-button">
                Save Changes
              </button>
              <button onClick={() => setIsEditing(false)} className="cancel-button">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="volunteer-reports">
        <div className="reports-header">
          <h2>Stray Animal Reports</h2>
          <button onClick={() => !editingReport && setShowReportForm(!showReportForm)} className="report-button">
            {showReportForm && !editingReport ? "Cancel Report" : "Report Stray Animal"}
          </button>
        </div>
        
        {showReportForm && (
          <div className="report-form">
            <h3>{editingReport ? "Edit Animal Report" : "New Animal Report"}</h3>
            
            <div className="form-group">
              <label>Animal Type (Dog, Cat, etc.):</label>
              <input 
                type="text" 
                name="animalType" 
                value={editingReport ? editingReport.animalType : newReport.animalType} 
                onChange={handleReportChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Location:</label>
              <input 
                type="text" 
                name="location" 
                value={editingReport ? editingReport.location : newReport.location} 
                onChange={handleReportChange}
                required
                placeholder="Street address, landmarks, etc."
              />
            </div>
            
            <div className="form-group">
              <label>Description:</label>
              <textarea 
                name="description" 
                value={editingReport ? editingReport.description : newReport.description} 
                onChange={handleReportChange}
                placeholder="Animal color, size, behavior, etc."
              />
            </div>
            
            <div className="form-group">
              <label>Photo of Animal:</label>
              <input 
                type="file" 
                onChange={handleReportImageChange} 
              />
              {(editingReport?.image || newReport.image) && (
                <img 
                  src={editingReport ? editingReport.image : newReport.image} 
                  alt="Animal Preview" 
                  className="image-preview" 
                />
              )}
            </div>
            
            <div className="button-group">
              <button onClick={submitReport} className="submit-button">
                {editingReport ? "Update Report" : "Submit Report"}
              </button>
              <button onClick={cancelReportForm} className="cancel-button">
                Cancel
              </button>
            </div>
          </div>
        )}
        
        <div className="reports-list">
          <h3>Your Reports</h3>
          
          {reports.length === 0 ? (
            <p>You haven't submitted any reports yet.</p>
          ) : (
            <div className="reports-grid">
              {reports.map(report => (
                <div key={report.id} className="report-card">
                  {report.image && (
                    <img src={report.image} alt="Reported Animal" className="report-image" />
                  )}
                  <div className="report-details">
                    <h4>{report.animalType}</h4>
                    <p><strong>Location:</strong> {report.location}</p>
                    <p><strong>Date:</strong> {report.date}</p>
                    <p><strong>Status:</strong> <span className={`status-${report.status.toLowerCase()}`}>{report.status}</span></p>
                    
                    {/* Only show edit/delete if status is pending */}
                    {report.status === "Pending" && (
                      <div className="report-actions">
                        <button onClick={() => startEditReport(report)} className="edit-report-button">
                          Edit
                        </button>
                        <button onClick={() => deleteReport(report.id)} className="delete-report-button">
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Volunteers;