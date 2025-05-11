import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
import {useNavigate, useLocation } from 'react-router-dom';

function StudentPage() {
  const [menuOpen, setMenuOpen] = useState(true);
  const [selectedMajor, setSelectedMajor] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    jobInterests: '',
    internships: '',
    partTimeJobs: '',
    collegeActivities: '',
  });
  const [draftProfile, setDraftProfile] = useState({ ...profile });
  const [activeSidebarItem, setActiveSidebarItem] = useState('home');
  const navigate = useNavigate();
  const location = useLocation();
  const student = location.state?.user;
  const [showCompanies, setShowCompanies] = useState(false); // State to control visibility of companies list
  const companies = JSON.parse(localStorage.getItem('companies')) ;
  useEffect(() => {
    const savedProfile = JSON.parse(localStorage.getItem('studentProfile'));
    const initialProfile = savedProfile || {
      name: '',
      email: student?.email || '',
      jobInterests: '',
      internships: '',
      partTimeJobs: '',
      collegeActivities: '',
    };

    setProfile(initialProfile);
    setDraftProfile(initialProfile);
  }, [student]);

  const handleEditClick = () => {
    setIsEditingProfile(true);
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    setDraftProfile(profile);
  };

 const handleDraftChange = (e) => {

    const { name, value } = e.target;

    if (name !== 'email') {

      setDraftProfile(prev => ({ ...prev, [name]: value }));

    }

  };

  const handleSaveProfile = () => {
    setProfile(draftProfile);
    localStorage.setItem('studentProfile', JSON.stringify(draftProfile));
    setIsEditingProfile(false);
    alert('Profile updated!');
    const studentUsers = JSON.parse(localStorage.getItem('studentusers'));
    studentUsers.push(draftProfile);
    localStorage.setItem('studentusers', JSON.stringify(studentUsers));
    // console.log('Retrieved students from localStorage:', studentUsers);
  };

  const [isMajorsOpen, setIsMajorsOpen] = useState(false);

  const handleMajorsToggle = () => {
    setIsMajorsOpen(!isMajorsOpen);
  };

  const handleProfileClick = () => {
    setShowProfile(true);
    setShowCompanies(false); // Ensure other views are hidden
    setIsEditingProfile(false);
    setActiveSidebarItem('profile');
  };

  const handleHomeClick = () => {
    setShowProfile(false);
    setShowCompanies(false); // Hide companies when going to home
    setIsMajorsOpen(false);
    setActiveSidebarItem('home');
  };

  const handleBrowseJobsClick = () => {
    setShowCompanies(false); // Hide companies when going to jobs
    setShowProfile(false); // Ensure other views are hidden
    setIsMajorsOpen(false);
    setActiveSidebarItem('jobs');
    navigate('/jobspage',{ state: { student } });
    console.log('Browse Jobs clicked');
  };

  const handleMyApplicationsClick = () => {
    setShowCompanies(false);  // Hide companies when going to applications
    setShowProfile(false); // Ensure other views are hidden
    setIsMajorsOpen(false);
    setActiveSidebarItem('applications');
    navigate('/studentapplications',{ state: { student } });
    console.log('My Applications clicked');
  };

  const handleSettingsClick = () => {
    setShowCompanies(false); // Hide companies when going to settings
    setShowProfile(false); // Ensure other views are hidden
    setIsMajorsOpen(false);
    setActiveSidebarItem('settings');
    console.log('Settings clicked');
  };

    const handleCompaniesClick = () => {
    setShowProfile(false); // Hide profile when going to companies
    // setShowMajorsOpen(false);
    setShowCompanies(true); // Show the companies list
    setActiveSidebarItem('companies');
  };

 const sidebarButtonStyle = (isActive) => ({
    backgroundColor: isActive ? '#5D6D7E' : 'transparent',
    border: 'none',
    padding: '10px 20px',
    color: isActive ? '#F1C40F' : 'white',
    textDecoration: 'none',
    cursor: 'pointer',
    font: 'inherit',
    width: '100%',
    textAlign: 'left',
    display: 'block',
    borderRadius: '5px',
    marginBottom: '5px',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
    },
  });

  return (
    <div style={{ display: 'flex' }}>
      {/* Sidebar */}
      <div
        style={{
          width: menuOpen ? '180px' : '0',
          height: '100vh',
          backgroundColor: '#34495E',
          transition: '0.3s',
          padding: menuOpen ? '20px' : '0',
          boxShadow: menuOpen ? '2px 0 5px rgba(0,0,0,0.2)' : 'none',
          overflowY: menuOpen ? 'auto' : 'hidden', // Add scrollbar when open
          position: 'fixed', // Make sidebar fixed
          top: 0,           // Stick to the top
          left: 0,          // Stick to the left
          zIndex: 2,
        }}
      >
        {menuOpen && (
          <ul style={{ listStyleType: 'none', padding: 0, marginTop: '20px' }}>
            <li>
              <button
                onClick={handleHomeClick}
                style={sidebarButtonStyle(activeSidebarItem === 'home')}
              >
                Home Page
              </button>
            </li>
            <li>
              <button
                onClick={handleProfileClick}
                style={sidebarButtonStyle(activeSidebarItem === 'profile')}
              >
                Profile
              </button>
            </li>
            <li>
              <button
                onClick={handleBrowseJobsClick}
                style={sidebarButtonStyle(activeSidebarItem === 'jobs')}
              >
                Jobs
              </button>
            </li>
            <li>
              <button
                onClick={handleMyApplicationsClick}
                style={sidebarButtonStyle(activeSidebarItem === 'applications')}
              >
                Applications
              </button>
            </li>
            <li style={{ marginBottom: '10px' }}>
              <button
                onClick={handleMajorsToggle}
                style={sidebarButtonStyle(activeSidebarItem === 'majors')}
              >
                Majors
              </button>
            </li>
            <li>
              <button
                onClick={handleSettingsClick}
                style={sidebarButtonStyle(activeSidebarItem === 'settings')}
              >
                Settings
              </button>
            </li>
             <li>
              <button
                onClick={handleCompaniesClick}
                style={sidebarButtonStyle(activeSidebarItem === 'companies')}
              >
                Companies
              </button>
            </li>
          </ul>
        )}
      </div>

      {/* Main Content */}
      <div style={{ flexGrow: 1, padding: '20px', marginLeft: menuOpen ? '300px' : '0', transition: '0.3s' }}>
        <button
          onClick={() => setMenuOpen(prev => !prev)}
          style={{
            fontSize: '24px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            position: 'absolute',
            top: '10px',
            left: menuOpen ? '300px' : '20px', // Adjust left position based on menuOpen
            color: 'black',
            transition: 'left 0.3s' // Add smooth transition
          }}
        >
          ☰
        </button>

        {!showProfile && !isMajorsOpen && !showCompanies && (
          <div>
            <h1>Welcome to the SCAD Managment System(SMS)</h1>
            <p>Use the sidebar to navigate.</p>
          </div>
        )}

        {showProfile && (
          <>
            <h1>Student Profile</h1>
            {!isEditingProfile ? (
              <div>
                <p><strong>Name:</strong> {profile.name}</p>
                <p><strong>Email:</strong> {student.email}</p>
                <p><strong>Job Interests:</strong> {profile.jobInterests || 'Not specified'}</p>
                <p><strong>Previous Internships:</strong> {profile.internships || 'No internships specified'}</p>
                <p><strong>Part-time Jobs:</strong> {profile.partTimeJobs || 'No part-time jobs specified'}</p>
                <p><strong>College Activities:</strong> {profile.collegeActivities || 'No activities specified'}</p>
                <button onClick={handleEditClick} style={{ padding: '8px 15px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' }}>
                  Edit Profile
                </button>
              </div>
            ) : (
              <div style={{ maxWidth: '600px', marginTop: '20px' }}>
                <label>Name:</label>
                <input
                  name="name"
                  value={draftProfile.name}
                  onChange={handleDraftChange}
                  style={{ width: '100%', marginBottom: '10px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
                <label>Email:</label>
                <input
                  name="email"
                  value={draftProfile.email}
                  onChange={handleDraftChange}
                  style={{ width: '100%', marginBottom: '10px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: '#f0f0f0' }}
                  readOnly
                />
                <p style={{ fontSize: '0.9em', color: '#666', marginBottom: '10px' }}>Email is not editable.</p>
                <label>Job Interests:</label>
                <textarea
                  name="jobInterests"
                  value={draftProfile.jobInterests}
                  onChange={handleDraftChange}
                  style={{ width: '100%', marginBottom: '10px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', minHeight: '80px' }}
                />
                <label>Previous Internships (Responsibilities, Duration, Company):</label>
                <textarea
                  name="internships"
                  value={draftProfile.internships}
                  onChange={handleDraftChange}
                  style={{ width: '100%', marginBottom: '10px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', minHeight: '100px' }}
                  placeholder="e.g., Software Development Intern - Developed features X and Y (3 months, Tech Company Inc.)"
                />
                <label>Part-time Jobs (Responsibilities, Duration, Company):</label>
                <textarea
                  name="partTimeJobs"
                  value={draftProfile.partTimeJobs}
                  onChange={handleDraftChange}
                  style={{ width: '100%', marginBottom: '10px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', minHeight: '100px' }}
                  placeholder="e.g., Customer Service Representative - Handled inquiries (6 months, Retail Corp.)"
                />
                <label>College Activities:</label>
                <textarea
                  name="collegeActivities"
                  value={draftProfile.collegeActivities}
                  onChange={handleDraftChange}
                  style={{ width: '100%', marginBottom: '10px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', minHeight: '80px' }}
                  placeholder="e.g., Member of Robotics Club, Volunteer at Campus Events"
                />
                <button onClick={handleSaveProfile} style={{ padding: '10px 20px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '10px' }}>
                  Save
                </button>
                <button onClick={handleCancelEdit} style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            )}
          </>
        )}

        {isMajorsOpen && (
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '300px',
              backgroundColor: 'white',
              border: '1px solid #ccc',
              borderRadius: '5px',
              padding: '20px',
              boxShadow: '0 0 10px rgba(0,0,0,0.1)',
              zIndex: 1000,
            }}
          >
            <button
              onClick={handleMajorsToggle}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                border: 'none',
                background: 'transparent',
                fontSize: '18px',
                cursor: 'pointer',
              }}
            >
              ×
            </button>

            <h3 style={{ marginTop: 0 }}>Select Your Major</h3>

            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="majors" style={{ display: 'block', marginBottom: '5px' }}>
                Major:
              </label>
              <select
                id="majors"
                value={selectedMajor}
                onChange={(e) => setSelectedMajor(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                }}
              >
                <option value="">Select a major</option>
                <option value="MET">MET</option>
                <option value="IET">IET</option>
                <option value="Mechatronics">Mechatronics</option>
                <option value="Business Informatics">Business Informatics</option>
                <option value="Pharmacy">Pharmacy</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="semester" style={{ display: 'block', marginBottom: '5px' }}>
                Semester:
              </label>
              <select
                id="semester"
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                }}
              >
                <option value="">Select semester</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <option key={num} value={num}>
                    Semester {num}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                console.log('Selected:', selectedMajor, 'Semester:', selectedSemester);
              }}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Select
            </button>
          </div>
        )}
         {showCompanies && (
            <div>
              <h1>Companies</h1>
              <ul>
                <li> <p><strong>Companies:</strong> {companies.email}</p></li>
                {companies.map((company, index) => (
                <li>
                  <h3>{company.companyName}</h3>
                  <p><strong>companyEmail:</strong> {company.email}</p>
                  <p><strong>industry:</strong> {company.industry}</p>
                  <p><strong>size:</strong> {company.companySize}</p>
                  <p><strong>Jobs:</strong> {company.jobs}</p>
                </li>
              ))}
                {/* Add more companies as needed */}
              </ul>
            </div>
          )}
      </div>
    </div>
  );
}

export default StudentPage;
