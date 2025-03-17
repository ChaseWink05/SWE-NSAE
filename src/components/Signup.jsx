import React, { useState, useEffect } from "react";
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
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track if the user is logged in
  const navigate = useNavigate();

  // Check if the user is already logged in on component mount
  useEffect(() => {
    const checkUser = async () => {
      const { data: userData, error } = await supabase.auth.getUser(); // Use getUser() instead of user()

      if (error) {
        console.error("Error fetching user:", error);
        return;
      }

      if (userData) {
        setIsLoggedIn(true);
        const userEmail = userData.user.email;

        // Navigate based on user email
        if (userEmail === "ceo@example.com") {
          navigate("/ceo");
        } else if (userEmail === "handler@example.com") {
          navigate("/handler");
        } else if (userEmail === "boardmember@example.com") {
          navigate("/boardMembers");
        } else if (userEmail === "hr@example.com") {
          navigate("/hr");
        } else if (userEmail === "caregivers@example.com") {
          navigate("/caregivers");
        } else if (userEmail === "headcare@example.com") {
          navigate("/headcare");
        } else {
          navigate("/volunteer"); // Default route for other users
        }
      }
    };

    checkUser();
  }, [navigate]);

  // If already logged in, redirect away from the signup page
  if (isLoggedIn) {
    return <div>Redirecting...</div>; // You can display a loading or redirect message
  }

  const handleSignup = async () => {
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setMessage("Signup failed: " + error.message);
      return;
    }

    // Insert or update user details in "users" table
    const { error: upsertError } = await supabase
      .from("users")
      .upsert([{ id: data.user.id, name, hometown, bio, email }], { onConflict: ["id"] }); // Handle conflict on `id`

    if (upsertError) {
      setMessage("Failed to save user information: " + upsertError.message);
      return;
    }
    // ✅ Debugging: Fetch user data after saving to confirm it was stored
    const { data: userData, error: fetchError } = await supabase
      .from("users")
      .select("id, name, hometown, bio, email")
      .eq("id", data.user.id)
      .single(); // Fetch only one user

    if (fetchError) {
      console.error("Error fetching user data:", fetchError.message);
      setMessage("User saved, but failed to verify data: " + fetchError.message);
      return;
    }

    console.log("✅ User data stored in database:", userData);

    setMessage(`Account created! Name: ${userData.name}, Hometown: ${userData.hometown}, Bio: ${userData.bio}`);

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
