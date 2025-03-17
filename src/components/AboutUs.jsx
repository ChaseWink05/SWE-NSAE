import React from 'react';
import '../styles/AboutUs.css';
import heisneberg from '../Images/Heisenberg.jpg';
import jesse from '../Images/Jesse.png';
import gus from '../Images/Gus.png';
import mike from '../Images/Mike.png';
import saul from '../Images/SaulGoodMan.png';
import hank from '../Images/Hank.png';
import { Link } from "react-router-dom";

function AboutUs() {
  // Sample data for CEO and board members
  const ceo = {
    name: "Dr. Gustavo Fring",
    title: "Chief Executive Officer",
    image: gus,
    bio: "Dr. Fring has over 20 years of experience in animal welfare and has been instrumental in expanding our organization's reach and impact."
};
  
  const boardMembers = [
    {
      name: "Jesse Pinkman",
      title: "Chairperson",
      image: jesse,
      bio: "With a background in finance and a passion for animal welfare, Jessee has been instrumental in expanding our organization's reach and financial sustainability."
    },
    {
      name: "Dr. Saul Goodman",
      title: "Vice Chair & Research Director",
      image: saul,
      bio: "Dr. Goodman leads our research initiatives and has published extensively on urban wildlife management and stray animal care."
    },
    {
      name: "Walter White",
      title: "Treasurer",
      image : heisneberg,
      bio: "With 20 years in nonprofit financial management, Robert ensures our resources are used efficiently to maximize our impact on animal welfare."
    },
    {
      name: "Hank Schrader",
      title: "Community Outreach Director",
      image: hank,
      bio: "Hank's background in community organizing has helped us build strong partnerships with local businesses, schools, and government agencies."
    }
  ];

  return (
    <div className="about-us-container">
      <div className="hero-section">
        <h1>About NSAE</h1>
        <p className="mission-statement">
          Our mission is to protect and care for stray animals through rescue, rehabilitation, and community education.
        </p>
      </div>

      <section className="our-story">
        <h2>Our Story</h2>
        <div className="story-content">
          <p>
            Founded in 2015, the National Society for Animal Emergencies (NSAE) began as a small group of passionate volunteers 
            dedicated to helping stray and abandoned animals in urban areas. What started as weekend rescue missions has 
            grown into a nationwide network of caregivers, veterinarians, and advocates working together to provide 
            comprehensive care and support for animals in need.
          </p>
          <p>
            Today, NSAE operates in over 50 cities across the country, with thousands of volunteers and specialized 
            caregivers working tirelessly to rescue, rehabilitate, and rehome stray animals. Our organization also 
            focuses on community education, spay/neuter programs, and advocacy for stronger animal welfare policies.
          </p>
        </div>
      </section>

      <section className="leadership">
        <h2>Our Leadership</h2>
        
        <div className="ceo-section">
          <h3>Executive Leadership</h3>
          <div className="leader-card ceo-card">
            <div className="leader-image">
              <img src={ceo.image} alt={ceo.name} />
            </div>
            <div className="leader-info">
              <h4>{ceo.name}</h4>
              <p className="leader-title">{ceo.title}</p>
              <p className="leader-bio">{ceo.bio}</p>
            </div>
          </div>
        </div>

        <div className="board-section">
          <h3>Board of Directors</h3>
          <div className="board-grid">
            {boardMembers.map((member, index) => (
              <div key={index} className="leader-card board-card">
                <div className="leader-image">
                  <img src={member.image} alt={member.name} />
                </div>
                <div className="leader-info">
                  <h4>{member.name}</h4>
                  <p className="leader-title">{member.title}</p>
                  <p className="leader-bio">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="impact">
        <h2>Our Impact</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>15,000+</h3>
            <p>Animals rescued</p>
          </div>
          <div className="stat-card">
            <h3>50+</h3>
            <p>Cities with active teams</p>
          </div>
          <div className="stat-card">
            <h3>5,000+</h3>
            <p>Volunteers nationwide</p>
          </div>
          <div className="stat-card">
            <h3>95%</h3>
            <p>Placement rate for rescued animals</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AboutUs;