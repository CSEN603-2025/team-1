import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

function CompanyPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [jobData, setJobData] = useState({
    title: '',
    duration: '',
    isPaid: false,
    salary: '',
    skills: '',
    description: '',
  });
  const [postedJobs, setPostedJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [notificationPopupOpen, setNotificationPopupOpen] = useState(false);
  const [jobs, setJobs] = useState([]);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedCompany = location.state?.company;

    if (storedCompany) {
      setCompanyName(storedCompany.companyName || storedCompany.companyEmail);

      // Load existing jobs for this company from localStorage
      const storedNotifications = getNotificationsForCompany(storedCompany.companyEmail);
      setNotifications(storedNotifications);
      const storedJobs = localStorage.getItem(`companyJobs_${storedCompany.companyEmail}`);
      if (storedJobs) {
        setPostedJobs(JSON.parse(storedJobs));
      }
    }
  }, [location, navigate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // Delay for 500ms (debounce time)

    return () => clearTimeout(timer); // Cleanup on every change to searchQuery
  }, [searchQuery]);

  useEffect(() => {
    const storedCompany = location.state?.companyUser;
    if (storedCompany) {
      localStorage.setItem(`companyJobs_${storedCompany.companyEmail}`, JSON.stringify(postedJobs));
      // Update the global jobs list (for jobs.js)
      updateGlobalJobList(storedCompany.companyName || storedCompany.companyEmail, postedJobs);
    }
  }, [postedJobs, location.state?.companyUser]);

  const updateGlobalJobList = (companyName, companyJobs) => {
    const allJobsString = localStorage.getItem('allJobs') || '[]';
    const allJobs = JSON.parse(allJobsString);

    // Filter out existing jobs from this company and then add the updated ones
    const updatedAllJobs = allJobs.filter(job => job.companyName !== companyName);
    
    companyJobs.forEach(job => {
      updatedAllJobs.push({ ...job, companyName });
    });

    // Update the global job list in localStorage
    localStorage.setItem('allJobs', JSON.stringify(updatedAllJobs));
  };

  const toggleMenu = () => setMenuOpen(prev => !prev);

  const handleLogout = () => {
    navigate('/');
  };

  useEffect(() => {
  const savedJobs = JSON.parse(localStorage.getItem('jobs'));
  if (savedJobs) {
    setJobs(savedJobs);
  }
}, []);

