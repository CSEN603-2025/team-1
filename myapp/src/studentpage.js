import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getNotification, clearNotifications } from './notification'; // Assuming this file exists

// --- START: Added Dummy Course Data ---
const majorCourses = {
    'MET': [
        { id: 1, code: 'MET101', title: 'Introduction to Mechanical Engineering', semester: 1, description: 'Fundamentals of mechanical systems, materials, and thermodynamics.' },
        { id: 2, code: 'MET201', title: 'Thermodynamics I', semester: 3, description: 'Basic principles of energy conversion and heat transfer.' },
        { id: 3, code: 'MET305', title: 'Fluid Mechanics', semester: 5, description: 'Behavior of fluids at rest and in motion.' },
        { id: 4, code: 'MET410', title: 'Machine Design', semester: 7, description: 'Design and analysis of machine components.' },
    ],
    'IET': [
        { id: 11, code: 'IET101', title: 'Introduction to Industrial Engineering', semester: 1, description: 'Overview of industrial engineering principles and practices.' },
        { id: 12, code: 'IET205', title: 'Operations Research I', semester: 4, description: 'Introduction to optimization techniques and modeling.' },
        { id: 13, code: 'IET315', title: 'Work Systems Design', semester: 6, description: 'Analysis and design of efficient work processes.' },
        { id: 14, code: 'IET420', title: 'Supply Chain Management', semester: 8, description: 'Planning and management of supply chain activities.' },
    ],
    'Mechatronics': [
        { id: 21, code: 'MTR101', title: 'Introduction to Mechatronics', semester: 1, description: 'Synergistic integration of mechanics, electronics, and computing.' },
        { id: 22, code: 'MTR210', title: 'Digital Logic Design', semester: 3, description: 'Fundamentals of digital circuits and systems.' },
        { id: 23, code: 'MTR320', title: 'Control Systems', semester: 5, description: 'Analysis and design of feedback control systems.' },
        { id: 24, code: 'MTR430', title: 'Robotics', semester: 7, description: 'Kinematics, dynamics, and control of robotic manipulators.' },
    ],
    'Business Informatics': [
        { id: 31, code: 'BINF101', title: 'Introduction to Business Informatics', semester: 1, description: 'Intersection of business processes and information technology.' },
        { id: 32, code: 'BINF220', title: 'Database Management Systems', semester: 4, description: 'Design, implementation, and management of databases.' },
        { id: 33, code: 'BINF330', title: 'Enterprise Resource Planning (ERP)', semester: 6, description: 'Concepts and application of ERP systems in business.' },
        { id: 34, code: 'BINF440', title: 'Business Intelligence & Analytics', semester: 8, description: 'Using data for business decision-making.' },
    ],
    'Pharmacy': [
        { id: 41, code: 'PHM101', title: 'Introduction to Pharmacy', semester: 1, description: 'Overview of the pharmacy profession and pharmaceutical sciences.' },
        { id: 42, code: 'PHM210', title: 'Organic Chemistry for Pharmacy', semester: 3, description: 'Fundamental organic chemistry principles relevant to drugs.' },
        { id: 43, code: 'PHM315', title: 'Pharmacology I', semester: 5, description: 'Study of drug actions and their effects on the body.' },
        { id: 44, code: 'PHM425', title: 'Pharmaceutics I', semester: 7, description: 'Principles of drug formulation and delivery systems.' },
    ]
};
// --- END: Added Dummy Course Data ---


