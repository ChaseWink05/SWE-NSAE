import React, { useState, useEffect } from "react"; 

import { useNavigate } from "react-router-dom";
import "../styles/Login.css";
import supabase from "../utils/supabaseClient"; 

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  // Track if the user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const navigate = useNavigate();

     // Check if the user is already logged in on component mount
  useEffect(() => {
    const checkUser = async () => {
      // Using getUser() instead of user()
      const { data: userData, error } = await supabase.auth.getUser(); 
      
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
        } else if (userEmail === "volunteer@example.com") {
          navigate("/volunteer");
        } else if (userEmail === "boardmember@example.com") {
          navigate("/boardMembers");
        } else if (userEmail === "reptile-caregiver@example.com") {
          navigate("/caregivers");
        } else if (userEmail === "hr@example.com") {
          navigate("/hr");
        }else if (userEmail === "dog-caregiver@example.com") {
          navigate("/caregivers");
        }else if (userEmail === "cat-caregiver@example.com") {
          navigate("/caregivers");
        } else if (userEmail === "caregivers@example.com") {
          navigate("/caregivers");
        } else if (userEmail === "headcare@example.com") {
          navigate("/headcare");
        } else if (userEmail === "bird-caregiver@nsae.com") {
          navigate("/caregivers");
        }else if (userEmail === "wildlife-caregiver@nsae.com") {
          navigate("/caregivers");
        }else if (userEmail === "mamal-caregiver@nase.com") {
          navigate("/caregivers");
        }else if (userEmail === "other-caregiver@nase.com") {
          navigate("/caregivers");
        } else {
          // Default route for other users
          navigate("/volunteer"); 
        }
      }
    };

    checkUser();
  }, [navigate]);

  const handleLogin = async () => {
    // Log in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  
    if (error) {
      setMessage("Login failed: " + error.message);
      return;
    }

    // Get the logged-in user email
    const userEmail = data.user.email;

    // Navigate based on the email address
    if (userEmail === "ceo@example.com") {
      navigate("/ceo");
    } else if (userEmail === "handler@example.com") {
      navigate("/handler");
    } else if (userEmail === "volunteer@example.com") {
      navigate("/volunteer");
    } else if (userEmail === "boardmember@example.com") {
      navigate("/boardMembers");
    } else if (userEmail === "hr@example.com") {
      navigate("/hr");
    }else if (userEmail === "reptile-caregiver@example.com") {
      navigate("/caregivers");
    }else if (userEmail === "dog-caregiver@example.com") {
      navigate("/caregivers");
    }else if (userEmail === "cat-caregiver@example.com") {
      navigate("/caregivers");
    } else if (userEmail === "bird-caregiver@nsae.com") {
      navigate("/caregivers");
    }else if (userEmail === "wildlife-caregiver@nsae.com") {
      navigate("/caregivers");
    }else if (userEmail === "mamal-caregiver@nase.com") {
      navigate("/caregivers");
    }else if (userEmail === "other-caregiver@nase.com") {
      navigate("/caregivers");
    } else if (userEmail === "caregivers@example.com") {
      navigate("/caregivers");
    } else if (userEmail === "headcare@example.com") {
      navigate("/headcare");
    } else {
      // Default route if no match
      navigate("/volunteer"); 
    }
  };
  

  return (
    <div className="login-container">
      {/* Container for the login form */}
      <div className="login-form">
        <h2>Login</h2>
        {/* Input field for email */}
        <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        {/* Input field for password */}
        <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
        {/* Button to handle login */}
        <button onClick={handleLogin}>Login</button>
         {/* Button to navigate to signup page */}
        <button onClick={() => navigate("/signup")}>Sign Up</button>
        {/* Button to navigate to home page */}
        <button onClick={() => navigate("/Home")}>Home</button>
        {/* Display message if present */}
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
}

export default Login;
