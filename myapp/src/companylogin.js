import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// --- 1. IMPORT YOUR NOTIFICATION FUNCTIONS ---
import { getNotification, clearNotifications } from './notification.js'; 

function CompanyLogin() {
  // State management
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('You have no new notifications!');
  const [hasNotification, setHasNotification] = useState(false);
  const [canLogin, setCanLogin] = useState(true); // Default to true, actual check will happen
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const colors = {
    primary: { main: '#6366f1', dark: '#4f46e5', light: '#818cf8', lighter: '#e0e7ff', contrast: '#ffffff' },
    neutral: { 50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a' },
    error: '#ef4444', success: '#10b981', background: '#f8fafc'
  };

  // Fetches notifications and updates UI state
  const fetchAndDisplayNotifications = useCallback(() => {
    if (!email) { 
      setHasNotification(false);
      setNotificationMessage('You have no new notifications!');
      return;
    }
    // --- 2. USE getNotification ---
    // This will get notifications that were set with clearAfterRead: false by admin
    // or any other notifications for this email based on your notification.js logic.
    const userNotifications = getNotification(email); 

    if (userNotifications.length > 0) {
      setNotificationMessage(userNotifications[userNotifications.length - 1].message);
      setHasNotification(true); 
    } else {
      setHasNotification(false);
      setNotificationMessage('You have no new notifications!');
    }
  }, [email]);

  // Checks company status (isAccepted) and then fetches notifications
  const refreshCompanyStatusAndNotifications = useCallback(() => {
    if (!email) {
      setCanLogin(false); 
      fetchAndDisplayNotifications(); 
      return;
    }

    const companies = JSON.parse(localStorage.getItem('companies')) || [];
    const companyData = companies.find(c => c.companyEmail === email);

    if (companyData) {
      setCanLogin(companyData.isAccepted);
    } else {
      setCanLogin(false); 
    }
    fetchAndDisplayNotifications(); // This will call getNotification
  }, [email, fetchAndDisplayNotifications]);
  

  // Initialize email from location.state or localStorage
  useEffect(() => {
    const stateCompanyEmail = location.state?.company?.companyEmail;
    const storedCompany = JSON.parse(localStorage.getItem('currentCompany'));
    const storedCompanyEmail = storedCompany?.companyEmail;

    if (stateCompanyEmail) {
      setEmail(stateCompanyEmail);
      // Check for notifications potentially passed in location state (e.g., after registration)
      // This is separate from the global notification system but can coexist.
      if (location.state?.notificationMessage) {
        setNotificationMessage(location.state.notificationMessage);
        setHasNotification(true);
      }
    } else if (storedCompanyEmail) {
      setEmail(storedCompanyEmail);
    }
  }, [location.state]);


  // Main effect for refreshing data when email changes or storage is updated
  useEffect(() => {
    if (email) { 
        refreshCompanyStatusAndNotifications();
    }

    const handleStorageChange = (event) => {
      if (event.key === 'companies' || event.key === 'notifications' || event.key === null) {
        if (email) refreshCompanyStatusAndNotifications();
      }
    };
    
    // If your global setNotification dispatches an event, listen for it
    const handleGlobalNotification = (event) => {
        if(event.detail && event.detail.email === email){ // If notification is for current company
            refreshCompanyStatusAndNotifications();
        } else if (event.detail && !email && event.detail.email) { // If email not set, but notification has one
             // Potentially set email from notification and refresh, or just refresh generally
            refreshCompanyStatusAndNotifications();
        }
    }

    window.addEventListener('storage', handleStorageChange);
    // Make sure the event name matches what your setNotification might dispatch
    window.addEventListener('globalNotificationUpdate', handleGlobalNotification); 


    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('globalNotificationUpdate', handleGlobalNotification);
    };
  }, [email, refreshCompanyStatusAndNotifications]);


  const handleLogin = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!email) newErrors.email = 'Email is required';
    else if (!emailRegex.test(email)) newErrors.email = 'Invalid email format';
    if (!password) newErrors.password = 'Password is required';

    setErrors(newErrors);
    if (Object.keys(newErrors).length) return;

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    const companies = JSON.parse(localStorage.getItem('companies')) || [];
    const user = companies.find(c => c.companyEmail === email);

    if (!user) { 
      let errorMessage = 'Account not found or registration not approved.';
      // --- 3. CHECK NOTIFICATIONS ON FAILED LOGIN (NO USER) ---
      const userNotifications = getNotification(email); 
      const rejectionNotification = userNotifications.find(n => n.message.toLowerCase().includes('rejected'));
      if (rejectionNotification) {
        errorMessage = rejectionNotification.message; 
      }
      setErrors({ form: errorMessage });
    } else if (user.password !== password) {
      setErrors({ form: 'Incorrect password.' });
    } else if (!user.isAccepted) {
      let pendingMessage = 'Your account registration is still pending approval.';
      // --- 4. CHECK NOTIFICATIONS ON FAILED LOGIN (NOT ACCEPTED) ---
      const userNotifications = getNotification(email);
      const specificStatusMessage = userNotifications.length > 0 ? userNotifications[userNotifications.length - 1].message : null;
      if (specificStatusMessage) { 
        pendingMessage = specificStatusMessage;
      }
      setErrors({ form: pendingMessage });
    } else { 
      localStorage.setItem('currentCompany', JSON.stringify(user));
      
      // --- 5. CLEAR NOTIFICATIONS ON SUCCESSFUL LOGIN ---
      clearNotifications(email); 
      setHasNotification(false); 

      navigate('/company-dashboard', { state: { company: user } });
    }
    setIsLoading(false);
  };

  const togglePopup = () => {
    setShowPopup(prevShowPopup => {
        const willOpen = !prevShowPopup;
        if (willOpen && hasNotification && email) { 
            // --- 6. CLEAR NOTIFICATIONS WHEN POPUP IS OPENED ---
            clearNotifications(email); 
            setHasNotification(false);     
        }
        return willOpen;
    });
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      position: 'relative',
      backgroundColor: colors.background,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    }}>
      {/* Notification Bell */}
      <div onClick={togglePopup} style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: hasNotification ? colors.primary.lighter : 'transparent',
        transition: 'background-color 0.2s ease'
      }}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke={hasNotification ? colors.primary.main : colors.neutral[600]}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {hasNotification && (
          <span style={{
            position: 'absolute',
            top: '0',
            right: '0',
            backgroundColor: colors.error,
            color: 'white',
            fontSize: '10px',
            fontWeight: 'bold',
            width: '16px',
            height: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
          }}>!</span>
        )}
      </div>

      {/* Notification Popup */}
      {showPopup && (
        <div style={{
          position: 'absolute',
          top: '70px',
          right: '20px',
          width: '300px',
          padding: '16px',
          backgroundColor: '#fff',
          border: `1px solid ${colors.neutral[200]}`,
          borderRadius: '8px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          zIndex: 10,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <h3 style={{ 
              color: colors.neutral[800], 
              margin: 0, 
              fontSize: '16px', 
              fontWeight: 600 
            }}>
              Notifications
            </h3>
            <button 
              onClick={togglePopup} 
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colors.neutral[500]
              }}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div style={{
            padding: '12px',
            backgroundColor: notificationMessage.toLowerCase().includes('rejected') ? '#fee2e2' : 
                            notificationMessage.toLowerCase().includes('accepted') ? colors.primary.lighter : 
                            colors.neutral[100],
            borderRadius: '6px',
            color: notificationMessage.toLowerCase().includes('rejected') ? colors.error :
                   notificationMessage.toLowerCase().includes('accepted') ? colors.primary.dark : 
                   colors.neutral[600],
            fontSize: '14px',
            marginBottom: '12px',
            borderLeft: `4px solid ${
                notificationMessage.toLowerCase().includes('rejected') ? colors.error :
                notificationMessage.toLowerCase().includes('accepted') ? colors.primary.main :
                colors.neutral[300]
            }`
          }}>
            {notificationMessage}
          </div>
          <button 
            onClick={togglePopup} 
            style={{
              padding: '8px 12px',
              backgroundColor: colors.neutral[500],
              color: colors.primary.contrast,
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              width: '100%',
              transition: 'background-color 0.2s ease',
            }}
          >
            Close
          </button>
        </div>
      )}

      {/* Login Card */}
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        padding: '32px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        width: '380px',
        maxWidth: '90%'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="48" 
            height="48" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke={colors.primary.main}
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            style={{ marginBottom: '16px' }}
          >
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
          </svg>
          <h2 style={{ 
            color: colors.neutral[800], 
            fontSize: '24px', 
            fontWeight: '600',
            margin: 0
          }}>
            Company Login
          </h2>
          <p style={{ 
            color: colors.neutral[500], 
            fontSize: '14px',
            marginTop: '8px',
            marginBottom: 0
          }}>
            Sign in to access your company dashboard
          </p>
        </div>

        {errors.form && (
          <div style={{
            backgroundColor: errors.form.toLowerCase().includes('rejected') ? '#fee2e2' : 
                           errors.form.toLowerCase().includes('pending') ? '#ffedd5' : 
                           '#fef2f2', 
            color: errors.form.toLowerCase().includes('rejected') ? colors.error :
                   errors.form.toLowerCase().includes('pending') ? '#f97316' : 
                   colors.error,
            padding: '12px 16px',
            borderRadius: '6px',
            marginBottom: '20px',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderLeft: `4px solid ${
                errors.form.toLowerCase().includes('rejected') ? colors.error :
                errors.form.toLowerCase().includes('pending') ? '#f97316' :
                colors.error
            }`
          }}>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            {errors.form}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px' }}>
            <label 
              htmlFor="email" 
              style={{ 
                display: 'block', 
                marginBottom: '6px', 
                fontSize: '14px', 
                fontWeight: '500',
                color: colors.neutral[700]
              }}
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="your@company.com"
              value={email}
              onChange={e => setEmail(e.target.value.trim())}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: `1px solid ${errors.email ? colors.error : colors.neutral[300]}`,
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                boxSizing: 'border-box',
              }}
            />
            {errors.email && (
              <div style={{ 
                color: colors.error, 
                fontSize: '12px', 
                marginTop: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                {errors.email}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '6px'
            }}>
              <label 
                htmlFor="password" 
                style={{ 
                  fontSize: '14px', 
                  fontWeight: '500',
                  color: colors.neutral[700]
                }}
              >
                Password
              </label>
            </div>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: `1px solid ${errors.password ? colors.error : colors.neutral[300]}`,
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                boxSizing: 'border-box',
              }}
            />
            {errors.password && (
              <div style={{ 
                color: colors.error, 
                fontSize: '12px', 
                marginTop: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                 <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                {errors.password}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading} 
            style={{
              padding: '12px',
              width: '100%',
              backgroundColor: isLoading ? colors.neutral[400] : (canLogin ? colors.primary.main : colors.neutral[500]), 
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: isLoading ? 'not-allowed' : (canLogin ? 'pointer' : 'not-allowed'),
              transition: 'background-color 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            {isLoading ? (
              <>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  style={{ animation: 'spin 1s linear infinite' }}
                >
                  <line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                </svg>
                Signing in...
              </>
            ) : (
              canLogin ? 'Sign In' : 'Account Not Approved / Check Notifications' 
            )}
          </button>
        </form>

        <div style={{ 
          marginTop: '24px', 
          textAlign: 'center',
          fontSize: '14px',
          color: colors.neutral[600]
        }}>
          Don't have an account?{' '}
          <a 
            href="/company-register" 
            style={{ 
              color: colors.primary.main,
              textDecoration: 'none',
              fontWeight: '500'
            }}
          >
            Register now
          </a>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `
      }} />
    </div>
  );
}

export default CompanyLogin;