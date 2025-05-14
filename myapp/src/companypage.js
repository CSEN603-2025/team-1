import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getNotification, clearNotifications } from './notification';

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
    industry: '',
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
  const [selectedJobApplicants, setSelectedJobApplicants] = useState(null);
  const [currentJobIndex, setCurrentJobIndex] = useState(null); // Track which job we're viewing applicants for
  const [isApplicantsModalOpen, setIsApplicantsModalOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [applicantFilter, setApplicantFilter] = useState({
    status: '',
    search: ''
  });
  const [acceptedInterns, setAcceptedInterns] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const storedCompany = location.state?.company;

  useEffect(() => {
    const storedCompany = location.state?.company;

    if (storedCompany) {
      setCompanyName(storedCompany.companyName || storedCompany.companyEmail);
      
      // Load posted jobs
      const storedJobs = localStorage.getItem(`companyJobs_${storedCompany.companyEmail}`);
      if (storedJobs) {
        setPostedJobs(JSON.parse(storedJobs));
      }
      
      // Load accepted interns
      const companyInternsKey = `companyInterns_${storedCompany.companyEmail}`;
      const storedInterns = localStorage.getItem(companyInternsKey);
      if (storedInterns) {
        setAcceptedInterns(JSON.parse(storedInterns));
      }
    }
  }, [location, navigate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const storedCompany = location.state?.company;
    if (storedCompany) {
      setCompanyName(storedCompany.companyName || storedCompany.companyEmail);
      localStorage.setItem(`companyJobs_${storedCompany.companyEmail}`, JSON.stringify(postedJobs));
      updateGlobalJobList(
        storedCompany.companyName || storedCompany.companyEmail,
        storedCompany.companyEmail,
        postedJobs
      );
    }
  }, [postedJobs, location.state?.company]);

  const updateGlobalJobList = (companyName, companyEmail, companyJobs) => {
    const allJobsString = localStorage.getItem('allJobs') || '[]';
    const allJobs = JSON.parse(allJobsString);

    const updatedAllJobs = allJobs.filter(job => job.companyEmail !== companyEmail);
    companyJobs.forEach(job => {
      updatedAllJobs.push({ ...job, companyName, companyEmail });
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
      industry: '',
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
      industry: '',
    });

    const companies = JSON.parse(localStorage.getItem('companies')) || [];
    const companyIndex = companies.findIndex(company => company.companyEmail === storedCompany.companyEmail);

    if (companyIndex !== -1) {
      const company = companies[companyIndex];
      const updatedCompany = {
        ...company,
        jobs: updatedJobs,  
      };
      companies[companyIndex] = updatedCompany;
      localStorage.setItem('companies', JSON.stringify(companies));
    }
  };

  const handleEditJob = (index) => {
    setEditingIndex(index);
    setJobData(postedJobs[index]);
    setIsJobModalOpen(true);
  };

  const handleDeleteJob = (indexToDelete) => {
    const jobToDelete = postedJobs[indexToDelete];
    const updatedPostedJobs = postedJobs.filter((_, index) => index !== indexToDelete);
    setPostedJobs(updatedPostedJobs);

    const allJobsString = localStorage.getItem('allJobs') || '[]';
    const allJobs = JSON.parse(allJobsString);
    const updatedAllJobs = allJobs.filter(
      job => !(job.companyEmail === storedCompany?.companyEmail && job.title === jobToDelete.title)
    );
    localStorage.setItem('allJobs', JSON.stringify(updatedAllJobs));
    
    const companies = JSON.parse(localStorage.getItem('companies')) || [];
    const companyIndex = companies.findIndex(company => company.companyEmail === storedCompany.companyEmail);
    if (companyIndex !== -1) {
      const company = companies[companyIndex];
      const updatedCompanyJobs = company.jobs.filter(
        job => !(job.title === jobToDelete.title)
      );
      const updatedCompany = {
        ...company,
        jobs: updatedCompanyJobs
      };
      companies[companyIndex] = updatedCompany; 
      localStorage.setItem('companies', JSON.stringify(companies));
    }
  };

  const handleViewApplicants = (job, index) => {
    setSelectedJobApplicants(job.applicants || []);
    setCurrentJobIndex(index); // Store the job index
    setIsApplicantsModalOpen(true);
    setApplicantFilter({ status: '', search: '' });
  };

  const handleCloseApplicantsModal = () => {
    setIsApplicantsModalOpen(false);
    setSelectedJobApplicants(null);
    setCurrentJobIndex(null);
  };

  const handleViewApplicantProfile = (applicant) => {
    setSelectedApplicant(applicant);
    setIsProfileModalOpen(true);
  };

  const handleCloseProfileModal = () => {
    setIsProfileModalOpen(false);
    setSelectedApplicant(null);
  };

  const handleUpdateApplicantStatus = (applicantEmail, newStatus) => {
    if (currentJobIndex === null || currentJobIndex >= postedJobs.length) {
      console.error("Invalid job index:", currentJobIndex);
      return;
    }

    const updatedJobs = [...postedJobs];
    const job = updatedJobs[currentJobIndex];
    
    // Update status in company's job applicants
    if (job.applicants) {
      const updatedApplicants = job.applicants.map(applicant => {
        if (applicant.email === applicantEmail) {
          return { ...applicant, status: newStatus };
        }
        return applicant;
      });
      
      updatedJobs[currentJobIndex].applicants = updatedApplicants;
    }

    // Update status in global applications (appliedInternships)
    const allApplied = JSON.parse(localStorage.getItem('appliedInternships') || '[]');
    const updatedApplied = allApplied.map(app => {
      if (app.studentProfile?.email === applicantEmail && 
          app.title === job.title && 
          app.companyEmail === storedCompany?.companyEmail) {
        return { ...app, status: newStatus };
      }
      return app;
    });
    localStorage.setItem('appliedInternships', JSON.stringify(updatedApplied));

    // Update the applicants modal if open
    if (selectedJobApplicants) {
      setSelectedJobApplicants(prev => prev.map(applicant => {
        if (applicant.email === applicantEmail) {
          return { ...applicant, status: newStatus };
        }
        return applicant;
      }));
    }

    // Add to accepted interns if status is accepted and not already added
    if (newStatus === 'accepted') {
      const acceptedApplicant = job.applicants?.find(applicant => applicant.email === applicantEmail);
      if (acceptedApplicant && storedCompany?.companyEmail) {
        const companyInternsKey = `companyInterns_${storedCompany.companyEmail}`;
        const currentInterns = JSON.parse(localStorage.getItem(companyInternsKey)) || [];
        
        const isAlreadyAdded = currentInterns.some(intern => 
          intern.email === acceptedApplicant.email && 
          intern.jobTitle === job.title
        );
        
        if (!isAlreadyAdded) {
          const newIntern = {
            ...acceptedApplicant,
            jobTitle: job.title,
            jobDuration: job.duration,
            isPaid: job.isPaid,
            salary: job.salary || '',
            acceptedDate: new Date().toISOString(),
            companyName: storedCompany.companyName || storedCompany.companyEmail,
            status: 'current'
          };
          
          const updatedInterns = [...currentInterns, newIntern];
          localStorage.setItem(companyInternsKey, JSON.stringify(updatedInterns));
          setAcceptedInterns(updatedInterns);
        }
      }
    }

    setPostedJobs(updatedJobs);
    setSelectedApplicant(prev => prev && { ...prev, status: newStatus });
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

  // Filter applicants based on status and search
  const filteredApplicants = selectedJobApplicants?.filter(applicant => {
    const matchesStatus = !applicantFilter.status || applicant.status === applicantFilter.status;
    const matchesSearch = !applicantFilter.search || 
      (applicant.name && applicant.name.toLowerCase().includes(applicantFilter.search.toLowerCase())) ||
      (applicant.email && applicant.email.toLowerCase().includes(applicantFilter.search.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  // Function to navigate to Accepted Interns page with accepted interns list
  const navigateToAcceptedInterns = () => {
    navigate('/company/interns', { 
      state: { 
        acceptedInterns,
        storedCompany 
      } 
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const newNotifications = getNotification(storedCompany.companyEmail) || [];
      setNotifications(newNotifications);
    }, 3000); // check every 3 seconds

    return () => clearInterval(interval); // cleanup on unmount
  }, [storedCompany.companyEmail]);
  
  const handleBellClick = () => {
    const fetchedNotifications = getNotification(storedCompany.companyEmail) || [];
    setNotifications(fetchedNotifications);
    setIsPopupOpen(prev => !prev);
  };

  const handleClosePopup = () => {
    clearNotifications(storedCompany.companyEmail); // clear from storage
    setNotifications([]);              // clear from state
    setIsPopupOpen(false);             // close popup
  };

  return (
<div style={{ display: 'flex', backgroundColor: '#e6f2ff', minHeight: '100vh' }}>
  {/* Sidebar - Dark Blue with modern styling */}
  <div
    style={{
      width: menuOpen ? '180px' : '0',
      height: '100vh',
      backgroundColor: '#34495E', // Slightly darker blue for more sophistication
      overflowX: 'hidden',
      transition: 'all 0.3s ease-in-out',
      padding: menuOpen ? '30px 20px' : '0',
      boxShadow: menuOpen ? '4px 0 15px rgba(0, 0, 0, 0.1)' : 'none',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 1000,
      color: 'white',
      borderRadius: '0 20px 20px 0', // Rounded right corners
      borderRight: '1px solid rgba(255, 255, 255, 0.1)' // Subtle border
    }}
  >
    {/* Close button (X) - positioned top right */}
    {menuOpen && (
      <button 
        onClick={toggleMenu}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'none',
          border: 'none',
          color: 'white',
          fontSize: '24px',
          cursor: 'pointer',
          transition: 'transform 0.2s',
          padding: '5px',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ':hover': {
            transform: 'rotate(90deg)',
            backgroundColor: 'rgba(255, 255, 255, 0.1)'
          }
        }}
      >
        &times;
      </button>
    )}
    
    {menuOpen && (
      <ul style={{ 
        listStyleType: 'none', 
        padding: 0, 
        marginTop: '60px',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
      }}>
        {[
          { to: "/companyprofile", text: "Profile", onClick: null },
          { text: "Post a Job", onClick: handleJobModalToggle },
          { to: "/allpostedjobs", text: "All Posted Jobs", state: { storedCompany } },
          { to: "/companyapplications", text: "View Applications" },
          { text: "Your Interns", onClick: navigateToAcceptedInterns },
          { text: "Logout", onClick: handleLogout }
        ].map((item, index) => (
          <li key={index} style={{ 
            margin: '10px 0',
            transition: 'all 0.2s ease',
            ':hover': {
              transform: 'translateX(5px)'
            }
          }}>
            {item.to ? (
              <Link 
                to={item.to}
                state={item.state || {}}
                style={{ 
                  color: 'white', 
                  textDecoration: 'none',
                  fontSize: '18px',
                  fontWeight: '400',
                  display: 'block',
                  padding: '12px 15px',
                  borderRadius: '8px',
                  transition: 'all 0.2s',
                  ':hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    fontSize: '19px'
                  }
                }}
              >
                {item.text}
              </Link>
            ) : (
              <button 
                onClick={item.onClick}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: 'white', 
                  textDecoration: 'none',
                  fontSize: '18px',
                  fontWeight: '400',
                  cursor: 'pointer',
                  padding: '12px 15px',
                  width: '100%',
                  textAlign: 'left',
                  borderRadius: '8px',
                  transition: 'all 0.2s',
                  ':hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    fontSize: '19px'
                  }
                }}
              >
                {item.text}
              </button>
            )}
          </li>
        ))}
      </ul>
    )}
  </div>

  {/* Main Content - Light Blue Background */}
  <div style={{ 
    marginLeft: menuOpen ? '250px' : '0', 
    transition: 'margin-left 0.3s', 
    padding: '20px', 
    width: '100%',
    backgroundColor: 'white' // Light blue background
  }}>
    {/* Menu Button - Dark Blue */}
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
        color: '#34495E' // Dark blue color to match sidebar
      }}
    >
      ☰
    </button>

        <h1>Welcome, {companyName}</h1>
        <p>This is your company dashboard. Use the menu to navigate between sections.</p>
        
        <div>
          {/* Bell Icon */}
          <div
            onClick={handleBellClick}
            style={{
              cursor: 'pointer',
              position: 'fixed',
              top: '20px',
              right: '20px',
              fontSize: '40px',
              color: '#1E90FF',
              zIndex: 9999,
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="72" height="72"
              fill="#385e72"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C10.34 2 9 3.34 9 5v1.07C6.72 7.25 5.14 9.36 5 12v5l-1 1v1h16v-1l-1-1v-5c-.14-2.64-1.72-4.75-4-5.93V5c0-1.66-1.34-3-3-3zm1 19h-2c0 1.1.9 2 2 2s2-.9 2-2z"/>
            </svg>
            {notifications.length > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  backgroundColor: 'red',
                  color: 'white',
                  borderRadius: '50%',
                  padding: '0.2em 0.5em',
                  fontSize: '14px',
                }}
              >
                {notifications.length}
              </span>
            )}
          </div>

          {/* Popup Notification */}
          {isPopupOpen && (
            <div
              style={{
                position: 'absolute',
                top: '50px',
                right: '20px',
                backgroundColor: 'white',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                padding: '20px',
                borderRadius: '8px',
                width: '250px',
                zIndex: 9999,
              }}
            >
              <button
                onClick={handleClosePopup}
                style={{
                  position: 'absolute',
                  top: '5px',
                  right: '5px',
                  background: 'transparent',
                  border: 'none',
                  fontSize: '16px',
                  cursor: 'pointer',
                }}
              >
                X
              </button>
              <h4>Notifications</h4>
              {notifications.length === 0 ? (
                <p>No notifications</p>
              ) : (
                notifications.map((notification, index) => (
                  <div key={index} style={{ marginBottom: '10px' }}>
                    <p><strong>{notification.message}</strong></p>
                    <p>{new Date(notification.timestamp).toLocaleString()}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

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
              <th>Applicants</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.map((job, index) => (
              <tr key={index}>
                <td>{job.title}</td>
                <td>{job.duration}</td>
                <td>{job.isPaid ? 'Yes' : 'No'}</td>
                <td>{job.applicants ? job.applicants.length : 0}</td>
                <td>
                  <button onClick={() => handleEditJob(index)}>Edit</button>
                  <button onClick={() => handleDeleteJob(index)}>Delete</button>
                  <button onClick={() => handleViewApplicants(job, index)}>Applicants Details</button>
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
                <div style={{ marginBottom: '10px' }}>
                  <label>Industry</label>
                  <input type="text" name="industry" value={jobData.industry} onChange={handleJobInputChange} style={{ width: '100%', padding: '8px', borderRadius: '4px' }} />
                </div>
                <button type="submit" style={{ backgroundColor: '#007bff', color: 'white', padding: '10px', width: '100%', }}>
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

        {/* Applicants Modal */}
        {isApplicantsModalOpen && selectedJobApplicants && (
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
            zIndex: 1200,
          }}>
            <div style={{ 
              background: 'white', 
              padding: '20px', 
              borderRadius: '4px', 
              maxHeight: '80vh', 
              overflowY: 'auto', 
              width: '80%' 
            }}>
              <h3>Applicants</h3>
              
              {/* Filter Controls */}
              <div style={{ marginBottom: '20px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                <div>
                  <label style={{ marginRight: '10px' }}>Status:</label>
                  <select
                    value={applicantFilter.status}
                    onChange={(e) => setApplicantFilter({...applicantFilter, status: e.target.value})}
                    style={{ padding: '5px', borderRadius: '4px' }}
                  >
                    <option value="">All</option>
                    <option value="pending">Pending</option>
                    <option value="finalized">Finalized</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label style={{ marginRight: '10px' }}>Search:</label>
                  <input
                    type="text"
                    placeholder="Search applicants..."
                    value={applicantFilter.search}
                    onChange={(e) => setApplicantFilter({...applicantFilter, search: e.target.value})}
                    style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ddd' }}
                  />
                </div>
              </div>

              {filteredApplicants && filteredApplicants.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApplicants.map((applicant, index) => (
                      <tr key={index}>
                        <td>{applicant.name || 'N/A'}</td>
                        <td>{applicant.email || 'N/A'}</td>
                        <td>
                          <span style={{
                            fontWeight: 'bold',
                            color: applicant.status === 'accepted' ? 'green' :
                              applicant.status === 'rejected' ? 'red' :
                                applicant.status === 'finalized' ? 'blue' :
                                  'orange'
                          }}>
                            {applicant.status || 'pending'}
                          </span>
                        </td>
                        <td>
                          <button 
                            onClick={() => handleViewApplicantProfile(applicant)}
                            style={{
                              padding: '5px 10px',
                              backgroundColor: '#007bff',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            View Profile
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No applicants match your filters.</p>
              )}
              <button 
                onClick={handleCloseApplicantsModal} 
                style={{ 
                  padding: '8px 15px', 
                  backgroundColor: '#6c757d', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px', 
                  cursor: 'pointer' 
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Applicant Profile Modal */}
        {isProfileModalOpen && selectedApplicant && (
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
            zIndex: 1300,
          }}>
            <div style={{ 
              background: 'white', 
              padding: '30px', 
              borderRadius: '8px', 
              maxHeight: '90vh', 
              overflowY: 'auto', 
              width: '80%',
              maxWidth: '800px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0 }}>
                  {selectedApplicant.name || 'Applicant Profile'}
                </h2>
                <button 
                  onClick={handleCloseProfileModal}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '20px',
                    cursor: 'pointer',
                    color: '#6c757d'
                  }}
                >
                  ×
                </button>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Basic Information</h3>
                <p><strong>Name:</strong> {selectedApplicant.name || 'N/A'}</p>
                <p><strong>Email:</strong> {selectedApplicant.email || 'N/A'}</p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Job Interests</h3>
                <p>{selectedApplicant.jobInterests || 'No job interests specified'}</p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Experience</h3>
                <p><strong>Internships:</strong> {selectedApplicant.internships || 'N/A'}</p>
                <p><strong>Part-time Jobs:</strong> {selectedApplicant.partTimeJobs || 'N/A'}</p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>College Activities</h3>
                <p>{selectedApplicant.collegeActivities || 'No college activities listed'}</p>
              </div>

              <div style={{ marginTop: '20px' }}>
                <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Application Status</h3>
                <p>Current Status: 
                  <span style={{
                    fontWeight: 'bold',
                    color: selectedApplicant.status === 'accepted' ? 'green' :
                          selectedApplicant.status === 'rejected' ? 'red' :
                          selectedApplicant.status === 'finalized' ? 'blue' :
                          'orange'
                  }}>
                    {selectedApplicant.status || 'pending'}
                  </span>
                </p>
                
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button 
                    onClick={() => {
                      handleUpdateApplicantStatus(selectedApplicant.email, 'finalized');
                      setSelectedApplicant({...selectedApplicant, status: 'finalized'});
                    }}
                    style={{ padding: '8px 12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
                  >
                    Mark as Finalized
                  </button>
                  <button 
                    onClick={() => {
                      handleUpdateApplicantStatus(selectedApplicant.email, 'accepted');
                      setSelectedApplicant({...selectedApplicant, status: 'accepted'});
                    }}
                    style={{ padding: '8px 12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}
                  >
                    Accept
                  </button>
                  <button 
                    onClick={() => {
                      handleUpdateApplicantStatus(selectedApplicant.email, 'rejected');
                      setSelectedApplicant({...selectedApplicant, status: 'rejected'});
                    }}
                    style={{ padding: '8px 12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}
                  >
                    Reject
                  </button>
                </div>
              </div>

              <button 
                onClick={handleCloseProfileModal} 
                style={{ 
                  padding: '10px 20px', 
                  backgroundColor: '#007bff', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px', 
                  cursor: 'pointer',
                  fontSize: '16px',
                  marginTop: '20px'
                }}
              >
                Close Profile
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CompanyPage;