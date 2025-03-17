import React, { useState } from "react";
import emailjs from "@emailjs/browser";
import "../styles/EmailPage.css"; // Import styling if needed

function EmailPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const sendEmail = (e) => {
    e.preventDefault();

    // Prevent sending empty form
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      alert("Please fill out all fields before sending.");
      return;
    }

    setLoading(true); // Show loading state

    const emailParams = {
      from_name: formData.name,
      from_email: formData.email,
      subject: formData.subject,
      message: formData.message
    };

    emailjs
      .send(
        "service_fp7g3to", // Replace with your EmailJS Service ID
        "template_ho8plxr", // Replace with your EmailJS Template ID
        emailParams,
        "jE8nMyNB8y4VifjqD" // Replace with your EmailJS Public Key
      )
      .then(
        (response) => {
          alert("Email sent successfully!");
          console.log("Success:", response);
          setFormData({ name: "", email: "", subject: "", message: "" }); // Reset form
        },
        (error) => {
          alert("Failed to send email. Please try again later.");
          console.error("Error details:", error);
        }
      )
      .finally(() => setLoading(false)); // Remove loading state
  };

  return (
    <div className="email-container">
      <h2>Contact Us</h2>
      <form onSubmit={sendEmail} className="email-form">
        <input
          type="text"
          name="name"
          placeholder="Your Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Your Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="subject"
          placeholder="Subject"
          value={formData.subject}
          onChange={handleChange}
          required
        />
        <textarea
          name="message"
          placeholder="Your Message"
          value={formData.message}
          onChange={handleChange}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send Email"}
        </button>
      </form>
    </div>
  );
}

export default EmailPage;