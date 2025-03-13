import React, { useEffect, useState } from "react";
import supabase from "../utils/supabaseClient"; 
import "../styles/HR.css";

function HR() {
    const [totalDonations, setTotalDonations] = useState(0);
    const [animalReports, setAnimalReports] = useState([]);
    const [filteredReports, setFilteredReports] = useState([]);
    const [loading, setLoading] = useState(true);  // Add loading state
    const [selectedAnimalType, setSelectedAnimalType] = useState("All");
  
    // Fetch total donations from the donations table
    useEffect(() => {
      const fetchTotalDonations = async () => {
        const { data, error } = await supabase
          .from("donations")
          .select("amount");
  
        if (error) {
          console.error("Error fetching donations:", error);
        } else {
          const total = data.reduce((sum, donation) => sum + donation.amount, 0);
          setTotalDonations(total);
        }
      };
  
      fetchTotalDonations();
    }, []);
  
    // Fetch animal reports from the animal_reports table
    useEffect(() => {
      const fetchAnimalReports = async () => {
        const { data, error } = await supabase
          .from("animal_reports")
          .select("*");
  
        if (error) {
          console.error("Error fetching animal reports:", error);
        } else {
          console.log("Fetched animal reports:", data); // Log the fetched data
          setAnimalReports(data);
          setFilteredReports(data); // Initially, show all reports
        }
        setLoading(false);  // Set loading to false once fetching is complete
      };
  
      fetchAnimalReports();
    }, []);
  
    const handleLoginRedirect = () => {
      window.open("https://app.supabase.io/", "_blank");
    };
  
    // Filter reports based on selected animal type
    const handleAnimalFilter = (event) => {
      const selectedType = event.target.value;
      setSelectedAnimalType(selectedType);
  
      if (selectedType === "All") {
        setFilteredReports(animalReports); // Show all reports
      } else {
        const filtered = animalReports.filter((report) =>
          report.animal_type.toLowerCase() === selectedType.toLowerCase()
        );
        setFilteredReports(filtered); // Show filtered reports based on selection
      }
    };
  
    return (
      <div className="hr-page">
        <h1 className="hr-header">HR Dashboard</h1>
        <div className="hr-dashboard">
          <p>Welcome, HR! Here you can view reports and manage the organization.</p>
          <h2>Total Donations: ${totalDonations.toFixed(2)}</h2>
          <button onClick={handleLoginRedirect} className="hr-login-btn">
            Login to Supabase
          </button>
        </div>
  
        {/* Animal Filter Dropdown */}
        <div className="animal-filter">
          <label htmlFor="animal-type">Filter by Animal Type: </label>
          <select
            id="animal-type"
            value={selectedAnimalType}
            onChange={handleAnimalFilter}
          >
            <option value="All">All</option>
            <option value="Dog">Dog</option>
            <option value="Cat">Cat</option>
            <option value="Bird">Bird</option>
            <option value="Reptile">Reptile</option>
            <option value="Small Mammal">Small Mammal</option>
            <option value="Wildlife">Wildlife</option>
            <option value="Other">Other</option>
          </select>
        </div>
  
        {/* Check if loading is true */}
        {loading ? (
          <div>Loading animal reports...</div>
        ) : (
          <div className="animal-reports">
            <h2>Current Animal Reports</h2>
            <div className="report-list">
              {filteredReports.length === 0 ? (
                <p>No reports available.</p>
              ) : (
                filteredReports.map((report) => (
                  <div key={report.id} className="report-card">
                    <h3>{report.animal_type}</h3>
                    <p><strong>Location:</strong> {report.location}</p>
                    <p><strong>Description:</strong> {report.description}</p>
                    <p><strong>Status:</strong> {report.status || "Pending"}</p>
                    <p><strong>Caregiver Notes:</strong> {report.caregiver_notes || "N/A"}</p>
                    <p><strong>Reported On:</strong> {new Date(report.created_at).toLocaleDateString()}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
  
  export default HR;