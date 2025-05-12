import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function StudentPage() {
    const [menuOpen, setMenuOpen] = useState(true);
    const [selectedMajor, setSelectedMajor] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    const [showProfile, setShowProfile] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const status = null;

    const [profile, setProfile] = useState({
        name: '',
        email: '',
        jobInterests: '',
        industry: '',
        internships: '',
        partTimeJobs: '',
        collegeActivities: '',
        major: '',
        semester: '',
    });
    const [draftProfile, setDraftProfile] = useState({ ...profile });
    const [activeSidebarItem, setActiveSidebarItem] = useState('home');
    const navigate = useNavigate();
    const location = useLocation();
    const student = location.state?.user || location.state?.studentj;
    const [showCompanies, setShowCompanies] = useState(false);
    const[showmyinternships, setshowmyinternships]=useState(false);
    const companies = JSON.parse(localStorage.getItem('companies')) || [];
    const [filteredCompanies, setFilteredCompanies] = useState([]);
    const [showFiltered, setShowFiltered] = useState(false);

    const profileKey = student ? `studentProfile_${student.email}` : 'studentProfile';

    useEffect(() => {
        const savedProfile = localStorage.getItem(profileKey);
        const initialProfile = savedProfile ? JSON.parse(savedProfile) : {
            name: '',
            email: student?.email || '',
            jobInterests: '',
            industry: '',
            internships: '',
            partTimeJobs: '',
            collegeActivities: '',
            major: '',
            semester: '',
        };
        setProfile(initialProfile);
        setDraftProfile(initialProfile);
        setSelectedMajor(initialProfile.major);
        setSelectedSemester(initialProfile.semester);
    }, [student, profileKey]);

    const handleEditClick = () => {
        setIsEditingProfile(true);
    };

    const handleCancelEdit = () => {
        setIsEditingProfile(false);
        setDraftProfile(profile);
        setSelectedMajor(profile.major);
        setSelectedSemester(profile.semester);
    };

    const handleDraftChange = (e) => {
        const { name, value } = e.target;
        if (name !== 'email') {
            setDraftProfile(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSaveProfile = () => {
        const updatedDraftProfile = {
            ...draftProfile,
            major: selectedMajor,
            semester: selectedSemester,
        };

        localStorage.setItem(profileKey, JSON.stringify(updatedDraftProfile));

        const profileWithStatus = { ...updatedDraftProfile, status };
        let studentUsers = JSON.parse(localStorage.getItem('studentusers')) || [];

        const existingUserIndex = studentUsers.findIndex(user => user.email === updatedDraftProfile.email);

        if (existingUserIndex > -1) {
            studentUsers[existingUserIndex] = profileWithStatus;
        } else {
            studentUsers.push(profileWithStatus);
        }
        localStorage.setItem('studentusers', JSON.stringify(studentUsers));
        console.log('Updated student users in localStorage:', studentUsers);
        setProfile(updatedDraftProfile);
        setIsEditingProfile(false);
        alert('Profile updated!');
    };


    const handleProfileClick = () => {
        setShowProfile(true);
        setShowCompanies(false);
        setshowmyinternships(false);
        setIsEditingProfile(false);
        setActiveSidebarItem('profile');
    };

    const handleHomeClick = () => {
        setShowProfile(false);
        setShowCompanies(false);
        setshowmyinternships(false);
        setActiveSidebarItem('home');
    };

    const handleBrowseJobsClick = () => {
        setShowCompanies(false);
        setShowProfile(false);
        setshowmyinternships(false);
        setActiveSidebarItem('jobs');
        navigate('/jobspage', { state: { student } });
        console.log('Browse Jobs clicked');
    };

    const handleMyApplicationsClick = () => {
        setShowCompanies(false);
        setShowProfile(false);
        setshowmyinternships(false);
        setActiveSidebarItem('applications');
        navigate('/studentapplications', { state: { student } });
        console.log('My Applications clicked');
    };

    const handleSettingsClick = () => {
        setShowCompanies(false);
        setShowProfile(false);
        setshowmyinternships(false);
        setActiveSidebarItem('settings');
        console.log('Settings clicked');
    };

    const handleCompaniesClick = () => {
        setShowProfile(false);
        setShowCompanies(true);
        setshowmyinternships(false);
        setActiveSidebarItem('companies');
        setShowFiltered(false);
        setFilteredCompanies([]);
    };

    const handleFilterCompanies = () => {
        const interestedJobs = profile.jobInterests.split(',').map(item => item.trim().toLowerCase());
        const studentIndustry = profile.industry.toLowerCase();

        const filtered = companies.filter(company => {
            const companyJobs = typeof company.jobs === 'string'
                ? company.jobs.split(',').map(job => job.trim().toLowerCase())
                : [];
            const companyIndustry = company.industry.toLowerCase();

            const hasJobMatch = interestedJobs.some(job => companyJobs.includes(job));
            const isIndustryMatch = companyIndustry.includes(studentIndustry);

            return hasJobMatch && isIndustryMatch;
        });

        setFilteredCompanies(filtered);
        setShowFiltered(true);
    };

    const handleMyInternshipsClick = () => {
      setshowmyinternships(true);
        setShowCompanies(false);
        setShowProfile(false);
        setActiveSidebarItem('internships');
   
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
                    overflowY: menuOpen ? 'auto' : 'hidden',
                    position: 'fixed',
                    top: 0,
                    left: 0,
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
                        <li>
                            <button
                                onClick={handleMyInternshipsClick}
                                style={sidebarButtonStyle(activeSidebarItem === 'internships')}
                            >
                                My Internships
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
                        left: menuOpen ? '300px' : '20px',
                        color: 'black',
                        transition: 'left 0.3s'
                    }}
                >
                    ☰
                </button>

                {!showProfile && !showCompanies && !showmyinternships && (
                    <div>
                        <h1>Welcome to the SCAD Managment System(SMS)</h1>
                        <p>Use the sidebar to navigate.</p>
                    </div>
                )}

                {showmyinternships && (
                  <div>

                    </div>
                )

                }

                {showProfile && (
                    <>
                        <h1>Student Profile</h1>
                        {!isEditingProfile ? (
                            <div>
                                <p><strong>Name:</strong> {profile.name}</p>
                                <p><strong>Email:</strong> {student.email}</p>
                                <p><strong>Job Interests:</strong> {profile.jobInterests || 'Not specified'}</p>
                                <p><strong>Industry:</strong> {profile.industry || 'Not specified'}</p>
                                <p><strong>Previous Internships:</strong> {profile.internships || 'No internships specified'}</p>
                                <p><strong>Part-time Jobs:</strong> {profile.partTimeJobs || 'No part-time jobs specified'}</p>
                                <p><strong>College Activities:</strong> {profile.collegeActivities || 'No activities specified'}</p>
                                <p><strong>Major:</strong> {profile.major || 'Not selected'}</p>
                                <p><strong>Semester:</strong> {profile.semester || 'Not selected'}</p>
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
                                    value={student.email}
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
                                    placeholder="e.g., Software Development, Data Science, Project Management"
                                />
                                <label>Industry:</label>
                                <input
                                    name="industry"
                                    value={draftProfile.industry}
                                    onChange={handleDraftChange}
                                    style={{ width: '100%', marginBottom: '10px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                                    placeholder="e.g., Technology, Finance, Healthcare"
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
                                <label>Major:</label>
                                <select
                                    name="major"
                                    value={selectedMajor}
                                    onChange={(e) => setSelectedMajor(e.target.value)}
                                    style={{ width: '100%', marginBottom: '10px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                                >
                                    <option value="">Select a major</option>
                                    <option value="MET">MET</option>
                                    <option value="IET">IET</option>
                                    <option value="Mechatronics">Mechatronics</option>
                                    <option value="Business Informatics">Business Informatics</option>
                                    <option value="Pharmacy">Pharmacy</option>
                                </select>

                                <label>Semester:</label>
                                <select
                                    name="semester"
                                    value={selectedSemester}
                                    onChange={(e) => setSelectedSemester(e.target.value)}
                                    style={{ width: '100%', marginBottom: '20px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                                >
                                    <option value="">Select semester</option>
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                        <option key={num} value={num}>
                                            Semester {num}
                                        </option>
                                    ))}
                                </select>
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

                {showCompanies && (
                    <div>
                        <h1>Companies</h1>
                        <button onClick={handleFilterCompanies} style={{ padding: '8px 15px', backgroundColor: '#4CAF50', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '10px' }}>
                            Filter Companies
                        </button>
                        {showFiltered ? (
                            <div>
                                <h2>Filtered Companies</h2>
                                {filteredCompanies.length > 0 ? (
                                    <ul>
                                        {filteredCompanies.map((company, index) => (
                                            <li key={index}>
                                                <h3>{company.companyName}</h3>
                                                <p><strong>Email:</strong> {company.companyEmail}</p>
                                                <p><strong>Industry:</strong> {company.industry}</p>
                                                <p><strong>Size:</strong> {company.companySize}</p>
                                                <p><strong>Jobs:</strong></p>
                                                <ul>
                                                    {Array.isArray(company.jobs) && company.jobs.length > 0 ? (
                                                        company.jobs.map((job, jobIndex) => (
                                                            <li key={jobIndex}>
                                                                <p><strong>Title:</strong> {job.title}</p>
                                                                <p><strong>Duration:</strong> {job.duration}</p>
                                                                <p><strong>Salary:</strong> {job.salary}</p>
                                                                <p><strong>Industry:</strong> {job.industry}</p>
                                                                <p><strong>Skills:</strong> {job.skills}</p>
                                                                <p><strong>Description:</strong> {job.description}</p>
                                                                <p><strong>Applicants:</strong> {job.applicants.join(', ')}</p>
                                                            </li>
                                                        ))
                                                    ) : (
                                                        <li>No jobs available.</li>
                                                    )}
                                                </ul>
                                            </li>

                                        ))}
                                    </ul>
                                ) : (
                                    <li>No companies match your interests.</li>
                                )}
                            </div>
                        ) : (
                            <ul>
                                {companies.length > 0 ? (
                                    companies.map((company, index) => (
                                        <li key={index}>
                                            <h3>{company.companyName}</h3>
                                            <p><strong>Email:</strong> {company.companyEmail}</p>
                                            <p><strong>Industry:</strong> {company.industry}</p>
                                            <p><strong>Size:</strong> {company.companySize}</p>
                                            <p><strong>Jobs:</strong></p>
                                            <ul>
                                                {Array.isArray(company.jobs) && company.jobs.length > 0 ? (
                                                    company.jobs.map((job, jobIndex) => (
                                                        <li key={jobIndex}>
                                                            <p><strong>Title:</strong> {job.title}</p>
                                                            <p><strong>Duration:</strong> {job.duration}</p>
                                                            <p><strong>Salary:</strong> {job.salary}</p>
                                                            <p><strong>Industry:</strong> {job.industry}</p>
                                                            <p><strong>Skills:</strong> {job.skills}</p>
                                                            <p><strong>Description:</strong> {job.description}</p>
                                                            <p><strong>Applicants:</strong> {job.applicants.join(', ')}</p>
                                                        </li>
                                                    ))
                                                ) : (
                                                    <li>No jobs available.</li>
                                                )}
                                            </ul>
                                        </li>

                                    ))
                                ) : (
                                    <li>No companies available.</li>
                                )}
                            </ul>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default StudentPage;
