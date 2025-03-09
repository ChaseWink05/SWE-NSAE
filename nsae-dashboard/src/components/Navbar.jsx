import React from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css";
import logo from "../Images/Logo.jpg"; // Import the image

function Navbar() {
  return (
    <nav className="navbar">
      <div className="hamburger-menu">
        <div className="hamburger-icon">
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div className="dropdown-content">
          <Link to="/about">About Us</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/VolunteerSignup">Volunteer</Link> {/* Ensure this link points to the correct route */}
        </div>
      </div>
      <div className="navbar-logo">
        <Link to="/home"> {/* Wrap the logo with a Link component */}
          <img src={logo} alt="NSAE Logo" /> {/* Use the imported image */}
        </Link>
      </div>
      <ul className="navbar-links">
        <li><Link to="/Signup">Volunteer Now!</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;