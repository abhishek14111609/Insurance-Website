# Admin Frontend - Technical Debt & Issues Tracker

**Last Updated:** January 21, 2026  
**Project:** Pashudhan Suraksha - Admin Frontend  
**Version:** 1.0

---

## 🔴 Critical Issues (Fix Immediately)

### ISSUE-001: Console Statements in Production
**Severity:** Critical  
**Type:** Code Quality  
**Status:** 🔴 Open  
**Effort:** 2-3 hours

**Description:**  
Found 43 console statements throughout the codebase that will expose debugging information in production.

**Locations:**
- `console.log()`: 3 instances
  - `src/utils/adminUtils.js:225`
  - `src/pages/CommissionSettings.jsx:26`
  - `src/pages/CommissionSettings.jsx:50` (commented)
- `console.error()`: 40+ instances across all page components

**Impact:**
- Performance degradation
- Security risk (exposing internal errors)
- Unprofessional appearance

**Solution:**
1. Remove all console.log statements
2. Replace console.error with proper error tracking service (Sentry)
3. Or create custom logger that's disabled in production

**Code Example:**
```javascript
// Before
console.error('Error loading data:', error);

// After
import { logError } from '@/utils/errorLogger';
logError('Error loading data', error);
```

---

### ISSUE-002: Invalid Axios Version
**Severity:** Critical  
**Type:** Dependency  
**Status:** 🔴 Open  
**Effort:** 30 minutes

**Description:**  
Package.json lists axios version as "^1.13.2" which doesn't exist. Latest is ~1.6.x.

**Location:** `package.json:13`

**Impact:**
- Build may fail
- Unpredictable behavior
- Security vulnerabilities

**Solution:**
```json
// Change from:
"axios": "^1.13.2"

// To:
"axios": "^1.6.2"
```

Then run: `npm install`

---

### ISSUE-003: No Error Boundaries
**Severity:** Critical  
**Type:** Error Handling  
**Status:** 🔴 Open  
**Effort:** 2 hours

**Description:**  
No React Error Boundaries implemented. Any unhandled error will crash the entire app.

**Impact:**
- Poor user experience
- No graceful degradation
- Lost user data on crash

**Solution:**
Create ErrorBoundary component and wrap App:

```javascript
// src/components/ErrorBoundary.jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    logError('ErrorBoundary caught:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

---

### ISSUE-004: Demo Credentials Exposed
**Severity:** High  
**Type:** Security  
**Status:** 🔴 Open  
**Effort:** 15 minutes

**Description:**  
Admin login page displays demo credentials in production.

**Location:** `src/pages/Auth/AdminLogin.jsx:123-127`

**Impact:**
- Security risk
- Unauthorized access potential

**Solution:**
```javascript
// Option 1: Remove completely
// Delete lines 122-128

// Option 2: Show only in development
{import.meta.env.DEV && (
  <p className="demo-credentials">
    <strong>Demo Credentials:</strong><br />
    Email: admin@insurance.com<br />
    Password: admin123
  </p>
)}
```

---

## 🟡 High Priority Issues (Fix Soon)

### ISSUE-005: No Search or Filtering
**Severity:** High  
**Type:** Feature Gap  
**Status:** 🟡 Open  
**Effort:** 1-2 days

**Description:**  
All list pages (agents, customers, policies) have no search or filter functionality. Users must scroll through entire lists.

**Affected Pages:**
- AllAgents.jsx
- AllCustomers.jsx
- AllPolicyPlans.jsx
- PolicyApprovals.jsx
- AgentApprovals.jsx
- ClaimApprovals.jsx
- WithdrawalApprovals.jsx

**Impact:**
- Poor user experience
- Difficult to find specific records
- Scalability issues

**Solution:**
Implement search component:
```javascript
const [searchTerm, setSearchTerm] = useState('');
const filteredData = data.filter(item => 
  item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  item.email.toLowerCase().includes(searchTerm.toLowerCase())
);
```

---

### ISSUE-006: No Pagination
**Severity:** High  
**Type:** Performance  
**Status:** 🟡 Open  
**Effort:** 1 day

**Description:**  
All data loaded at once. With hundreds/thousands of records, this will cause performance issues.

**Impact:**
- Slow page loads
- High memory usage
- Poor UX with large datasets

**Solution:**
Implement server-side pagination:
```javascript
const [page, setPage] = useState(1);
const [limit] = useState(20);
const { data, total } = await api.getAgents({ page, limit });
```

---

### ISSUE-007: No Code Splitting
**Severity:** High  
**Type:** Performance  
**Status:** 🟡 Open  
**Effort:** 4 hours

**Description:**  
All components loaded upfront, resulting in large initial bundle.

**Impact:**
- Slow initial load
- Wasted bandwidth
- Poor performance on slow connections

**Solution:**
```javascript
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const AllAgents = lazy(() => import('./pages/Agents/AllAgents'));

