No Stray Animals Ever (NSAE)
Overview
No Stray Animals Ever (NSAE) is a comprehensive animal rescue and management platform designed to help caregivers, volunteers, and administrators efficiently track and manage stray or abandoned animals. The system includes real-time dashboards, communication tools, scheduling features, and donation management to streamline operations.

Table of Contents
Developer Team and Roles
Vision Statement
Technical Stack
Features
User Stories
Setup and Installation
Known Issues
Future Improvements
Contributors
Acknowledgements

Developer Team and Roles
Anson Graumman – Developer
Developed front-end routing and page functionality.
Created caregiver, head caregiver, and volunteer profiles.
Built report submission and approval functionality.
Created footer and About Us page.
Managed database storage for user data and reports.
John McIntosh – Developer
Developed organization chat, including DMs and group chats.
Set up Supabase for storing chat data.
Created a Contact Us page with EmailJS integration.
Improved overall UI.
Chase Wink – Project Manager
Created navbar, homepage, and sign-up functionality.
Developed donation and profile editing functionality.
Built CEO and HR features for managing meetings and reports.
Assisted with chat functionality and user roles.

Vision Statement
FOR the NSAE animal welfare organization, caregivers, and volunteers
WHO need a centralized platform to manage and track stray or abandoned animal rescue operations
THE No Stray Animals Ever (NSAE) system is a comprehensive animal rescue and management platform
THAT provides real-time dashboards, scheduling, reporting, and communications among various roles
UNLIKE traditional spreadsheets or scattered solutions
OUR PRODUCT streamlines all essential operations in a single user-friendly interface

Technical Stack
Frontend: React (JavaScript/JSX)
Backend: Node.js (Express) + Supabase
Database: Supabase (PostgreSQL)
Styling: CSS Modules
Chat: Real-time database subscription
Tools: Visual Studio Code, GitHub, npm

Features
✅ Role-Based Dashboards – Custom dashboards for CEO, HR, Caregivers, Volunteers, and Board Members.
✅ Animal Reporting – Volunteers can report animals, and caregivers can update status (Pending/Approved/Rejected).
✅ Chat – Real-time communication among all users.
✅ Meetings – CEO and HR can schedule meetings and invite specific users.
✅ Donation Management – Secure form for donations.
✅ User Management – CEO and HR can create, delete, and manage user accounts.

User Stories
As a Volunteer, I want to report any strays that I may come across so that the caregivers can take care of them.
As an HR Manager, I want a dashboard to see all upcoming meetings and manage animal statuses.
As a CEO, I want to view total donations and schedule new meetings.
As a Caregiver, I want to see incoming animal reports and approve or reject them.
As a Donor, I want a secure and straightforward donation form to support the rescue mission.

To view
Follow this link
https://chasewink05.github.io/SWE-NSAE/
Then click the logo to view the home page

Known Issues
Payment Integration – Mock payment only; not tested for real transactions.
404 Error on Refresh – If the site is refreshed, a 404 error may occur.
Footer Misalignment – If the site is zoomed out, the footer may not stay at the bottom.
Initial Page Login - Sometimes on the initial page it brings you to a page with just the header and footer, click logo to resolve issue
Future Improvements
Add Veterinarian role for tracking medical records.
Improve payment integration with enhanced security.
Multi-language support.
More advanced chat features (e.g., private channels).

Contributors
Anson Graumman
John McIntosh
Chase Wink

Acknowledgements
React Docs
Supabase Docs
GitHub Pages Deployment
PostgreSQL Docs
JavaScript MDN Docs
React Router Docs
