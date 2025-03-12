import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Dashboard from "./components/Dashboard";
import Messages from "./components/Messages";
import Login from "./components/Login";
import CEOPage from "./components/CEOPage";
import HandlerPage from "./components/Handler";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Volunteers from "./components/Volunteers";
import BoardMembers from "./components/BoardMembers";
import Caregivers from "./components/Caregivers";
import HeadCare from "./components/HeadCaregivers";
import HR from "./components/HR";
import Signup from "./components/Signup";
import EmailPage from "./components/EmailPage";

function App() {
  return (
      <Router>
        <div>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/Home" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/ceo" element={<CEOPage />} />
            <Route path="/handler" element={<HandlerPage />} />
            <Route path="/volunteer" element={<Volunteers />} />
            <Route path= "/boardMembers" element={<BoardMembers />} />
            <Route path= "/caregivers" element={<Caregivers />} />
            <Route path= "/headcare" element={<HeadCare />} />
            <Route path= "/hr" element={<HR />} />
            <Route path= "/email" element={<EmailPage />} />
          </Routes>
          <Footer />
        </div>
      </Router>
  );
}

export default App;