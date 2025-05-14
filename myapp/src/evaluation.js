import React, { useState, useEffect } from 'react';

const evaluationsData = [
    {
        student: {
            name: "John Doe",
            email: "johndoe@example.com",
            major: "Computer Science",
            studenteval:"good company",
            recommended :"yes"
        },
        company: {
            name: "Tech Solutions Ltd.",
            mainSupervisor: "Jane Smith",
            CompanyEmail: "janesmith@techsolutions.com"
        },
        internship: {
            startDate: "2025-01-10",
            endDate: "2025-04-10",
            evaluationReport: "John has demonstrated exceptional skills in machine learning and data analysis. His ability to tackle complex problems was impressive. He contributed significantly to the development of our AI project, working alongside the team to improve data preprocessing techniques. We highly recommend him for any future opportunities in AI development.",
            duration :"3 months"
        }
    },
    {
        student: {
            name: "Jane Doe",
            email: "janedoe@example.com",
            major: "Finance",
            studenteval:"alooo",
            recommended:"no"
        },
        company: {
            name: "Finance Pros Inc.",
            mainSupervisor: "Mark Lee",
            CompanyEmail: "marklee@financepros.com"
        },
        internship: {
            startDate: "2025-06-01",
            endDate: "2025-07-01",
            evaluationReport: "Jane showed great potential in financial analysis and budgeting. She was able to work independently and contributed to improving the financial forecasting process. We believe she will excel in her career in finance.",
            duration:"1 month"
        }
    }
];

const EvaluationReportPage = () => {
    const [report, setReport] = useState([]);
    const [expandedStudentIndex, setExpandedStudentIndex] = useState(null);

    useEffect(() => {
        setReport(evaluationsData); // Loading the dummy data
    }, []);

    const handleStudentClick = (index) => {
        setExpandedStudentIndex(expandedStudentIndex === index ? null : index); // Toggle visibility
    };

    if (!report) {
        return <p>Loading report...</p>;
    }

    return (
        <div style={{ padding: '20px' }}>
            <h1>Internship Evaluation Report</h1>

            {/* Student Selection List */}
            <section style={{ marginBottom: '20px' }}>
                <h2>Choose a Student to View Evaluation</h2>
                <ul>
                    {report.map((data, index) => (
                        <li key={index}>
                            <button
                                onClick={() => handleStudentClick(index)}
                                style={{
                                    padding: '8px 12px',
                                    backgroundColor: '#007acc',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    marginBottom: '10px'
                                }}
                            >
                                {data.student.name}
                            </button>
                        </li>
                    ))}
                </ul>
            </section>

            {/* Display Selected Student's Report */}
            {expandedStudentIndex !== null && (
                <div>
                    {/* Student Information */}
                    <section style={{ marginBottom: '20px' }}>
                        <h2>Student Information</h2>
                        <p><strong>Name:</strong> {report[expandedStudentIndex].student.name}</p>
                        <p><strong>Email:</strong> {report[expandedStudentIndex].student.email}</p>
                        <p><strong>Major:</strong> {report[expandedStudentIndex].student.major}</p>
                        <section style={{ marginBottom: '20px' }}>
                        <h2>Student's Evaluation Report</h2>
                        <p>{report[expandedStudentIndex].student.studenteval}</p>
                        <p><strong>Recommend it :</strong> {report[expandedStudentIndex].student.recommended}</p>
                    </section>
                    </section>

                    {/* Company Information */}
                    <section style={{ marginBottom: '20px' }}>
                        <h2>Company Information</h2>
                        <p><strong>Company Name:</strong> {report[expandedStudentIndex].company.name}</p>
                        <p><strong>Main Supervisor:</strong> {report[expandedStudentIndex].company.mainSupervisor}</p>
                        <p><strong>Company Email:</strong> {report[expandedStudentIndex].company.supervisorEmail}</p>
                    </section>

                    {/* Internship Duration */}
                    <section style={{ marginBottom: '20px' }}>
                        <h2>Internship Duration</h2>
                        <p><strong>Start Date:</strong> {new Date(report[expandedStudentIndex].internship.startDate).toLocaleDateString()}</p>
                        <p><strong>End Date:</strong> {new Date(report[expandedStudentIndex].internship.endDate).toLocaleDateString()}</p>
                         <p><strong>Duration:</strong> {report[expandedStudentIndex].internship.duration}</p>
                    </section>

                    {/* Evaluation Report */}
                    <section style={{ marginBottom: '20px' }}>
                        <h2>Company's Evaluation Report</h2>
                        <p>{report[expandedStudentIndex].internship.evaluationReport}</p>
                    </section>
                </div>
            )}
        </div>
    );
};

export default EvaluationReportPage;
