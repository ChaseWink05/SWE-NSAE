import React, { useState, useEffect } from "react";
import "../styles/Volunteer.css";

function Volunteers() {
  // Default profile info (normally would be fetched from a database)
  const [profile, setProfile] = useState({
    name: "",
    hobby: "",
    town: "",
    bio: "",
    image: ""
  });
  
  const [isEditing, setIsEditing] = useState(false);
  
  // Load volunteer profile from localStorage on component mount
  useEffect(() => {
    const savedProfile = localStorage.getItem("volunteer");
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
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
        <h2>Volunteer Reports</h2>
        <p>You have no pending reports.</p>
      </div>
    </div>
  );
}

export default Volunteers;