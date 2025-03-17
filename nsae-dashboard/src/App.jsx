import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home.jsx";
import Dashboard from "./components/Dashboard.jsx";
import Messages from "./components/Messages.jsx";
import Login from "./components/Login.jsx";
import CEOPage from "./components/CEOPage.jsx";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Volunteers from "./components/Volunteers.jsx";
import BoardMembers from "./components/BoardMembers.jsx";
import Caregivers from "./components/Caregivers.jsx";
import HeadCare from "./components/HeadCaregivers.jsx";
import HR from "./components/HR.jsx";
import Signup from "./components/Signup.jsx"; // Import the Signup component
import EmailPage from "./components/EmailPage.jsx"; // Import the EmailPage component
import ChatApp from "./components/ChatApp.jsx";
import DonatePage from "./components/DonatePage.jsx";
import AboutUs from "./components/AboutUs.jsx";


function App() {
  return (
    <Router>
      <div>
        <Navbar /> {/* Include the Navbar component here */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/Home" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/signup" element={<Signup />} /> 
          <Route path="/login" element={<Login />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/ceo" element={<CEOPage />} />
          <Route path="/volunteer" element={<Volunteers />} />
          <Route path= "/volunteer" element={<Volunteers />} />
          <Route path= "/boardMembers" element={<BoardMembers />} />
          <Route path= "/caregivers" element={<Caregivers />} />
          <Route path= "/headcare" element={<HeadCare />} />
          <Route path= "/hr" element={<HR />} />
          <Route path= "/email" element={<EmailPage />} />
          <Route path= "/ChatApp" element={<ChatApp />} />
          <Route path="/donate" element={<DonatePage />} />
          <Route path="/about" element={<AboutUs />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;