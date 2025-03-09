import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Signup.css";
import supabase from "../utils/supabaseClient"; // Import Supabase client

function Signup() {
  const [name, setName] = useState("");
  const [hometown, setHometown] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSignup = async () => {
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setMessage("Signup failed: " + error.message);
      return;
    }

    // Save additional user information to the database
    const { error: insertError } = await supabase
      .from("users")
      .insert([{ name, hometown, bio, email, password}]);

    if (insertError) {
      setMessage("Failed to save user information: " + insertError.message);
      return;
    }

    setMessage("Account has been created! Please check your email to confirm your account.");
    setTimeout(() => {
      navigate("/login");
    }, 3000); // Redirect to login page after 3 seconds
  };

  return (
    <div className="signup-container">
      <div className="signup-form">
        <h2>Sign Up</h2>
        <input type="text" placeholder="Full Name" onChange={(e) => setName(e.target.value)} />
        <input type="text" placeholder="Hometown" onChange={(e) => setHometown(e.target.value)} />
        <textarea placeholder="Bio" onChange={(e) => setBio(e.target.value)} />
        <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
        <button onClick={handleSignup}>Sign Up</button>
        <button onClick={() => navigate("/login")}>Login</button>
        <button onClick={() => navigate("/Home")}>Home</button>
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
}

export default Signup;
