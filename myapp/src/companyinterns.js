import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function CompanyInterns() {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Get data from location.state
    const { acceptedInterns: initialInterns = [], storedCompany } = location.state || {};
    const [interns, setInterns] = useState(initialInterns.map(intern => ({ ...intern, status: intern.status || 'current' })));

    const [selectedInternForEvaluation, setSelectedInternForEvaluation] = useState(null);
    const [evaluation, setEvaluation] = useState('');
    const [selectedInternEmail, setSelectedInternEmail] = useState('');

    // Load interns from localStorage on component mount
    useEffect(() => {
        if (storedCompany?.companyEmail) {
            const companyInternsKey = `companyInterns_${storedCompany.companyEmail}`;
            const storedInterns = JSON.parse(localStorage.getItem(companyInternsKey)) || [];
            setInterns(storedInterns.map(intern => ({ ...intern, status: intern.status || 'current' })));
        }
    }, [storedCompany]);

    // Update intern status in both state and localStorage
    const updateInternStatus = (email, jobTitle) => {
        if (!storedCompany?.companyEmail) return;

        const updatedInterns = interns.map(intern => {
            if (intern.email === email && intern.jobTitle === jobTitle) {
                return { ...intern, status: 'completed' };
            }
            return intern;
        });

        setInterns(updatedInterns);

        const companyInternsKey = `companyInterns_${storedCompany.companyEmail}`;
        localStorage.setItem(companyInternsKey, JSON.stringify(updatedInterns));
    };

    // Filter interns based on search term and status
    const filteredInterns = interns.filter(intern => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
            intern.name?.toLowerCase().includes(searchLower) ||
            intern.email?.toLowerCase().includes(searchLower) ||
            intern.jobTitle?.toLowerCase().includes(searchLower);

        const matchesStatus =
            statusFilter === 'all' ||
            intern.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const handleSelectIntern = (email, jobTitle) => {
        const selectedIntern = interns.find((i) => i.email === email && i.jobTitle === jobTitle);
        setSelectedInternForEvaluation(selectedIntern);
        const evaluationKey = `evaluation_${email}_${jobTitle}`;
        const storedEvaluation = localStorage.getItem(evaluationKey) || '';
        setEvaluation(storedEvaluation);
    };

    const handleCloseEvaluation = () => {
        setSelectedInternForEvaluation(null);
        setEvaluation('');
        setSelectedInternEmail('');
    };

    const saveEvaluation = () => {
        if (selectedInternForEvaluation) {
            const evaluationKey = `evaluation_${selectedInternForEvaluation.email}_${selectedInternForEvaluation.jobTitle}`;
            localStorage.setItem(evaluationKey, evaluation);
            alert(`Evaluation for ${selectedInternForEvaluation.name} saved!`);
            handleCloseEvaluation();
        } else {
            alert('Please select an intern first.');
        }
    };

    const deleteEvaluation = () => {
        if (selectedInternForEvaluation) {
            const evaluationKey = `evaluation_${selectedInternForEvaluation.email}_${selectedInternForEvaluation.jobTitle}`;
            localStorage.removeItem(evaluationKey);
            setEvaluation('');
            alert(`Evaluation for ${selectedInternForEvaluation.name} deleted!`);
            handleCloseEvaluation();
        } else {
            alert("No evaluation to delete!");
        }
    }

    return (
        <div style={{
            backgroundColor: '#e6f2ff', // Baby blue background
            minHeight: '100vh',
            padding: '20px',
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        }}>
            <div style={{
                maxWidth: '800px',
                margin: '0 auto',
                padding: '20px',
                backgroundColor: '#fff',
                borderRadius: '10px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                position: 'relative'
            }}>
                <h1 style={{ 
                    textAlign: 'center', 
                    color: '#34495E', 
                    marginBottom: '20px',
                    paddingBottom: '10px',
                    borderBottom: '2px solid #e6f2ff'
                }}>
                    Your Interns
                </h1>

                {/* Search and Filter Controls */}
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '15px',
                    marginBottom: '25px',
                    justifyContent: 'space-between',
                    backgroundColor: '#e6f2ff', // Lighter blue for the filter section
                    padding: '15px',
                    borderRadius: '8px'
                }}>
                    <div style={{ flex: '1', minWidth: '250px' }}>
                        <input
                            type="text"
                            placeholder="Search by name, email, or job title..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '6px',
                                border: '1px solid #e6f2ff',
                                fontSize: '16px',
                                backgroundColor: '#f8fcff'
                            }}
                        />
                    </div>

                    <div style={{ flex: '1', minWidth: '250px' }}>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '6px',
                                border: '1px solid #b3e0ff',
                                fontSize: '16px',
                                backgroundColor: '#f8fcff'
                            }}
                        >
                            <option value="all">All Interns</option>
                            <option value="current">Current Interns</option>
                            <option value="completed">Internship Completed</option>
                        </select>
                    </div>
                </div>

                {filteredInterns.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '40px',
                        backgroundColor: '#f0f9ff',
                        borderRadius: '8px',
                        marginBottom: '20px'
                    }}>
                        <p style={{ fontSize: '18px', color: '#555' }}>
                            No interns found matching your criteria.
                        </p>
                    </div>
                ) : (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {filteredInterns.map((intern, index) => (
                            <li key={`${intern.email}-${intern.jobTitle}`} style={{
                                border: '1px solid #b3e0ff',
                                borderRadius: '8px',
                                padding: '15px 20px',
                                marginBottom: '15px',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                                backgroundColor: '#f8fcff',
                                wordBreak: 'break-word',
                                position: 'relative',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <div style={{
                                        position: 'absolute',
                                        top: '10px',
                                        right: '10px',
                                        padding: '5px 10px',
                                        borderRadius: '4px',
                                        backgroundColor: intern.status === 'completed' ? '#28a745' : '#007bff',
                                        color: 'white',
                                        fontSize: '14px'
                                    }}>
                                        {intern.status === 'completed' ? 'Completed' : 'Current'}
                                    </div>

                                    <h2 style={{ margin: '0 0 10px 0', fontSize: '20px', color: '#333' }}>
                                        {intern.name || 'No Name Provided'}
                                    </h2>
                                    <p style={{ margin: '5px 0', color: '#666' }}>
                                        <strong>Email:</strong> {intern.email || 'N/A'}
                                    </p>
                                    <p style={{ margin: '5px 0', color: '#666' }}>
                                        <strong>Job Title:</strong> {intern.jobTitle || 'N/A'}
                                    </p>
                                    <p style={{ margin: '5px 0', color: '#666' }}>
                                        <strong>Duration:</strong> {intern.jobDuration || 'N/A'}
                                    </p>
                                    <div style={{ marginTop: '15px' }}>
                                        <button
                                            onClick={() => updateInternStatus(intern.email, intern.jobTitle)}
                                            style={{
                                                padding: '8px 15px',
                                                backgroundColor: intern.status !== 'completed' ? '#28a745' : '#6c757d',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '14px'
                                            }}
                                            disabled={intern.status === 'completed'}
                                        >
                                            Mark as Completed
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}

                {/* Evaluation Section */}
                <div style={{ 
                    marginTop: '20px',
                    backgroundColor: '#f0f9ff',
                    padding: '15px',
                    borderRadius: '8px'
                }}>
                    <h3 style={{ color: '#34495E', marginBottom: '15px' }}>Intern Evaluations</h3>
                    <select
                        value={selectedInternEmail}
                        onChange={(e) => {
                            const [email, jobTitle] = e.target.value.split('__');
                            setSelectedInternEmail(e.target.value);
                            handleSelectIntern(email, jobTitle);
                        }}
                        style={{
                            width: '100%',
                            maxWidth: '300px',
                            padding: '10px',
                            borderRadius: '6px',
                            border: '1px solid #b3e0ff',
                            fontSize: '16px',
                            backgroundColor: '#f8fcff',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="">Select Intern for Evaluation</option>
                        {filteredInterns
                            .filter(intern => intern.status === 'completed')
                            .map(intern => (
                                <option key={`${intern.email}__${intern.jobTitle}`}
                                        value={`${intern.email}__${intern.jobTitle}`}>
                                    {intern.name} - {intern.jobTitle}
                                </option>
                            ))}
                    </select>
                </div>

                {/* Evaluation Popup */}
                {selectedInternForEvaluation && (
                    <div style={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: 'white',
                        padding: '20px',
                        borderRadius: '8px',
                        boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
                        zIndex: 1000,
                        width: '80%',
                        maxWidth: '500px',
                        border: '2px solid #b3e0ff'
                    }}>
                        <h3 style={{ color: '#34495E', marginBottom: '10px' }}>
                            Evaluation for {selectedInternForEvaluation.name}
                        </h3>
                        <textarea
                            value={evaluation}
                            onChange={(e) => setEvaluation(e.target.value)}
                            placeholder="Write your evaluation here..."
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '6px',
                                border: '1px solid #b3e0ff',
                                fontSize: '16px',
                                minHeight: '150px',
                                boxSizing: 'border-box',
                                marginBottom: '15px',
                                backgroundColor: '#f8fcff'
                            }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button
                                onClick={handleCloseEvaluation}
                                style={{
                                    padding: '10px 15px',
                                    backgroundColor: '#6c757d',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '16px'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveEvaluation}
                                style={{
                                    padding: '10px 15px',
                                    backgroundColor: '#28a745',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '16px'
                                }}
                            >
                                Save Evaluation
                            </button>
                            <button
                                onClick={deleteEvaluation}
                                style={{
                                    padding: '10px 15px',
                                    backgroundColor: '#dc3545',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '16px'
                                }}
                            >
                                Delete Evaluation
                            </button>
                        </div>
                    </div>
                )}

                {/* Overlay for the popup */}
                {selectedInternForEvaluation && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        zIndex: 999,
                    }} onClick={handleCloseEvaluation}></div>
                )}

                <button
                    onClick={() => navigate(-1)}
                    style={{
                        marginTop: '30px',
                        padding: '10px 20px',
                        backgroundColor: '#34495E',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        width: '100%',
                        maxWidth: '300px',
                        display: 'block',
                        marginLeft: 'auto',
                        marginRight: 'auto',
                        transition: 'all 0.3s',
                        ':hover': {
                            backgroundColor: '#34495E'
                        }
                    }}
                >
                    Back to Dashboard
                </button>
            </div>
        </div>
    );
}

export default CompanyInterns;