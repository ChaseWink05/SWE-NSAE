import React from "react";
import { Link } from "react-router-dom";
import "../styles/Home.css";
import HappyDog from "../Images/HappyDog.jpg"; // Import an image
import rescueImage from "../Images/RescueImage.png"; // Import another image

function Home() {
  return (
    <div>
      <div className="home-container">
        <h1>Welcome to No Stray Animals Ever (NSAE)</h1>
        <p>
          We rescue and shelter stray animals. Learn more about our mission or sign up to volunteer!
        </p>
        <div className="home-section">
          <img src={HappyDog} alt="Dogo" className="home-image" />
          <div className="home-text">
            <h2>Our Mission</h2>
            <p>
              At NSAE, our mission is to rescue and provide shelter for stray animals. We believe that every animal deserves a loving home and a chance at a better life. Our dedicated team works tirelessly to ensure the safety and well-being of all animals in our care.
            </p>
          </div>
        </div>
        <div className="home-section">
          <img src={rescueImage} alt="Rescue Operations" className="home-image" />
          <div className="home-text">
            <h2>Rescue Operations</h2>
            <p>
              Our rescue operations are at the heart of what we do. We respond to calls from the community and work with local authorities to rescue animals in need. Our team is trained to handle a variety of situations, ensuring that each animal receives the care and attention they deserve.
            </p>
          </div>
        </div>
        <h3>Contact Information</h3>
        <p>📍 NSAE Office: 1 Main Street, Dreamland, DL 00000, ULTRA PLANET</p>
        <p>📍 Safari Park: 2 Park Street, Dreamland, DL 00000, ULTRA PLANET</p>
        <p>📧 Contact HR: <a href="mailto:hr@nsae.org">hr@nsae.org</a></p>
        
        <Link to="/signup" className="button">Become a Volunteer</Link>
        <Link to="/login" className="button">Login</Link>
      </div>
 
    </div>
  );
}

export default Home;