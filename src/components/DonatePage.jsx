import React, { useState } from "react";
import supabase from "../utils/supabaseClient"; // Import Supabase client
import "../styles/DonatePage.css";

function DonatePage() {
  const [amount, setAmount] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cvv, setCvv] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateAndDonate = async () => {
    if (cardNumber.length !== 16) {
      alert("Credit card number must be 16 digits!");
      return;
    }
    if (cvv.length !== 3) {
      alert("CVV must be 3 digits!");
      return;
    }
    if (!expiryDate.match(/^(0[1-9]|1[0-2])\/\d{2}$/)) {
      alert("Invalid expiration date! Use MM/YY format.");
      return;
    }

    // Check if the expiration date is "08/18"
    if (expiryDate === "08/18") {
      alert("This card is expired.");
      return;
    }

    // Check if the expiration date is before today
    const [expMonth, expYear] = expiryDate.split("/").map(Number);
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100; // Get last two digits of the current year
    const currentMonth = currentDate.getMonth() + 1; // Months are zero-based

    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
      alert("This card is expired.");
      return;
    }

    setIsLoading(true);
    const donationAmount = parseFloat(amount);
    if (isNaN(donationAmount) || donationAmount <= 0) {
      alert("Please enter a valid donation amount.");
      setIsLoading(false);
      return;
    }

    // Insert donation into Supabase
    const { error } = await supabase
      .from("donations")
      .insert([{ amount: donationAmount }]);

    if (error) {
      alert("Error processing donation: " + error.message);
    } else {
      alert(`Thank you for donating $${amount}!`);
      setAmount("");
      setCardNumber("");
      setCvv("");
      setExpiryDate("");
    }
    setIsLoading(false);
  };

  return (
    <div className="donate-page">
      <h1>Donate</h1>
      <input
        type="number"
        placeholder="Enter amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <input
        type="text"
        placeholder="Credit Card Number"
        maxLength="16"
        value={cardNumber}
        onChange={(e) => setCardNumber(e.target.value)}
      />
      <input
        type="text"
        placeholder="CVV"
        maxLength="3"
        value={cvv}
        onChange={(e) => setCvv(e.target.value)}
      />
      <input
        type="text"
        placeholder="Expiration Date (MM/YY)"
        value={expiryDate}
        onChange={(e) => setExpiryDate(e.target.value)}
      />
      <button onClick={validateAndDonate} disabled={isLoading}>
        {isLoading ? "Processing..." : "Confirm Donation"}
      </button>
    </div>
  );
}

export default DonatePage;