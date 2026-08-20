import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { checkUserAuthStatus } from './api'

// We will build these components next!
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import SuperAdminDashboard from './pages/SuperAdminDashboard'
import RequestorDashboard from './pages/RequestorDashboard'
import SolverDashboard from './pages/SolverDashboard'
import ViewerDashboard from './pages/ViewerDashboard'
import ManagerDashboard from './pages/ManagerDashboard'

// Helper function to protect routes based on login status
const ProtectedRoute = ({ user, children, allowedRoles }) => {
  if (!user) {
    return <Navigate to="/" replace />;
  }
  if (allowedRoles) {
    const secRoles = (user.secondary_roles || '').split(',').map(r => r.trim());
    const hasRole = allowedRoles.includes(user.role) || allowedRoles.some(r => secRoles.includes(r));
    if (!hasRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }
  return children;
};

const LogoutHandler = ({ setUser }) => {
  React.useEffect(() => {
    sessionStorage.removeItem('ticket_user');
    setUser(null);
    window.location.href = '/';
  }, [setUser]);
  return null;
};

const AnimatedRoutes = ({ user, setUser }) => {
  const location = useLocation();

  return (
    <div key={location.pathname} className="page-transition" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Routes location={location}>
        {/* Public Login Route */}
        <Route path="/" element={
          !user ? <Login setUser={setUser} /> : (
            <Navigate to={
              user.role === 'Admin' || user.role === 'Superadmin' || user.role === 'Super Admin' ? '/admin' :
              user.role === 'Viewer' ? '/viewer' :
              user.role === 'Solver' ? '/solver' :
              user.role === 'Manager' || user.role === 'RM' ? '/manager' : '/requestor'
            } replace />
          )
        } />

        {/* Admin Routes */}
        <Route path="/admin/*" element={
          <ProtectedRoute user={user} allowedRoles={['Admin', 'Superadmin', 'Super Admin']}>
            <AdminDashboard user={user} setUser={setUser} />
          </ProtectedRoute>
        } />

        {/* Super Admin Routes */}
        <Route path="/superadmin/*" element={
          <ProtectedRoute user={user} allowedRoles={['Superadmin', 'Super Admin']}>
            <SuperAdminDashboard user={user} setUser={setUser} />
          </ProtectedRoute>
        } />

        {/* User Routes (Redirect legacy to requestor) */}
        <Route path="/user" element={<Navigate to="/requestor" replace />} />

        <Route path="/requestor/*" element={
          <ProtectedRoute user={user} allowedRoles={['User', 'Admin', 'Superadmin', 'Super Admin', 'Solver', 'Requestor', 'Manager', 'RM']}>
            <RequestorDashboard user={user} setUser={setUser} />
          </ProtectedRoute>
        } />

        <Route path="/solver/*" element={
          <ProtectedRoute user={user} allowedRoles={['User', 'Admin', 'Superadmin', 'Super Admin', 'Solver', 'Requestor', 'Manager', 'RM']}>
            <SolverDashboard user={user} setUser={setUser} />
          </ProtectedRoute>
        } />

        {/* Viewer Routes */}
        <Route path="/viewer/*" element={
          <ProtectedRoute user={user} allowedRoles={['Viewer']}>
            <ViewerDashboard user={user} setUser={setUser} />
          </ProtectedRoute>
        } />

        {/* Manager Dashboard Route */}
        <Route path="/manager/*" element={
          <ProtectedRoute user={user}>
            <ManagerDashboard user={user} setUser={setUser} />
          </ProtectedRoute>
        } />

        {/* Unauthorized Route */}
        <Route path="/unauthorized" element={
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '16px' }}>Unauthorized Access</h1>
            <p style={{ marginBottom: '24px' }}>You do not have permission to view this page.</p>
            <button 
              onClick={() => {
                sessionStorage.removeItem('ticket_user');
                setUser(null);
                window.location.href = '/';
              }}
              style={{ padding: '10px 20px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
            >
              Return to Login
            </button>
          </div>
        } />

        {/* Catch-all 404 */}
        <Route path="*" element={
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '16px' }}>404 - Page Not Found</h1>
            <button onClick={() => window.location.href = '/'} style={{ padding: '10px 20px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Go Home</button>
          </div>
        } />
        <Route path="/logout" element={
          <LogoutHandler setUser={setUser} />
        } />
      </Routes>
    </div>
  );
};

function App() {
  // Global state to track if a user is logged in
  const [user, setUser] = useState(JSON.parse(sessionStorage.getItem('ticket_user')) || null);

  // Instant deactivation listener: Checks session status periodically and on window focus
  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    const verifyUserSession = async () => {
      try {
        const res = await checkUserAuthStatus(user);
        if (res && res.active === false) {
          sessionStorage.removeItem('ticket_user');
          if (isMounted) {
            setUser(null);
            alert(res.error || "Your account has been deactivated by an administrator.");
            window.location.href = '/';
          }
        }
      } catch (err) {
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          const errMsg = err.response.data?.error || "Your account has been deactivated by an administrator.";
          sessionStorage.removeItem('ticket_user');
          if (isMounted) {
            setUser(null);
            alert(errMsg);
            window.location.href = '/';
          }
        }
      }
    };

    // Immediate check on mount/user change
    verifyUserSession();

    // Check periodically every 10 seconds
    const interval = setInterval(verifyUserSession, 10000);

    // Also verify when user returns/focuses the browser tab
    const handleFocus = () => verifyUserSession();
    window.addEventListener('focus', handleFocus);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user]);

  return (
    <Router>
      <div className="app-container">
        <AnimatedRoutes user={user} setUser={setUser} />
      </div>
    </Router>
  )
}

export default App