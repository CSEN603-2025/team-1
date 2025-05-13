import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

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
    const [companies, setCompanies] = useState([]); // To store the companies data

    useEffect(() => {
        if (student?.email) {
            const foundInternships = [];
            const foundCompanies = [];

            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);

                if (key.startsWith('companyInterns_')) {
                    const companyEmail = key.split('companyInterns_')[1];
                    const interns = JSON.parse(localStorage.getItem(key)) || [];

                    interns.forEach(intern => {
                        if (intern.email === student.email) {
                            foundInternships.push({
                                ...intern,
                                companyEmail // Add companyEmail to the internship object
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
            console.warn("Student data not found in location state. Using fallback or redirecting.");
        }
    }, [student]);

    // Log the companies array
    useEffect(() => {
        console.log("Companies associated with the student:", companies);
    }, [companies]);

    const processedInternships = useMemo(() => {
        return allInternships.map(internship => ({
            ...internship,
            derivedStatus: internship.endDate ? 'completed' : 'current',
            startDateObj: new Date(internship.startDate),
            endDateObj: internship.endDate ? new Date(internship.endDate) : null
        }));
    }, [allInternships]);

    const handleSearch = () => {
        const lowerSearchTerm = searchTerm.toLowerCase();
        const filtered = processedInternships.filter(internship =>
            internship.jobTitle.toLowerCase().includes(lowerSearchTerm) ||
            (internship.companyEmail && internship.companyEmail.toLowerCase().includes(lowerSearchTerm)) // Search by company email
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
                    placeholder="Search by Job Title or Company Email..."
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
                            <p style={styles.companyName}>{internship.companyEmail}</p> {/* Display company email */}
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
                        </div>
                    ))}
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
};

export default MyInternshipsPage;