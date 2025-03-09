import React from "react";
import { Link } from "react-router-dom";
import "../styles/Footer.css";
import nature_and_us from "../Images/nature_and_us.png";
import pollution_extractor from "../Images/pollution_extractor.png";
import save_the_planet from "../Images/save_the_planet.png";
function Footer() {
    return (
        <footer className="footer">
            <div className="footer-content">
                <p>📍 NSAE Office: 1 Main Street, Dreamland, DL 00000, ULTRA PLANET</p>
                <p>📍 Safari Park: 2 Park Street, Dreamland, DL 00000, ULTRA PLANET</p>
                <p>📧 Contact HR: <a href="mailto:hr@nsae.org">hr@nsae.org</a></p>
                <h3>Our Partners</h3>
            </div>
            <div className= "footer-images">
                
                <img src = {nature_and_us} alt="Nature and Us" />
                <img src = {pollution_extractor} alt="Pollution Extractor" />
                <img src = {save_the_planet} alt="Save the Planet" />
             
       </div>
        </footer>
    );
}
export default Footer;
            