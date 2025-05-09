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

  // Load last-logged-in company from localStorage
  useEffect(() => {
    const stateCompany = location.state?.newCompany;
    const loadCompanyState = () => {
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
    };

    loadCompanyState();
  }, [location.state]);

  // Optimize refresh state when email changes using useCallback
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
      // Store user data in localStorage and sessionStorage
      localStorage.setItem('currentCompany', JSON.stringify({
        ...user,
        hasNotification: user.hasNotification
      }));
      sessionStorage.setItem('currentCompany', JSON.stringify({
        ...user,
        hasNotification: user.hasNotification
      }));

      // Update notification status if applicable
      if (user.hasNotification) {
        const updated = companies.map(c =>
          c.companyEmail === email ? { ...c, hasNotification: false } : c
        );
        localStorage.setItem('companies', JSON.stringify(updated));
        sessionStorage.setItem('companies', JSON.stringify(updated));
      }

      // Pass the company user data to the company dashboard
      navigate('/company-dashboard', { state: { company: user } });

    }
  };

  const togglePopup = () => {
    setShowPopup(prev => !prev);
    if (hasNotification) {
      setHasNotification(false); // Hide the notification alert when the popup is closed
    }
  };

  const inputStyle = (err) => ({
    width: '100%', padding: '8px', marginBottom: '5px',
    border: err ? '1px solid #ff4d4d' : '1px solid #ccc', boxSizing: 'border-box'
  });

  const errorText = (msg) => (
    <div style={{ color:'#ff4d4d', fontSize:'12px', marginTop:'5px' }}>{msg}</div>
  );

  return (
    <div style={{
      display:'flex', justifyContent:'center', alignItems:'center',
      minHeight:'100vh', position:'relative', backgroundColor: '#e6f0f5' // Light background
    }}>
      <div onClick={togglePopup} style={{
        position:'absolute', top:'20px', right:'20px', cursor:'pointer'
      }}>
        {hasNotification && (
          <div style={{
            position:'absolute', top:0, right:0,
            width:'25px', height:'25px',
            backgroundColor:'#ff4d4d', color:'white',
            borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'14px'
          }}>!</div>
        )}
        <img src="/bellicon.png" alt="Notifications" style={{
          width:'80px', height:'80px', // Bigger bell size
          transition: 'all 0.3s ease'
        }} />
      </div>

      {showPopup && (
        <div style={{
          position:'absolute', top:'70px', right:'20px',
          width:'220px', padding:'10px',
          backgroundColor:'#fff', border:'1px solid #ddd',
          borderRadius:'8px', boxShadow:'0 4px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#385e72' }}>Notifications</h3>
          <p>{notificationMessage}</p>
          <button onClick={togglePopup} style={{
            padding:'5px', backgroundColor:'#4CAF50',
            color:'white', border:'none', borderRadius:'4px'
          }}>Close</button>
        </div>
      )}

      <div style={{
        background:'#fff', borderRadius:'8px', padding:'20px',
        boxShadow:'0 4px 6px rgba(0,0,0,0.1)', width:'300px'
      }}>
        <h2 style={{ textAlign:'center', color: '#385e72' }}>Company Login</h2>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom:'15px' }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={inputStyle(errors.email)}
            />
            {errors.email && errorText(errors.email)}
          </div>

          <div style={{ marginBottom:'15px' }}>
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

          <div style={{ textAlign:'center' }}>
            <button
              type="submit"
              disabled={!canLogin}
              style={{
                padding:'10px 20px', width:'100%',
                backgroundColor: canLogin ? '#385e72' : '#999',
                color:'white', border:'none', borderRadius:'5px',
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