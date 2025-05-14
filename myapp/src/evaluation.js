import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './sidebarscad';
import SidebarFac from './sidebarfaculty';

// Mock evaluation data
const evaluationsData = [
  {
    student: {
      name: 'John Doe',
      email: 'johndoe@example.com',
      major: 'Computer Science',
      studenteval: 'Excellent performance, demonstrated strong coding skills.',
      recommended: 'Yes'
    },
    company: {
      name: 'Tech Solutions Ltd.',
      mainSupervisor: 'Jane Smith',
      CompanyEmail: 'contact@techsolutions.com'
    },
    internship: {
      startDate: '2024-06-01',
      endDate: '2024-09-01',
      duration: '3 months',
      evaluationReport: 'John demonstrated great problem-solving skills and contributed to several key projects.'
    }
  },
  {
    student: {
      name: 'Alice Johnson',
      email: 'alicejohnson@example.com',
      major: 'Finance',
      studenteval: 'Strong understanding of financial analysis and modeling.',
      recommended: 'Yes'
    },
    company: {
      name: 'FinCorp Inc.',
      mainSupervisor: 'Robert Brown',
      CompanyEmail: 'contact@fincorp.com'
    },
    internship: {
      startDate: '2024-07-01',
      endDate: '2024-10-01',
      duration: '3 months',
      evaluationReport: 'Alice was able to handle complex financial reports and showed great attention to detail.'
    }
  }
];

