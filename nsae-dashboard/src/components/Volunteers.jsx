import { useState, useEffect } from 'react';
import supabase from '../utils/supabaseClient';
import reportService from '../services/ReportService';
import '../styles/Volunteer.css';

function Volunteers() {
  // Profile state
  const [profile, setProfile] = useState({
    name: '',
    hobby: '',
    town: '',
    bio: '',
    image: ''
  });
  
  // UI state
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showReportForm, setShowReportForm] = useState(false);
  
  // Reports state
  const [reports, setReports] = useState([]);
  const [newReport, setNewReport] = useState({
    animalType: '',
    otherAnimalType: '',
    location: '',
    description: '',
    imageFile: null,
    imagePreview: null
  });
  const [editingReport, setEditingReport] = useState(null);

  // Predefined animal types with proper labels
  const animalOptions = [
    {value: 'Dog', label: 'Dog'},
    {value: 'Cat', label: 'Cat'},
    {value: 'Bird', label: 'Bird'},
    {value: 'Reptile', label: 'Reptile (Snake, Lizard, etc.)'},
    {value: 'Small Mammal', label: 'Small Mammal (Rabbit, Guinea Pig, etc.)'},
    {value: 'Wildlife', label: 'Wildlife (Fox, Deer, etc.)'},
    {value: 'Other', label: 'Other'}
  ];

  // Load data on component mount
  useEffect(() => {
    // Load profile from localStorage
    const savedProfile = localStorage.getItem("volunteer");
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }

    // Check auth status and load reports
    checkAuthAndLoadReports();
    
    // Set up real-time subscription for updates
    const setupRealtimeSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const subscription = supabase
          .channel('animal_reports_changes')
          .on(
            'postgres_changes',
            {
              event: '*', 
              schema: 'public',
              table: 'animal_reports',
              filter: `volunteer_id=eq.${user.id}`
            },
            (payload) => {
              console.log('Change received!', payload);
              fetchReports(); // Reload reports when changes occur
            }
          )
          .subscribe();
          
        // Cleanup subscription on unmount
        return () => {
          subscription.unsubscribe();
        };
      }
    };
    
    setupRealtimeSubscription();
  }, []);

  // Auth check and reports loading
  const checkAuthAndLoadReports = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log("User not authenticated");
        return;
      }
      
      fetchReports();
    } catch (error) {
      console.error("Auth check error:", error);
    }
  };

  // Fetch reports from database
  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const data = await reportService.getMyReports();
      console.log("Fetched reports:", data);
      setReports(data || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
      alert("Failed to load reports. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Profile functions
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfile(prev => ({ ...prev, image: event.target.result }));
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const saveProfile = () => {
    localStorage.setItem("volunteer", JSON.stringify(profile));
    setIsEditing(false);
  };

  // Report functions
  const handleReportChange = (e) => {
    const { name, value } = e.target;
    if (editingReport) {
      // Handle name differences between form fields and DB fields
      if (name === "animalType") {
        setEditingReport(prev => ({ 
          ...prev, 
          animal_type: value,
          // Reset the other type field if not "Other"
          other_animal_type: value !== 'Other' ? '' : prev.other_animal_type
        }));
      } else if (name === "otherAnimalType") {
        setEditingReport(prev => ({ ...prev, other_animal_type: value }));
      } else {
        setEditingReport(prev => ({ ...prev, [name]: value }));
      }
    } else {
      if (name === "animalType") {
        setNewReport(prev => ({ 
          ...prev, 
          animalType: value,
          // Reset the other type field if not "Other"
          otherAnimalType: value !== 'Other' ? '' : prev.otherAnimalType
        }));
      } else {
        setNewReport(prev => ({ ...prev, [name]: value }));
      }
    }
  };

  const handleReportImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // For preview
      const reader = new FileReader();
      reader.onload = (event) => {
        if (editingReport) {
          setEditingReport(prev => ({ ...prev, imagePreview: event.target.result, imageFile: file }));
        } else {
          setNewReport(prev => ({ ...prev, imagePreview: event.target.result, imageFile: file }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const submitReport = async () => {
    try {
      // Handle "Other" animal type
      const finalAnimalType = (editingReport ? editingReport.animal_type : newReport.animalType) === 'Other' 
        ? `Other: ${editingReport ? editingReport.other_animal_type : newReport.otherAnimalType}`
        : (editingReport ? editingReport.animal_type : newReport.animalType);
      
      if (editingReport) {
        // Update existing report
        console.log("Updating report:", editingReport.id, {
          animalType: finalAnimalType,
          location: editingReport.location,
          description: editingReport.description
        });
        
        await reportService.updateReport(editingReport.id, {
          animalType: finalAnimalType,
          location: editingReport.location,
          description: editingReport.description
        });
        
        alert("Report updated successfully!");
      } else {
        // Validate required fields
        if (!newReport.animalType || !newReport.location) {
          alert("Please provide animal type and location");
          return;
        }
        
        if (newReport.animalType === 'Other' && !newReport.otherAnimalType) {
          alert("Please specify the animal type");
          return;
        }
        
        // Create new report
        await reportService.createReport({
          animalType: finalAnimalType,
          location: newReport.location,
          description: newReport.description,
          imageFile: newReport.imageFile
        });
        
        alert("Report submitted successfully!");
      }
      
      // Reset form and refresh reports
      setNewReport({
        animalType: '',
        otherAnimalType: '',
        location: '',
        description: '',
        imageFile: null,
        imagePreview: null
      });
      
      setEditingReport(null);
      setShowReportForm(false);
      fetchReports();
    } catch (error) {
      console.error("Error saving report:", error);
      alert(`Failed to save report: ${error.message || "Unknown error"}`);
    }
  };

  const startEditReport = (report) => {
    console.log("Starting edit for report:", report);
    
    // Handle "Other:" prefix in animal_type
    let animalType = report.animal_type;
    let otherAnimalType = '';
    
    if (report.animal_type && report.animal_type.startsWith('Other:')) {
      animalType = 'Other';
      otherAnimalType = report.animal_type.substring(7).trim();
    }
    
    // Make a copy to avoid direct state mutation
    setEditingReport({
      ...report,
      // Ensure these fields exist for the form
      animal_type: animalType,
      other_animal_type: otherAnimalType,
      location: report.location,
      description: report.description
    });
    
    setShowReportForm(true);
  };

  const deleteReport = async (id, status) => {
    if (!id) {
      console.error("No report ID provided");
      return;
    }
    
    let confirmMessage = "Are you sure you want to delete this report?";
    
    if (status && status !== 'pending') {
      confirmMessage = `This report has already been ${status}. Are you absolutely sure you want to delete it? This action cannot be undone.`;
    }
    
    if (window.confirm(confirmMessage)) {
      try {
        console.log("Deleting report:", id);
        await reportService.deleteReport(id);
        alert("Report deleted successfully!");
        fetchReports();
      } catch (error) {
        console.error("Error deleting report:", error);
        alert(`Failed to delete report: ${error.message || "Unknown error"}`);
      }
    }
  };

  const cancelReportForm = () => {
    setShowReportForm(false);
    setEditingReport(null);
    setNewReport({
      animalType: '',
      otherAnimalType: '',
      location: '',
      description: '',
      imageFile: null,
      imagePreview: null
    });
  };

  return (
    <div className="volunteer-page">
      <h1>Volunteer Dashboard</h1>
      
      <div className="volunteer-profile">
        <h2>Your Profile</h2>
        
        {isEditing ? (
          <div className="edit-profile">
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
              <label>Favorite Hobby:</label>
              <input 
                type="text" 
                name="hobby" 
                value={profile.hobby} 
                onChange={handleChange} 
              />
            </div>
            
            <div className="form-group">
              <label>Home Town:</label>
              <input 
                type="text" 
                name="town" 
                value={profile.town} 
                onChange={handleChange} 
              />
            </div>
            
            <div className="form-group">
              <label>About Me:</label>
              <textarea 
                name="bio" 
                value={profile.bio} 
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label>Profile Image:</label>
              <input 
                type="file" 
                onChange={handleImageChange} 
              />
            </div>
            
            <div className="button-group">
              <button onClick={saveProfile} className="save-button">Save Profile</button>
              <button onClick={() => setIsEditing(false)} className="cancel-button">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="profile-display">
            <div className="profile-header">
              {profile.image && <img src={profile.image} alt="Profile" className="profile-image" />}
              <div>
                <h3>{profile.name || "Your Name"}</h3>
                {profile.hobby && <p><strong>Hobby:</strong> {profile.hobby}</p>}
                {profile.town && <p><strong>From:</strong> {profile.town}</p>}
              </div>
              <button onClick={() => setIsEditing(true)} className="edit-button">Edit Profile</button>
            </div>
            
            {profile.bio && (
              <div className="profile-bio">
                <h4>About Me</h4>
                <p>{profile.bio}</p>
              </div>
            )}
          </div>
        )}
        
        <div className="volunteer-reports">
          <div className="reports-header">
            <h2>Stray Animal Reports</h2>
            <div>
              <button onClick={fetchReports} className="refresh-button">
                Refresh Reports
              </button>
              <button onClick={() => !editingReport && setShowReportForm(!showReportForm)} className="report-button">
                {showReportForm && !editingReport ? "Cancel Report" : "Report Stray Animal"}
              </button>
            </div>
          </div>
          
          {showReportForm && (
            <div className="report-form">
              <h3>{editingReport ? "Edit Animal Report" : "New Animal Report"}</h3>
              
              <div className="form-group">
                <label>Animal Type:</label>
                <select
                  name="animalType"
                  value={editingReport ? editingReport.animal_type : newReport.animalType}
                  onChange={handleReportChange}
                  className="animal-select"
                  required
                >
                  <option value="">-- Select Animal Type --</option>
                  {animalOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {editingReport?.animal_type === 'Other' || newReport.animalType === 'Other' ? (
                  <div className="form-group other-animal">
                    <label>Please specify:</label>
                    <input
                      type="text"
                      name="otherAnimalType"
                      value={editingReport ? editingReport.other_animal_type || '' : newReport.otherAnimalType || ''}
                      onChange={handleReportChange}
                      placeholder="Enter animal type"
                    />
                  </div>
                ) : null}
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
                {(editingReport?.imagePreview || newReport.imagePreview) && (
                  <img 
                    src={editingReport ? editingReport.imagePreview : newReport.imagePreview} 
                    alt="Animal Preview" 
                    className="image-preview" 
                  />
                )}
                {(editingReport?.image_url && !editingReport?.imagePreview) && (
                  <img 
                    src={editingReport.image_url} 
                    alt="Current Animal Image" 
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
          
          {isLoading ? (
            <div className="loading-indicator">
              <div className="loading-spinner"></div>
              <p>Loading reports...</p>
            </div>
          ) : (
            <div className="reports-list">
              <h3>Your Reports</h3>
              
              {reports.length === 0 ? (
                <p>You haven't submitted any reports yet.</p>
              ) : (
                <div className="reports-grid">
                  {reports.map(report => (
                    <div key={report.id} className="report-card vertical-layout">
                      {report.image_url && (
                        <div className="image-container">
                          <img src={report.image_url} alt="Reported Animal" className="report-image" />
                        </div>
                      )}
                      <div className="report-details">
                        <h4>
                          {report.animal_type.startsWith('Other:') 
                            ? report.animal_type 
                            : report.animal_type}
                        </h4>
                        <p><strong>Location:</strong> {report.location}</p>
                        <p><strong>Date:</strong> {new Date(report.created_at).toLocaleDateString()}</p>
                        <p><strong>Status:</strong> <span className={`status-badge status-${(report.status || 'pending').toLowerCase()}`}>
                          {report.status ? (report.status.charAt(0).toUpperCase() + report.status.slice(1)) : 'Pending'}
                        </span></p>
                        
                        <div className="report-actions">
                          {(report.status === "pending" || !report.status) && (
                            <button onClick={() => startEditReport(report)} className="edit-report-button">
                              Edit
                              </button>
                            )}
                            <button onClick={() => deleteReport(report.id, report.status)} className="delete-report-button">
                              Delete
                            </button>
                        </div>
                        
                        {report.caregiver_notes && (
                          <div className="caregiver-feedback">
                            <p><strong>Caregiver Notes:</strong> {report.caregiver_notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Volunteers;