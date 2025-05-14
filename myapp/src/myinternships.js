import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// (majorsWithCourses array remains the same)
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

// Default states for initialization
const defaultEvaluationState = {
    text: '',
    recommend: false,
    submitted: false,
};

const defaultReportState = {
    title: "",
    introduction: "",
    body: "",
    major: "",
    courses: [],
    pdfFile: null,       // This is for the File object during editing, not stored in localStorage
    pdfFileName: "",     // This IS stored in localStorage
    submitted: false,    // Initial form save
    finalSubmitted: false, // Final submission
};


function MyInternshipsPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const student = location.state?.student;

    const [allInternships, setAllInternships] = useState([]);
    const [internships, setInternships] = useState([]); // For display after filtering
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    const [companies, setCompanies] = useState([]);

    // --- State for Popups ---
    const [showEvaluationPopup, setShowEvaluationPopup] = useState(false);
    const [currentInternshipIdForPopup, setCurrentInternshipIdForPopup] = useState(null);
    
    const [popupEvaluationData, setPopupEvaluationData] = useState({...defaultEvaluationState});
    const [evaluationError, setEvaluationError] = useState('');

    const [showReportPopup, setShowReportPopup] = useState(false);
    const [popupReportData, setPopupReportData] = useState({...defaultReportState});
    const [reportErrors, setReportErrors] = useState({});
    
    const [showFinalReportView, setShowFinalReportView] = useState(false);
        

    // Effect to fetch internships AND LOAD PERSISTED DATA from localStorage
    useEffect(() => {
        if (student?.email) {
            let foundInternships = [];
            const foundCompanies = [];
            const allcomp = JSON.parse(localStorage.getItem('companies')) || [];
            
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('companyInterns_')) {
                    const companyEmail = key.split('companyInterns_')[1];
                    const internsDataFromStorage = JSON.parse(localStorage.getItem(key)) || [];
                    const company = allcomp.find(c => c.companyEmail === companyEmail);
                    const companyName = company ? company.companyName : 'N/A';
                  
                    internsDataFromStorage.forEach(intern => {
                        if (intern.email === student.email) {
                            const uniqueInternshipId = `${student.email}_${intern.jobTitle}_${companyEmail}_${intern.startDate}`.replace(/\s+/g, '_');
                            
                            // === LOAD PERSISTED DATA ===
                            const savedEvaluation = JSON.parse(localStorage.getItem(`evaluation_${uniqueInternshipId}`)) || { ...defaultEvaluationState };
                            let savedReport = JSON.parse(localStorage.getItem(`report_${uniqueInternshipId}`)) || { ...defaultReportState };
                            // pdfFile object itself isn't stored, only its name.
                            // When loading, pdfFile (the File object) will be null. pdfFileName is loaded.
                            savedReport = { ...savedReport, pdfFile: null };


                            foundInternships.push({
                                ...intern,
                                uniqueInternshipId,
                                companyEmail,
                                companyName,
                                evaluation: savedEvaluation,
                                report: savedReport,
                            });
                            if (!foundCompanies.some(c => c.companyEmail === companyEmail)) {
                                foundCompanies.push({ companyEmail, companyName });
                            }
                        }
                    });
                }
            }
            setAllInternships(foundInternships);
            setCompanies(foundCompanies);
        }
    }, [student]);

    const processedInternships = useMemo(() => {
        return allInternships.map(internship => ({
            ...internship,
            derivedStatus: internship.status ,
            startDateObj: new Date(internship.startDate),
            endDateObj: internship.endDate ? new Date(internship.endDate) : null,
        }));
    }, [allInternships]);

    // --- Filtering and Search ---
    const handleSearch = () => {
        const lowerSearchTerm = searchTerm.toLowerCase();
        const filtered = processedInternships.filter(internship =>
            internship.jobTitle.toLowerCase().includes(lowerSearchTerm) ||
            (internship.companyEmail && internship.companyEmail.toLowerCase().includes(lowerSearchTerm)) ||
            (internship.companyName?.toLowerCase().includes(lowerSearchTerm))
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
                    matchesDate = true; 
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
        setInternships(processedInternships); 
    };

    useEffect(() => {
        setInternships(processedInternships);
    }, [processedInternships]);

    useEffect(() => {
        let tempFiltered = processedInternships;
        if (searchTerm) {
            const lowerSearchTerm = searchTerm.toLowerCase();
            tempFiltered = tempFiltered.filter(internship =>
                internship.jobTitle.toLowerCase().includes(lowerSearchTerm) ||
                (internship.companyEmail && internship.companyEmail.toLowerCase().includes(lowerSearchTerm)) ||
                (internship.companyName?.toLowerCase().includes(lowerSearchTerm))
            );
        }
        tempFiltered = tempFiltered.filter(internship =>
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
    }, [statusFilter, filterStartDate, filterEndDate, processedInternships, searchTerm]);


    const handleDownloadSampleReport = () => {
        const link = document.createElement('a');
        const publicUrl = process.env.PUBLIC_URL || '';
        link.href = `${publicUrl}/Report.pdf`;
        link.setAttribute('download', 'Report.pdf');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // --- Popup Opening Handlers ---
    const handleOpenEvaluationPopup = (internshipId) => {
        const internshipToEdit = allInternships.find(intern => intern.uniqueInternshipId === internshipId);
        if (internshipToEdit) {
            setCurrentInternshipIdForPopup(internshipId);
            setPopupEvaluationData({ ...internshipToEdit.evaluation });
            setEvaluationError('');
            setShowEvaluationPopup(true);
        }
    };

    const handleOpenReportForm = (internshipId) => {
        const internshipToEdit = allInternships.find(intern => intern.uniqueInternshipId === internshipId);
        if (internshipToEdit) {
            setCurrentInternshipIdForPopup(internshipId);
            // When opening, pdfFile object is null. pdfFileName is from internship's report state (loaded from localStorage).
            setPopupReportData({ ...internshipToEdit.report, pdfFile: null }); 
            setReportErrors({});
            setShowReportPopup(true);
        }
    };
    
    const handleOpenFinalReportView = (internshipId) => {
        const internshipToView = allInternships.find(intern => intern.uniqueInternshipId === internshipId);
        if (internshipToView) {
            setCurrentInternshipIdForPopup(internshipId);
            // For viewing, we use the data from the internship object, which includes pdfFileName
            setPopupReportData({ ...internshipToView.report }); 
            setShowFinalReportView(true);
        }
    };


    // --- Saving Handlers (Update allInternships state AND SAVE TO localStorage) ---
    const handleSaveEvaluation = () => {
        if (!popupEvaluationData.text.trim()) {
            setEvaluationError("Evaluation cannot be empty.");
            return;
        }
        const updatedEvaluation = { ...popupEvaluationData, submitted: true };

        // === SAVE TO localStorage ===
        localStorage.setItem(`evaluation_${currentInternshipIdForPopup}`, JSON.stringify(updatedEvaluation));

        setAllInternships(prevInternships => 
            prevInternships.map(intern => 
                intern.uniqueInternshipId === currentInternshipIdForPopup 
                ? { ...intern, evaluation: updatedEvaluation }
                : intern
            )
        );
        setEvaluationError('');
        setShowEvaluationPopup(false);
    };

    const handleSaveReport = () => {
        const errors = {};
        if (!popupReportData.title.trim()) errors.title = "Title is required.";
        if (!popupReportData.introduction.trim()) errors.introduction = "Introduction is required.";
        if (!popupReportData.body.trim()) errors.body = "Body is required.";
        if (!popupReportData.major) errors.major = "Major must be selected.";
        if (popupReportData.courses.length === 0) errors.courses = "Select at least one course.";
        if (!popupReportData.pdfFile && !popupReportData.pdfFileName) errors.pdfFile = "Upload a PDF file.";
        
        setReportErrors(errors);

        if (Object.keys(errors).length === 0) {
            // Prepare the report data to be saved. Exclude the actual File object for localStorage.
            const reportToSaveInState = {
                ...popupReportData,
                submitted: true,
                finalSubmitted: false,
                pdfFileName: popupReportData.pdfFile ? popupReportData.pdfFile.name : popupReportData.pdfFileName,
                // pdfFile (File object) is kept in popupReportData for current interaction,
                // but we don't want to put the File object itself into allInternships state permanently
                // as it's large and not serializable for localStorage.
            };

            const reportToSaveInLocalStorage = {
                ...reportToSaveInState,
                pdfFile: null, // Explicitly nullify File object for localStorage
            };


            // === SAVE TO localStorage ===
            localStorage.setItem(`report_${currentInternshipIdForPopup}`, JSON.stringify(reportToSaveInLocalStorage));
            
            // Update allInternships state (this version holds the file name, not the file object)
            setAllInternships(prevInternships => 
                prevInternships.map(intern => 
                    intern.uniqueInternshipId === currentInternshipIdForPopup 
                    ? { ...intern, report: { ...reportToSaveInLocalStorage } } // Use the version for localStorage
                    : intern
                )
            );
            setShowReportPopup(false);
        }
    };

    const handleFinalReportSubmit = () => {
        const internshipToUpdate = allInternships.find(intern => intern.uniqueInternshipId === currentInternshipIdForPopup);
        if (internshipToUpdate) {
            const updatedReport = { ...internshipToUpdate.report, finalSubmitted: true, pdfFile: null }; // pdfFile null for storage

            // === SAVE TO localStorage ===
            localStorage.setItem(`report_${currentInternshipIdForPopup}`, JSON.stringify(updatedReport));

            setAllInternships(prevInternships => 
                prevInternships.map(intern => {
                    if (intern.uniqueInternshipId === currentInternshipIdForPopup) {
                        return { 
                            ...intern, 
                            report: updatedReport
                        };
                    }
                    return intern;
                })
            );
        }
        setShowFinalReportView(false);
    };


    if (!student?.email) {
        return (
            <div style={styles.pageContainer}>
                <p>Student information is missing. Please return to the dashboard.</p>
                <button onClick={() => navigate('/studentpage')} style={styles.button}>Back to Dashboard</button>
            </div>
        );
    }

    const currentPopupInternship = allInternships.find(
        (intern) => intern.uniqueInternshipId === currentInternshipIdForPopup
    );


    return (
        <div style={styles.pageContainer}>
            <button onClick={() => navigate(-1)} style={styles.backButton}>
                ← Back to Dashboard
            </button>
            <h1 style={styles.mainHeader}>My Internships</h1>
            <p style={styles.studentIdentifier}>
                Viewing internships for: <strong>{student.name || student.email}</strong>
            </p>

            <div style={{ marginBottom: '20px', border: '1px solid #eee', padding: '15px', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
                <h3>Companies with your internships:</h3>
                {companies.length > 0 ? (
                    <ul>
                        {companies.map((company, index) => (
                            <li key={index}>
                                <strong>Company Name:</strong> {company.companyName || 'N/A'}
                                {' - '}
                                <strong>Email:</strong> {company.companyEmail}
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
                    placeholder="Search by Job Title or Company..."
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
                        <div key={internship.uniqueInternshipId} style={styles.internshipCard}>
                            <h2 style={styles.internshipTitle}>{internship.jobTitle}</h2>
                            <p><strong>Company Name:</strong> {internship.companyName || 'N/A'}</p>
                            <p style={styles.companyName}><strong>Company Email:</strong> {internship.companyEmail}</p>
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
                                    onClick={() => handleOpenEvaluationPopup(internship.uniqueInternshipId)}
                                    style={styles.popupButton}
                                >
                                    {internship.evaluation.submitted ? "Edit Company Evaluation" : "Add Company Evaluation"}
                                </button>

                                {internship.report.finalSubmitted ? (
                                    <p style={{ color: 'green', fontWeight: 'bold', display: 'inline-block', marginLeft: '10px' }}>
                                        Internship Report Submitted!
                                    </p>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => handleOpenReportForm(internship.uniqueInternshipId)}
                                            style={styles.popupButton}
                                        >
                                            {internship.report.submitted ? "Edit Internship Report" : "Add Internship Report"}
                                        </button>

                                        {internship.report.submitted && (
                                            <button
                                                onClick={() => handleOpenFinalReportView(internship.uniqueInternshipId)}
                                                style={{ ...styles.popupButton, backgroundColor: '#28a745' }}
                                            >
                                                View and Submit Finalized Report
                                            </button>
                                        )}
                                    </>
                                )}
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
                                    value={popupEvaluationData.text}
                                    onChange={(e) => setPopupEvaluationData(prev => ({ ...prev, text: e.target.value }))}
                                    rows={4}
                                    style={{ width: '100%', marginBottom: '10px', boxSizing: 'border-box' }}
                                />
                                <label style={{ display: 'block', marginBottom: '10px' }}>
                                    <input
                                        type="checkbox"
                                        checked={popupEvaluationData.recommend}
                                        onChange={(e) => setPopupEvaluationData(prev => ({ ...prev, recommend: e.target.checked }))}
                                    />
                                    {' '}I recommend this company
                                </label>
                                {evaluationError && (
                                    <p style={{ color: 'red', marginBottom: '10px' }}>{evaluationError}</p>
                                )}
                                <div style={{ textAlign: 'right' }}>
                                    <button onClick={() => setShowEvaluationPopup(false)} style={{...styles.popupButton, backgroundColor: '#6c757d'}}>Close</button>
                                    <button onClick={handleSaveEvaluation} style={styles.popupButton}>
                                        Save
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                  {showReportPopup && (
                    <div style={styles.popupOverlay}>
                        <div style={styles.popupContent}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <h3>Internship Report</h3>
                                <button
                                    onClick={handleDownloadSampleReport}
                                    style={{ ...styles.popupButton, backgroundColor: '#17a2b8', margin: '0' }}
                                >
                                    Download Sample PDF
                                </button>
                            </div>

                            <input
                                type="text"
                                placeholder="Report Title"
                                value={popupReportData.title}
                                onChange={(e) => setPopupReportData(prev => ({ ...prev, title: e.target.value }))}
                                style={{ width: '100%', marginBottom: '10px', padding: '8px', boxSizing: 'border-box', borderColor: reportErrors.title ? 'red' : undefined }}
                            />
                            {reportErrors.title && <p style={styles.errorText}>{reportErrors.title}</p>}

                            <textarea
                                placeholder="Introduction"
                                value={popupReportData.introduction}
                                onChange={(e) => setPopupReportData(prev => ({ ...prev, introduction: e.target.value }))}
                                rows={3}
                                style={{ width: '100%', marginBottom: '10px', padding: '8px', boxSizing: 'border-box', borderColor: reportErrors.introduction ? 'red' : undefined }}
                            />
                            {reportErrors.introduction && <p style={styles.errorText}>{reportErrors.introduction}</p>}

                            <textarea
                                placeholder="Body"
                                value={popupReportData.body}
                                onChange={(e) => setPopupReportData(prev => ({ ...prev, body: e.target.value }))}
                                rows={5}
                                style={{ width: '100%', marginBottom: '10px', padding: '8px', boxSizing: 'border-box', borderColor: reportErrors.body ? 'red' : undefined }}
                            />
                            {reportErrors.body && <p style={styles.errorText}>{reportErrors.body}</p>}

                            <select
                                value={popupReportData.major}
                                onChange={(e) => setPopupReportData(prev => ({ ...prev, major: e.target.value, courses: [] }))}
                                style={{ width: '100%', marginBottom: '10px', padding: '8px', boxSizing: 'border-box', borderColor: reportErrors.major ? 'red' : undefined }}
                            >
                                <option value="">Select Major</option>
                                {majorsWithCourses.map((m, idx) => (
                                    <option key={idx} value={m.major}>{m.major}</option>
                                ))}
                            </select>
                            {reportErrors.major && <p style={styles.errorText}>{reportErrors.major}</p>}

                            {popupReportData.major && (
                                <div style={{ marginBottom: '10px', border: '1px solid #eee', padding: '10px', borderRadius: '4px' }}>
                                    <p style={{ fontWeight: 'bold', marginTop: '0' }}>Pick courses that helped:</p>
                                    {majorsWithCourses.find(m => m.major === popupReportData.major)?.courses.map((course, idx) => (
                                        <div key={idx}> <label> <input type="checkbox" value={course} checked={popupReportData.courses.includes(course)} onChange={(e) => { const selected = popupReportData.courses.includes(course) ? popupReportData.courses.filter(c => c !== course) : [...popupReportData.courses, course]; setPopupReportData(prev => ({ ...prev, courses: selected })); }} /> {` ${course}`} </label> </div>
                                    ))}
                                    {reportErrors.courses && <p style={{ color: 'red', marginBottom: '0' }}>{reportErrors.courses}</p>}
                                </div>
                            )}
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Upload PDF Report:</label>
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    setPopupReportData(prev => ({ 
                                        ...prev, 
                                        pdfFile: file, // Keep the File object in popup state for current editing
                                        pdfFileName: file ? file.name : "" // Update filename
                                    }));
                                }}
                                style={{ width: '100%', marginBottom: '10px', padding: '8px', boxSizing: 'border-box', borderColor: reportErrors.pdfFile ? 'red' : undefined }}
                            />
                            {/* Display selected file name from popup state */}
                            {popupReportData.pdfFile ? 
                                <p style={{fontSize: '0.9em', color: '#555'}}>Selected file: {popupReportData.pdfFile.name}</p> :
                                (popupReportData.pdfFileName && <p style={{fontSize: '0.9em', color: '#555'}}>Current file: {popupReportData.pdfFileName} (re-select if you want to change)</p>)
                            }
                            {reportErrors.pdfFile && <p style={styles.errorText}>{reportErrors.pdfFile}</p>}

                            <div style={{ textAlign: 'right', marginTop: '10px' }}>
                                <button onClick={() => setShowReportPopup(false)} style={{...styles.popupButton, backgroundColor: '#6c757d'}}>Close</button>
                                <button onClick={handleSaveReport} style={styles.popupButton}>
                                    Save Report
                                </button>
                            </div>
                        </div>
                    </div>
                    )}

                    {showFinalReportView && currentPopupInternship && (
                        <div style={styles.popupOverlay}>
                            <div style={styles.popupContent} role="dialog" aria-labelledby="finalReportTitle">
                                <h3 id="finalReportTitle" style={{ borderBottom: '1px solid #ccc', paddingBottom: '10px', marginBottom: '15px' }}>
                                    Final Internship Report Review
                                </h3>
                                {/* Display data from currentPopupInternship.report (which was loaded from localStorage) */}
                                <div style={styles.finalReportField}>
                                    <strong>Title:</strong> {currentPopupInternship.report.title || "N/A"}
                                </div>
                                <div style={styles.finalReportField}>
                                    <strong>Introduction:</strong>
                                    <p style={styles.finalReportParagraph}>{currentPopupInternship.report.introduction || "N/A"}</p>
                                </div>
                                <div style={styles.finalReportField}>
                                    <strong>Body:</strong>
                                    <p style={styles.finalReportParagraph}>{currentPopupInternship.report.body || "N/A"}</p>
                                </div>
                                <div style={styles.finalReportField}>
                                    <strong>Major:</strong> {currentPopupInternship.report.major || "N/A"}
                                </div>
                                {currentPopupInternship.report.major && currentPopupInternship.report.courses.length > 0 && (
                                    <div style={styles.finalReportField}>
                                        <strong>Relevant Courses:</strong>
                                        <ul style={{ listStyleType: 'disc', paddingLeft: '20px', margin: '5px 0 0 0' }}>
                                            {currentPopupInternship.report.courses.map(course => <li key={course}>{course}</li>)}
                                        </ul>
                                    </div>
                                )}
                                <div style={styles.finalReportField}>
                                    <strong>Uploaded PDF:</strong> {currentPopupInternship.report.pdfFileName || "None"}
                                </div>
                               

                                <div style={{ textAlign: 'right', marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #eee' }}>
                                    <button 
                                        onClick={() => {
                                            setShowFinalReportView(false);
                                            handleOpenReportForm(currentInternshipIdForPopup);
                                        }} 
                                        style={{...styles.popupButton, backgroundColor: '#6c757d'}}
                                    >
                                        Back to Edit
                                    </button>
                                    <button
                                        onClick={handleFinalReportSubmit}
                                        style={{ ...styles.popupButton, backgroundColor: '#007bff' }}
                                    >
                                        Submit Final Report
                                    </button>
                                </div>
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
        flex: '2 1 250px',
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        fontSize: '1em',
    },
    filterGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flex: '1 1 180px',
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
        padding: '9px',
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
        backgroundColor: '#6c757d',
        marginLeft: 'auto', 
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
        maxHeight: '90vh', 
        overflowY: 'auto',
        boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
        position: 'relative',
        boxSizing: 'border-box',
    },
    popupButton: {
        margin: '10px 0 0 10px', 
        padding: '8px 16px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        backgroundColor: '#007bff',
        color: '#fff',
        fontSize: '0.9em',
    },
    errorText: { 
        color: 'red',
        fontSize: '0.85em',
        marginTop: '-5px',
        marginBottom: '10px',
    },
    finalReportField: {
        marginBottom: '12px',
        fontSize: '1.05em',
        lineHeight: '1.5',
    },
    finalReportParagraph: { 
        whiteSpace: 'pre-wrap', 
        backgroundColor: '#f9f9f9',
        padding: '8px',
        borderRadius: '4px',
        border: '1px solid #eee',
        marginTop: '4px',
        maxHeight: '150px', 
        overflowY: 'auto',  
    }
};

export default MyInternshipsPage;