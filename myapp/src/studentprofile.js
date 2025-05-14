import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function StudentProfilePage() {
    const navigate = useNavigate();
    const location = useLocation();
    const student = location.state?.student || { email: 'default@example.com' };
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profile, setProfile] = useState({
        name: '',
        email: student.email,
        jobInterests: '',
        industry: '',
        internships: '',
        partTimeJobs: '',
        collegeActivities: '',
        major: '',
        semester: '',
    });
    const [draftProfile, setDraftProfile] = useState({ ...profile });
    const [selectedMajor, setSelectedMajor] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    const profileKey = `studentProfile_${student.email}`;
    const status = null;

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
        setSelectedMajor(initialProfile.major || '');
        setSelectedSemester(initialProfile.semester || '');
    }, [profileKey, student?.email]);

    const handleEditClick = () => {
        setIsEditingProfile(true);
        setDraftProfile(profile);
    };

    const handleCancelEdit = () => {
        setIsEditingProfile(false);
    };

    const handleDraftChange = (e) => {
        const { name, value } = e.target;
        setDraftProfile({ ...draftProfile, [name]: value });
    };

    const handleSaveProfile = () => {
        const updatedDraftProfile = {
            ...draftProfile,
            major: selectedMajor,
            semester: selectedSemester,
            email: student.email
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

    return (
        <div>
            <h1>Student Profile</h1>
            {!isEditingProfile ? (
                <div style={{ lineHeight: '1.8' }}>
                    <p><strong>Name:</strong> {profile.name || 'Not set'}</p>
                    <p><strong>Email:</strong> {profile.email}</p>
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
                    <h2 style={{ marginTop: 0 }}>Edit Profile</h2>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Name:</label>
                        <input
                            type="text"
                            name="name"
                            value={draftProfile.name}
                            onChange={handleDraftChange}
                            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
                        />
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email:</label>
                        <input
                            type="email"
                            name="email"
                            value={student.email}
                            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: '#e9ecef', boxSizing: 'border-box', cursor: 'not-allowed' }}
                            readOnly
                        />
                        <p style={{ fontSize: '0.9em', color: '#666', marginTop: '5px' }}>Email cannot be changed.</p>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Major:</label>
                        <select
                            name="major"
                            value={selectedMajor}
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
                            value={selectedSemester}
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
        </div>
    );
}

export default StudentProfilePage;
