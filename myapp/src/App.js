import React, { useState, useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import CompanyRegister from './CompanyRegister';
import CompanyLogin from './companylogin';
import StudentPage from './studentpage';
import SCADPage from './scadpage';
import CompanyPage from './companypage';
import FacultyPage from './facultypage';
import ViewRegistration from './viewregistration';
import Jobs from './jobspage';
import MyApplications from "./studentapplications";
import ALLJobs from './allpostedjob';

function App() {
  // Manage notification state
 const [notification, setNotification] = useState({ message: '', email: '' });


  // Dummy users for login
  const dummyUsers = [
    {
      role: 'student',
      email: 'student@example.com',
      password: 'student123',
    },
    {
      role: 'student',
      email: 'student2@example.com',
      password: 'student123',
    },
    {
      role: 'scad',
      email: 'scad@example.com',
      password: 'scad123',
    },
    {
      role: 'faculty',
      email: 'faculty@example.com',
      password: 'faculty123',
    },
  ];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();

  // Handle form submission for login
 const handleLogin = (e) => {
  e.preventDefault();
  let valid = true;

  setEmailError('');
  setPasswordError('');

  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();

  const user = dummyUsers.find((u) => u.email === trimmedEmail);
  const companies = JSON.parse(localStorage.getItem('companies')) || [];
  const companyUser = companies.find((c) => c.companyEmail === trimmedEmail);

  if (user) {
    if (user.password !== trimmedPassword) {
      valid = false;
      setPasswordError('Wrong password');
    } else {
      sessionStorage.setItem('user', JSON.stringify(user));

      if (user.role === 'student') {
        navigate('/studentpage', { state: { user } });      
      } else if (user.role === 'scad') {
        navigate('/scadpage', { state: { user } });
      } else if (user.role === 'faculty') {
        navigate('/facultypage', { state: { user } });
      }
    }
  } else if (companyUser) {
    if (companyUser.password !== trimmedPassword) {
      valid = false;
      setPasswordError('Wrong password');
    } else {
      sessionStorage.setItem('currentCompany', JSON.stringify(companyUser)); // store as 'currentCompany' to match useEffect
      navigate('/company-dashboard', { state: { company:companyUser } });
    }
  } else {
    valid = false;
    setEmailError('Invalid email');
  }

  return valid;
};

  
const isInitialLoad = useState(true);
  useEffect(() => {
    // Check if the user is already logged in via localStorage
    // Check for existing user sessions on initial load
    if (isInitialLoad.current) {
      isInitialLoad.current = false; // Prevent this block from running again

      // const storedUser = localStorage.getItem('user');
      // if (storedUser) {
      //   const user = JSON.parse(storedUser);
      //   if (user.role === 'student') {
      //     navigate('/studentpage');
      //   } else if (user.role === 'scad') {
      //     navigate('/scadpage');
      //   } else if (user.role === 'faculty') {
      //     navigate('/facultypage');
      //   }
      // }

      const raw = sessionStorage.getItem('currentCompany');
      if (raw) {
        const companyUser = JSON.parse(raw);
        navigate('/company-dashboard', { state: {company:companyUser } });
      }
    }
  }, [navigate,isInitialLoad]);

  return (
    <div>
      <Routes>
        {/* Login Page */}
        <Route
          path="/"
          element={
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                backgroundColor: '#e6f0f5', // Light background
              }}
            >
              <div
                style={{
                  padding: '30px',
                  borderRadius: '10px',
                  backgroundColor: '#ffffff', // White background for the form
                  boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                  width: '400px',
                  textAlign: 'center',
                }}
              >
                {/* SCAD Logo */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
                  <img src="/scad.png" alt="SCAD Logo" style={{ width: '250px', height: 'auto' }} />
                </div>
                <h2 style={{ textAlign: 'center', color: '#385e72' }}>Login</h2>
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: '100%', marginBottom: '15px' }}>
                    <label htmlFor="email" style={{ fontWeight: 'bold', color: '#385e72', textAlign: 'left', display: 'block' }}>Email:</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="Enter your email"
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: `1px solid ${emailError ? '#ff4d4d' : '#ccc'}`,
                        borderRadius: '4px',
                      }}
                    />
                    {emailError && <div style={{ color: '#ff4d4d', fontSize: '12px' }}>{emailError}</div>}
                  </div>
                  <div style={{ width: '100%', marginBottom: '15px' }}>
                    <label htmlFor="password" style={{ fontWeight: 'bold', color: '#385e72', textAlign: 'left', display: 'block' }}>Password:</label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Enter your password"
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: `1px solid ${passwordError ? '#ff4d4d' : '#ccc'}`,
                        borderRadius: '4px',
                      }}
                    />
                    {passwordError && <div style={{ color: '#ff4d4d', fontSize: '12px' }}>{passwordError}</div>}
                  </div>
                  <button
                    type="submit"
                    style={{
                      padding: '10px',
                      backgroundColor: '#385e72',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      width: '100%',
                      cursor: 'pointer',
                    }}
                  >
                    Login
                  </button>
                  <a
                    href="/company-register"
                    style={{
                      marginTop: '15px',
                      color: '#385e72',
                      textDecoration: 'underline',
                      fontWeight: 'bold',
                      fontSize: '14px',
                    }}
                  >
                    Register as a Company
                  </a>
                  
                </form>
              </div>
            </div>
          }
        />

        {/* Other Pages */}
        <Route path="/company-register" element={<CompanyRegister />} />
        <Route path="/view-registration" element={<ViewRegistration setNotification={setNotification} />} />
        <Route path="/company-login" element={<CompanyLogin />} />
        <Route path="/studentpage" element={<StudentPage />} />
        <Route path="/scadpage" element={<SCADPage />} />
        <Route path="/company-dashboard" element={<CompanyPage />} />
        <Route path="/facultypage" element={<FacultyPage />} />
        <Route path="/jobspage" element={<Jobs setNotification={setNotification} />} />
        <Route path="/studentapplications" element={<MyApplications/>}/>
        <Route path= "/allpostedjobs" element={<ALLJobs/>}/>
      </Routes>

      {/* Display Notification Message */}
       {notification.message && (
        <div
          style={{
            position: 'fixed',
            top: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#6aabd2', // Blue Grotto
            color: 'white',
            padding: '10px',
            borderRadius: '4px',
          }}
        >
          <strong>{notification.email}</strong>: {notification.message}
        </div>
      )}
    </div>
  );
}

export default App;