const EvaluationReportPage = () => {
  const [report, setReport] = useState([]);
  const [expandedStudentIndex, setExpandedStudentIndex] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scadsidebar, setScad] = useState(false);
  const [facultyside, setFac] = useState(false);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const state = location.state?.type;
      setReport(evaluationsData);
      if (state === "scad") {
        setScad(true);
      } else if (state === "faculty") {
        setFac(true);
      }
      setLoading(false);
    }, 800);
  }, [location]);

  const handleStudentClick = (index) => {
    setExpandedStudentIndex(expandedStudentIndex === index ? null : index);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleDownloadReport = () => {
    if (downloading) return;
    
    setDownloading(true);
    
    // Create a link element
    const link = document.createElement('a');
    
    // Set the href to the PDF file in the public folder
    link.href = process.env.PUBLIC_URL ? `${process.env.PUBLIC_URL}/Report.pdf` : '/Report.pdf';
    
    // Set download attribute to suggest filename
    const studentName = report[expandedStudentIndex].student.name.replace(/\s+/g, '_').toLowerCase();
    link.download = `${studentName}_evaluation_report.pdf`;
    
    // Append to the document
    document.body.appendChild(link);
    
    // Trigger the download
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    
    // Reset downloading state after a short delay
    setTimeout(() => {
      setDownloading(false);
    }, 1000);
  };

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh',
      width: '100%',
      overflow: 'hidden',
      backgroundColor: '#f0f2f5',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    }}>
      {/* Sidebar */}
      {scadsidebar ? (
        <Sidebar menuOpen={menuOpen} toggleMenu={toggleMenu} />
      ) : facultyside ? (
        <SidebarFac menuOpen={menuOpen} toggleMenu={toggleMenu} />
      ) : null}

      {/* Main Content */}
      <div style={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <header style={{
          backgroundColor: '#ffffff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          padding: '0 24px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          zIndex: 10
        }}>
          {/* Menu Toggle */}
          <button 
            onClick={toggleMenu}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              transition: 'background-color 0.2s',
              marginRight: '16px'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <span style={{
              display: 'block',
              width: '18px',
              height: '2px',
              backgroundColor: '#333',
              marginBottom: '4px',
              transition: 'transform 0.2s, opacity 0.2s',
              transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none'
            }}></span>
            <span style={{
              display: 'block',
              width: '18px',
              height: '2px',
              backgroundColor: '#333',
              marginBottom: '4px',
              transition: 'opacity 0.2s',
              opacity: menuOpen ? 0 : 1
            }}></span>
            <span style={{
              display: 'block',
              width: '18px',
              height: '2px',
              backgroundColor: '#333',
              transition: 'transform 0.2s',
              transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none'
            }}></span>
          </button>

          {/* Page Title */}
          <h1 style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: 600,
            color: '#333'
          }}>
            Evaluation Reports
          </h1>

          {/* Spacer */}
          <div style={{ flex: 1 }}></div>

          {/* User Profile */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: facultyside ? '#6366f1' : '#8b5cf6',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: '14px'
            }}>
              {facultyside ? 'FP' : 'SA'}
            </div>
            <div>
              <div style={{
                fontSize: '14px',
                fontWeight: 500,
                color: '#333'
              }}>
                {facultyside ? 'Faculty Portal' : 'SCAD Admin'}
              </div>
              <div style={{
                fontSize: '12px',
                color: '#666'
              }}>
                {facultyside ? 'Mariam' : 'Administrator'}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main style={{
          flex: 1,
          overflow: 'auto',
          padding: '24px',
          position: 'relative'
        }}>
          {/* Loading State */}
          {loading && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255,255,255,0.8)',
              zIndex: 5
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  border: '3px solid #f3f3f3',
                  borderTop: '3px solid #6366f1',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  marginBottom: '12px'
                }}></div>
                <div style={{
                  color: '#666',
                  fontSize: '14px',
                  fontWeight: 500
                }}>
                  Loading reports...
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          {!loading && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              maxWidth: '1200px',
              margin: '0 auto'
            }}>
              {/* Page Header */}
              <div style={{
                backgroundColor: '#fff',
                borderRadius: '8px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <h2 style={{
                  margin: '0 0 8px 0',
                  fontSize: '20px',
                  fontWeight: 600,
                  color: '#111'
                }}>
                  Internship Evaluation Reports
                </h2>
                <p style={{
                  margin: 0,
                  color: '#666',
                  fontSize: '14px',
                  lineHeight: 1.5
                }}>
                  Review detailed evaluation reports for students who have completed internships. 
                  Select a student from the list below to view their complete evaluation details.
                </p>
              </div>

              {/* Student Selection */}
              <div style={{
                backgroundColor: '#fff',
                borderRadius: '8px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{
                  margin: '0 0 16px 0',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#111'
                }}>
                  Select a Student
                </h3>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  {report.map((data, index) => (
                    <button
                      key={index}
                      onClick={() => handleStudentClick(index)}
                      style={{
                        padding: '12px 20px',
                        backgroundColor: expandedStudentIndex === index ? '#6366f1' : '#fff',
                        color: expandedStudentIndex === index ? '#fff' : '#333',
                        border: `1px solid ${expandedStudentIndex === index ? '#6366f1' : '#e5e7eb'}`,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 500,
                        transition: 'all 0.2s',
                        boxShadow: expandedStudentIndex === index ? '0 2px 5px rgba(99, 102, 241, 0.2)' : 'none'
                      }}
                      onMouseOver={(e) => {
                        if (expandedStudentIndex !== index) {
                          e.target.style.backgroundColor = '#f9fafb';
                          e.target.style.borderColor = '#d1d5db';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (expandedStudentIndex !== index) {
                          e.target.style.backgroundColor = '#fff';
                          e.target.style.borderColor = '#e5e7eb';
                        }
                      }}
                    >
                      {data.student.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Student Report */}
              {expandedStudentIndex !== null && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '24px'
                }}>
                  {/* Student Information */}
                  <div style={{
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{
                      backgroundColor: '#6366f1',
                      padding: '16px 24px',
                      borderBottom: '1px solid #4f46e5'
                    }}>
                      <h3 style={{
                        margin: 0,
                        color: '#fff',
                        fontSize: '16px',
                        fontWeight: 600
                      }}>
                        Student Information
                      </h3>
                    </div>
                    <div style={{
                      padding: '24px'
                    }}>
                      <div style={{
                        marginBottom: '16px'
                      }}>
                        <div style={{
                          fontSize: '12px',
                          fontWeight: 500,
                          color: '#666',
                          marginBottom: '4px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          Name
                        </div>
                        <div style={{
                          fontSize: '16px',
                          color: '#333'
                        }}>
                          {report[expandedStudentIndex].student.name}
                        </div>
                      </div>
                      
                      <div style={{
                        marginBottom: '16px'
                      }}>
                        <div style={{
                          fontSize: '12px',
                          fontWeight: 500,
                          color: '#666',
                          marginBottom: '4px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          Email
                        </div>
                        <div style={{
                          fontSize: '16px',
                          color: '#333'
                        }}>
                          {report[expandedStudentIndex].student.email}
                        </div>
                      </div>
                      
                      <div style={{
                        marginBottom: '16px'
                      }}>
                        <div style={{
                          fontSize: '12px',
                          fontWeight: 500,
                          color: '#666',
                          marginBottom: '4px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          Major
                        </div>
                        <div style={{
                          fontSize: '16px',
                          color: '#333'
                        }}>
                          {report[expandedStudentIndex].student.major}
                        </div>
                      </div>
                      
                      <div style={{
                        marginBottom: '16px'
                      }}>
                        <div style={{
                          fontSize: '12px',
                          fontWeight: 500,
                          color: '#666',
                          marginBottom: '4px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          Recommendation
                        </div>
                        <div style={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          backgroundColor: report[expandedStudentIndex].student.recommended === 'Yes' ? '#dcfce7' : '#fee2e2',
                          color: report[expandedStudentIndex].student.recommended === 'Yes' ? '#166534' : '#991b1b',
                          borderRadius: '9999px',
                          fontSize: '14px',
                          fontWeight: 500
                        }}>
                          {report[expandedStudentIndex].student.recommended}
                        </div>
                      </div>
                      
                      <div>
                        <div style={{
                          fontSize: '12px',
                          fontWeight: 500,
                          color: '#666',
                          marginBottom: '4px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          Student Evaluation
                        </div>
                        <div style={{
                          fontSize: '14px',
                          color: '#333',
                          lineHeight: 1.6,
                          padding: '12px',
                          backgroundColor: '#f9fafb',
                          borderRadius: '6px',
                          border: '1px solid #e5e7eb'
                        }}>
                          {report[expandedStudentIndex].student.studenteval}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Company Information */}
                  <div style={{
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{
                      backgroundColor: '#8b5cf6',
                      padding: '16px 24px',
                      borderBottom: '1px solid #7c3aed'
                    }}>
                      <h3 style={{
                        margin: 0,
                        color: '#fff',
                        fontSize: '16px',
                        fontWeight: 600
                      }}>
                        Company Information
                      </h3>
                    </div>
                    <div style={{
                      padding: '24px'
                    }}>
                      <div style={{
                        marginBottom: '16px'
                      }}>
                        <div style={{
                          fontSize: '12px',
                          fontWeight: 500,
                          color: '#666',
                          marginBottom: '4px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          Company Name
                        </div>
                        <div style={{
                          fontSize: '16px',
                          color: '#333'
                        }}>
                          {report[expandedStudentIndex].company.name}
                        </div>
                      </div>
                      
                      <div style={{
                        marginBottom: '16px'
                      }}>
                        <div style={{
                          fontSize: '12px',
                          fontWeight: 500,
                          color: '#666',
                          marginBottom: '4px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          Main Supervisor
                        </div>
                        <div style={{
                          fontSize: '16px',
                          color: '#333'
                        }}>
                          {report[expandedStudentIndex].company.mainSupervisor}
                        </div>
                      </div>
                      
                      <div style={{
                        marginBottom: '16px'
                      }}>
                        <div style={{
                          fontSize: '12px',
                          fontWeight: 500,
                          color: '#666',
                          marginBottom: '4px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          Company Email
                        </div>
                        <div style={{
                          fontSize: '16px',
                          color: '#333'
                        }}>
                          {report[expandedStudentIndex].company.CompanyEmail}
                        </div>
                      </div>
                      
                      <div>
                        <div style={{
                          fontSize: '12px',
                          fontWeight: 500,
                          color: '#666',
                          marginBottom: '4px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          Company Evaluation
                        </div>
                        <div style={{
                          fontSize: '14px',
                          color: '#333',
                          lineHeight: 1.6,
                          padding: '12px',
                          backgroundColor: '#f9fafb',
                          borderRadius: '6px',
                          border: '1px solid #e5e7eb'
                        }}>
                          {report[expandedStudentIndex].internship.evaluationReport}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Internship Details */}
                  <div style={{
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{
                      backgroundColor: '#ec4899',
                      padding: '16px 24px',
                      borderBottom: '1px solid #db2777'
                    }}>
                      <h3 style={{
                        margin: 0,
                        color: '#fff',
                        fontSize: '16px',
                        fontWeight: 600
                      }}>
                        Internship Details
                      </h3>
                    </div>
                    <div style={{
                      padding: '24px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px 0',
                        borderBottom: '1px solid #e5e7eb'
                      }}>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: 500,
                          color: '#666'
                        }}>
                          Start Date
                        </div>
                        <div style={{
                          fontSize: '14px',
                          color: '#333',
                          fontWeight: 500
                        }}>
                          {new Date(report[expandedStudentIndex].internship.startDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                      
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px 0',
                        borderBottom: '1px solid #e5e7eb'
                      }}>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: 500,
                          color: '#666'
                        }}>
                          End Date
                        </div>
                        <div style={{
                          fontSize: '14px',
                          color: '#333',
                          fontWeight: 500
                        }}>
                          {new Date(report[expandedStudentIndex].internship.endDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                      
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px 0'
                      }}>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: 500,
                          color: '#666'
                        }}>
                          Duration
                        </div>
                        <div style={{
                          fontSize: '14px',
                          color: '#333',
                          fontWeight: 500
                        }}>
                          {report[expandedStudentIndex].internship.duration}
                        </div>
                      </div>
                      
                      <div style={{
                        marginTop: '24px',
                        display: 'flex',
                        justifyContent: 'center'
                      }}>
                        <button 
                          onClick={handleDownloadReport}
                          disabled={downloading}
                          style={{
                            padding: '10px 16px',
                            backgroundColor: downloading ? '#e5e7eb' : '#f3f4f6',
                            color: downloading ? '#9ca3af' : '#374151',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: 500,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: downloading ? 'default' : 'pointer',
                            transition: 'all 0.2s',
                            position: 'relative'
                          }}
                          onMouseOver={(e) => {
                            if (!downloading) e.target.style.backgroundColor = '#e5e7eb';
                          }}
                          onMouseOut={(e) => {
                            if (!downloading) e.target.style.backgroundColor = '#f3f4f6';
                          }}
                        >
                          {downloading ? (
                            <>
                              <span style={{
                                display: 'inline-block',
                                width: '16px',
                                height: '16px',
                                border: '2px solid rgba(156, 163, 175, 0.3)',
                                borderTop: '2px solid #9ca3af',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                              }}></span>
                              Downloading...
                            </>
                          ) : (
                            <>
                              <span style={{
                                fontSize: '18px'
                              }}>📄</span>
                              Download Full Report
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* No Selection State */}
              {expandedStudentIndex === null && !loading && report.length > 0 && (
                <div style={{
                  backgroundColor: '#fff',
                  borderRadius: '8px',
                  padding: '48px 24px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '48px',
                    marginBottom: '16px'
                  }}>
                    📋
                  </div>
                  <h3 style={{
                    margin: '0 0 8px 0',
                    fontSize: '18px',
                    fontWeight: 600,
                    color: '#111'
                  }}>
                    Select a Student
                  </h3>
                  <p style={{
                    margin: 0,
                    color: '#666',
                    fontSize: '14px',
                    maxWidth: '400px',
                    marginLeft: 'auto',
                    marginRight: 'auto'
                  }}>
                    Please select a student from the list above to view their complete evaluation report.
                  </p>
                </div>
              )}
              
              {/* No Data State */}
              {!loading && report.length === 0 && (
                <div style={{
                  backgroundColor: '#fff',
                  borderRadius: '8px',
                  padding: '48px 24px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '48px',
                    marginBottom: '16px'
                  }}>
                    🔍
                  </div>
                  <h3 style={{
                    margin: '0 0 8px 0',
                    fontSize: '18px',
                    fontWeight: 600,
                    color: '#111'
                  }}>
                    No Reports Found
                  </h3>
                  <p style={{
                    margin: 0,
                    color: '#666',
                    fontSize: '14px',
                    maxWidth: '400px',
                    marginLeft: 'auto',
                    marginRight: 'auto'
                  }}>
                    There are no evaluation reports available at this time. Please check back later.
                  </p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* CSS Animations */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default EvaluationReportPage;