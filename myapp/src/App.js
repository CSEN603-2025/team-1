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
import AllStudents from './allstudents';
import CompanyInterns from './companyinterns';
import WorkshopPage from './workshop';
import ViewWorkshopsPage from './viewworkshop';
import MyInternshipsPage from './myinternships';
import CompanyProfile from './companyprofile';
import CompaniesForStudentsPage from './companiesforstudents';
import StudentProfilePage from './studentprofile';
import FacultyReport from './facultyreports';
import EvaluationPage from './evaluation';
import StatisticsDashboard from './statistics';
import AllJobsPosted from './companyallpostedjobs';
import AssessmentPage from './online-assessments';
import StudentWorkshops from './studentworkshops';
import AppointmentPage from './appointments';
import StudentJobs from './studentjobs';
import WhoViewedMyProfile from './viewprofile';

function App() {
  // Manage notification state
 const [notification, setNotification] = useState({ message: '', email: '' });
 
  

  // Dummy users for login
  const dummyUsers = [
    {
      role: 'student',
      email: 'student@example.com',
      password: 'student123',
      duration:0,
    },
    {
      role: 'pro',
      email: 'student2@example.com',
      password: 'student123',
      duration:3,
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
  const users = JSON.parse(localStorage.getItem('allUsers')) || [];

if (users.length === 0) {
  // Add dummy users only if the array is empty
  users.push(...dummyUsers); // Use spread syntax to add all dummy users individually
  localStorage.setItem('allUsers', JSON.stringify(users));
}
// console.log(users)

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

      if (user.role === 'student' || user.role === 'pro') {
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
  }, [navigate, isInitialLoad]);

  // Purple theme colors
  const theme = {
    primary: {
      main: '#6a4c93', // Main purple
      light: '#9d8bb0', // Light purple
      dark: '#4a2c73', // Dark purple
      veryLight: '#f5f0fa', // Very light purple for backgrounds
      transparent: 'rgba(85, 17, 116, 0.27)', // Transparent purple as requested
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
      light: '#ffffff',
    },
    error: '#d32f2f',
  };

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
                height: '100vh',
                width: '100%',
              }}
            >
              {/* Left Half - Welcome and Logo with transparent purple background */}
              <div
                style={{
                  flex: 1,
                  backgroundColor: theme.primary.transparent, // Transparent purple background
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '40px',
                }}
              >
                <img 
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/20240821000231%21German_University_in_Cairo_logo-JrPReAORyb41fBSa6NRLevScQhijEI.png" 
                  alt="GUC Logo" 
                  style={{ 
                    width: '50%', // Smaller logo
                    maxWidth: '300px', 
                    marginBottom: '40px' 
                  }} 
                />
                <h1 style={{ 
                  fontSize: '32px', 
                  color: 'black', 
                  textAlign: 'center',
                  fontWeight: 'bold',
                  marginBottom: '20px'
                }}>
                  Welcome to the GUC SCAD System
                </h1>
                <p style={{ 
                  fontSize: '18px', 
                  color: 'black', 
                  textAlign: 'center',
                  maxWidth: '600px',
                  lineHeight: '1.6'
                }}>
                  Student Career and Alumni Development portal for the German University in Cairo
                </p>
              </div>

              {/* Right Half - Login Form with light purple accents */}
              <div
                style={{
                  flex: 1,
                  backgroundColor: 'white',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  boxShadow: '-5px 0 15px rgba(0, 0, 0, 0.1)',
                }}
              >
                <div
                  style={{
                    width: '80%',
                    maxWidth: '400px',
                    padding: '40px 0',
                  }}
                >
                  <h2 style={{ 
                    textAlign: 'center', 
                    color: theme.primary.main, 
                    fontSize: '28px',
                    marginBottom: '40px'
                  }}>
                    Login to Your Account
                  </h2>
                  
                  <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ marginBottom: '20px' }}>
                      <label htmlFor="email" style={{ 
                        fontWeight: 'bold', 
                        color: theme.primary.main, 
                        display: 'block',
                        marginBottom: '8px'
                      }}>
                        Email:
                      </label>
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
                          padding: '12px',
                          border: `1px solid ${emailError ? theme.error : theme.primary.light}`,
                          borderRadius: '4px',
                          fontSize: '16px',
                          backgroundColor: theme.primary.veryLight,
                        }}
                      />
                      {emailError && <div style={{ color: theme.error, fontSize: '14px', marginTop: '5px' }}>{emailError}</div>}
                    </div>
                    
                    <div style={{ marginBottom: '25px' }}>
                      <label htmlFor="password" style={{ 
                        fontWeight: 'bold', 
                        color: theme.primary.main, 
                        display: 'block',
                        marginBottom: '8px'
                      }}>
                        Password:
                      </label>
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
                          padding: '12px',
                          border: `1px solid ${passwordError ? theme.error : theme.primary.light}`,
                          borderRadius: '4px',
                          fontSize: '16px',
                          backgroundColor: theme.primary.veryLight,
                        }}
                      />
                      {passwordError && <div style={{ color: theme.error, fontSize: '14px', marginTop: '5px' }}>{passwordError}</div>}
                    </div>
                    
                    <button
                      type="submit"
                      style={{
                        padding: '14px',
                        backgroundColor: theme.primary.main,
                        color: theme.text.light,
                        border: 'none',
                        borderRadius: '4px',
                        width: '105%',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        transition: 'background-color 0.3s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = theme.primary.dark}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = theme.primary.main}
                    >
                      Login
                    </button>
                    
                    <div style={{ textAlign: 'center', marginTop: '25px' }}>
                      <a
                        href="/company-register"
                        style={{
                          color: theme.primary.main,
                          textDecoration: 'none',
                          fontWeight: 'bold',
                          fontSize: '18px',
                        }}
                        onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
                      >
                        Register as a Company
                      </a>
                    </div>
                    
                    <div style={{ textAlign: 'center', marginTop: '15px' }}>
                      <button
                        onClick={() => {
                          localStorage.clear();
                          alert('Local storage cleared!');
                        }}
                        style={{
                          backgroundColor: 'transparent',
                          border: `1px solid ${theme.primary.light}`,
                          borderRadius: '4px',
                          padding: '8px 12px',
                          color: theme.primary.main,
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        Clear Local Storage
                      </button>
                    </div>
                  </form>
                </div>
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
        <Route path="/allstudents" element={<AllStudents />} />
        <Route path="/company/interns" element={<CompanyInterns />} />
        <Route path="/workshop" element={<WorkshopPage />} />
        <Route path="/viewworkshop" element={<ViewWorkshopsPage />} />
        <Route path="/myinternships" element={<MyInternshipsPage />} />
        <Route path="/companyprofile" element={<CompanyProfile />} />
        <Route path="/companiesforstudents" element={<CompaniesForStudentsPage />} />
        <Route path="/studentprofile" element={<StudentProfilePage />} />
        <Route path="/facultyreports" element={<FacultyReport />} />
        <Route path="/evaluation" element={<EvaluationPage />} />
        <Route path="/statistics" element={<StatisticsDashboard />} />
        <Route path="/online-assessments" element={<AssessmentPage />} />
        <Route path="/studentworkshops" element={<StudentWorkshops />} />
        <Route path="/appointments" element={<AppointmentPage />} />
        <Route path="/companyallpostedjobs" element={<AllJobsPosted />} />
        <Route path="/studentjobs" element={<StudentJobs />} />
        <Route path="/viewprofile" element={<WhoViewedMyProfile />} />
        {/* Add more routes as needed */}
      </Routes>

      {/* Display Notification Message */}
      {notification.message && (
        <div
          style={{
            position: 'fixed',
            top: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: theme.primary.main,
            color: theme.text.light,
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