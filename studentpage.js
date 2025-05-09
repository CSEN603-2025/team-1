import React, { useState, useEffect } from 'react';

function StudentPage() {
  const [menuOpen, setMenuOpen] = useState(true);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    jobInterests: '',
    internships: '',
    partTimeJobs: '',
    collegeActivities: '',

    
  });

  useEffect(() => {
    const savedProfile = JSON.parse(localStorage.getItem('studentProfile'));
    if (savedProfile) setProfile(savedProfile);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    localStorage.setItem('studentProfile', JSON.stringify(profile));
    alert('Profile updated!');
  };

  return (
    <div style={{ display: 'flex' }}>
      {/* Sidebar */}
      <div
        style={{
          width: menuOpen ? '250px' : '0',
          height: '100vh',
          backgroundColor: '#f0f0f0',
          transition: '0.3s',
          padding: menuOpen ? '20px' : '0',
          boxShadow: menuOpen ? '2px 0 5px rgba(0,0,0,0.2)' : 'none',
        }}
      >
        {menuOpen && (
          <ul style={{ listStyleType: 'none', padding: 0, marginTop: '50px' }}>
            <li><a href="#profile">My Profile</a></li>
            <li><a href="#jobs">Browse Jobs</a></li>
            <li><a href="#applications">My Applications</a></li>
            <li><a href="#settings">Settings</a></li>
          </ul>
        )}
      </div>

      {/* Main Content */}
      <div style={{ flexGrow: 1, padding: '20px' }}>
        <button
          onClick={() => setMenuOpen(prev => !prev)}
          style={{
            fontSize: '24px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            position: 'absolute',
            top: '20px',
            left: '20px',
          }}
        >
          ☰
        </button>

        <h1>Student Profile</h1>
        <div style={{ maxWidth: '600px', marginTop: '20px' }}>
          <label>Name:</label>
          <input
            name="name"
            value={profile.name}
            onChange={handleChange}
            style={{ width: '100%', marginBottom: '10px' }}
          />
          <label>Email:</label>
          <input
            name="email"
            value={profile.email}
            onChange={handleChange}
            style={{ width: '100%', marginBottom: '10px' }}
          />
          <label>Job Interests:</label>
          <textarea
            name="jobInterests"
            value={profile.jobInterests}
            onChange={handleChange}
            style={{ width: '100%', marginBottom: '10px' }}
          />
          <label>Previous Internships (Responsibilities, Duration, Company):</label>
          <textarea
            name="internships"
            value={profile.internships}
            onChange={handleChange}
            style={{ width: '100%', marginBottom: '10px' }}
          />
          <label>Part-time Jobs (Responsibilities, Duration, Company):</label>
          <textarea
            name="partTimeJobs"
            value={profile.partTimeJobs}
            onChange={handleChange}
            style={{ width: '100%', marginBottom: '10px' }}
          />
          <label>College Activities:</label>
          <textarea
            name="collegeActivities"
            value={profile.collegeActivities}
            onChange={handleChange}
            style={{ width: '100%', marginBottom: '10px' }}
          />
          <button
            onClick={handleSave}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Save Profile
          </button>
        </div>
      </div>
    </div>
  );
}

export default StudentPage;
