import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function CompanyLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('You have no notifications!');
  const [hasNotification, setHasNotification] = useState(false);
  const [canLogin, setCanLogin] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  useEffect(() => {
    const stateCompany = location.state?.company;
    if (stateCompany) {
      setEmail(stateCompany.companyEmail);
      setCanLogin(stateCompany.isAccepted);
      if (stateCompany.hasNotification) {
        setHasNotification(true);
        setNotificationMessage('Your registration has been accepted!');
      }
      localStorage.setItem('currentCompany', JSON.stringify(stateCompany));
      sessionStorage.setItem('currentCompany', JSON.stringify(stateCompany));
    } else {
      const stored = JSON.parse(localStorage.getItem('currentCompany')) || {};
      if (stored) {
        setEmail(stored.companyEmail);
        setCanLogin(stored.isAccepted);
        if (stored.hasNotification) {
          setHasNotification(true);
          setNotificationMessage('Your registration has been accepted!');
        }
      }
    }
  }, [location.state]);

  const refreshState = useCallback(() => {
    const companies = JSON.parse(localStorage.getItem('companies')) || [];
    const user = companies.find(c => c.companyEmail === email);

    if (user) {
      setCanLogin(user.isAccepted);
      if (user.hasNotification) {
        setHasNotification(true);
        setNotificationMessage('Your registration has been accepted!');
      }
    } else {
      setCanLogin(false);
      setHasNotification(false);
    }
  }, [email]);

  useEffect(() => {
    refreshState();
    window.addEventListener('storage', refreshState);
    return () => window.removeEventListener('storage', refreshState);
  }, [email, refreshState]);

  const handleLogin = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!email) newErrors.email = 'Email is required';
    else if (!emailRegex.test(email)) newErrors.email = 'Invalid email format';
    if (!password) newErrors.password = 'Password is required';

    setErrors(newErrors);
    if (Object.keys(newErrors).length) return;

    const companies = JSON.parse(localStorage.getItem('companies')) || [];
    const user = companies.find(c => c.companyEmail === email);

    if (!user) {
      setErrors({ form: 'Invalid email' });
    } else if (user.password !== password) {
      setErrors({ form: 'Wrong password' });
    } else if (!user.isAccepted) {
      setErrors({ form: 'You are not accepted yet!' });
    } else {
      localStorage.setItem('currentCompany', JSON.stringify({
        ...user,
        hasNotification: user.hasNotification
      }));
      sessionStorage.setItem('currentCompany', JSON.stringify({
        ...user,
        hasNotification: user.hasNotification
      }));

      if (user.hasNotification) {
        const updated = companies.map(c =>
          c.companyEmail === email ? { ...c, hasNotification: false } : c
        );
        localStorage.setItem('companies', JSON.stringify(updated));
        sessionStorage.setItem('companies', JSON.stringify(updated));
      }

      navigate('/company-dashboard', { state: { company: user } });
    }
  };

  const togglePopup = () => {
    setShowPopup(prev => !prev);
    if (hasNotification) {
      setHasNotification(false);
    }
  };

  const inputStyle = (err) => ({
    width: '100%', padding: '8px', marginBottom: '5px',
    border: err ? '1px solid #ff4d4d' : '1px solid #ccc', boxSizing: 'border-box'
  });

  const errorText = (msg) => (
    <div style={{ color: '#ff4d4d', fontSize: '12px', marginTop: '5px' }}>{msg}</div>
  );

  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      minHeight: '100vh', position: 'relative', backgroundColor: '#e6f0f5'
    }}>
      <div onClick={togglePopup} style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="72" height="72"
          fill="#385e72"
          viewBox="0 0 24 24"
        >
          <path d="M12 2C10.34 2 9 3.34 9 5v1.07C6.72 7.25 5.14 9.36 5 12v5l-1 1v1h16v-1l-1-1v-5c-.14-2.64-1.72-4.75-4-5.93V5c0-1.66-1.34-3-3-3zm1 19h-2c0 1.1.9 2 2 2s2-.9 2-2z"/>
        </svg>
        {hasNotification && (
          <span style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            backgroundColor: '#ff4d4d',
            color: 'white',
            fontSize: '10px',
            padding: '3px 6px',
            borderRadius: '50%',
          }}>!</span>
        )}
      </div>

      {showPopup && (
        <div style={{
          position: 'absolute', top: '70px', right: '20px',
          width: '220px', padding: '10px',
          backgroundColor: '#fff', border: '1px solid #ddd',
          borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#385e72' }}>Notifications</h3>
          <p>{notificationMessage}</p>
          <button onClick={togglePopup} style={{
            padding: '5px', backgroundColor: '#4CAF50',
            color: 'white', border: 'none', borderRadius: '4px'
          }}>Close</button>
        </div>
      )}

      <div style={{
        background: '#fff', borderRadius: '8px', padding: '20px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '300px'
      }}>
        <h2 style={{ textAlign: 'center', color: '#385e72' }}>Company Login</h2>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '15px' }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={inputStyle(errors.email)}
            />
            {errors.email && errorText(errors.email)}
          </div>

          <div style={{ marginBottom: '15px' }}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={inputStyle(errors.password)}
            />
            {errors.password && errorText(errors.password)}
          </div>

          {errors.form && errorText(errors.form)}

          <div style={{ textAlign: 'center' }}>
            <button
              type="submit"
              disabled={!canLogin}
              style={{
                padding: '10px 20px', width: '100%',
                backgroundColor: canLogin ? '#385e72' : '#999',
                color: 'white', border: 'none', borderRadius: '5px',
                cursor: canLogin ? 'pointer' : 'not-allowed'
              }}
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CompanyLogin;
