import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Dummy company data (You can move this to a separate file if needed)
const dummyCompanies = [
    {
        companyEmail: 'techinnovations@example.com',
        companyName: 'Tech Innovations Inc.',
        industry: 'Technology',
        companySize: '50-200 employees',
        jobs: ['Software Development', 'Data Science', 'UI/UX Design'],
        description: 'A leading tech company focused on innovative solutions.',
    },
    {
        companyEmail: 'globalmanufacturing@example.com',
        companyName: 'Global Manufacturing Ltd.',
        industry: 'Manufacturing',
        companySize: '1000+ employees',
        jobs: [
            { title: 'Mechanical Engineering Intern', duration: '3 months', skills: 'CAD, Problem-solving' },
            'Supply Chain Management Trainee'
        ],
        description: 'A global leader in industrial manufacturing.',
    },
    {
        companyEmail: 'creativeagency@example.com',
        companyName: 'Creative Agency Pro',
        industry: 'Marketing & Advertising',
        companySize: '20-50 employees',
        jobs: ['Digital Marketing Specialist', { title: 'Graphic Design Intern', duration: '6 months', skills: 'Adobe Creative Suite' }, 'Content Creator'],
        description: 'A vibrant agency specializing in creative campaigns.',
    },
    {
        companyEmail: 'healthfirst@example.com',
        companyName: 'HealthFirst Group',
        industry: 'Healthcare',
        companySize: '500+ employees',
        jobs: ['Research Assistant', 'Healthcare Administration'],
        description: 'Committed to providing quality healthcare services.',
    },
    {
        companyEmail: 'greenearth@example.com',
        companyName: 'Green Earth Solutions',
        industry: 'Environmental Science',
        companySize: '10-30 employees',
        jobs: ['Environmental Consulting Intern', 'Sustainability Research Fellow'],
        description: 'Dedicated to creating a sustainable future.',
    },
];

function CompaniesForStudentsPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const student = location.state?.student || { email: 'default@example.com' }; // Get student data
    const [companies, setCompanies] = useState(dummyCompanies);
    const [filteredCompanies, setFilteredCompanies] = useState([]);
    const [showFiltered, setShowFiltered] = useState(false);
    const [profile, setProfile] = useState({
        name: '',
        email: student.email,
        jobInterests: '',
        industry: '',
        // ... other profile fields
    });
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [errorProfile, setErrorProfile] = useState(null);
    const profileKey = `studentProfile_${student.email}`;

    useEffect(() => {
        const savedProfile = localStorage.getItem(profileKey);
        if (savedProfile) {
            try {
                setProfile(JSON.parse(savedProfile));
            } catch (error) {
                setErrorProfile("Failed to parse profile from localStorage");
            } finally {
                setLoadingProfile(false);
            }
        } else {
             setLoadingProfile(false);
             setErrorProfile('No profile data found.  Please update your profile.');
        }
    }, [profileKey]);

    const handleFilterCompanies = () => {
        if (!profile.jobInterests && !profile.industry) {
            alert('Please update your profile with your job interests or industry to use the filter.');
            return;
        }

        const interestedJobs = (profile.jobInterests || '').split(',').map(item => item.trim().toLowerCase()).filter(Boolean);
        const studentIndustry = (profile.industry || '').toLowerCase().trim();

        const filtered = companies.filter(company => {
            const companyJobs = Array.isArray(company.jobs)
                ? company.jobs.map(job => (typeof job === 'string' ? job.toLowerCase() : job?.title?.toLowerCase() || ''))
                : typeof company.jobs === 'string'
                    ? company.jobs.split(',').map(job => job.trim().toLowerCase())
                    : [];

            const companyIndustry = (company.industry || '').toLowerCase().trim();

            const hasJobMatch = interestedJobs.length > 0
                ? interestedJobs.some(interest => companyJobs.includes(interest))
                : true;

            const isIndustryMatch = studentIndustry
                ? companyIndustry.includes(studentIndustry)
                : true;

            return   isIndustryMatch;
        });

        setFilteredCompanies(filtered);
        setShowFiltered(true);
    };

      const handleShowAll = () => {
        setShowFiltered(false);
        setFilteredCompanies([]);
    };


    if (loadingProfile) {
        return <div>Loading profile data...</div>;
    }

    if (errorProfile) {
        return <div>Error loading profile: {errorProfile}</div>;
    }

    return (
        <div>
            <h1>Companies & Opportunities</h1>
            <button
                onClick={handleFilterCompanies}
                style={{ padding: '10px 20px', backgroundColor: '#17a2b8', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '20px', fontSize: '16px' }}
                disabled={loadingProfile}
            >
                {showFiltered ? 'Show All Companies' : 'Filter Based on My Profile'}
            </button>
            {filteredCompanies.length > 0 && (
                <button
                    onClick={handleShowAll}
                    style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '20px', marginLeft: '10px', fontSize: '16px' }}
                >
                    Show All Companies
                </button>
            )}

            <ul style={{ listStyle: 'none', padding: 0 }}>
                {(showFiltered ? filteredCompanies : companies).length > 0 ? (
                    (showFiltered ? filteredCompanies : companies).map((company, index) => (
                        <li key={index} style={{ border: '1px solid #e0e0e0', marginBottom: '15px', padding: '15px 20px', borderRadius: '6px', backgroundColor: '#fff' }}>
                            <h3 style={{ marginTop: 0, marginBottom: '10px' }}>{company.companyName}</h3>
                            <p><strong>Email:</strong> {company.companyEmail}</p>
                            <p><strong>Industry:</strong> {company.industry}</p>
                            <p><strong>Size:</strong> {company.companySize}</p>
                            <h4 style={{ marginTop: '15px', marginBottom: '8px' }}>Jobs/Internships Offered:</h4>
                            {Array.isArray(company.jobs) && company.jobs.length > 0 ? (
                                <ul style={{ listStyle: 'disc', paddingLeft: '20px' }}>
                                    {company.jobs.map((job, jobIndex) => (
                                        <li key={jobIndex}>
                                            {typeof job === 'object' && job !== null ? (
                                                <>
                                                    <strong>{job.title || 'N/A'}</strong> - {job.duration || 'N/A'} ({job.skills || 'N/A'})
                                                </>
                                            ) : (
                                                job
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            ) : typeof company.jobs === 'string' && company.jobs.trim() !== '' ? (
                                <ul style={{ listStyle: 'disc', paddingLeft: '20px' }}>
                                    {company.jobs.split(',').map((job, jobIndex) => (
                                        <li key={jobIndex}>{job.trim()}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No specific jobs listed.</p>
                            )}
                        </li>
                    ))
                ) : (
                    <li>{showFiltered ? 'No companies match your current filter criteria.' : 'No companies available.'}</li>
                )}
            </ul>
        </div>
    );
}

export default CompaniesForStudentsPage;
