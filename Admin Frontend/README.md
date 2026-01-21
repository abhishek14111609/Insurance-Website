# Pashudhan Suraksha - Admin Frontend

> Modern, secure admin panel for managing the Pashudhan Suraksha insurance platform

[![React](https://img.shields.io/badge/React-19.2.0-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.2.4-646CFF.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/license-Private-red.svg)]()

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Development](#development)
- [Build & Deployment](#build--deployment)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Security](#security)
- [Contributing](#contributing)

## 🎯 Overview

The Admin Frontend is a comprehensive management dashboard for the Pashudhan Suraksha insurance platform. It provides administrators with tools to manage agents, policies, customers, claims, commissions, and more.

### Key Highlights

- ✅ **Secure Authentication** - HTTP-only cookie-based auth (XSS protected)
- ✅ **Fully Responsive** - Works seamlessly on mobile, tablet, and desktop
- ✅ **Modern UI/UX** - Clean, intuitive interface with smooth animations
- ✅ **Role-Based Access** - Admin-only access with protected routes
- ✅ **Real-time Updates** - Live data synchronization with backend

## ✨ Features

### Dashboard
- Real-time statistics (agents, policies, customers, claims)
- Pending approvals overview
- Quick action buttons
- Recent activity tracking

### Agent Management
- View all agents with detailed information
- Approve/reject agent registrations
- KYC document verification
- Edit agent profiles
- Commission tracking

### Policy Management
- Create and manage policy plans
- Approve/reject policy applications
- View policy details and documents
- Track policy status

### Customer Management
- View all customers
- Customer profile details
- Policy history
- Transaction records

### Financial Operations
- Commission settings configuration
- Commission approval workflow
- Withdrawal request processing
- Claim approvals

### Communication
- Customer inquiry management
- Reply to inquiries
- Notification system

## 🛠️ Tech Stack

### Core
- **React 19.2.0** - UI library
- **Vite 7.2.4** - Build tool & dev server
- **React Router DOM 7.12.0** - Client-side routing

### State Management
- **React Context API** - Global state management
- **React Hooks** - Component state

### HTTP & API
- **Axios 1.6.7** - HTTP client
- **REST API** - Backend communication

### UI & Styling
- **Vanilla CSS** - Custom styling with CSS variables
- **React Hot Toast** - Toast notifications
- **Responsive Design** - Mobile-first approach

### Development Tools
- **ESLint** - Code linting
- **Vite SWC** - Fast refresh

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 or **yarn** >= 1.22.0
- **Git** (for version control)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Insurance-Website/Admin Frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Then edit `.env` with your configuration (see [Environment Variables](#environment-variables))

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api
# For production: https://pashudhansurakshabackend.onrender.com/api

# Payment Gateway (Razorpay)
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

### Environment Variable Descriptions

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_API_URL` | Backend API base URL | Yes | - |
| `VITE_RAZORPAY_KEY_ID` | Razorpay public key for payments | Yes | - |

**⚠️ Important:** Never commit `.env` files to version control. Use `.env.example` as a template.

## 💻 Development

### Running the Dev Server

```bash
npm run dev
```

- Opens at `http://localhost:5173`
- Hot Module Replacement (HMR) enabled
- Fast refresh with Vite

### Code Linting

```bash
npm run lint
```

### Building for Production

```bash
npm run build
```

Output will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## 🏗️ Build & Deployment

### Production Build

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Deployment Options

#### Vercel (Recommended)

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts

The `vercel.json` configuration is already set up for SPA routing.

#### Other Platforms

The build output in `dist/` can be deployed to:
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Any static hosting service

### Environment Variables in Production

Make sure to set all required environment variables in your deployment platform:
- Vercel: Project Settings → Environment Variables
- Netlify: Site Settings → Build & Deploy → Environment

## 📁 Project Structure

```
Admin Frontend/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable components
│   │   ├── ErrorBoundary.jsx
│   │   └── ProtectedRoute.jsx
│   ├── context/         # React Context providers
│   │   └── AuthContext.jsx
│   ├── pages/           # Page components
│   │   ├── Auth/        # Authentication pages
│   │   ├── Agents/      # Agent management
│   │   ├── Policies/    # Policy management
│   │   ├── Dashboard.jsx
│   │   └── ...
│   ├── services/        # API services
│   │   └── api.service.js
│   ├── utils/           # Utility functions
│   │   ├── numberUtils.js
│   │   └── ...
│   ├── App.jsx          # Main app component
│   ├── App.css          # Global styles
│   ├── main.jsx         # Entry point
│   └── index.css        # Base styles
├── .env                 # Environment variables (not in git)
├── .env.example         # Environment template
├── index.html           # HTML template
├── package.json         # Dependencies
├── vite.config.js       # Vite configuration
└── vercel.json          # Vercel deployment config
```

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## 🔒 Security

### Authentication

- **HTTP-only Cookies** - Tokens stored securely, not accessible via JavaScript
- **CORS Protection** - Configured with `withCredentials: true`
- **Role-Based Access** - Admin-only routes protected
- **Token Refresh** - Automatic token renewal on expiry

### Best Practices

- ✅ No sensitive data in localStorage
- ✅ XSS protection via HTTP-only cookies
- ✅ CSRF protection (backend)
- ✅ Input validation
- ✅ Error boundaries for graceful failures

### Security Checklist

Before deploying to production:

- [ ] Remove all `console.log()` statements
- [ ] Verify environment variables are set
- [ ] Run `npm audit` and fix vulnerabilities
- [ ] Test authentication flow
- [ ] Verify HTTPS is enabled
- [ ] Check CORS configuration

## 🐛 Troubleshooting

### Common Issues

**Issue: "Cannot connect to backend"**
- Solution: Check `VITE_API_URL` in `.env` file
- Verify backend server is running

**Issue: "401 Unauthorized"**
- Solution: Clear browser cookies and login again
- Check if backend JWT_SECRET matches

**Issue: "Build fails"**
- Solution: Delete `node_modules` and `package-lock.json`
- Run `npm install` again

## 📝 Contributing

### Development Workflow

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Run linting: `npm run lint`
4. Test thoroughly
5. Commit: `git commit -m "Add your feature"`
6. Push: `git push origin feature/your-feature`
7. Create a Pull Request

### Code Style

- Use functional components with hooks
- Follow ESLint rules
- Use meaningful variable names
- Add comments for complex logic
- Keep components small and focused

## 📞 Support

For issues or questions:
- Create an issue in the repository
- Contact the development team

## 📄 License

This project is private and proprietary.

---

**Built with ❤️ by the Pashudhan Suraksha Team**

Last Updated: January 21, 2026
