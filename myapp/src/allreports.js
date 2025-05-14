import React, { useState, useEffect } from 'react';
import Sidebar from './sidebarscad'; // Adjust path as needed

const initialReports = [
    {
        id: 1,
        title: "AI Internship Report",
        introduction: "This internship focused on real-world applications of artificial intelligence.",
        body: "I worked on various projects involving machine learning, data preprocessing, and predictive modeling.",
        major: "Computer Science",
        courses: ["Machine Learning", "Data Structures", "AI Fundamentals"],
        status: "pending",
        pdfFilename: "Report.pdf",
    },
    {
        id: 2,
        title: "Finance Internship Report",
        introduction: "I learned about financial analysis and portfolio management.",
        body: "My tasks included analyzing financial statements, budgeting, and client interactions.",
        major: "Finance",
        courses: ["Corporate Finance", "Accounting Basics"],
        status: "pending",
        pdfFilename: "Report.pdf",
    },
];

const AllReportsPage = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [reports, setReports] = useState([]);
    const [filterMajor, setFilterMajor] = useState("");
    const [filterStatus, setFilterStatus] = useState("pending");
    const [expandedReportId, setExpandedReportId] = useState(null);

    useEffect(() => {
        const savedReports = JSON.parse(localStorage.getItem("reports"));
        if (savedReports) {
            setReports(savedReports);
        } else {
            setReports(initialReports);
            localStorage.setItem("reports", JSON.stringify(initialReports));
        }
    }, []);

    const filteredReports = reports.filter(report =>
        (filterMajor === "" || report.major === filterMajor) &&
        (filterStatus === "all" || report.status === filterStatus)
    );

    const toggleReportDetails = (id) => {
        setExpandedReportId(expandedReportId === id ? null : id);
    };

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar menuOpen={menuOpen} toggleMenu={() => setMenuOpen(!menuOpen)} />

            <div style={{
                flex: 1,
                padding: '20px',
                marginLeft: menuOpen ? '250px' : '0px',
                transition: 'margin-left 0.3s ease'
            }}>
                {/* Hamburger Menu */}
                {!menuOpen && (
                    <button
                        onClick={() => setMenuOpen(true)}
                        style={{
                            fontSize: '24px',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            marginBottom: '20px'
                        }}
                        aria-label="Open Sidebar"
                    >
                        ☰
                    </button>
                )}

                <h1>Submitted Internship Reports</h1>

                {/* Filter Controls */}
                <div style={{ marginBottom: '20px' }}>
                    <label htmlFor="majorFilter">Filter by Major:</label>
                    <select
                        id="majorFilter"
                        value={filterMajor}
                        onChange={(e) => setFilterMajor(e.target.value)}
                        style={{ marginRight: '20px' }}
                    >
                        <option value="">All Majors</option>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Finance">Finance</option>
                    </select>

                    <label htmlFor="statusFilter">Filter by Status:</label>
                    <select
                        id="statusFilter"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="all">All</option>
                        <option value="pending">Pending</option>
                        <option value="flagged">Flagged</option>
                        <option value="rejected">Rejected</option>
                        <option value="accepted">Accepted</option>
                    </select>
                </div>

                {/* Reports List */}
                {filteredReports.length === 0 ? (
                    <p>No reports match your filters.</p>
                ) : (
                    filteredReports.map(report => (
                        <div key={report.id} style={{
                            border: '1px solid #ccc',
                            borderRadius: '8px',
                            padding: '15px',
                            marginBottom: '20px',
                            backgroundColor: '#f9f9f9'
                        }}>
                            <h2
                                onClick={() => toggleReportDetails(report.id)}
                                style={{ cursor: 'pointer', color: '#007acc' }}
                            >
                                {report.title}
                            </h2>

                            <p><strong>Status:</strong> {report.status}</p>

                            {/* Toggle details */}
                            {expandedReportId === report.id && (
                                <div style={{ marginTop: '10px' }}>
                                    <p><strong>Major:</strong> {report.major}</p>
                                    <p><strong>Introduction:</strong> {report.introduction}</p>
                                    <p><strong>Body:</strong> {report.body}</p>
                                    <p><strong>Helpful Courses:</strong> {report.courses.join(', ')}</p>
                                    <a href={`/reports/${report.pdfFilename}`}
                                        download
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            display: 'inline-block',
                                            marginTop: '10px',
                                            padding: '8px 12px',
                                            backgroundColor: '#007acc',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            textDecoration: 'none',
                                            fontWeight: 'bold',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Download PDF
                                    </a>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AllReportsPage;
