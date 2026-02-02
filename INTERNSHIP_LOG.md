# Internship Progress Report/Log
**Student Name:** [Your Name]
**Project Title:** Pashudhan Suraksha (Cattle Insurance Portal)
**Duration:** 08/12/2025 – 30/04/2026

---

## Weekly Work Log (Phase 1: Development & Implementation)

### Week 1: Dec 08 – Dec 13, 2025
**Focus:** Onboarding & Project Setup
- **Monday:** Orientation and understanding the problem statement: "Digitalizing Cattle Insurance for Rural India". Analyzing requirements for three user roles: Admin, Agent, and Customer.
- **Tuesday:** Finalized the technology stack (MERN: MongoDB, Express, React, Node.js). Set up the development environment (VS Code, Git, Node.js).
- **Wednesday:** Initialized the project repository. Created the basic folder structure for Backend and Frontend.
- **Thursday:** Designed the Database Schema (ER Diagram implementation) for `Users` and `Policies` using Mongoose.
- **Friday:** Set up the Express.js server and verified database connectivity with MongoDB.
- **Saturday:** Weekly review with mentor regarding the database architecture.

### Week 2: Dec 15 – Dec 20, 2025
**Focus:** Authentication & Security
- **Monday:** Implemented the Backend API for User Registration and Login.
- **Tuesday:** Integrated `bcryptjs` for password hashing and `jsonwebtoken` (JWT) for secure session management.
- **Wednesday:** Developed middleware for role-based access control (RBAC) to separate Admin and Customer routes.
- **Thursday:** Started working on the Frontend (React + Vite). Created the Login/Signup UI pages.
- **Friday:** Connected Frontend forms with Backend Auth APIs. Handled CORS issues and API errors.
- **Saturday:** Tested login flows for different user types and fixed session persistence issues.

### Week 3: Dec 22 – Dec 27, 2025
**Focus:** Admin Dashboard Development
- **Monday:** Designed the Admin Dashboard layout (Sidebars, Header).
- **Tuesday:** Created API endpoints to CRUD (Create, Read, Update, Delete) Policy Plans.
- **Wednesday:** Built the frontend forms for "Add Policy Plan" allowing admins to define premiums and coverage details.
- **Thursday:** Implemented a data table to view all registered users and agents in the admin panel.
- **Friday:** Added "Policy Approval" workflow where admins can accept or reject pending policy requests.
- **Saturday:** Cleaned up UI components and fixed responsive design issues on the Admin panel.

### Week 4: Dec 29, 2025 – Jan 03, 2026
**Focus:** Customer Portal & Policy Purchase Flow
- **Monday:** Designed the Customer Landing page and "About Us" section.
- **Tuesday:** Created the "Buy Policy" form for customers to enter cattle details (Tag ID, Breed, Age).
- **Wednesday:** Implemented file upload functionality (using Multer) for customers to upload cattle photos (Front, Back, Tag).
- **Thursday:** Integrated Razorpay Payment Gateway (Test Mode) for premium collection.
- **Friday:** Developed the logic to create a policy record in the database upon successful payment.
- **Saturday:** End-to-end testing of the policy purchase flow from a customer perspective.

### Week 5: Jan 05 – Jan 10, 2026
**Focus:** Agent Module Implementation
- **Monday:** Decided to separate the Agent Portal into a distinct frontend structure for better scalability.
- **Tuesday:** Created "Agent Registration" flow with referral code logic.
- **Wednesday:** Implemented "My Team" hierarchy logic. Agents can now see their sub-agents (downline).
- **Thursday:** Built the Agent Dashboard to display total sales, earnings, and wallet balance.
- **Friday:** Added "Sell Policy" feature for Agents (similar to customer buy flow but tagged to the agent).
- **Saturday:** Debugged issues where agent IDs were not linking correctly to sold policies.

### Week 6: Jan 12 – Jan 17, 2026
**Focus:** Commission Logic & PDF Generation
- **Monday:** Analyzed the commission structure (Direct commission vs Override commission for parent agents).
- **Tuesday:** Wrote the backend algorithm to calculate and distribute commissions dynamically based on policy duration.
- **Wednesday:** Integrated `PDFKit` to automatically generate the "Policy Certificate" PDF upon approval.
- **Thursday:** Designed the PDF layout to look professional (adding logos, signatures, and policy details).
- **Friday:** Added a "Download Policy" button in the Customer and Agent dashboards.
- **Saturday:** Fixed formatting issues in the generated PDF (dates and currency symbols).

### Week 7: Jan 19 – Jan 24, 2026
**Focus:** Advanced Features & Refinement
- **Monday:** Implemented "KYC & Bank Details" forms for Agents to receive payouts.
- **Tuesday:** Created the "Claims" module. Customers can now file a claim with photos and descriptions.
- **Wednesday:** Built the Admin interface to review and approve/reject Claims.
- **Thursday:** Refined the Commission Settings in Admin Panel to allow configuring percentages/fixed amounts dynamically.
- **Friday:** Worked on "Notification" system (basic alerts when a policy is approved).
- **Saturday:** Code refactoring and organizing backend routes for better maintainability.

### Week 8: Jan 26 – Feb 01, 2026 (Current)
**Focus:** Bug Fixes, CORS & Deployment Prep
- **Monday:** Encountered Cross-Origin (CORS) issues between the three frontends (Admin, Agent, Customer) and Backend.
- **Tuesday:** Fixed API Environment variables to correctly switch between Local (localhost) and Production URLs.
- **Wednesday:** Solved a critical bug where Seller Commissions were not being credited for specific Policy Plans.
- **Thursday:** Updated the "Commission Matrix" UI in Admin Panel to allow bulk editing of commissions per plan.
- **Friday:** Implemented "Team View" export to CSV feature for Agents.
- **Saturday:** Worked on implementing strict logic for Customer KYC (PAN/Aadhar) secure storage.
- **Sunday (Today):** Finalizing the "Production Logic Report" and preparing the codebase for valid internship documentation.

---

## Future Plan (Feb – April 2026)

- **February:** Intensive Testing (Unit & Integration), Performance Optimization (Lazy loading), Security Audits (Input validation).
- **March:** Deployment to Cloud (AWS/Vercel/Render), Domain Setup, Real-world Pilot Testing with limited users.
- **April:** Final Documentation, User Manual Creation, Project Presentation & Final Internship Report Submission.
