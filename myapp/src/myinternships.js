import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const majorsWithCourses = [
  {
    major: "Computer Science",
    courses: [
      "Data Structures and Algorithms",
      "Operating Systems",
      "Database Management Systems",
      "Computer Networks",
      "Artificial Intelligence",
      "Web Development",
      "Machine Learning"
    ]
  },
  {
    major: "Electrical Engineering",
    courses: [
      "Circuit Analysis",
      "Electromagnetics",
      "Digital Logic Design",
      "Control Systems",
      "Power Systems",
      "Microprocessors",
      "Signal Processing"
    ]
  },
  {
    major: "Mechanical Engineering",
    courses: [
      "Thermodynamics",
      "Fluid Mechanics",
      "Machine Design",
      "Heat Transfer",
      "Manufacturing Processes",
      "Dynamics of Machinery",
      "Engineering Drawing"
    ]
  },
  {
    major: "Business Administration",
    courses: [
      "Principles of Management",
      "Marketing Fundamentals",
      "Financial Accounting",
      "Organizational Behavior",
      "Business Ethics",
      "Operations Management",
      "Strategic Management"
    ]
  },
  {
    major: "Psychology",
    courses: [
      "Introduction to Psychology",
      "Developmental Psychology",
      "Cognitive Psychology",
      "Abnormal Psychology",
      "Social Psychology",
      "Research Methods",
      "Psychological Assessment"
    ]
  },
  {
    major: "Civil Engineering",
    courses: [
      "Structural Analysis",
      "Geotechnical Engineering",
      "Transportation Engineering",
      "Concrete Design",
      "Surveying",
      "Construction Management",
      "Environmental Engineering"
    ]
  },
  {
    major: "Biology",
    courses: [
      "Cell Biology",
      "Genetics",
      "Ecology",
      "Human Anatomy and Physiology",
      "Microbiology",
      "Evolutionary Biology",
      "Biochemistry"
    ]
  }
];

function MyInternshipsPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const student = location.state?.student; // { email: '...', name: '...' }

    const [allInternships, setAllInternships] = useState([]); // To store all fetched internships
    const [internships, setInternships] = useState([]); // To store the internships to display
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'current', 'completed'
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    const [companyname,setcompanyName] = useState('');
    const [companies, setCompanies] = useState([]); // To store the companies data
    const [showEvaluationPopup, setShowEvaluationPopup] = useState(false);
    const [showReportPopup, setShowReportPopup] = useState(false);
    const [reportErrors, setReportErrors] = useState({});
    const [reportSubmitted, setReportSubmitted] = useState(false);
    const [reportData, setReportData] = useState({
    title: "",
    introduction: "",
    body: "",
    major: "",
    courses: [],
    pdfFile: null
});
        
    const [evaluationData, setEvaluationData] = useState({
        text: '',
        recommend: false,
    });
    const [evaluationError, setEvaluationError] = useState('');
    const [evaluationSubmitted, setEvaluationSubmitted] = useState(false);

        

    useEffect(() => {
        if (student?.email) {
            const foundInternships = [];
            const foundCompanies = [];
            const allcomp= JSON.parse(localStorage.getItem('companies'));
            console.log(allcomp);
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);

                if (key.startsWith('companyInterns_')) {
                    const companyEmail = key.split('companyInterns_')[1];
                    const interns = JSON.parse(localStorage.getItem(key)) || [];
                    const company=allcomp.filter(c=>c.companyEmail===companyEmail);
                    const name= company[0].companyName;
                    setcompanyName(name);
                    console.log(name);
                  
                    interns.forEach(intern => {
                        if (intern.email === student.email) {
                            foundInternships.push({
                                ...intern,
                                companyEmail,// Add companyEmail to the internship object
                                companyname,
                            
                            });
                            // Add to companies list if not already present
                            if (!foundCompanies.some(c => c.companyEmail === companyEmail)) {
                                foundCompanies.push({ companyEmail });
                            }
                        }
                    });
                }
            }
            setAllInternships(foundInternships); // Store all fetched internships
            setCompanies(foundCompanies); // Set the companies array
        } else {
            // console.warn("Student data not found in location state. Using fallback or redirecting.");
        }
    }, [student, companyname]);

    // Log the companies array
    useEffect(() => {
        // console.log("Companies associated with the student:", companies);
    }, [companies]);

    const processedInternships = useMemo(() => {
        return allInternships.map(internship => ({
            ...internship,
            derivedStatus: internship.status ,
            startDateObj: new Date(internship.startDate),
            endDateObj: internship.endDate ? new Date(internship.endDate) : null
        }));
    }, [allInternships]);

    const handleSearch = () => {
        const lowerSearchTerm = searchTerm.toLowerCase();
        const filtered = processedInternships.filter(internship =>
            internship.jobTitle.toLowerCase().includes(lowerSearchTerm) ||
            (internship.companyEmail && internship.companyEmail.toLowerCase().includes(lowerSearchTerm)) ||
            (internship.companyname?.toLowerCase().includes(lowerSearchTerm))// Search by company email
        );
        setInternships(filtered);
    };

    const filteredByStatus = useMemo(() => {
        return internships.filter(internship =>
            statusFilter === 'all' || internship.derivedStatus === statusFilter
        );
    }, [internships, statusFilter]);

    const filteredByDate = useMemo(() => {
        return filteredByStatus.filter(internship => {
            let matchesDate = true;
            if (filterStartDate && filterEndDate) {
                const filterStart = new Date(filterStartDate);
                const filterEnd = new Date(filterEndDate);
                if (filterStart > filterEnd) {
                    matchesDate = true; // Or provide feedback to user
                } else {
                    const internStart = internship.startDateObj;
                    const internEnd = internship.endDateObj || new Date('2999-12-31');
                    matchesDate = internStart <= filterEnd && internEnd >= filterStart;
                }
            } else if (filterStartDate) {
                const filterStart = new Date(filterStartDate);
                const internEnd = internship.endDateObj || new Date('2999-12-31');
                matchesDate = internEnd >= filterStart;
            } else if (filterEndDate) {
                const filterEnd = new Date(filterEndDate);
                matchesDate = internship.startDateObj <= filterEnd;
            }
            return matchesDate;
        });
    }, [filteredByStatus, filterStartDate, filterEndDate]);

    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setFilterStartDate('');
        setFilterEndDate('');
        setInternships(processedInternships); // Reset to all fetched internships
    };

    useEffect(() => {
        // Apply initial filters when processedInternships change (after fetching)
        setInternships(processedInternships);
    }, [processedInternships]);

    // Apply status and date filters whenever their states change
    useEffect(() => {
        let tempFiltered = processedInternships.filter(internship =>
            statusFilter === 'all' || internship.derivedStatus === statusFilter
        );

        if (filterStartDate) {
            const filterStart = new Date(filterStartDate);
            tempFiltered = tempFiltered.filter(internship =>
                (internship.endDateObj || new Date('2999-12-31')) >= filterStart
            );
        }

        if (filterEndDate) {
            const filterEnd = new Date(filterEndDate);
            tempFiltered = tempFiltered.filter(internship =>
                internship.startDateObj <= filterEnd
            );
        }

        setInternships(tempFiltered);
    }, [statusFilter, filterStartDate, filterEndDate, processedInternships]);

    if (!student?.email) {
        return (
            <div style={styles.pageContainer}>
                <p>Student information is missing. Please return to the dashboard.</p>
                <button onClick={() => navigate('/studentpage')} style={styles.button}>Back to Dashboard</button>
            </div>
        );
    }

    return (
        <div style={styles.pageContainer}>
            <button onClick={() => navigate(-1)} style={styles.backButton}>
                &larr; Back to Dashboard
            </button>
            <h1 style={styles.mainHeader}>My Internships</h1>
            <p style={styles.studentIdentifier}>
                Viewing internships for: <strong>{student.name || student.email}</strong>
            </p>

            {/* Display the companies array */}
            <div style={{ marginBottom: '20px', border: '1px solid #eee', padding: '15px', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
                <h3>Companies with your internships:</h3>
                {companies.length > 0 ? (
                    <ul>
                        {companies.map((company, index) => (
                            <li key={index}>
                                <strong>Company Email:</strong> {company.companyEmail}
                                <strong>Company Name:</strong> {companyname}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No companies found for this student.</p>
                )}
            </div>

            <div style={styles.filtersSection}>
                <input
                    type="text"
                    placeholder="Search by Job Title or Company Name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={styles.searchInput}
                />
                <button onClick={handleSearch} style={styles.button}>Search</button>
                <div style={styles.filterGroup}>
                    <label htmlFor="statusFilter" style={styles.filterLabel}>Status:</label>
                    <select
                        id="statusFilter"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={styles.filterSelect}
                    >
                        <option value="all">All</option>
                        <option value="current">Current</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
                <div style={styles.filterGroup}>
                    <label htmlFor="filterStartDate" style={styles.filterLabel}>From:</label>
                    <input
                        type="date"
                        id="filterStartDate"
                        value={filterStartDate}
                        onChange={(e) => setFilterStartDate(e.target.value)}
                        style={styles.dateInput}
                    />
                </div>
                <div style={styles.filterGroup}>
                    <label htmlFor="filterEndDate" style={styles.filterLabel}>To:</label>
                    <input
                        type="date"
                        id="filterEndDate"
                        value={filterEndDate}
                        onChange={(e) => setFilterEndDate(e.target.value)}
                        style={styles.dateInput}
                    />
                </div>
                <button onClick={clearFilters} style={{ ...styles.button, ...styles.clearButton }}>Clear Filters</button>
            </div>

            {filteredByDate.length > 0 ? (
                <div style={styles.internshipList}>
                    {filteredByDate.map(internship => (
                        <div key={internship.id} style={styles.internshipCard}>
                            <h2 style={styles.internshipTitle}>{internship.jobTitle}</h2>
                            <p><strong>Company Name:</strong>{internship.companyName}</p>
                            <p style={styles.companyName}>Company Email:{internship.companyEmail}</p> {/* Display company email */}
                            <p style={styles.dates}>
                                <strong>Start:</strong> {internship.startDateObj.toLocaleDateString()}
                                {internship.endDateObj && (
                                    <> | <strong>End:</strong> {internship.endDateObj.toLocaleDateString()}</>
                                )}
                            </p>
                            <p style={styles.status}>
                                <strong>Status:</strong>
                                <span style={internship.derivedStatus === 'current' ? styles.statusCurrent : styles.statusCompleted}>
                                    {internship.derivedStatus.charAt(0).toUpperCase() + internship.derivedStatus.slice(1)}
                                </span>
                            </p>
                            <p style={styles.description}>{internship.description}</p>
                            {internship.derivedStatus === 'completed' && (
                            <div style={{ marginTop: '10px' }}>
                                <button
                                    onClick={() => setShowEvaluationPopup(true)}
                                    style={styles.popupButton}
                                >
                                    {evaluationSubmitted ? "Edit Company Evaluation" : "Add Company Evaluation"}
                                </button>

                                <button
                                    onClick={() => setShowReportPopup(true)}
                                    style={styles.popupButton}
                                >
                                    {reportSubmitted ? "Edit Internship Report" : "Add Internship Report"}
                                    
                                </button>
                                
                            </div>
                        )}

                        </div>
                        
                    ))}
                    {showEvaluationPopup && (
                        <div style={styles.popupOverlay}>
                            <div style={styles.popupContent}>
                                <h3>Company Evaluation</h3>

                                <textarea
                                    placeholder="Write your evaluation of the company..."
                                    value={evaluationData.text}
                                    onChange={(e) => setEvaluationData({ ...evaluationData, text: e.target.value })}
                                    rows={4}
                                    style={{ width: '100%', marginBottom: '10px' }}
                                />

                                <label style={{ display: 'block', marginBottom: '10px' }}>
                                    <input
                                        type="checkbox"
                                        checked={evaluationData.recommend}
                                        onChange={(e) => setEvaluationData({ ...evaluationData, recommend: e.target.checked })}
                                    />
                                    {' '}I recommend this company
                                </label>

                                {evaluationError && (
                                    <p style={{ color: 'red', marginBottom: '10px' }}>{evaluationError}</p>
                                )}

                                <button onClick={() => setShowEvaluationPopup(false)} style={styles.popupButton}>Close</button>
                                <button
                                    onClick={() => {
                                        if (!evaluationData.text.trim()) {
                                            setEvaluationError("Evaluation cannot be empty.");
                                        } else {
                                            console.log("Evaluation Submitted:", evaluationData);
                                            setEvaluationError('');
                                            setEvaluationSubmitted(true); // ✅ Mark as submitted
                                            setShowEvaluationPopup(false); // ✅ Close the popup
                                        }
                                    }}
                                    style={styles.popupButton}
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    )}


                  {showReportPopup && (
                    <div style={styles.popupOverlay}>
                        <div style={styles.popupContent}>
                            <h3>Internship Report</h3>

                            <input
                                type="text"
                                placeholder="Report Title"
                                value={reportData.title}
                                onChange={(e) => setReportData({ ...reportData, title: e.target.value })}
                                style={{ width: '100%', marginBottom: '10px', borderColor: reportErrors.title ? 'red' : undefined }}
                            />
                            {reportErrors.title && <p style={{ color: 'red' }}>{reportErrors.title}</p>}

                            <textarea
                                placeholder="Introduction"
                                value={reportData.introduction}
                                onChange={(e) => setReportData({ ...reportData, introduction: e.target.value })}
                                rows={3}
                                style={{ width: '100%', marginBottom: '10px', borderColor: reportErrors.introduction ? 'red' : undefined }}
                            />
                            {reportErrors.introduction && <p style={{ color: 'red' }}>{reportErrors.introduction}</p>}

                            <textarea
                                placeholder="Body"
                                value={reportData.body}
                                onChange={(e) => setReportData({ ...reportData, body: e.target.value })}
                                rows={5}
                                style={{ width: '100%', marginBottom: '10px', borderColor: reportErrors.body ? 'red' : undefined }}
                            />
                            {reportErrors.body && <p style={{ color: 'red' }}>{reportErrors.body}</p>}

                            <select
                                value={reportData.major}
                                onChange={(e) => setReportData({ ...reportData, major: e.target.value, courses: [] })}
                                style={{ width: '100%', marginBottom: '10px', borderColor: reportErrors.major ? 'red' : undefined }}
                            >
                                <option value="">Select Major</option>
                                {majorsWithCourses.map((m, idx) => (
                                    <option key={idx} value={m.major}>{m.major}</option>
                     ))}
            </select>
            {reportErrors.major && <p style={{ color: 'red' }}>{reportErrors.major}</p>}

            {reportData.major && (
                <div style={{ marginBottom: '10px' }}>
                    <p style={{ fontWeight: 'bold' }}>Pick courses that helped:</p>
                    {majorsWithCourses.find(m => m.major === reportData.major)?.courses.map((course, idx) => (
                        <div key={idx}>
                            <label>
                                <input
                                    type="checkbox"
                                    value={course}
                                    checked={reportData.courses.includes(course)}
                                    onChange={(e) => {
                                        const selected = reportData.courses.includes(course)
                                            ? reportData.courses.filter(c => c !== course)
                                            : [...reportData.courses, course];
                                        setReportData({ ...reportData, courses: selected });
                                    }}
                                />
                                {` ${course}`}
                            </label>
                        </div>
                    ))}
                    {reportErrors.courses && <p style={{ color: 'red' }}>{reportErrors.courses}</p>}
                </div>
            )}

            <input
                type="file"
                accept=".pdf"
                onChange={(e) => setReportData({ ...reportData, pdfFile: e.target.files[0] })}
                style={{ marginBottom: '10px', borderColor: reportErrors.pdfFile ? 'red' : undefined }}
            />
            {reportErrors.pdfFile && <p style={{ color: 'red' }}>{reportErrors.pdfFile}</p>}

            <button onClick={() => setShowReportPopup(false)} style={styles.popupButton}>Close</button>
            <button
                onClick={() => {
                   const errors = {};
                        if (!reportData.title.trim()) errors.title = "Title is required.";
                        if (!reportData.introduction.trim()) errors.introduction = "Introduction is required.";
                        if (!reportData.body.trim()) errors.body = "Body is required.";
                        if (!reportData.major) errors.major = "Major must be selected.";
                        if (reportData.courses.length === 0) errors.courses = "Select at least one course.";
                        if (!reportData.pdfFile) errors.pdfFile = "Upload a PDF file.";

                        setReportErrors(errors);

                        if (Object.keys(errors).length === 0) {
                            console.log("Report Submitted:", reportData);
                            setReportSubmitted(true); // ✅ Mark as submitted
                            setShowReportPopup(false); // ✅ Close the popup
                        }
                    

                }}
                style={styles.popupButton}
            >
                Save
            </button>
        </div>
    </div>
)}

                </div>
            ) : (
                <p style={styles.noResults}>No internships match your current filters or no internships recorded.</p>
            )}
        </div>
    );
}

const styles = {
    pageContainer: {
        maxWidth: '1200px',
        margin: '20px auto',
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
        color: '#333',
    },
    backButton: {
        background: 'transparent',
        border: 'none',
        color: '#007bff',
        fontSize: '1em',
        cursor: 'pointer',
        marginBottom: '20px',
        padding: '5px 0',
    },
    mainHeader: {
        textAlign: 'center',
        color: '#2c3e50',
        borderBottom: '2px solid #007bff',
        paddingBottom: '10px',
        marginBottom: '10px',
    },
    studentIdentifier: {
        textAlign: 'center',
        fontSize: '1.1em',
        marginBottom: '25px',
        color: '#555',
    },
    filtersSection: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '15px',
        alignItems: 'center',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        marginBottom: '30px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    },
    searchInput: {
        flex: '2 1 250px', // Adjusted width
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        fontSize: '1em',
    },
    filterGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flex: '1 1 180px', // Allow filter groups to take space
    },
    filterLabel: {
        marginRight: '5px',
        fontWeight: 'bold',
        fontSize: '0.9em',
    },
    filterSelect: {
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        backgroundColor: 'white',
        flexGrow: 1,
    },
    dateInput: {
        padding: '9px', //Slightly less padding to match height
        border: '1px solid #ccc',
        borderRadius: '4px',
        flexGrow: 1,
    },
    button: {
        padding: '10px 15px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '1em',
        backgroundColor: '#007bff',
        color: 'white',
    },
    clearButton: {
        backgroundColor: '#6c757d', // A neutral color for clear
        marginLeft: 'auto', // Pushes it to the right if space allows
    },
    internshipList: {
        marginTop: '20px',
    },
    internshipCard: {
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
    internshipTitle: {
        margin: '0 0 10px 0',
        color: '#0056b3',
    },
    companyName: {
        fontWeight: 'bold',
        marginBottom: '8px',
    },
    dates: {
        fontSize: '0.9em',
        color: '#555',
        marginBottom: '8px',
    },
    status: {
        fontSize: '0.9em',
        marginBottom: '12px',
    },
    statusCurrent: {
        backgroundColor: '#d4edda',
        color: '#155724',
        padding: '3px 7px',
        borderRadius: '4px',
        marginLeft: '5px',
    },
    statusCompleted: {
        backgroundColor: '#e2e3e5',
        color: '#383d41',
        padding: '3px 7px',
        borderRadius: '4px',
        marginLeft: '5px',
    },
    description: {
        lineHeight: '1.6',
        color: '#444',
    },
    noResults: {
        textAlign: 'center',
        fontSize: '1.2em',
        color: '#777',
        padding: '30px 0',
    },
    popupOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    },
    popupContent: {
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '80vh', // LIMIT HEIGHT
        overflowY: 'auto',  // MAKE CONTENT SCROLLABLE
        boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
        position: 'relative',
    },

    popupButton: {
        margin: '10px 5px 0 0',
        padding: '8px 16px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        backgroundColor: '#007bff',
        color: '#fff',
    },

};

export default MyInternshipsPage;