import React, { useEffect, useState } from "react";
import supabase from "../utils/supabaseClient"; // Import Supabase client
import "../styles/HR.css";

function HR() {
  const [totalDonations, setTotalDonations] = useState(0);

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

  const handleLoginRedirect = () => {
    window.open("https://app.supabase.io/", "_blank");
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
    </div>
  );
}

export default HR;
