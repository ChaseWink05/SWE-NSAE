import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Navbar.css";
import logo from "../Images/Logo.jpg"; 
// Ensure supabaseClient is properly imported
import supabase from "../utils/supabaseClient"; 

function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Check for the current user session on initial load
  useEffect(() => {
    const session = supabase.auth.getSession();
    if (session) {
      setUser(session.user);
    }

    // Listen for changes in the auth session
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });

    // Cleanup listener on unmount
    return () => {
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // Clear the user state when logging out
    setUser(null); 
    // Navigate to the login page
    navigate("/login"); 
  };

  const extractNameFromEmail = (email) => {
    // Take the part before '@' as the name
    const [name] = email.split("@");  
    // Capitalize the first letter
    return name.charAt(0).toUpperCase() + name.slice(1);  
  };

  return (
    <nav className="navbar">
      <div className="hamburger-menu">
        <div className="hamburger-icon">
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div className="dropdown-content">
          <Link to="/Home">Home</Link>
          <Link to="/about">About Us</Link>
          <Link to="/email">Contact Us</Link>
          {/* Ensure this link points to the correct route */}
          <Link to="/login">Login/Dashboard</Link> 
        </div>
      </div>
      <div className="navbar-logo">
        {/* Wrap the logo with a Link component */}
        <Link to="/home"> 
        {/* Use the imported image */}
          <img src={logo} alt="NSAE Logo" /> 
        </Link>
      </div>
      <ul className="navbar-links">
        <li><Link to="/Signup">Volunteer Now!</Link></li>
        {/* Change Donate to a text link */}
        <li><Link to="/donate" className="donate-link">Donate</Link> </li>
        {user && (
          <li className="user-info">
            {/* Display the user's name */}
            <span className="user-name">Welcome, {extractNameFromEmail(user.email)}</span> 
            {/* Button to log out */}
            <button onClick={handleLogout}>Logout</button> 
          </li>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
