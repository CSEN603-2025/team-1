import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getNotification, clearNotifications } from './notification';

function CompanyPage() {
  // State variables remain the same
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
    industry: ''
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
  const [currentJobIndex, setCurrentJobIndex] = useState(null);
  const [isApplicantsModalOpen, setIsApplicantsModalOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [applicantFilter, setApplicantFilter] = useState({
    status: '',
    search: '',
    jobTitle: ''
  });
  const [acceptedInterns, setAcceptedInterns] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('jobs');
  const navigate = useNavigate();
  const location = useLocation();
  const storedCompany = location.state?.company;


  // All useEffect hooks and functions remain the same
  useEffect(() => {
    const storedCompany = location.state?.company;
    if (storedCompany) {
      setCompanyName(storedCompany.companyName || storedCompany.companyEmail);
      
      // Load posted jobs
      const storedJobs = localStorage.getItem(`companyJobs_${storedCompany.companyEmail}`);
      if (storedJobs) {
        setPostedJobs(JSON.parse(storedJobs));
      } else {
        setPostedJobs([]);
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
      industry: ''
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
    
    const jobToSave = editingIndex !== null 
      ? jobData 
      : { 
          ...jobData,
          applicants: [] 
        };

    if (editingIndex !== null) {
      updatedJobs[editingIndex] = jobToSave;
    } else {
      updatedJobs.push(jobToSave);
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
      industry: ''
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
    setCurrentJobIndex(index);
    setIsApplicantsModalOpen(true);
    setApplicantFilter({ status: '', search: '', jobTitle: job.title });
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
    
    if (job.applicants) {
      const updatedApplicants = job.applicants.map(applicant => {
        if (applicant.email === applicantEmail) {
          return { ...applicant, status: newStatus };
        }
        return applicant;
      });
      
      updatedJobs[currentJobIndex].applicants = updatedApplicants;
    }

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

    if (selectedJobApplicants) {
      setSelectedJobApplicants(prev => prev.map(applicant => {
        if (applicant.email === applicantEmail) {
          return { ...applicant, status: newStatus };
        }
        return applicant;
      }));
    }

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

  const getAllApplicants = () => {
    return postedJobs.flatMap(job => 
      (job.applicants || []).map(applicant => ({
        ...applicant,
        jobTitle: job.title,
        jobDuration: job.duration,
        isPaid: job.isPaid,
        salary: job.salary
      }))
    );
  };

  const allApplicants = getAllApplicants();

  const filteredApplicants = allApplicants.filter(applicant => {
    const matchesStatus = !applicantFilter.status || applicant.status === applicantFilter.status;
    const matchesSearch = !applicantFilter.search || 
      (applicant.name && applicant.name.toLowerCase().includes(applicantFilter.search.toLowerCase())) ||
      (applicant.email && applicant.email.toLowerCase().includes(applicantFilter.search.toLowerCase()));
    const matchesJobTitle = !applicantFilter.jobTitle || 
      (applicant.jobTitle && applicant.jobTitle.toLowerCase().includes(applicantFilter.jobTitle.toLowerCase()));
    return matchesStatus && matchesSearch && matchesJobTitle;
  });

  const navigateToAcceptedInterns = () => {
    navigate('/company/interns', { 
      state: { 
        acceptedInterns,
        storedCompany 
      } 
    });
  };

  const navigateToProfile = () => {
    navigate('/companyprofile', { state: { company: storedCompany } });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const newNotifications = getNotification(storedCompany?.companyEmail) || [];
      setNotifications(newNotifications);
    }, 3000);

    return () => clearInterval(interval);
  }, [storedCompany?.companyEmail]);
  
  const handleBellClick = () => {
    const fetchedNotifications = getNotification(storedCompany?.companyEmail) || [];
    setNotifications(fetchedNotifications);
    setIsPopupOpen(prev => !prev);
  };

  const handleClosePopup = () => {
    clearNotifications(storedCompany?.companyEmail);
    setNotifications([]);
    setIsPopupOpen(false);
  };

  // Simplified color palette
  const theme = {
    primary: '#6b46c1', // Main purple
    primaryTransparent: 'rgba(47, 2, 68, 0.42)', // More transparent purple for sidebar
    primaryLight: '#e9d8fd', // Light purple for backgrounds
    primaryDark: '#553c9a', // Dark purple for hover states
    neutral: {
      lightest: '#f8fafc',
      light: '#e2e8f0',
      medium: '#64748b',
      dark: '#334155',
      darkest: '#1e293b'
    },
    status: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      pending: '#64748b'
    }
  };

  // Menu items with icons
  const menuItems = [
    { 
      text: "Dashboard", 
      to: "/company-dashboard", 
      state: { company: storedCompany },
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="9"></rect>
          <rect x="14" y="3" width="7" height="5"></rect>
          <rect x="14" y="12" width="7" height="9"></rect>
          <rect x="3" y="16" width="7" height="5"></rect>
        </svg>
      )
    },
    { 
      text: "Profile", 
      to: "/companyprofile", 
      state: { company: storedCompany },
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      )
    },
    { 
      text: "Post a Job", 
      onClick: handleJobModalToggle,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="12" y1="18" x2="12" y2="12"></line>
          <line x1="9" y1="15" x2="15" y2="15"></line>
        </svg>
      )
    },
    { 
      text: "Posted Jobs", 
      to: "/companyallpostedjobs", 
      state: { storedCompany },
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
        </svg>
      )
    },
    { 
      text: "Your Interns", 
      onClick: navigateToAcceptedInterns,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      )
    },
    { 
      text: "Logout", 
      onClick: handleLogout,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
      )
    }
  ];

  // Common button style
  const buttonStyle = {
    primary: {
      backgroundColor: theme.primary,
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      padding: '8px 16px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'background-color 0.2s',
    },
    secondary: {
      backgroundColor: 'white',
      color: theme.primary,
      border: `1px solid ${theme.primary}`,
      borderRadius: '4px',
      padding: '8px 16px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.2s',
    },
    danger: {
      backgroundColor: 'white',
      color: theme.status.error,
      border: `1px solid ${theme.status.error}`,
      borderRadius: '4px',
      padding: '8px 16px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.2s',
    }
  };
  
  return (
    <div style={{ display: 'flex', backgroundColor: theme.neutral.lightest, minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Sidebar - Updated with more transparent purple */}
      <div
        style={{
          width: menuOpen ? '240px' : '0',
          height: '100vh',
          backgroundColor: 'transparent', // Make background transparent
          backdropFilter: 'blur(10px)',
          overflowX: 'hidden',
          transition: 'all 0.3s ease-in-out',
          padding: menuOpen ? '20px 0 0 0' : '0',
          boxShadow: menuOpen ? '0 0 15px rgba(0, 0, 0, 0.1)' : 'none',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 1000,
          color: 'white',
          borderRight: menuOpen ? `1px solid ${theme.primaryTransparent}` : 'none',
          background: `linear-gradient(to bottom, ${theme.primaryTransparent}, rgba(107, 70, 193, 0.3))`, // Gradient background
        }}
      >
        {menuOpen && (
          <>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '0 20px 20px 20px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              marginBottom: '20px'
            }}>
              <h1 style={{ 
                margin: 0, 
                fontSize: '20px', 
                fontWeight: '600',
                color: 'white'
              }}>
                Company Portal
              </h1>
              <button 
                onClick={toggleMenu}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  fontSize: '20px',
                  cursor: 'pointer',
                  padding: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                &times;
              </button>
            </div>
            
            <ul style={{ 
              listStyleType: 'none', 
              padding: 0, 
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
            }}>
              {menuItems.map((item, index) => (
                <li key={index} style={{ 
                  margin: '0',
                  transition: 'all 0.2s ease',
                }}>
                  {item.to ? (
                    <Link 
                      to={item.to}
                      state={item.state || {}}
                      style={{ 
                        color: 'white', 
                        textDecoration: 'none',
                        fontSize: '15px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 20px',
                        transition: 'all 0.2s',
                        borderLeft: '3px solid transparent',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)', // Subtle highlight
                        margin: '2px 0',
                      }}
                    >
                      {item.icon}
                      {item.text}
                    </Link>
                  ) : (
                    <button 
                      onClick={item.onClick}
                      style={{ 
                        background: 'rgba(255, 255, 255, 0.05)', // Subtle highlight
                        border: 'none', 
                        color: 'white', 
                        textDecoration: 'none',
                        fontSize: '15px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        padding: '12px 20px',
                        width: '100%',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        transition: 'all 0.2s',
                        borderLeft: '3px solid transparent',
                        margin: '2px 0',
                      }}
                    >
                      {item.icon}
                      {item.text}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* Main Content */}
      <div style={{ 
        marginLeft: menuOpen ? '240px' : '0', 
        transition: 'margin-left 0.3s', 
        padding: '0', 
        width: '100%',
        backgroundColor: theme.neutral.lightest,
      }}>
        {/* Header */}
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '15px 30px',
          backgroundColor: 'white',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button
              onClick={toggleMenu}
              style={{
                fontSize: '24px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: theme.neutral.dark,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ☰
            </button>
            <h1 style={{ 
              margin: 0, 
              fontSize: '20px', 
              fontWeight: '600',
              color: theme.neutral.darkest
            }}>
              Company Portal
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* Notification Bell */}
            <div
              onClick={handleBellClick}
              style={{
                cursor: 'pointer',
                color: theme.neutral.dark,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: theme.neutral.lightest,
                transition: 'background-color 0.2s',
                position: 'relative',
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20" 
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              {notifications.length > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '0',
                    right: '0',
                    backgroundColor: theme.status.error,
                    color: 'white',
                    borderRadius: '50%',
                    width: '16px',
                    height: '16px',
                    fontSize: '10px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {notifications.length}
                </span>
              )}
            </div>

            {/* User Profile */}
            <div 
              onClick={navigateToProfile}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
              }}
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: theme.primaryLight,
                color: theme.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '600',
                fontSize: '14px',
              }}>
                {companyName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: '500',
                  color: theme.neutral.darkest
                }}>
                  {companyName}
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  color: theme.neutral.medium
                }}>
                  Company
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Notification Popup */}
        {isPopupOpen && (
          <div
            style={{
              position: 'absolute',
              top: '70px',
              right: '30px',
              backgroundColor: 'white',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
              padding: '20px',
              borderRadius: '8px',
              width: '320px',
              zIndex: 9999,
              border: `1px solid ${theme.neutral.light}`,
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '15px',
              borderBottom: `1px solid ${theme.neutral.light}`,
              paddingBottom: '10px'
            }}>
              <h4 style={{ 
                margin: 0, 
                fontSize: '16px', 
                fontWeight: '600',
                color: theme.neutral.darkest
              }}>
                Notifications
              </h4>
              <button
                onClick={handleClosePopup}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: theme.neutral.medium,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ×
              </button>
            </div>
            {notifications.length === 0 ? (
              <div style={{
                padding: '20px 0',
                textAlign: 'center',
                color: theme.neutral.medium,
                fontSize: '14px'
              }}>
                No notifications
              </div>
            ) : (
              notifications.map((notification, index) => (
                <div key={index} style={{ 
                  marginBottom: '15px',
                  padding: '12px',
                  backgroundColor: theme.neutral.lightest,
                  borderRadius: '6px',
                  borderLeft: `3px solid ${theme.primary}`
                }}>
                  <p style={{ 
                    margin: '0 0 5px 0',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: theme.neutral.darkest
                  }}>
                    {notification.message}
                  </p>
                  <p style={{ 
                    margin: 0,
                    fontSize: '12px',
                    color: theme.neutral.medium
                  }}>
                    {new Date(notification.timestamp).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        <div style={{ padding: '30px' }}>
          {/* Welcome Section */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          }}>
            <h1 style={{ 
              fontSize: '24px', 
              fontWeight: '600', 
              color: theme.neutral.darkest,
              marginTop: 0,
              marginBottom: '8px'
            }}>
              Welcome to Company Portal
            </h1>
            <p style={{ 
              fontSize: '15px', 
              color: theme.neutral.medium,
              margin: 0
            }}>
              This is your dashboard where you can manage job postings, view applicants, and access company resources.
            </p>
          </div>

          {/* Tab Navigation */}
          <div style={{ 
            display: 'flex', 
            marginBottom: '24px', 
            borderBottom: `1px solid ${theme.neutral.light}`,
          }}>
            <button
              onClick={() => setActiveTab('jobs')}
              style={{
                padding: '12px 24px',
                backgroundColor: 'transparent',
                color: activeTab === 'jobs' ? theme.primary : theme.neutral.medium,
                border: 'none',
                borderBottom: activeTab === 'jobs' ? `2px solid ${theme.primary}` : 'none',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                marginRight: '8px',
              }}
            >
              Posted Jobs
            </button>
            <button
              onClick={() => setActiveTab('applicants')}
              style={{
                padding: '12px 24px',
                backgroundColor: 'transparent',
                color: activeTab === 'applicants' ? theme.primary : theme.neutral.medium,
                border: 'none',
                borderBottom: activeTab === 'applicants' ? `2px solid ${theme.primary}` : 'none',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
              }}
            >
              Applicants
            </button>
          </div>

          {/* Posted Jobs Tab */}
          {activeTab === 'jobs' && (
            <div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '24px' 
              }}>
                <h2 style={{ 
                  margin: 0, 
                  fontSize: '18px', 
                  fontWeight: '600',
                  color: theme.neutral.darkest
                }}>
                  My Posted Jobs
                </h2>
                <button 
                  onClick={handleJobModalToggle}
                  style={{
                    ...buttonStyle.primary,
                    backgroundColor: theme.primary,
                  }}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  Post New Job
                </button>
              </div>

              {/* Filter Section for Jobs */}
              <div style={{ 
                marginBottom: '24px', 
                padding: '20px', 
                backgroundColor: 'white', 
                borderRadius: '8px',
                border: `1px solid ${theme.neutral.light}`,
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}>
                <div style={{ position: 'relative', marginBottom: '20px' }}>
                  <svg 
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '12px',
                      transform: 'translateY(-50%)',
                      pointerEvents: 'none',
                    }}
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={theme.neutral.medium}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <input
                    type="text"
                    placeholder="Search by job title or required skills..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      padding: '10px 12px 10px 36px',
                      width: '90%',
                      border: `1px solid ${theme.neutral.light}`,
                      borderRadius: '4px',
                      fontSize: '14px',
                      backgroundColor: theme.neutral.lightest,
                      outline: 'none',
                      transition: 'all 0.2s ease',
                    }}
                  />
                </div>

                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: '16px', 
                  alignItems: 'center' 
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    backgroundColor: theme.neutral.lightest,
                    padding: '8px 16px',
                    borderRadius: '4px',
                    border: `1px solid ${theme.neutral.light}`,
                  }}>
                    <span style={{ 
                      marginRight: '12px', 
                      fontWeight: '500',
                      fontSize: '14px', 
                      color: theme.neutral.medium
                    }}>
                      Payment:
                    </span>
                    <label style={{ 
                      marginRight: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '14px', 
                      color: theme.neutral.dark,
                      cursor: 'pointer'
                    }}>
                      <input
                        type="checkbox"
                        checked={filterPaid.paid}
                        onChange={(e) => setFilterPaid(prev => ({ ...prev, paid: e.target.checked }))}
                        style={{ 
                          width: '14px',
                          height: '14px',
                          accentColor: theme.primary
                        }}
                      /> 
                      Paid
                    </label>
                    <label style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '14px', 
                      color: theme.neutral.dark,
                      cursor: 'pointer'
                    }}>
                      <input
                        type="checkbox"
                        checked={filterPaid.unpaid}
                        onChange={(e) => setFilterPaid(prev => ({ ...prev, unpaid: e.target.checked }))}
                        style={{ 
                          width: '14px',
                          height: '14px',
                          accentColor: theme.primary
                        }}
                      /> 
                      Unpaid
                    </label>
                  </div>

                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    backgroundColor: theme.neutral.lightest,
                    padding: '8px 16px',
                    borderRadius: '4px',
                    border: `1px solid ${theme.neutral.light}`,
                  }}>
                    <span style={{ 
                      marginRight: '12px', 
                      fontWeight: '500',
                      fontSize: '14px', 
                      color: theme.neutral.medium
                    }}>
                      Duration:
                    </span>
                    {['1 month', '2 months', '3 months'].map(duration => (
                      <label key={duration} style={{ 
                        marginRight: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '14px', 
                        color: theme.neutral.dark,
                        cursor: 'pointer'
                      }}>
                        <input
                          type="checkbox"
                          checked={filterDuration[duration]}
                          onChange={(e) => setFilterDuration(prev => ({
                            ...prev,
                            [duration]: e.target.checked,
                          }))}
                          style={{ 
                            width: '14px',
                            height: '14px',
                            accentColor: theme.primary
                          }}
                        /> 
                        {duration}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Jobs Table */}
              {filteredJobs.length > 0 ? (
                <div style={{ 
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  overflow: 'hidden',
                  border: `1px solid ${theme.neutral.light}`,
                  marginBottom: '30px'
                }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ 
                      width: '100%', 
                      borderCollapse: 'collapse',
                    }}>
                      <thead>
                        <tr style={{ 
                          backgroundColor: theme.neutral.lightest,
                          borderBottom: `1px solid ${theme.neutral.light}`
                        }}>
                          <th style={{ 
                            padding: '14px 20px', 
                            textAlign: 'left',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: theme.neutral.medium,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Title
                          </th>
                          <th style={{ 
                            padding: '14px 20px', 
                            textAlign: 'left',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: theme.neutral.medium,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Duration
                          </th>
                          <th style={{ 
                            padding: '14px 20px', 
                            textAlign: 'left',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: theme.neutral.medium,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Compensation
                          </th>
                          <th style={{ 
                            padding: '14px 20px', 
                            textAlign: 'left',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: theme.neutral.medium,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Skills
                          </th>
                          <th style={{ 
                            padding: '14px 20px', 
                            textAlign: 'left',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: theme.neutral.medium,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Applicants
                          </th>
                          <th style={{ 
                            padding: '14px 20px', 
                            textAlign: 'right',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: theme.neutral.medium,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredJobs.map((job, index) => (
                          <tr key={index} style={{ 
                            borderBottom: index < filteredJobs.length - 1 ? `1px solid ${theme.neutral.light}` : 'none',
                            transition: 'background-color 0.2s',
                          }}>
                            <td style={{ padding: '14px 20px', fontSize: '14px', fontWeight: '500', color: theme.neutral.darkest }}>
                              {job.title}
                            </td>
                            <td style={{ padding: '14px 20px', fontSize: '14px', color: theme.neutral.dark }}>
                              {job.duration}
                            </td>
                            <td style={{ padding: '14px 20px' }}>
                              <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                padding: '4px 10px',
                                borderRadius: '4px',
                                backgroundColor: job.isPaid ? `${theme.primaryLight}` : theme.neutral.lightest,
                                color: job.isPaid ? theme.primary : theme.neutral.medium,
                                fontSize: '13px',
                                fontWeight: '500',
                              }}>
                                <span style={{
                                  width: '6px',
                                  height: '6px',
                                  borderRadius: '50%',
                                  backgroundColor: job.isPaid ? theme.primary : theme.neutral.medium,
                                  marginRight: '6px',
                                }}></span>
                                {job.isPaid ? (job.salary || 'Paid') : 'Unpaid'}
                              </div>
                            </td>
                            <td style={{ padding: '14px 20px' }}>
                              <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '6px',
                              }}>
                                {job.skills && job.skills.split(',').slice(0, 2).map((skill, i) => (
                                  <span key={i} style={{
                                    padding: '2px 8px',
                                    backgroundColor: theme.primaryLight,
                                    color: theme.primary,
                                    borderRadius: '4px',
                                    fontSize: '13px',
                                    fontWeight: '500',
                                    whiteSpace: 'nowrap',
                                  }}>
                                    {skill.trim()}
                                  </span>
                                ))}
                                {job.skills && job.skills.split(',').length > 2 && (
                                  <span style={{
                                    padding: '2px 8px',
                                    backgroundColor: theme.neutral.lightest,
                                    color: theme.neutral.medium,
                                    borderRadius: '4px',
                                    fontSize: '13px',
                                    fontWeight: '500',
                                  }}>
                                    +{job.skills.split(',').length - 2} more
                                  </span>
                                )}
                              </div>
                            </td>
                            <td style={{ padding: '14px 20px' }}>
                              <span style={{ 
                                display: 'inline-flex',
                                alignItems: 'center',
                                padding: '4px 10px',
                                backgroundColor: job.applicants?.length > 0 ? theme.primaryLight : theme.neutral.lightest,
                                color: job.applicants?.length > 0 ? theme.primary : theme.neutral.medium,
                                borderRadius: '4px',
                                fontSize: '13px',
                                fontWeight: '500',
                                cursor: job.applicants?.length > 0 ? 'pointer' : 'default'
                              }}
                              onClick={() => job.applicants?.length > 0 && handleViewApplicants(job, index)}
                              >
                                {job.applicants ? job.applicants.length : 0} applicant(s)
                              </span>
                            </td>
                            <td style={{ 
                              padding: '14px 20px',
                              textAlign: 'right'
                            }}>
                              <div style={{
                                display: 'flex',
                                gap: '8px',
                                justifyContent: 'flex-end',
                              }}>
                                <button 
                                  onClick={() => handleEditJob(index)}
                                  style={buttonStyle.secondary}
                                >
                                  <svg 
                                    width="14" 
                                    height="14" 
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="2" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                  >
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                  </svg>
                                  Edit
                                </button>
                                <button 
                                  onClick={() => handleDeleteJob(index)}
                                  style={buttonStyle.danger}
                                >
                                  <svg 
                                    width="14" 
                                    height="14" 
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="2" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                  >
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                  </svg>
                                  Delete
                                </button>
                                {job.applicants?.length > 0 && (
                                  <button 
                                    onClick={() => handleViewApplicants(job, index)}
                                    style={buttonStyle.secondary}
                                  >
                                    <svg 
                                      width="14" 
                                      height="14" 
                                      viewBox="0 0 24 24" 
                                      fill="none" 
                                      stroke="currentColor" 
                                      strokeWidth="2" 
                                      strokeLinecap="round" 
                                      strokeLinejoin="round"
                                    >
                                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                      <circle cx="9" cy="7" r="4"></circle>
                                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                    </svg>
                                    Applicants
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div style={{ 
                  padding: '40px', 
                  backgroundColor: 'white', 
                  borderRadius: '8px', 
                  textAlign: 'center',
                  border: `1px solid ${theme.neutral.light}`,
                  marginBottom: '30px'
                }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: theme.primaryLight,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px auto',
                  }}>
                    <svg 
                      width="24" 
                      height="24" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke={theme.primary} 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                  </div>
                  <h3 style={{
                    margin: '0 0 8px 0',
                    fontSize: '18px',
                    fontWeight: '600',
                    color: theme.neutral.darkest,
                  }}>
                    No jobs match your filters
                  </h3>
                  <p style={{
                    margin: '0 0 20px 0',
                    fontSize: '14px',
                    color: theme.neutral.medium,
                    maxWidth: '400px',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                  }}>
                    Try adjusting your search criteria or post a new job.
                  </p>
                  <button 
                    onClick={handleJobModalToggle}
                    style={buttonStyle.primary}
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Post New Job
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Applicants Tab */}
          {activeTab === 'applicants' && (
            <div>
              <h2 style={{ 
                margin: '0 0 24px 0', 
                fontSize: '18px', 
                fontWeight: '600',
                color: theme.neutral.darkest
              }}>
                All Applicants
              </h2>
              
              {/* Filter Section for Applicants */}
              <div style={{ 
                marginBottom: '24px', 
                padding: '20px', 
                backgroundColor: 'white', 
                borderRadius: '8px',
                border: `1px solid ${theme.neutral.light}`,
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}>
                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: '16px', 
                  marginBottom: '10px' 
                }}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      color: theme.neutral.medium
                    }}>
                      Search by Name or Email:
                    </label>
                    <div style={{ position: 'relative' }}>
                      <svg 
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '12px',
                          transform: 'translateY(-50%)',
                          pointerEvents: 'none',
                        }}
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={theme.neutral.medium}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                      <input
                        type="text"
                        placeholder="Search applicants..."
                        value={applicantFilter.search}
                        onChange={(e) => setApplicantFilter({...applicantFilter, search: e.target.value})}
                        style={{ 
                          padding: '10px 12px 10px 36px',
                          width: '90%',
                          border: `1px solid ${theme.neutral.light}`,
                          borderRadius: '4px',
                          fontSize: '14px',
                          backgroundColor: theme.neutral.lightest,
                          outline: 'none',
                          transition: 'all 0.2s ease',
                        }}
                      />
                    </div>
                  </div>
                  
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      color: theme.neutral.medium
                    }}>
                      Search by Job Title:
                    </label>
                    <div style={{ position: 'relative' }}>
                      <svg 
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '12px',
                          transform: 'translateY(-50%)',
                          pointerEvents: 'none',
                        }}
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={theme.neutral.medium}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                        <line x1="12" y1="22.08" x2="12" y2="12"></line>
                      </svg>
                      <input
                        type="text"
                        placeholder="Search by job title..."
                        value={applicantFilter.jobTitle}
                        onChange={(e) => setApplicantFilter({...applicantFilter, jobTitle: e.target.value})}
                        style={{ 
                          padding: '10px 12px 10px 36px',
                          width: '90%',
                          border: `1px solid ${theme.neutral.light}`,
                          borderRadius: '4px',
                          fontSize: '14px',
                          backgroundColor: theme.neutral.lightest,
                          outline: 'none',
                          transition: 'all 0.2s ease',
                        }}
                      />
                    </div>
                  </div>
                  
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      color: theme.neutral.medium
                    }}>
                      Status:
                    </label>
                    <select
                      value={applicantFilter.status}
                      onChange={(e) => setApplicantFilter({...applicantFilter, status: e.target.value})}
                      style={{ 
                        padding: '10px 12px',
                        width: '90%',
                        border: `1px solid ${theme.neutral.light}`,
                        borderRadius: '4px',
                        fontSize: '14px',
                        backgroundColor: theme.neutral.lightest,
                        outline: 'none',
                        transition: 'all 0.2s ease',
                        appearance: 'none',
                        backgroundImage:
                          'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%2364748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>\')',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 12px center',
                        backgroundSize: '16px',
                      }}
                    >
                      <option value="">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="finalized">Finalized</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Applicants Table */}
              {filteredApplicants.length > 0 ? (
                <div style={{ 
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  overflow: 'hidden',
                  border: `1px solid ${theme.neutral.light}`,
                  marginBottom: '30px'
                }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ 
                      width: '100%', 
                      borderCollapse: 'collapse',
                    }}>
                      <thead>
                        <tr style={{ 
                          backgroundColor: theme.neutral.lightest,
                          borderBottom: `1px solid ${theme.neutral.light}`
                        }}>
                          <th style={{ 
                            padding: '14px 20px', 
                            textAlign: 'left',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: theme.neutral.medium,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Name
                          </th>
                          <th style={{ 
                            padding: '14px 20px', 
                            textAlign: 'left',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: theme.neutral.medium,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Email
                          </th>
                          <th style={{ 
                            padding: '14px 20px', 
                            textAlign: 'left',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: theme.neutral.medium,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Job Title
                          </th>
                          <th style={{ 
                            padding: '14px 20px', 
                            textAlign: 'left',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: theme.neutral.medium,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Status
                          </th>
                          <th style={{ 
                            padding: '14px 20px', 
                            textAlign: 'right',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: theme.neutral.medium,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredApplicants.map((applicant, index) => (
                          <tr key={index} style={{ 
                            borderBottom: index < filteredApplicants.length - 1 ? `1px solid ${theme.neutral.light}` : 'none',
                            transition: 'background-color 0.2s',
                          }}>
                            <td style={{ padding: '14px 20px', fontSize: '14px', fontWeight: '500', color: theme.neutral.darkest }}>
                              {applicant.name || 'N/A'}
                            </td>
                            <td style={{ padding: '14px 20px', fontSize: '14px', color: theme.neutral.dark }}>
                              {applicant.email || 'N/A'}
                            </td>
                            <td style={{ padding: '14px 20px', fontSize: '14px', color: theme.neutral.darkest }}>
                              {applicant.jobTitle || 'N/A'}
                            </td>
                            <td style={{ padding: '14px 20px' }}>
                              <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                padding: '4px 10px',
                                borderRadius: '4px',
                                backgroundColor: 
                                  applicant.status === 'accepted' ? 'rgba(16, 185, 129, 0.1)' :
                                  applicant.status === 'rejected' ? 'rgba(239, 68, 68, 0.1)' :
                                  applicant.status === 'finalized' ? theme.primaryLight : 
                                  theme.neutral.lightest,
                                color: 
                                  applicant.status === 'accepted' ? theme.status.success :
                                  applicant.status === 'rejected' ? theme.status.error :
                                  applicant.status === 'finalized' ? theme.primary : 
                                  theme.neutral.medium,
                                fontSize: '13px',
                                fontWeight: '500',
                              }}>
                                <span style={{
                                  width: '6px',
                                  height: '6px',
                                  borderRadius: '50%',
                                  backgroundColor: 
                                    applicant.status === 'accepted' ? theme.status.success :
                                    applicant.status === 'rejected' ? theme.status.error :
                                    applicant.status === 'finalized' ? theme.primary : 
                                    theme.neutral.medium,
                                  marginRight: '6px',
                                }}></span>
                                {applicant.status || 'pending'}
                              </div>
                            </td>
                            <td style={{ 
                              padding: '14px 20px',
                              textAlign: 'right'
                            }}>
                              <button 
                                onClick={() => {
                                  // Find the job this applicant applied to
                                  const jobIndex = postedJobs.findIndex(job => job.title === applicant.jobTitle);
                                  if (jobIndex !== -1) {
                                    setCurrentJobIndex(jobIndex);
                                    setSelectedJobApplicants(postedJobs[jobIndex].applicants || []);
                                    setSelectedApplicant(applicant);
                                    setIsProfileModalOpen(true);
                                  }
                                }}
                                style={buttonStyle.primary}
                              >
                                <svg 
                                  width="14" 
                                  height="14" 
                                  viewBox="0 0 24 24" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  strokeWidth="2" 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round"
                                >
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                  <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                                View Profile
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div style={{ 
                  padding: '40px', 
                  backgroundColor: 'white', 
                  borderRadius: '8px', 
                  textAlign: 'center',
                  border: `1px solid ${theme.neutral.light}`,
                  marginBottom: '30px'
                }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: theme.primaryLight,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px auto',
                  }}>
                    <svg 
                      width="24" 
                      height="24" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke={theme.primary} 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                  </div>
                  <h3 style={{
                    margin: '0 0 8px 0',
                    fontSize: '18px',
                    fontWeight: '600',
                    color: theme.neutral.darkest,
                  }}>
                    No applicants match your filters
                  </h3>
                  <p style={{
                    margin: '0',
                    fontSize: '14px',
                    color: theme.neutral.medium,
                    maxWidth: '400px',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                  }}>
                    Try adjusting your search criteria.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

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
            zIndex: 1400
          }}>
            <div style={{ 
              background: 'white', 
              padding: '24px', 
              borderRadius: '8px', 
              width: '600px',
              maxWidth: '90%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '20px',
                borderBottom: `1px solid ${theme.neutral.light}`,
                paddingBottom: '16px'
              }}>
                <h2 style={{ 
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: '600',
                  color: theme.neutral.darkest
                }}>
                  {editingIndex !== null ? 'Edit Job' : 'Post a New Job'}
                </h2>
                <button 
                  onClick={handleJobModalToggle}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '20px',
                    cursor: 'pointer',
                    color: theme.neutral.medium,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleJobSubmit}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    color: theme.neutral.darkest
                  }}>
                    Job Title
                  </label>
                  <input 
                    type="text" 
                    name="title" 
                    value={jobData.title} 
                    onChange={handleJobInputChange} 
                    required
                    style={{ 
                      width: '100%', 
                      padding: '10px 12px', 
                      borderRadius: '4px',
                      border: `1px solid ${theme.neutral.light}`,
                      fontSize: '14px',
                      backgroundColor: theme.neutral.lightest,
                      outline: 'none',
                      transition: 'all 0.2s ease',
                    }} 
                  />
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    color: theme.neutral.darkest
                  }}>
                    Duration
                  </label>
                  <select 
                    name="duration" 
                    value={jobData.duration} 
                    onChange={handleJobInputChange} 
                    required
                    style={{ 
                      width: '100%', 
                      padding: '10px 12px', 
                      borderRadius: '4px',
                      border: `1px solid ${theme.neutral.light}`,
                      fontSize: '14px',
                      backgroundColor: theme.neutral.lightest,
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      appearance: 'none',
                      backgroundImage:
                        'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%2364748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>\')',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 12px center',
                      backgroundSize: '16px',
                    }}
                  >
                    <option value="">Select Duration</option>
                    <option value="1 month">1 month</option>
                    <option value="2 months">2 months</option>
                    <option value="3 months">3 months</option>
                  </select>
                </div>
                
                <div style={{ 
                  marginBottom: '16px', 
                  display: 'flex', 
                  alignItems: 'center',
                  backgroundColor: theme.neutral.lightest,
                  padding: '10px 12px',
                  borderRadius: '4px',
                  border: `1px solid ${theme.neutral.light}`,
                }}>
                  <input 
                    type="checkbox" 
                    id="isPaid"
                    name="isPaid" 
                    checked={jobData.isPaid} 
                    onChange={handleJobInputChange} 
                    style={{ 
                      width: '16px',
                      height: '16px',
                      marginRight: '12px',
                      accentColor: theme.primary
                    }}
                  />
                  <label 
                    htmlFor="isPaid"
                    style={{ 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      color: theme.neutral.darkest,
                      cursor: 'pointer'
                    }}
                  >
                    Paid Position
                  </label>
                </div>
                
                {jobData.isPaid && (
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      color: theme.neutral.darkest
                    }}>
                      Salary
                    </label>
                    <input 
                      type="text" 
                      name="salary" 
                      value={jobData.salary} 
                      onChange={handleJobInputChange} 
                      placeholder="e.g. $2000/month"
                      style={{ 
                        width: '100%', 
                        padding: '10px 12px', 
                        borderRadius: '4px',
                        border: `1px solid ${theme.neutral.light}`,
                        fontSize: '14px',
                        backgroundColor: theme.neutral.lightest,
                        outline: 'none',
                        transition: 'all 0.2s ease',
                      }} 
                    />
                  </div>
                )}
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    color: theme.neutral.darkest
                  }}>
                    Required Skills
                  </label>
                  <input 
                    type="text" 
                    name="skills" 
                    value={jobData.skills} 
                    onChange={handleJobInputChange} 
                    required
                    placeholder="e.g. React, JavaScript, HTML, CSS"
                    style={{ 
                      width: '100%', 
                      padding: '10px 12px', 
                      borderRadius: '4px',
                      border: `1px solid ${theme.neutral.light}`,
                      fontSize: '14px',
                      backgroundColor: theme.neutral.lightest,
                      outline: 'none',
                      transition: 'all 0.2s ease',
                    }} 
                  />
                  <p style={{
                    margin: '4px 0 0 0',
                    fontSize: '12px',
                    color: theme.neutral.medium,
                  }}>
                    Separate skills with commas
                  </p>
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    color: theme.neutral.darkest
                  }}>
                    Job Description
                  </label>
                  <textarea 
                    name="description" 
                    value={jobData.description} 
                    onChange={handleJobInputChange} 
                    required
                    rows="5"
                    placeholder="Describe the responsibilities and expectations for this internship..."
                    style={{ 
                      width: '100%', 
                      padding: '10px 12px', 
                      borderRadius: '4px',
                      border: `1px solid ${theme.neutral.light}`,
                      fontSize: '14px',
                      backgroundColor: theme.neutral.lightest,
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      resize: 'vertical',
                      minHeight: '100px',
                      lineHeight: '1.5',
                      fontFamily: 'inherit',
                    }} 
                  />
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    color: theme.neutral.darkest
                  }}>
                    Industry
                  </label>
                  <input 
                    type="text" 
                    name="industry" 
                    value={jobData.industry} 
                    onChange={handleJobInputChange}
                    placeholder="e.g. Technology, Marketing, Finance"
                    style={{ 
                      width: '100%', 
                      padding: '10px 12px', 
                      borderRadius: '4px',
                      border: `1px solid ${theme.neutral.light}`,
                      fontSize: '14px',
                      backgroundColor: theme.neutral.lightest,
                      outline: 'none',
                      transition: 'all 0.2s ease',
                    }} 
                  />
                </div>
                
                <button 
                  type="submit"
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    backgroundColor: theme.primary,
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  {editingIndex !== null ? (
                    <>
                      <svg 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                        <polyline points="17 21 17 13 7 13 7 21"></polyline>
                        <polyline points="7 3 7 8 15 8"></polyline>
                      </svg>
                      Update Job
                    </>
                  ) : (
                    <>
                      <svg 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="12" y1="18" x2="12" y2="12"></line>
                        <line x1="9" y1="15" x2="15" y2="15"></line>
                      </svg>
                      Post Job
                    </>
                  )}
                </button>
              </form>
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
              padding: '24px', 
              borderRadius: '8px', 
              maxHeight: '80vh', 
              overflowY: 'auto', 
              width: '80%',
              maxWidth: '900px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '20px',
                borderBottom: `1px solid ${theme.neutral.light}`,
                paddingBottom: '16px'
              }}>
                <h2 style={{ 
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: '600',
                  color: theme.neutral.darkest
                }}>
                  Applicants for {postedJobs[currentJobIndex]?.title}
                </h2>
                <button 
                  onClick={handleCloseApplicantsModal}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '20px',
                    cursor: 'pointer',
                    color: theme.neutral.medium,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  ×
                </button>
              </div>
              
              {/* Filter Controls */}
              <div style={{ 
                marginBottom: '20px', 
                display: 'flex', 
                gap: '16px', 
                flexWrap: 'wrap',
                backgroundColor: theme.neutral.lightest,
                padding: '16px',
                borderRadius: '8px',
                border: `1px solid ${theme.neutral.light}`,
              }}>
                <div style={{ flex: '1 1 200px' }}>
                  <label style={{ 
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: theme.neutral.medium
                  }}>
                    Status:
                  </label>
                  <select
                    value={applicantFilter.status}
                    onChange={(e) => setApplicantFilter({...applicantFilter, status: e.target.value})}
                    style={{ 
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '4px',
                      border: `1px solid ${theme.neutral.light}`,
                      fontSize: '14px',
                      backgroundColor: 'white',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      appearance: 'none',
                      backgroundImage:
                        'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%2364748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>\')',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 12px center',
                      backgroundSize: '16px',
                    }}
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="finalized">Finalized</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div style={{ flex: '1 1 200px' }}>
                  <label style={{ 
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: theme.neutral.medium
                  }}>
                    Search:
                  </label>
                  <div style={{ position: 'relative' }}>
                    <svg 
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '12px',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none',
                      }}
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={theme.neutral.medium}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input
                      type="text"
                      placeholder="Search applicants..."
                      value={applicantFilter.search}
                      onChange={(e) => setApplicantFilter({...applicantFilter, search: e.target.value})}
                      style={{ 
                        width: '100%',
                        padding: '10px 12px 10px 36px',
                        borderRadius: '4px',
                        border: `1px solid ${theme.neutral.light}`,
                        fontSize: '14px',
                        backgroundColor: 'white',
                        outline: 'none',
                        transition: 'all 0.2s ease',
                      }}
                    />
                  </div>
                </div>
              </div>

              {filteredApplicants && filteredApplicants.length > 0 ? (
                <div style={{ 
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: `1px solid ${theme.neutral.light}`,
                  marginBottom: '20px'
                }}>
                  <table style={{ 
                    width: '100%', 
                    borderCollapse: 'collapse',
                  }}>
                    <thead>
                      <tr style={{ 
                        backgroundColor: theme.neutral.lightest,
                        borderBottom: `1px solid ${theme.neutral.light}`
                      }}>
                        <th style={{ 
                          padding: '14px 20px', 
                          textAlign: 'left',
                          fontSize: '13px',
                          fontWeight: '600',
                          color: theme.neutral.medium,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          Name
                        </th>
                        <th style={{ 
                          padding: '14px 20px', 
                          textAlign: 'left',
                          fontSize: '13px',
                          fontWeight: '600',
                          color: theme.neutral.medium,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          Email
                        </th>
                        <th style={{ 
                          padding: '14px 20px', 
                          textAlign: 'left',
                          fontSize: '13px',
                          fontWeight: '600',
                          color: theme.neutral.medium,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          Status
                        </th>
                        <th style={{ 
                          padding: '14px 20px', 
                          textAlign: 'right',
                          fontSize: '13px',
                          fontWeight: '600',
                          color: theme.neutral.medium,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredApplicants.map((applicant, index) => (
                        <tr key={index} style={{ 
                          borderBottom: index < filteredApplicants.length - 1 ? `1px solid ${theme.neutral.light}` : 'none',
                          transition: 'background-color 0.2s',
                        }}>
                          <td style={{ 
                            padding: '14px 20px',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: theme.neutral.darkest
                          }}>
                            {applicant.name || 'N/A'}
                          </td>
                          <td style={{ 
                            padding: '14px 20px',
                            fontSize: '14px',
                            color: theme.neutral.dark
                          }}>
                            {applicant.email || 'N/A'}
                          </td>
                          <td style={{ padding: '14px 20px' }}>
                            <div style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '4px 10px',
                              borderRadius: '4px',
                              backgroundColor: 
                                applicant.status === 'accepted' ? 'rgba(16, 185, 129, 0.1)' :
                                applicant.status === 'rejected' ? 'rgba(239, 68, 68, 0.1)' :
                                applicant.status === 'finalized' ? theme.primaryLight : 
                                theme.neutral.lightest,
                              color: 
                                applicant.status === 'accepted' ? theme.status.success :
                                applicant.status === 'rejected' ? theme.status.error :
                                applicant.status === 'finalized' ? theme.primary : 
                                theme.neutral.medium,
                              fontSize: '13px',
                              fontWeight: '500',
                            }}>
                              <span style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                backgroundColor: 
                                  applicant.status === 'accepted' ? theme.status.success :
                                  applicant.status === 'rejected' ? theme.status.error :
                                  applicant.status === 'finalized' ? theme.primary : 
                                  theme.neutral.medium,
                                marginRight: '6px',
                              }}></span>
                              {applicant.status || 'pending'}
                            </div>
                          </td>
                          <td style={{ 
                            padding: '14px 20px',
                            textAlign: 'right'
                          }}>
                            <button 
                              onClick={() => handleViewApplicantProfile(applicant)}
                              style={buttonStyle.primary}
                            >
                              <svg 
                                width="14" 
                                height="14" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                              >
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                              </svg>
                              View Profile
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ 
                  padding: '30px', 
                  backgroundColor: theme.neutral.lightest, 
                  borderRadius: '8px', 
                  textAlign: 'center',
                  border: `1px solid ${theme.neutral.light}`,
                  marginBottom: '20px'
                }}>
                  <p style={{
                    margin: 0,
                    fontSize: '14px',
                    color: theme.neutral.medium,
                  }}>
                    No applicants match your filters.
                  </p>
                </div>
              )}

              <button 
                onClick={handleCloseApplicantsModal} 
                style={buttonStyle.secondary}
              >
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
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
              padding: '24px', 
              borderRadius: '8px', 
              maxHeight: '90vh', 
              overflowY: 'auto', 
              width: '80%',
              maxWidth: '700px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '20px',
                borderBottom: `1px solid ${theme.neutral.light}`,
                paddingBottom: '16px'
              }}>
                <h2 style={{ 
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: '600',
                  color: theme.neutral.darkest
                }}>
                  {selectedApplicant.name || 'Applicant Profile'}
                </h2>
                <button 
                  onClick={handleCloseProfileModal}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '20px',
                    cursor: 'pointer',
                    color: theme.neutral.medium,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  ×
                </button>
              </div>

              <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '20px',
                marginBottom: '20px'
              }}>
                <div style={{
                  backgroundColor: theme.neutral.lightest,
                  borderRadius: '8px',
                  padding: '16px',
                  border: `1px solid ${theme.neutral.light}`,
                }}>
                  <h3 style={{ 
                    margin: '0 0 12px 0',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: theme.neutral.darkest,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    <svg 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke={theme.primary} 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    Basic Information
                  </h3>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}>
                    <div>
                      <p style={{
                        margin: '0 0 4px 0',
                        fontSize: '13px',
                        fontWeight: '500',
                        color: theme.neutral.medium,
                      }}>
                        Name
                      </p>
                      <p style={{
                        margin: 0,
                        fontSize: '14px',
                        color: theme.neutral.darkest,
                      }}>
                        {selectedApplicant.name || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p style={{
                        margin: '0 0 4px 0',
                        fontSize: '13px',
                        fontWeight: '500',
                        color: theme.neutral.medium,
                      }}>
                        Email
                      </p>
                      <p style={{
                        margin: 0,
                        fontSize: '14px',
                        color: theme.neutral.darkest,
                      }}>
                        {selectedApplicant.email || 'N/A'}
                      </p>
                    </div>
                    {selectedApplicant.jobTitle && (
                      <div>
                        <p style={{
                          margin: '0 0 4px 0',
                          fontSize: '13px',
                          fontWeight: '500',
                          color: theme.neutral.medium,
                        }}>
                          Applied for
                        </p>
                        <p style={{
                          margin: 0,
                          fontSize: '14px',
                          color: theme.neutral.darkest,
                        }}>
                          {selectedApplicant.jobTitle}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{
                  backgroundColor: theme.neutral.lightest,
                  borderRadius: '8px',
                  padding: '16px',
                  border: `1px solid ${theme.neutral.light}`,
                }}>
                  <h3 style={{ 
                    margin: '0 0 12px 0',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: theme.neutral.darkest,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    <svg 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke={theme.primary} 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                    Skills
                  </h3>
                  {selectedApplicant.skills ? (
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px',
                    }}>
                      {selectedApplicant.skills.split(',').map((skill, index) => (
                        <span
                          key={index}
                          style={{
                            padding: '4px 10px',
                            backgroundColor: theme.primaryLight,
                            color: theme.primary,
                            borderRadius: '4px',
                            fontSize: '13px',
                            fontWeight: '500',
                          }}
                        >
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p style={{
                      margin: 0,
                      fontSize: '14px',
                      color: theme.neutral.medium,
                      fontStyle: 'italic',
                    }}>
                      No skills listed
                    </p>
                  )}
                </div>
              </div>

              <div style={{
                backgroundColor: theme.neutral.lightest,
                borderRadius: '8px',
                padding: '16px',
                border: `1px solid ${theme.neutral.light}`,
                marginBottom: '20px',
              }}>
                <h3 style={{ 
                  margin: '0 0 12px 0',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: theme.neutral.darkest,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke={theme.primary} 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                  </svg>
                  Experience
                </h3>
                {selectedApplicant.experience ? (
                  <p style={{
                    margin: 0,
                    fontSize: '14px',
                    color: theme.neutral.darkest,
                    lineHeight: '1.5',
                  }}>
                    {selectedApplicant.experience}
                  </p>
                ) : (
                  <p style={{
                    margin: 0,
                    fontSize: '14px',
                    color: theme.neutral.medium,
                    fontStyle: 'italic',
                  }}>
                    No experience listed
                  </p>
                )}
              </div>

              <div style={{
                backgroundColor: theme.neutral.lightest,
                borderRadius: '8px',
                padding: '16px',
                border: `1px solid ${theme.neutral.light}`,
                marginBottom: '20px',
              }}>
                <h3 style={{ 
                  margin: '0 0 12px 0',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: theme.neutral.darkest,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke={theme.primary} 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                  </svg>
                  Application Status
                </h3>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '16px',
                }}>
                  <p style={{
                    margin: '0 12px 0 0',
                    fontSize: '14px',
                    color: theme.neutral.darkest,
                  }}>
                    Current Status:
                  </p>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    backgroundColor: 
                      selectedApplicant.status === 'accepted' ? 'rgba(16, 185, 129, 0.1)' :
                      selectedApplicant.status === 'rejected' ? 'rgba(239, 68, 68, 0.1)' :
                      selectedApplicant.status === 'finalized' ? theme.primaryLight : 
                      theme.neutral.lightest,
                    color: 
                      selectedApplicant.status === 'accepted' ? theme.status.success :
                      selectedApplicant.status === 'rejected' ? theme.status.error :
                      selectedApplicant.status === 'finalized' ? theme.primary : 
                      theme.neutral.medium,
                    fontSize: '14px',
                    fontWeight: '500',
                  }}>
                    <span style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: 
                        selectedApplicant.status === 'accepted' ? theme.status.success :
                        selectedApplicant.status === 'rejected' ? theme.status.error :
                        selectedApplicant.status === 'finalized' ? theme.primary : 
                        theme.neutral.medium,
                      marginRight: '6px',
                    }}></span>
                    {selectedApplicant.status || 'pending'}
                  </div>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  gap: '10px', 
                  flexWrap: 'wrap'
                }}>
                  <button 
                    onClick={() => {
                      handleUpdateApplicantStatus(selectedApplicant.email, 'finalized');
                      setSelectedApplicant({...selectedApplicant, status: 'finalized'});
                    }}
                    style={buttonStyle.secondary}
                  >
                    <svg 
                      width="14" 
                      height="14" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    Mark as Finalized
                  </button>
                  <button 
                    onClick={() => {
                      handleUpdateApplicantStatus(selectedApplicant.email, 'accepted');
                      setSelectedApplicant({...selectedApplicant, status: 'accepted'});
                    }}
                    style={{
                      ...buttonStyle.secondary,
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      color: theme.status.success,
                      border: `1px solid rgba(16, 185, 129, 0.2)`,
                    }}
                  >
                    <svg 
                      width="14" 
                      height="14" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Accept
                  </button>
                  <button 
                    onClick={() => {
                      handleUpdateApplicantStatus(selectedApplicant.email, 'rejected');
                      setSelectedApplicant({...selectedApplicant, status: 'rejected'});
                    }}
                    style={buttonStyle.danger}
                  >
                    <svg 
                      width="14" 
                      height="14" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    Reject
                  </button>
                </div>
              </div>

              <button 
                onClick={handleCloseProfileModal} 
                style={buttonStyle.secondary}
              >
                <svg 
                  width="14" 
                  height="14" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
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