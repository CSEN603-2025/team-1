import React, { useState, useEffect } from 'react';

function StudentPage() {
  const [menuOpen, setMenuOpen] = useState(true);
  const [selectedMajor, setSelectedMajor] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
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
  const [ismajorssOpen, setIsmajorsOpen] = useState(false);
  const handlemajorsToggle = () => {
    setIsmajorsOpen(!ismajorssOpen);
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
            <li><a href="/jobspage">Browse Jobs</a></li>
            <li><a href="/studentapplications">My Applications</a></li>
            <li style={{ margin: '15px 0' }}>
              <button onClick={handlemajorsToggle} style={{ background: 'none', border: 'none', padding: 0,color: '#007bff', textDecoration: 'underline', cursor: 'pointer', font: 'inherit' }}>
                Majors
              </button>
            </li>
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

    {ismajorssOpen && (
      <div style={{
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
      }}>
        <button 
          onClick={handlemajorsToggle}
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
        
        {/* Majors Dropdown */}
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="majors" style={{ display: 'block', marginBottom: '5px' }}>Major:</label>
          <select
            id="majors"
            value={selectedMajor}
            onChange={(e) => setSelectedMajor(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ddd'
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
        
        {/* Semester Dropdown */}
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="semester" style={{ display: 'block', marginBottom: '5px' }}>Semester:</label>
          <select
            id="semester"
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
          >
            <option value="">Select semester</option>
            {[1, 2, 3, 4, 5, 6, 7, 8,9,10].map((num) => (
              <option key={num} value={num}>Semester {num}</option>
            ))}
          </select>
        </div>
        
        {/* Select Button */}
        <button
          onClick={() => {
            // You can add functionality here later
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
      </div>
    </div>
  );
}

export default StudentPage;
