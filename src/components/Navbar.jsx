import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Navbar.css";
import logo from "../Images/Logo.jpg"; // Import the image
import supabase from "../utils/supabaseClient"; // Ensure supabaseClient is properly imported

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
      // Removing the unsubscribe attempt
      // Since it's not necessary for your requirements, you can leave this out
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null); // Clear the user state when logging out
    navigate("/login"); // Navigate to the login page
  };

  const extractNameFromEmail = (email) => {
    const [name] = email.split("@");  // Take the part before '@' as the name
    return name.charAt(0).toUpperCase() + name.slice(1);  // Capitalize the first letter
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
          <Link to="/login">Login/Dashboard</Link> {/* Ensure this link points to the correct route */}
        </div>
      </div>
      <div className="navbar-logo">
        <Link to="/home"> {/* Wrap the logo with a Link component */}
          <img src={logo} alt="NSAE Logo" /> {/* Use the imported image */}
        </Link>
      </div>
      <ul className="navbar-links">
        <li><Link to="/Signup">Volunteer Now!</Link></li>
        <li><Link to="/donate" className="donate-link">Donate</Link> {/* Change Donate to a text link */}</li>
        {user && (
          <li className="user-info">
            <span className="user-name">Welcome, {extractNameFromEmail(user.email)}</span> {/* Display the user's name */}
            <button onClick={handleLogout}>Logout</button> {/* Button to log out */}
          </li>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
