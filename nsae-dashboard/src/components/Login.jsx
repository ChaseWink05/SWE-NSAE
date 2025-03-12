import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";
import supabase from "../utils/supabaseClient"; // Import Supabase client

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const predefinedCredentials = {
    ceo: { email: "ceo@example.com", password: "ceopassword", route: "/ceo" },
    handler: { email: "handler@example.com", password: "handlerpassword", route: "/handler" },
    volunteers: { email: "volunteer@example.com", password: "123", route: "/volunteer" },
    boardMembers: { email: "boardmember@example.com",password: "1233", route: "/boardMembers" },
    hr : { email: "hr@example.com", password: "hrpassword", route: "/hr" },
    caregivers : { email: "caregivers@example.com", password: "123", route: "/caregivers" },
    headcaregivers : { email: "headcare@example.com", password: "headcarepassword", route: "/headcare" },
    dogCaregiver: { email: "dog-caregiver@example.com", password: "123", route: "/caregivers" },
    catCaregiver: { email: "cat-caregiver@example.com", password: "123", route: "/caregivers" },
    reptileCaregiver: { email: "reptile-caregiver@example.com", password: "123", route: "/caregivers" }
  };
           
  const handleLogin = async () => {
    try {
      // Sign in all users with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
    
      if (error) {
        setMessage("Login failed: " + error.message);
        return;
      }
  
      // Check if this is a predefined user to determine the redirect route
      const predefinedUser = Object.values(predefinedCredentials).find(
        (user) => user.email.toLowerCase() === email.toLowerCase()
      );
  
      // Redirect based on user type
      if (predefinedUser) {
        console.log("Logged in as:", email, "- redirecting to", predefinedUser.route);
        navigate(predefinedUser.route);
      } else {
        console.log("Logged in as regular volunteer:", email);
        navigate("/volunteer");
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Login</h2>
        <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
        <button onClick={handleLogin}>Login</button>
        <button onClick={() => navigate("/signup")}>Sign Up</button>
        <button onClick={() => navigate("/Home")}>Home</button>
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
}

export default Login;