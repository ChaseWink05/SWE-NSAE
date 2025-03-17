import { useState, useEffect } from 'react';
import supabase from '../utils/supabaseClient';
import reportService from '../services/ReportService';
import '../styles/Volunteer.css';
import './ChatApp'
import ChatApp from './ChatApp';

function Volunteers() {
  // Profile state
  const [profile, setProfile] = useState({
    name: '',
    town: '',
    bio: '',
    image: ''
  });
  
  // UI state
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showReportForm, setShowReportForm] = useState(false);
  const [showChat, setShowChat] = useState(false);
  
  // Reports state
  const [reports, setReports] = useState([]);
  const [newReport, setNewReport] = useState({
    animalType: '',
    otherAnimalType: '',
    location: '',
    description: '',
    imageFile: null,
    imagePreview: null,
    healthStatus: '',
    medicalNeeds: ''
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

  const [meetingsList, setMeetingsList] = useState([]); // List of meetings to display
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);

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
  
  // Load data on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          console.error("Error fetching authenticated user:", authError?.message);
          return;
        }
  
        // Fetch user profile from Supabase 'users' table
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("name, hometown, bio")
          .eq("id", user.id)
          .single();
  
        if (userError) {
          console.error("Error fetching user profile:", userError.message);
          return;
        }
  
        // Update profile state with fetched data
        setProfile({
          name: userData.name || "",
          town: userData.hometown || "",
          bio: userData.bio || "",
          image: ""
        });
  
      } catch (error) {
        console.error("Unexpected error fetching profile:", error);
      }
    };
  
    fetchUserProfile();
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

  const saveProfile = async () => {
    try {
      // Get authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error("User not authenticated:", authError?.message);
        alert("You must be logged in to update your profile.");
        return;
      }
  
      // Update user profile in Supabase
      const { error: updateError } = await supabase
        .from("users")
        .update({
          name: profile.name,
          hometown: profile.town,
          bio: profile.bio
        })
        .eq("id", user.id);
  
      if (updateError) {
        console.error("Error updating profile:", updateError.message);
        alert("Failed to update profile. Please try again.");
        return;
      }
  
      alert("Profile updated successfully!");
      setIsEditing(false); // Exit edit mode
  
    } catch (error) {
      console.error("Unexpected error updating profile:", error);
      alert("An unexpected error occurred.");
    }
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
      }else if (name === "healthStatus") {
          setEditingReport(prev => ({ ...prev, health_status: value }));
        }
        else if (name === "medicalNeeds") {
          setEditingReport(prev => ({ ...prev, medical_needs: value }));
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
          description: editingReport.description,
          healthStatus: editingReport.health_status,
          medicalNeeds: editingReport.medical_needs
        });
        
        await reportService.updateReport(editingReport.id, {
          animalType: finalAnimalType,
          location: editingReport.location,
          description: editingReport.description,
          healthStatus: editingReport.health_status,
          medicalNeeds: editingReport.medical_needs
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
          imageFile: newReport.imageFile,
          healthStatus: newReport.healthStatus,
          medicalNeeds: newReport.medicalNeeds
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
        imagePreview: null,
        healthStatus: '',
        medicalNeeds: ''
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
      description: report.description,
      healthStatus: report.health_status,
      medicalNeeds: report.medical_needs,
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
      imagePreview: null,
      healthStatus: '',
      medicalNeeds: ''
    });
  };

  return (
    <div className="volunteer-page">
      <h1>Volunteer Dashboard</h1>
      <div className = "meeting-list">
        <h3>Upcoming Meetings</h3>
        {meetingsList.length > 0 ? (
          <ul>
            {meetingsList.map((meeting) => (
              <li key={meeting.id}>
                <span>{meeting.time} - {meeting.topic}</span>
                </li>
            ))}
          </ul>
        ) : (
          <p>No upcoming meetings.</p>
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
              <input type="file" onChange={handleImageChange} />
            </div>
  
            <div className="button-group">
              <button onClick={saveProfile} className="save-button">Save Profile</button>
              <button onClick={() => setIsEditing(false)} className="cancel-button">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="profile-display">
            <h2>Welcome, {profile.name || "User"}!</h2>
            <button onClick={() => setIsEditing(true)} className="edit-profile-button">
              View/Edit Profile Details
            </button>
          </div>
        )}
  
        <div className="volunteer-reports">
          <div className="reports-header">
            <h2>Stray Animal Reports</h2>
            <div>
              <button onClick={fetchReports} className="refresh-button">
                Refresh Reports
              </button>
              <button 
                onClick={() => !editingReport && setShowReportForm(!showReportForm)} 
                className="report-button"
              >
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
              {(editingReport?.animal_type === 'Other' || newReport.animalType === 'Other') && (
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
              )}
            </div>
            <div className="form-group">
                <label>Animal Health Status:</label>
                <select
                  name="healthStatus"
                  value={editingReport ? editingReport.health_status || '' : newReport.healthStatus}
                  onChange={handleReportChange}
                  required
                >
                  <option value="">-- Select Health Status --</option>
                  <option value="healthy">Healthy</option>
                  <option value="needs_attention">Needs Medical Attention</option>
                  <option value="critical">Critical Condition</option>
                </select>
              </div>

              <div className="form-group">
                <label>Medical Needs (if any):</label>
                <textarea
                  name="medicalNeeds"
                  value={editingReport ? editingReport.medical_needs || '' : newReport.medicalNeeds}
                  onChange={handleReportChange}
                  placeholder="Describe any medical needs or concerns..."
                  rows={3}
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
                <input type="file" onChange={handleReportImageChange} />
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
                          {report.animal_type.startsWith("Other:") 
                            ? report.animal_type 
                            : report.animal_type}
                        </h4>
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
                        <p>
                          <strong>Status:</strong> 
                          <span className={`status-badge status-${(report.status || 'pending').toLowerCase()}`}>
                            {report.status ? (report.status.charAt(0).toUpperCase() + report.status.slice(1)) : "Pending"}
                          </span>
                        </p>
  
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