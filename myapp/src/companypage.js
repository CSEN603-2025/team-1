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
  const [filterPaid, setFilterPaid] = useState({ paid: false, unpaid: false });
  const [filterDuration, setFilterDuration] = useState({
    '1 month': false,
    '2 months': false,
    '3 months': false,
  });

  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const storedCompany = location.state?.companyUser;
  useEffect(() => {
    const storedCompany = location.state?.companyUser;

    if (storedCompany) {
      setCompanyName(storedCompany.companyName || storedCompany.companyEmail);
      // Load existing jobs for this company from localStorage
      const storedJobs = localStorage.getItem(`companyJobs_${storedCompany.companyEmail}`);
      if (storedJobs) {
        setPostedJobs(JSON.parse(storedJobs));
        console.log('Loaded jobs:', JSON.parse(storedJobs));
      }
    } else {
      navigate('/'); // Redirect if no company object
    }
  }, [location, navigate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // Delay for 500ms (debounce time)

    return () => clearTimeout(timer); // Cleanup on every change to searchQuery
  }, [searchQuery]);

  // Save jobs to localStorage whenever postedJobs changes AND companyUser exists
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

    localStorage.setItem('allJobs', JSON.stringify(updatedAllJobs));
  };

  const toggleMenu = () => setMenuOpen(prev => !prev);

  const handleLogout = () => {
    navigate('/company-login');
  };

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
        // Initialize applicants array for new job
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

    const matchesPaid =
      (!filterPaid.paid && !filterPaid.unpaid) ||
      (filterPaid.paid && job.isPaid) ||
      (filterPaid.unpaid && !job.isPaid);

    const selectedDurations = Object.entries(filterDuration)
      .filter(([_, checked]) => checked)
      .map(([duration]) => duration);

    const matchesDuration =
      selectedDurations.length === 0 || selectedDurations.includes(job.duration);

    return matchesSearchQuery && matchesPaid && matchesDuration;
  });

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
            <li style={{ margin: '15px 0' }}><Link to="/company/dashboard" state={{storedCompany}}> Dashboard</Link></li>
            <li style={{ margin: '15px 0' }}><Link to="/company/profile">Profile</Link></li>
            <li style={{ margin: '15px 0' }}>
              <button onClick={handleJobModalToggle} style={{ background: 'none', border: 'none', padding: 0, color: '#007bff', textDecoration: 'underline', cursor: 'pointer', font: 'inherit' }}>
                Post a Job
              </button>
            </li>
            <li><Link to="/allpostedjobs" state={{storedCompany}}>All posted Jobs</Link></li>
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

        {/* Filter Section */}
        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Search By Job Title ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '10px',
              width: '100%',
              marginBottom: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
          />

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '10px' }}>
            <label>
              <input
                type="checkbox"
                checked={filterPaid.paid}
                onChange={(e) => setFilterPaid(prev => ({ ...prev, paid: e.target.checked }))}
              /> Paid
            </label>
            <label>
              <input
                type="checkbox"
                checked={filterPaid.unpaid}
                onChange={(e) => setFilterPaid(prev => ({ ...prev, unpaid: e.target.checked }))}
              /> Unpaid
            </label>
            {['1 month', '2 months', '3 months'].map(duration => (
              <label key={duration}>
                <input
                  type="checkbox"
                  checked={filterDuration[duration]}
                  onChange={(e) => setFilterDuration(prev => ({
                    ...prev,
                    [duration]: e.target.checked,
                  }))}
                /> {duration}
              </label>
            ))}
          </div>
        </div>

        <h2>My Posted Jobs</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Duration</th>
              <th>Paid</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.map((job, index) => (
              <tr key={index}>
                <td>{job.title}</td>
                <td>{job.duration}</td>
                <td>{job.isPaid ? 'Yes' : 'No'}</td>
                <td>
                  <button onClick={() => handleEditJob(index)}>Edit</button>
                  <button onClick={() => handleDeleteJob(index)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Job Modal */}
        {isJobModalOpen && (
          <div style={{
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <div style={{ background: 'white', padding: '20px', borderRadius: '4px', width: '400px' }}>
              <h3>{editingIndex !== null ? 'Edit Job' : 'Post a New Job'}</h3>
              <form onSubmit={handleJobSubmit}>
                <div style={{ marginBottom: '10px' }}>
                  <label>Job Title</label>
                  <input type="text" name="title" value={jobData.title} onChange={handleJobInputChange} style={{ width: '100%', padding: '8px', borderRadius: '4px' }} />
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <label>Duration</label>
                  <select name="duration" value={jobData.duration} onChange={handleJobInputChange} style={{ width: '100%', padding: '8px', borderRadius: '4px' }}>
                    <option value="">Select Duration</option>
                    <option value="1 month">1 month</option>
                    <option value="2 months">2 months</option>
                    <option value="3 months">3 months</option>
                  </select>
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <label>
                    <input type="checkbox" name="isPaid" checked={jobData.isPaid} onChange={handleJobInputChange} /> Paid
                  </label>
                </div>
                {jobData.isPaid && (
                  <div style={{ marginBottom: '10px' }}>
                    <label>Salary</label>
                    <input type="text" name="salary" value={jobData.salary} onChange={handleJobInputChange} style={{ width: '100%', padding: '8px', borderRadius: '4px' }} />
                  </div>
                )}
                <div style={{ marginBottom: '10px' }}>
                  <label>Skills</label>
                  <input type="text" name="skills" value={jobData.skills} onChange={handleJobInputChange} style={{ width: '100%', padding: '8px', borderRadius: '4px' }} />
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <label>Description</label>
                  <textarea name="description" value={jobData.description} onChange={handleJobInputChange} style={{ width: '100%', padding: '8px', borderRadius: '4px' }} />
                </div>
                <button type="submit" style={{ backgroundColor: '#007bff', color: 'white', padding: '10px', width: '100%' }}>
                  {editingIndex !== null ? 'Update Job' : 'Post Job'}
                </button>
              </form>
              <button
                onClick={handleJobModalToggle}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#007bff',
                  textDecoration: 'underline',
                  padding: '10px',
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CompanyPage;
