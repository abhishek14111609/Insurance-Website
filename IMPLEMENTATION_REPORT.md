# Unified Login Implementation Report

## Overview
A unified login system has been implemented within the **Customer Frontend**, acting as the central authentication gateway. This system allows Users, Agents, and Admins to log in from a single interface and be automatically redirected to their respective applications.

## Key Changes

### 1. Port Management
To ensuring reliable redirection between the three separate frontend applications, explicit ports have been assigned in each project's `vite.config.js`:
- **Customer Frontend:** Port `5173` (http://localhost:5173)
- **Admin Frontend:** Port `5174` (http://localhost:5174)
- **Agent Frontend:** Port `5175` (http://localhost:5175)

### 2. Login Page (`/src/pages/Login.jsx`)
A new Login component has been created in the Customer Frontend.
- **Features:** 
    - Dropdown menu to select User Type (Customer, Agent, Admin).
    - Username and Password fields.
    - Responsive design matching the "SecureLife" brand colors.
- **Logic:**
    - Upon successful login (mocked), the system checks the selected `User Type`.
    - **Customer:** Navigates internally to the customer dashboard/home.
    - **Admin/Agent:** Performs a hard redirect (`window.location.href`) to their specific ports (`5174` and `5175`).

### 3. Navigation Updates
- **Navbar (`/src/components/Navbar.jsx`):** Added a "Login/Register" link to the navigation menu for easy access.
- **Routing (`/src/App.jsx`):** Registered the new `/login` route.

## How to Run
1. Open 3 separate terminals.
2. Navigate to each folder (`Customer Frontend`, `Admin Frontend`, `Agent Frontend`) in a separate terminal.
3. Run `npm run dev` in all three terminals.
4. Open the Customer Frontend (http://localhost:5173).
5. Click "Login/Register" in the Navbar.

## Future Recommendations
- **Authentication State:** Implement a shared authentication mechanism (e.g., HTTP-only cookies on `localhost`) so the Admin/Agent apps can verify the user is logged in after redirection.
- **Registration:** Enhance the Login page to include a togglable "Sign Up" form.
