import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Dashboard from "./components/Dashboard";
import Messages from "./components/Messages";
import Login from "./components/Login";
import CEOPage from "./components/CEOPage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Volunteers from "./components/Volunteers";
import BoardMembers from "./components/BoardMembers";
import Caregivers from "./components/Caregivers";
import HeadCare from "./components/HeadCaregivers";
import HR from "./components/HR";
import Signup from "./components/Signup"; // Import the Signup component
import EmailPage from "./components/EmailPage"; // Import the EmailPage component
import ChatApp from "./components/ChatApp";
import DonatePage from "./components/DonatePage";
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