function StudentPage() {
    const [menuOpen, setMenuOpen] = useState(true);
    const [selectedMajor, setSelectedMajor] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    const [showProfile, setShowProfile] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const status = null; // Assuming this is handled elsewhere or intended to be null

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
    // Robust check for student data in location state
    const student = location.state?.user || location.state?.studentj || { email: 'default@example.com' }; // Added fallback

    const [showCompanies, setShowCompanies] = useState(false);
    const [showmyinternships, setshowmyinternships] = useState(false);
    const [showCourses, setShowCourses] = useState(false); // --- Added state for courses view ---
    const companies = JSON.parse(localStorage.getItem('companies')) || [];
    const [filteredCompanies, setFilteredCompanies] = useState([]);
    const [showFiltered, setShowFiltered] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);

    // Use student email for profile key, ensure student exists
    const profileKey = student?.email ? `studentProfile_${student.email}` : 'studentProfile_default';

    useEffect(() => {
        const savedProfile = localStorage.getItem(profileKey);
        const initialProfile = savedProfile ? JSON.parse(savedProfile) : {
            name: '',
            email: student?.email || '', // Ensure email is set even if no profile saved
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
        // Set dropdowns based on loaded profile
        setSelectedMajor(initialProfile.major || '');
        setSelectedSemester(initialProfile.semester || '');
    }, [student?.email, profileKey]); // Depend on student.email for reactivity

    const handleEditClick = () => {
        setIsEditingProfile(true);
        // Ensure draft reflects current profile when starting edit
        setDraftProfile(profile);
        setSelectedMajor(profile.major || '');
        setSelectedSemester(profile.semester || '');
    };

    const handleCancelEdit = () => {
        setIsEditingProfile(false);
        setDraftProfile(profile); // Reset draft to saved profile
        // Reset dropdowns to saved profile values
        setSelectedMajor(profile.major || '');
        setSelectedSemester(profile.semester || '');
    };

    const handleDraftChange = (e) => {
        const { name, value } = e.target;
        // Prevent direct editing of email field in UI (though it's readOnly)
        if (name !== 'email') {
            setDraftProfile(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSaveProfile = () => {
        // Ensure major and semester from dropdowns are included in the profile being saved
        const updatedDraftProfile = {
            ...draftProfile,
            major: selectedMajor,
            semester: selectedSemester,
            email: student.email // Ensure the email is always the logged-in student's email
        };

        // Save profile specific to the student
        localStorage.setItem(profileKey, JSON.stringify(updatedDraftProfile));

        // Update the global 'studentusers' list (if used for admin/other purposes)
        const profileWithStatus = { ...updatedDraftProfile, status }; // Include status if needed
        let studentUsers = JSON.parse(localStorage.getItem('studentusers')) || [];
        const existingUserIndex = studentUsers.findIndex(user => user.email === updatedDraftProfile.email);

        if (existingUserIndex > -1) {
            studentUsers[existingUserIndex] = profileWithStatus;
        } else {
            studentUsers.push(profileWithStatus);
        }
        localStorage.setItem('studentusers', JSON.stringify(studentUsers));
        console.log('Updated student users in localStorage:', studentUsers);

        // Update the component's state and exit editing mode
        setProfile(updatedDraftProfile);
        setIsEditingProfile(false);
        alert('Profile updated!');
    };

    // --- Updated Handlers to hide other sections ---
    const handleProfileClick = () => {
        setShowProfile(true);
        setShowCompanies(false);
        setshowmyinternships(false);
        setShowCourses(false); // Hide courses
        setIsEditingProfile(false); // Ensure not in edit mode when switching to view
        setActiveSidebarItem('profile');
    };

    const handleHomeClick = () => {
        setShowProfile(false);
        setShowCompanies(false);
        setshowmyinternships(false);
        setShowCourses(false); // Hide courses
        setActiveSidebarItem('home');
    };

    const handleBrowseJobsClick = () => {
        // Hide local sections before navigating
        setShowProfile(false);
        setShowCompanies(false);
        setshowmyinternships(false);
        setShowCourses(false); // Hide courses
        setActiveSidebarItem('jobs'); // Optional: keep track even when navigating away
        navigate('/jobspage', { state: { student } });
        console.log('Browse Jobs clicked');
    };

    const handleMyApplicationsClick = () => {
        // Hide local sections before navigating
        setShowProfile(false);
        setShowCompanies(false);
        setshowmyinternships(false);
        setShowCourses(false); // Hide courses
        setActiveSidebarItem('applications'); // Optional
        navigate('/studentapplications', { state: { student } });
        console.log('My Applications clicked');
    };

    const handleSettingsClick = () => {
        setShowProfile(false);
        setShowCompanies(false);
        setshowmyinternships(false);
        setShowCourses(false); // Hide courses
        setActiveSidebarItem('settings');
        console.log('Settings clicked');
        // Implement actual settings view or navigation if needed
    };

    const handleCompaniesClick = () => {
        setShowProfile(false);
        setShowCompanies(true);
        setshowmyinternships(false);
        setShowCourses(false); // Hide courses
        setActiveSidebarItem('companies');
        setShowFiltered(false); // Reset filter view when clicking the main button
        setFilteredCompanies([]);
    };

     // --- Added Handler for Courses ---
     const handleCoursesClick = () => {
        setShowProfile(false);
        setShowCompanies(false);
        setshowmyinternships(false);
        setShowCourses(true); // Show courses
        setActiveSidebarItem('courses');
    };
    // --- End Added Handler ---

    const handleFilterCompanies = () => {
        const interestedJobs = (profile.jobInterests || '').split(',').map(item => item.trim().toLowerCase()).filter(Boolean);
        const studentIndustry = (profile.industry || '').toLowerCase();

        const filtered = companies.filter(company => {
            // Ensure company.jobs is treated as an array of strings if it's a string
            const companyJobs = typeof company.jobs === 'string'
                ? company.jobs.split(',').map(job => job.trim().toLowerCase())
                : Array.isArray(company.jobs) // Handle if jobs are already objects/strings in an array
                    ? company.jobs.map(job => (typeof job === 'string' ? job.toLowerCase() : job?.title?.toLowerCase() || ''))
                    : [];

             const companyIndustry = (company.industry || '').toLowerCase();

             // Check if student has interests specified
             const hasJobMatch = interestedJobs.length > 0
                 ? interestedJobs.some(interest => companyJobs.includes(interest))
                 : true; // If no job interests specified by student, don't filter based on jobs

             const isIndustryMatch = studentIndustry
                 ? companyIndustry.includes(studentIndustry)
                 : true; // If no industry specified by student, don't filter based on industry

             // Only return true if both conditions are met (or considered true by default)
             return hasJobMatch && isIndustryMatch;
        });

        setFilteredCompanies(filtered);
        setShowFiltered(true);
    };

    const handleMyInternshipsClick = () => {

         // Hide local sections before navigating
        setShowProfile(false);
        setShowCompanies(false);
        setshowmyinternships(false);
        setShowCourses(false); // Hide courses
        navigate('/myinternships', { state: { student } });
        console.log('My Internahips clicked');
        setActiveSidebarItem('internships');
        // Add logic here to fetch/display internships
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
        // Note: Pseudo-classes like :hover can't be directly used in inline styles.
        // Consider using CSS classes or a styling library (like styled-components) for hover effects.
    });

    // Notification logic
     useEffect(() => {
         // Ensure student object and email exist before setting up interval
        if (student?.email) {
            const interval = setInterval(() => {
                const newNotifications = getNotification(student.email) || [];
                // Only update state if notifications have actually changed to avoid unnecessary re-renders
                if (JSON.stringify(newNotifications) !== JSON.stringify(notifications)) {
                    setNotifications(newNotifications);
                }
            }, 3000); // check every 3 seconds

            return () => clearInterval(interval); // cleanup on unmount
        }
    }, [student?.email, notifications]); // Add notifications to dependency array if needed

    const handleBellClick = () => {
        if (student?.email) {
           const fetchedNotifications = getNotification(student.email) || [];
           setNotifications(fetchedNotifications);
           setIsPopupOpen(prev => !prev);
        } else {
            console.warn("Student email not available for fetching notifications.");
            // Optionally show a message to the user
        }
    };

    const handleClosePopup = () => {
        if (student?.email) {
            clearNotifications(student.email); // clear from storage
        }
        setNotifications([]);              // clear from state
        setIsPopupOpen(false);             // close popup
    };


    // Robust check for student data before rendering main content
    if (!student?.email) {
       // Optionally navigate back to login or show an error/loading state
       return <div>Loading student data or student not found...</div>;
    }


    return (
        <div style={{ display: 'flex' }}>
            {/* Sidebar */}
            <div
                style={{
                    width: menuOpen ? '180px' : '0', // Slightly wider for longer text
                    height: '100vh',
                    backgroundColor: '#34495E',
                    transition: 'width 0.3s ease-in-out',
                    padding: menuOpen ? '20px' : '0',
                    boxShadow: menuOpen ? '2px 0 5px rgba(0,0,0,0.2)' : 'none',
                    overflow: menuOpen ? 'auto' : 'hidden', // Use 'auto' for scrollbar only if needed
                    position: 'fixed', // Fixed position
                    top: 0,
                    left: 0,
                    zIndex: 1001, // Ensure sidebar is above content but potentially below modals
                    color: 'white', // Ensure text is visible
                }}
            >
                {menuOpen && (
                    <ul style={{ listStyleType: 'none', padding: 0, margin: 0, marginTop: '50px' /* Adjust top margin if needed */ }}>
                         {/* Sidebar Items */}
                        <li>
                            <button onClick={handleHomeClick} style={sidebarButtonStyle(activeSidebarItem === 'home')}>
                                Home Page
                            </button>
                        </li>
                        <li>
                            <button onClick={handleProfileClick} style={sidebarButtonStyle(activeSidebarItem === 'profile')}>
                                Profile
                            </button>
                        </li>
                         {/* --- Added Courses Button --- */}
                         <li>
                            <button onClick={handleCoursesClick} style={sidebarButtonStyle(activeSidebarItem === 'courses')}>
                                Courses
                            </button>
                        </li>
                         {/* --- End Added Courses Button --- */}
                        <li>
                            <button onClick={handleBrowseJobsClick} style={sidebarButtonStyle(activeSidebarItem === 'jobs')}>
                                Jobs
                            </button>
                        </li>
                        <li>
                            <button onClick={handleMyApplicationsClick} style={sidebarButtonStyle(activeSidebarItem === 'applications')}>
                                Applications
                            </button>
                        </li>
                         <li>
                            <button onClick={handleMyInternshipsClick} style={sidebarButtonStyle(activeSidebarItem === 'internships')}>
                                My Internships
                            </button>
                        </li>
                        <li>
                            <button onClick={handleCompaniesClick} style={sidebarButtonStyle(activeSidebarItem === 'companies')}>
                                Companies
                            </button>
                        </li>
                        <li>
                            <button onClick={handleSettingsClick} style={sidebarButtonStyle(activeSidebarItem === 'settings')}>
                                Settings
                            </button>
                        </li>
                    </ul>
                )}
            </div>

             {/* Menu Toggle Button - Position adjusted based on sidebar state */}
             <button
                onClick={() => setMenuOpen(prev => !prev)}
                style={{
                    fontSize: '24px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    position: 'fixed', // Fixed position relative to viewport
                    top: '15px', // Position near top
                    left: menuOpen ? '230px' : '15px', // Adjust based on sidebar width + padding
                    color: '#333', // Visible color
                    zIndex: 1002, // Above sidebar content
                    transition: 'left 0.3s ease-in-out'
                }}
            >
                ☰
            </button>

            {/* Main Content */}
            <div style={{
                 flexGrow: 1,
                 padding: '20px',
                 paddingTop: '60px', // Add padding top to avoid content going under fixed header elements
                 marginLeft: menuOpen ? '240px' : '60px', // Adjust margin based on sidebar width + some buffer
                 transition: 'margin-left 0.3s ease-in-out',
                 position: 'relative' // Needed for absolute positioning of bell icon popup
                }}>

                {/* Bell Icon & Popup Area - Positioned Top Right */}
                <div style={{ position: 'absolute', top: '15px', right: '20px', zIndex: 1000 }}>
                    <div onClick={handleBellClick} style={{ cursor: 'pointer', position: 'relative', display: 'inline-block' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                           <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zM8 1.918l-.797.161A4.002 4.002 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4.002 4.002 0 0 0-3.203-3.92L8 1.918zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5.002 5.002 0 0 1 13 6c0 .88.32 4.2 1.22 6z"/>
                        </svg>
                        {notifications.length > 0 && (
                            <span style={{
                                position: 'absolute', top: '-5px', right: '-8px', backgroundColor: 'red',
                                color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '10px',
                                border: '1px solid white' // Optional border
                            }}>
                                {notifications.length}
                            </span>
                        )}
                    </div>

                    {/* Popup Notification */}
                    {isPopupOpen && (
                        <div style={{
                            position: 'absolute', top: '35px', right: '0', backgroundColor: 'white',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)', padding: '15px', borderRadius: '8px',
                            width: '300px', zIndex: 1001, border: '1px solid #eee'
                        }}>
                            <button onClick={handleClosePopup} style={{
                                position: 'absolute', top: '8px', right: '8px', background: 'transparent', border: 'none',
                                fontSize: '16px', cursor: 'pointer', color: '#666', fontWeight: 'bold'
                            }}>✕</button>
                            <h4 style={{ marginTop: '0', marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px'}}>Notifications</h4>
                            {notifications.length === 0 ? (
                                <p style={{color: '#555'}}>No new notifications.</p>
                            ) : (
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: '300px', overflowY: 'auto' }}>
                                    {notifications.map((notification, index) => (
                                        <li key={index} style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: index < notifications.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                                            <p style={{ margin: '0 0 5px 0', fontWeight: '500' }}>{notification.message}</p>
                                            <p style={{ margin: '0', fontSize: '0.8em', color: '#777' }}>
                                                {new Date(notification.timestamp).toLocaleString()}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </div>


                 {/* --- Conditional Content Rendering --- */}

                {/* Welcome Message */}
                 {!showProfile && !showCompanies && !showmyinternships && !showCourses && ( // --- Updated Condition ---
                    <div>
                        <h1>Welcome {profile.name || 'Student'}!</h1>
                        <p>This is your dashboard for the SCAD Management System (SMS). Use the sidebar menu to navigate through different sections like your profile, job listings, applications, and more.</p>
                        {/* You could add more dashboard elements here */}
                    </div>
                )}

                {/* My Internships Section */}
                {showmyinternships && (
                    <div>
                         <h1>My Internships</h1>
                         {/* Add content to display student's internships here */}
                         <p>Internship display area. Fetch and show internship details.</p>
                    </div>
                )}

                {/* Profile Section */}
                {showProfile && (
                    <>
                        <h1>Student Profile</h1>
                        {!isEditingProfile ? (
                            <div style={{ lineHeight: '1.8' }}>
                                <p><strong>Name:</strong> {profile.name || 'Not set'}</p>
                                <p><strong>Email:</strong> {profile.email}</p> {/* Display email from profile state */}
                                <p><strong>Major:</strong> {profile.major || 'Not selected'}</p>
                                <p><strong>Semester:</strong> {profile.semester || 'Not selected'}</p>
                                <p><strong>Job Interests:</strong> {profile.jobInterests || 'Not specified'}</p>
                                <p><strong>Industry Preference:</strong> {profile.industry || 'Not specified'}</p>
                                <p><strong>Previous Internships:</strong> {profile.internships || 'None specified'}</p>
                                <p><strong>Part-time Jobs:</strong> {profile.partTimeJobs || 'None specified'}</p>
                                <p><strong>College Activities:</strong> {profile.collegeActivities || 'None specified'}</p>
                                <button onClick={handleEditClick} style={{ padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '15px', fontSize: '16px' }}>
                                    Edit Profile
                                </button>
                            </div>
                        ) : (
                             <div style={{ maxWidth: '700px', marginTop: '20px', border: '1px solid #ccc', padding: '20px', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                                <h2 style={{marginTop: 0}}>Edit Profile</h2>
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Name:</label>
                                    <input
                                        type="text" // Ensure type is text
                                        name="name"
                                        value={draftProfile.name}
                                        onChange={handleDraftChange}
                                        style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
                                    />
                                 </div>
                                 <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email:</label>
                                    <input
                                        type="email" // Set type to email
                                        name="email"
                                        value={student.email} // Display the non-editable email
                                        style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: '#e9ecef', boxSizing: 'border-box', cursor: 'not-allowed' }}
                                        readOnly // Make it explicitly read-only
                                    />
                                    <p style={{ fontSize: '0.9em', color: '#666', marginTop: '5px' }}>Email cannot be changed.</p>
                                </div>

                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Major:</label>
                                    <select
                                        name="major"
                                        value={selectedMajor} // Controlled by selectedMajor state
                                        onChange={(e) => setSelectedMajor(e.target.value)}
                                        style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
                                    >
                                        <option value="">Select a major</option>
                                        <option value="MET">MET</option>
                                        <option value="IET">IET</option>
                                        <option value="Mechatronics">Mechatronics</option>
                                        <option value="Business Informatics">Business Informatics</option>
                                        <option value="Pharmacy">Pharmacy</option>
                                    </select>
                                </div>

                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Semester:</label>
                                    <select
                                        name="semester"
                                        value={selectedSemester} // Controlled by selectedSemester state
                                        onChange={(e) => setSelectedSemester(e.target.value)}
                                        style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
                                    >
                                        <option value="">Select semester</option>
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                            <option key={num} value={num}>Semester {num}</option>
                                        ))}
                                    </select>
                                 </div>

                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Job Interests (comma-separated):</label>
                                    <textarea
                                        name="jobInterests"
                                        value={draftProfile.jobInterests}
                                        onChange={handleDraftChange}
                                        style={{ width: '100%', minHeight: '80px', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
                                        placeholder="e.g., Software Development, Data Analysis, Project Management"
                                    />
                                </div>

                                <div style={{ marginBottom: '15px' }}>
                                     <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Preferred Industry:</label>
                                     <input
                                        type="text"
                                        name="industry"
                                        value={draftProfile.industry}
                                        onChange={handleDraftChange}
                                        style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
                                        placeholder="e.g., Technology, Finance, Healthcare"
                                    />
                                </div>

                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Previous Internships (Details):</label>
                                    <textarea
                                        name="internships"
                                        value={draftProfile.internships}
                                        onChange={handleDraftChange}
                                        style={{ width: '100%', minHeight: '100px', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
                                        placeholder="e.g., Web Dev Intern at TechCorp (Summer 2024) - Built UI components using React."
                                    />
                                </div>

                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Part-time Jobs (Details):</label>
                                     <textarea
                                        name="partTimeJobs"
                                        value={draftProfile.partTimeJobs}
                                        onChange={handleDraftChange}
                                        style={{ width: '100%', minHeight: '100px', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
                                        placeholder="e.g., Barista at CoffeeShop (2023-Present) - Customer service, cash handling."
                                    />
                                </div>

                                <div style={{ marginBottom: '25px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>College Activities/Clubs:</label>
                                    <textarea
                                        name="collegeActivities"
                                        value={draftProfile.collegeActivities}
                                        onChange={handleDraftChange}
                                        style={{ width: '100%', minHeight: '80px', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
                                        placeholder="e.g., President of Coding Club, Volunteer Tutor"
                                    />
                                </div>

                                <div>
                                    <button onClick={handleSaveProfile} style={{ padding: '12px 25px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '10px', fontSize: '16px' }}>
                                        Save Changes
                                    </button>
                                    <button onClick={handleCancelEdit} style={{ padding: '12px 25px', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}>
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* --- START: Courses Section --- */}
                {showCourses && (
                    <div>
                        <h1>Available Courses for {profile.major || 'Your Major'}</h1>
                        {profile.major ? (
                            (() => { // Use IIFE for cleaner conditional logic
                                const coursesForMajor = majorCourses[profile.major] || []; // Get courses or empty array
                                if (coursesForMajor.length > 0) {
                                    return (
                                        <ul style={{ listStyle: 'none', padding: 0 }}>
                                            {coursesForMajor.map(course => (
                                                <li key={course.id} style={{ border: '1px solid #e0e0e0', marginBottom: '15px', padding: '15px 20px', borderRadius: '6px', backgroundColor: '#fff' }}>
                                                    <h3 style={{ marginTop: 0, marginBottom: '5px', color: '#333' }}>{course.code} - {course.title}</h3>
                                                    <p style={{ marginBottom: '8px', color: '#555' }}><strong>Semester:</strong> {course.semester}</p>
                                                    <p style={{ margin: 0, color: '#666', lineHeight: '1.5' }}>{course.description}</p>
                                                </li>
                                            ))}
                                        </ul>
                                    );
                                } else {
                                    return <p>No courses listed for the selected major ({profile.major}).</p>;
                                }
                            })() // Immediately invoke the function
                        ) : (
                            <p>Please select a major in your profile to view available courses.</p>
                        )}
                    </div>
                )}
                 {/* --- END: Courses Section --- */}


                {/* Companies Section */}
                {showCompanies && (
                     <div>
                         <h1>Companies & Opportunities</h1>
                         <button onClick={handleFilterCompanies} style={{ padding: '10px 20px', backgroundColor: '#17a2b8', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '20px', fontSize: '16px' }}>
                             {showFiltered ? 'Show All Companies' : 'Filter Based on My Profile'}
                         </button>
                        {/* Simple toggle for showing all vs filtered */}
                         <button onClick={() => setShowFiltered(prev => !prev)} style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '20px', marginLeft: '10px', fontSize: '16px', display: filteredCompanies.length > 0 ? 'inline-block' : 'none' /* Only show if filter has run */ }}>
                             {showFiltered ? 'Show All' : 'Show Filtered'}
                         </button>

                        {/* Decide which list to show */}
                         <ul style={{ listStyle: 'none', padding: 0 }}>
                            {(showFiltered ? filteredCompanies : companies).length > 0 ? (
                                (showFiltered ? filteredCompanies : companies).map((company, index) => (
                                    <li key={index} style={{ border: '1px solid #e0e0e0', marginBottom: '15px', padding: '15px 20px', borderRadius: '6px', backgroundColor: '#fff' }}>
                                        <h3 style={{ marginTop: 0, marginBottom: '10px' }}>{company.companyName}</h3>
                                        <p><strong>Email:</strong> {company.companyEmail}</p>
                                        <p><strong>Industry:</strong> {company.industry}</p>
                                        <p><strong>Size:</strong> {company.companySize}</p>
                                        <h4 style={{ marginTop: '15px', marginBottom: '8px' }}>Jobs/Internships Offered:</h4>
                                         {/* Robust handling of company.jobs */}
                                        {(Array.isArray(company.jobs) && company.jobs.length > 0) || (typeof company.jobs === 'string' && company.jobs.trim() !== '') ? (
                                            <ul style={{ listStyle: 'disc', paddingLeft: '20px' }}>
                                                 {/* If jobs is a string, split and map. If array, map directly. */}
                                                 {(typeof company.jobs === 'string' ? company.jobs.split(',').map(j => j.trim()) : company.jobs)
                                                     .filter(job => job) // Filter out empty strings/items
                                                     .map((job, jobIndex) => (
                                                         // If job is an object (likely from newer data), display details
                                                         typeof job === 'object' && job !== null ? (
                                                             <li key={jobIndex}>
                                                                 <strong>{job.title || 'N/A'}</strong> - {job.duration || 'N/A'} ({job.skills || 'N/A'})
                                                                 {/* Add more details if needed */}
                                                            </li>
                                                         ) : (
                                                             // If job is just a string (older data), display the string
                                                             <li key={jobIndex}>{job}</li>
                                                         )
                                                     ))
                                                 }
                                            </ul>
                                        ) : (
                                            <p>No specific jobs listed for this view.</p> // Changed message
                                        )}
                                        {/* You might want a button here to view full job details or apply */}
                                    </li>
                                ))
                             ) : (
                                 <li>{showFiltered ? 'No companies match your current filter criteria.' : 'No companies available.'}</li>
                             )}
                         </ul>
                    </div>
                )}
            </div>
        </div>
    );
}

export default StudentPage;