// Wrap in Suspense
<Suspense fallback={<LoadingSkeleton />}>
  <Dashboard />
</Suspense>
```

---

### ISSUE-008: No Testing
**Severity:** High  
**Type:** Quality Assurance  
**Status:** 🟡 Open  
**Effort:** 3-5 days

**Description:**  
Zero test coverage. No unit tests, integration tests, or E2E tests.

**Impact:**
- High risk of regressions
- Difficult to refactor
- No confidence in changes

**Solution:**
1. Set up Vitest + React Testing Library
2. Write tests for utilities (100% coverage)
3. Write tests for critical flows (auth, approvals)
4. Set up CI/CD with test automation

---

## 🟢 Medium Priority Issues

### ISSUE-009: Toast Font Size Too Large
**Severity:** Medium  
**Type:** UI/UX  
**Status:** 🟢 Open  
**Effort:** 5 minutes

**Description:**  
Toast notifications use 24px font, which is too large and looks unprofessional.

**Location:** `src/App.jsx:232`

**Solution:**
```javascript
// Change from:
style: { fontSize: '24px' }

// To:
style: { fontSize: '14px' }
```

---

### ISSUE-010: No Loading Skeletons
**Severity:** Medium  
**Type:** UI/UX  
**Status:** 🟢 Open  
**Effort:** 1 day

**Description:**  
Only basic "Loading..." text shown. No skeleton screens.

**Impact:**
- Poor perceived performance
- Jarring content shifts

**Solution:**
Create skeleton components for each page type.

---

### ISSUE-011: Hardcoded Production URL
**Severity:** Medium  
**Type:** Configuration  
**Status:** 🟢 Open  
**Effort:** 15 minutes

**Description:**  
Production API URL hardcoded as fallback in api.service.js

**Location:** `src/services/api.service.js:4`

**Solution:**
```javascript
// Remove hardcoded URL, rely only on env vars
const API_BASE_URL = import.meta.env.VITE_API_URL;
if (!API_BASE_URL) {
  throw new Error('VITE_API_URL environment variable is required');
}
```

---

### ISSUE-012: No Request Timeout
**Severity:** Medium  
**Type:** Reliability  
**Status:** 🟢 Open  
**Effort:** 15 minutes

**Description:**  
Axios instance has no timeout. Requests can hang indefinitely.

**Solution:**
```javascript
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  withCredentials: true
});
```

---

### ISSUE-013: Duplicate Modal Code
**Severity:** Medium  
**Type:** Code Quality  
**Status:** 🟢 Open  
**Effort:** 4 hours

**Description:**  
Similar modal patterns duplicated across multiple components.

**Affected Files:**
- PolicyApprovals.jsx
- AgentApprovals.jsx
- ClaimApprovals.jsx
- WithdrawalApprovals.jsx

**Solution:**
Create reusable Modal component:
```javascript
// src/components/Modal.jsx
export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button onClick={onClose}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
};
```

---

## 🔵 Low Priority Issues

### ISSUE-014: No Dark Mode
**Severity:** Low  
**Type:** Feature  
**Status:** 🔵 Open  
**Effort:** 1-2 days

**Description:**  
No dark mode support. Modern apps typically offer this.

**Solution:**
Implement theme toggle with CSS variables.

---

### ISSUE-015: No TypeScript
**Severity:** Low  
**Type:** Code Quality  
**Status:** 🔵 Open  
**Effort:** 2-3 weeks

**Description:**  
Project uses JavaScript. TypeScript would provide better type safety.

**Solution:**
Gradual migration to TypeScript.

---

### ISSUE-016: No PropTypes
**Severity:** Low  
**Type:** Code Quality  
**Status:** 🔵 Open  
**Effort:** 1 day

**Description:**  
No runtime type checking for component props.

**Solution:**
Add PropTypes to all components or migrate to TypeScript.

---

### ISSUE-017: Default Vite Favicon
**Severity:** Low  
**Type:** Branding  
**Status:** 🔵 Open  
**Effort:** 30 minutes

**Description:**  
Still using default Vite favicon instead of custom icon.

**Location:** `index.html:5`

**Solution:**
Create and add custom favicon files.

---

### ISSUE-018: Commented Code
**Severity:** Low  
**Type:** Code Quality  
**Status:** 🔵 Open  
**Effort:** 15 minutes

**Description:**  
"Add Agent" navigation link is commented out.

**Location:** `src/App.jsx:97-104`

**Solution:**
Either enable the feature or remove the commented code.

---

## 📊 Technical Debt Summary

### By Severity
- 🔴 Critical: 4 issues
- 🟡 High: 4 issues
- 🟢 Medium: 6 issues
- 🔵 Low: 5 issues

**Total: 19 issues**

### By Type
- Code Quality: 7 issues
- Performance: 3 issues
- Security: 2 issues
- UI/UX: 3 issues
- Feature Gap: 2 issues
- Configuration: 2 issues

### By Effort
- < 1 hour: 6 issues
- 1-4 hours: 5 issues
- 1 day: 3 issues
- 2-5 days: 4 issues
- 1+ weeks: 1 issue

### Total Estimated Effort
- Critical: 5-6 hours
- High: 6-12 days
- Medium: 2-3 days
- Low: 4-6 days

**Grand Total: ~13-21 days of work**

---

## 🎯 Recommended Fix Order

### Sprint 1 (Week 1): Production Readiness
1. ISSUE-001: Console statements
2. ISSUE-002: Axios version
3. ISSUE-003: Error boundaries
4. ISSUE-004: Demo credentials
5. ISSUE-009: Toast font size
6. ISSUE-017: Favicon

**Effort:** 1 week

### Sprint 2 (Weeks 2-3): Core Improvements
1. ISSUE-005: Search & filtering
2. ISSUE-006: Pagination
3. ISSUE-007: Code splitting
4. ISSUE-011: Hardcoded URL
5. ISSUE-012: Request timeout
6. ISSUE-013: Reusable modals

**Effort:** 2 weeks

### Sprint 3 (Weeks 4-6): Quality & Testing
1. ISSUE-008: Testing
2. ISSUE-010: Loading skeletons
3. ISSUE-016: PropTypes
4. ISSUE-018: Commented code

**Effort:** 2-3 weeks

### Sprint 4 (Optional): Enhancements
1. ISSUE-014: Dark mode
2. ISSUE-015: TypeScript migration

**Effort:** 3-4 weeks

---

## 📝 Notes

### Dependencies to Add
- Error tracking: Sentry or LogRocket
- Testing: Vitest, React Testing Library
- Form validation: React Hook Form or Formik
- Date formatting: date-fns or dayjs

### Breaking Changes
None identified. All fixes are backward compatible.

### Migration Path
All issues can be fixed incrementally without major refactoring.

---

**Maintained By:** Development Team  
**Review Frequency:** Weekly  
**Next Review:** [Set date]
