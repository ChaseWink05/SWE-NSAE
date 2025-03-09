import React from "react";
import "../styles/Dashboard.css"; // Import its specific CSS file

function Dashboard() {
  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">NSAE Dashboard</h2>
      <p className="dashboard-text">
        View animal reports, volunteer activities, and organization updates.
      </p>
    </div>
  );
}

export default Dashboard;
