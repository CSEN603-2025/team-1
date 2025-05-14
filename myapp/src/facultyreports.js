import React, { useState, useEffect } from 'react';
import { setNotification } from './notification';

const initialReports = [
    {
        id: 1,
        studentname:"student1",
        title: "AI Internship Report",
        studentemail: "student@example.com",
        introduction: "This internship focused on real-world applications of artificial intelligence.",
        body: "I worked on various projects involving machine learning, data preprocessing, and predictive modeling.",
        major: "Computer Science",
        courses: ["Machine Learning", "Data Structures", "AI Fundamentals"],
        status: "pending",
        pdfFilename: "Report.pdf",
        comment: ""
    },
    {
        id: 2,
        studentname:"student2",
        title: "Finance Internship Report",
        studentemail: "student2@example.com",
        introduction: "I learned about financial analysis and portfolio management.",
        body: "My tasks included analyzing financial statements, budgeting, and client interactions.",
        major: "Finance",
        courses: ["Corporate Finance", "Accounting Basics"],
        status: "pending",
        pdfFilename: "Report.pdf",
        comment: ""
    },
];

const FacultyReport = () => {
    const [reports, setReports] = useState([]);
    const [filterMajor, setFilterMajor] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [expandedReportId, setExpandedReportId] = useState(null);

    // For comment modal
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [comment, setComment] = useState("");
    const [commentingReportId, setCommentingReportId] = useState(null);
    const [pendingStatus, setPendingStatus] = useState(""); // "rejected" or "flagged"
    const [commentError, setCommentError] = useState("");


    useEffect(() => {
        const savedReports = JSON.parse(localStorage.getItem("reports"));
        if (savedReports) {
            setReports(savedReports);
        } else {
            setReports(initialReports);
            localStorage.setItem("reports", JSON.stringify(initialReports));
        }
    }, []);

    const handleStatusWithComment = (id, status) => {
        setCommentingReportId(id);
        setPendingStatus(status);
        setComment("");
        setShowCommentModal(true);
    };

    const saveCommentAndStatus = () => {
    if (!comment.trim()) {
        setCommentError("Comment is required.");
        return;
    }

    const updatedReports = reports.map(report =>
        report.id === commentingReportId
            ? { ...report, status: pendingStatus, comment }
            : report
    );
    setReports(updatedReports);
    localStorage.setItem("reports", JSON.stringify(updatedReports));

    const report = reports.find(r => r.id === commentingReportId);
    const email = report?.studentemail;
    const title = report?.title;
    const message = `Your internship report "${title}" has been ${pendingStatus}. Comment: ${comment}`;
    setNotification(message, email);

    // Reset modal states
    setShowCommentModal(false);
    setComment("");
    setCommentError("");
    setCommentingReportId(null);
};


    const toggleReportDetails = (id) => {
        setExpandedReportId(expandedReportId === id ? null : id);
    };

    const filteredReports = reports.filter(report =>
        (filterMajor === "" || report.major === filterMajor) &&
        (filterStatus === "all" || report.status === filterStatus)
    );

    return (
        <div style={{ padding: '20px' }}>
            <h1>Submitted Internship Reports</h1>

            {/* Filters */}
            <div style={{ marginBottom: '20px' }}>
                <label>Filter by Major: </label>
                <select value={filterMajor} onChange={(e) => setFilterMajor(e.target.value)}>
                    <option value="">All Majors</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Finance">Finance</option>
                </select>

                <label style={{ marginLeft: '20px' }}>Filter by Status: </label>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="all">All</option>
                    <option value="pending">Pending</option>
                    <option value="flagged">Flagged</option>
                    <option value="rejected">Rejected</option>
                    <option value="accepted">Accepted</option>
                </select>
            </div>

            {filteredReports.map(report => (
                <div key={report.id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                    <h2 onClick={() => toggleReportDetails(report.id)} style={{ cursor: 'pointer', color: '#007acc' }}>
                       {report.studentname}: {report.title}
                    </h2>
                    

                    {expandedReportId === report.id && (
                        <div>
                            <p><strong>Major:</strong> {report.major}</p>
                            <p><strong>Introduction:</strong> {report.introduction}</p>
                            <p><strong>Body:</strong> {report.body}</p>
                            <p><strong>Courses:</strong> {report.courses.join(', ')}</p>
                            <a href={`/reports/${report.pdfFilename}`} download target="_blank" rel="noopener noreferrer"
                                style={{ marginTop: '10px', display: 'inline-block', backgroundColor: '#007acc', color: 'white', padding: '8px 12px', borderRadius: '4px', textDecoration: 'none' }}>
                                Download PDF
                            </a>
                            <div style={{ marginTop: '10px' }}>
                                <button onClick={() => handleStatusWithComment(report.id, "rejected")} style={{ marginRight: '10px' }}>Reject</button>
                                <button onClick={() => handleStatusWithComment(report.id, "flagged")} style={{ marginRight: '10px' }}>Flag</button>
                                <button onClick={() => handleStatusWithComment(report.id, "accepted")}>Accept</button>
                            </div>

                            {["rejected", "flagged"].includes(report.status) && report.comment && (
                                <p><strong>Comment:</strong> {report.comment}</p>
                            )}

                        </div>
                    )}
                </div>
            ))}

            {/* Comment Modal */}
            {showCommentModal && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{ background: 'white', padding: '20px', borderRadius: '8px', width: '300px' }}>
                        <h3>{pendingStatus.charAt(0).toUpperCase() + pendingStatus.slice(1)} Report</h3>
                        <textarea
                            placeholder="Enter comment/reason..."
                            value={comment}
                            onChange={(e) => {
                                setComment(e.target.value);
                                if (commentError) setCommentError(""); // Clear error when typing
                            }}
                            style={{ width: '100%', height: '100px', marginBottom: '5px' }}
                        />
                        {commentError && (
                            <p style={{ color: 'red', marginTop: '0', marginBottom: '10px', fontSize: '0.9em' }}>
                                {commentError}
                            </p>
                        )}
                        <div style={{ textAlign: 'right' }}>
                            <button onClick={() => {
                                setShowCommentModal(false);
                                setComment("");
                                setCommentError("");
                            }} style={{ marginRight: '10px' }}>Cancel</button>
                            <button onClick={saveCommentAndStatus}>Save</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default FacultyReport;