useEffect(() => {
  if (jobs.length > 0) {
    localStorage.setItem('jobs', JSON.stringify(jobs));
  }
}, [jobs]);

  const handleJobModalToggle = () => {
    setIsJobModalOpen(prev => !prev);
    setEditingIndex(null);
    setJobData({
      title: '',
      duration: '',
      isPaid: false,
      salary: '',
      skills: '',
      description: '',
    });
  };

  const handleJobInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setJobData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleJobSubmit = (e) => {
    e.preventDefault();
    const updatedJobs = [...postedJobs];

    if (editingIndex !== null) {
      updatedJobs[editingIndex] = jobData;
    } else {
      const newJob = { ...jobData, applicants: [] };
      updatedJobs.push(newJob);
    }

    setPostedJobs(updatedJobs);
    setEditingIndex(null);
    setIsJobModalOpen(false);
    setJobData({
      title: '',
      duration: '',
      isPaid: false,
      salary: '',
      skills: '',
      description: '',
    });

    // Ensure the global job list is updated
    const storedCompany = location.state?.companyUser;
    if (storedCompany) {
      updateGlobalJobList(storedCompany.companyName || storedCompany.companyEmail, updatedJobs);
    }
  };

  const handleEditJob = (index) => {
    setEditingIndex(index);
    setJobData(postedJobs[index]);
    setIsJobModalOpen(true);
  };

  const handleDeleteJob = (index) => {
    setPostedJobs(prev => prev.filter((_, i) => i !== index));
  };

  const filteredJobs = postedJobs.filter(job => {
    const matchesSearchQuery =
      job.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      job.skills.toLowerCase().includes(debouncedSearchQuery.toLowerCase());

    return matchesSearchQuery;
  });

  const handleBellClick = () => {
    setNotificationPopupOpen(prev => !prev);
  };

  const getNotificationsForCompany = (email) => {
    const allNotifications = JSON.parse(localStorage.getItem('notifications')) || [];
    return allNotifications.filter(notification => notification.email === email);
  };

  return (
    <div style={{ display: 'flex' }}>
      {/* Sidebar */}
      <div
        style={{
          width: menuOpen ? '250px' : '0',
          height: '100vh',
          backgroundColor: '#f8f9fa',
          overflowX: 'hidden',
          transition: '0.3s',
          padding: menuOpen ? '20px' : '0',
          boxShadow: menuOpen ? '2px 0 5px rgba(0,0,0,0.2)' : 'none',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 1000,
        }}
      >
        {menuOpen && (
          <ul style={{ listStyleType: 'none', padding: 0, marginTop: '50px' }}>
            <li style={{ margin: '15px 0' }}><Link to="/company/dashboard">Dashboard</Link></li>
            <li style={{ margin: '15px 0' }}><Link to="/company/profile">Profile</Link></li>
            <li style={{ margin: '15px 0' }}>
              <button
                onClick={handleJobModalToggle}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: '#007bff',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  font: 'inherit',
                }}
              >
                Post a Job
              </button>
            </li>
            <li><Link to="/allpostedjobs">All posted Jobs</Link></li>
            <li style={{ margin: '15px 0' }}><Link to="/companyapplications">View Applications</Link></li>
            <li style={{ margin: '15px 0' }}><Link to="/company/interns">Your Interns</Link></li>
            <li style={{ margin: '15px 0' }}><Link to="/company/settings">Settings</Link></li>
            <li style={{ margin: '15px 0', cursor: 'pointer' }} onClick={handleLogout}>Logout</li>
          </ul>
        )}
      </div>

      {/* Main Content */}
      <div style={{ marginLeft: menuOpen ? '250px' : '0', transition: 'margin-left 0.3s', padding: '20px', width: '100%' }}>
        <button
          onClick={toggleMenu}
          style={{
            fontSize: '28px',
            fontWeight: 'bold',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            zIndex: 1101,
            position: 'absolute',
            top: '20px',
            left: '20px',
          }}
        >
          ☰
        </button>

        <h1>Welcome, {companyName}</h1>
        <p>This is your company dashboard. Use the menu to navigate between sections.</p>

        {/* Notifications */}
        <div style={{ marginBottom: '20px' }}>
          {notifications.length > 0 && (
            <div>
              {notifications.map(notification => (
                <div key={notification.id} style={{
                  padding: '10px',
                  marginBottom: '10px',
                  backgroundColor: notification.type === 'success' ? '#d4edda' : '#f8d7da',
                  color: notification.type === 'success' ? '#155724' : '#721c24',
                  border: '1px solid',
                  borderRadius: '4px',
                }}>
                  {notification.message}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bell icon */}
        <div style={{ position: 'absolute', top: '20px', right: '20px', cursor: 'pointer' }} onClick={handleBellClick}>
          <div style={{ position: 'relative' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="74" height="74" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M18 14V8c0-3.313-2.687-6-6-6S6 4.687 6 8v6c-2.106 0-3 1.473-3 3h18c0-1.527-.894-3-3-3z" />
              <path d="M16 18c0 1.104-.896 2-2 2s-2-.896-2-2h4z" />
            </svg>

            {/* Notification dot */}
            {notifications.length > 0 && !notificationPopupOpen && (
              <span style={{
                position: 'absolute',
                top: '0',
                right: '0',
                width: '8px',
                height: '8px',
                backgroundColor: 'red',
                borderRadius: '50%',
                border: '2px solid white',
              }} />
            )}
          </div>
        </div>

        {/* Notification Popup */}
        {notificationPopupOpen && (
          <div style={{
            position: 'absolute',
            top: '60px',
            right: '20px',
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '5px',
            boxShadow: '0 0 10px rgba(0,0,0,0.1)',
            minWidth: '250px',
            minHeight: '100px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}>
            <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
              {notifications.length === 0 ? 'No Notifications' : notifications.map(notification => (
                <div key={notification.id} style={{
                  marginBottom: '10px',
                  padding: '10px',
                  backgroundColor: notification.type === 'success' ? '#d4edda' : '#f8d7da',
                  color: notification.type === 'success' ? '#155724' : '#721c24',
                  border: '1px solid',
                  borderRadius: '4px',
                }}>
                  {notification.message}
                </div>
              ))}
            </div>

            {/* Close Button */}
            <button
              onClick={() => setNotificationPopupOpen(false)}
              style={{
                backgroundColor: '#007bff',
                border: 'none',
                padding: '10px',
                color: '#fff',
                borderRadius: '5px',
                cursor: 'pointer',
                marginTop: '10px',
                alignSelf: 'center',
                width: '100%',
              }}
            >
              Close
            </button>
          </div>
        )}

        {/* Job Search */}
        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Search Jobs"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              padding: '10px',
              width: '100%',
                            border: '1px solid #ccc',
              borderRadius: '4px',
              marginTop: '10px',
            }}
          />
        </div>

        {/* Job List */}
        <div>
          <h2>Posted Jobs</h2>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {filteredJobs.length === 0 ? (
              <li>No jobs posted yet.</li>
            ) : (
              filteredJobs.map((job, index) => (
                <li key={index} style={{
                  marginBottom: '15px',
                  padding: '15px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}>
                  <h3>{job.title}</h3>
                  <p><strong>Duration:</strong> {job.duration} months</p>
                  <p><strong>Paid:</strong> {job.isPaid ? 'Yes' : 'No'}</p>
                  {job.isPaid && <p><strong>Salary:</strong> {job.salary}</p>}
                  <p><strong>Skills:</strong> {job.skills}</p>
                  <p><strong>Description:</strong> {job.description}</p>

                  <div style={{ marginTop: '10px' }}>
                    <button onClick={() => handleEditJob(index)} style={{
                      padding: '5px 10px',
                      marginRight: '10px',
                      backgroundColor: '#007bff',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                    }}>
                      Edit
                    </button>
                    <button onClick={() => handleDeleteJob(index)} style={{
                      padding: '5px 10px',
                      backgroundColor: '#dc3545',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                    }}>
                      Delete
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Job Modal */}
        {isJobModalOpen && (
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)',
            zIndex: 1050,
            width: '80%',
            maxWidth: '500px',
          }}>
            <h2>{editingIndex !== null ? 'Edit Job' : 'Post a New Job'}</h2>
            <form onSubmit={handleJobSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label>Job Title</label>
                <input
                  type="text"
                  name="title"
                  value={jobData.title}
                  onChange={handleJobInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    marginTop: '5px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                  }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label>Duration (months)</label>
                <input
                  type="number"
                  name="duration"
                  value={jobData.duration}
                  onChange={handleJobInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    marginTop: '5px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                  }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label>
                  Paid Job
                  <input
                    type="checkbox"
                    name="isPaid"
                    checked={jobData.isPaid}
                    onChange={handleJobInputChange}
                    style={{ marginLeft: '10px' }}
                  />
                </label>
              </div>
              {jobData.isPaid && (
                <div style={{ marginBottom: '15px' }}>
                  <label>Salary</label>
                  <input
                    type="number"
                    name="salary"
                    value={jobData.salary}
                    onChange={handleJobInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      marginTop: '5px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                    }}
                  />
                </div>
              )}
              <div style={{ marginBottom: '15px' }}>
                <label>Skills Required</label>
                <input
                  type="text"
                  name="skills"
                  value={jobData.skills}
                  onChange={handleJobInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    marginTop: '5px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                  }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label>Job Description</label>
                <textarea
                  name="description"
                  value={jobData.description}
                  onChange={handleJobInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    marginTop: '5px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    height: '150px',
                  }}
                />
              </div>
              <button
                type="submit"
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
              >
                {editingIndex !== null ? 'Save Changes' : 'Post Job'}
              </button>
              <button
                type="button"
                onClick={handleJobModalToggle}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#ccc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  marginLeft: '10px',
                }}
              >
                Cancel
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default CompanyPage;

