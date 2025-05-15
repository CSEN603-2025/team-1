"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"

function CompanyProfile() {
  const [company, setCompany] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Simulate loading for a smoother experience
    const loadData = async () => {
      setIsLoading(true)
      const storedCompany = location.state?.company || JSON.parse(localStorage.getItem("currentCompany"))

      // Artificial delay for loading state demonstration
      await new Promise((resolve) => setTimeout(resolve, 800))

      if (storedCompany) {
        setCompany(storedCompany)
      } else {
        navigate("/company-login")
      }
      setIsLoading(false)
    }

    loadData()
  }, [location, navigate])

  const downloadDocument = () => {
    if (company?.document?.dataUrl) {
      const link = document.createElement("a")
      link.href = company.document.dataUrl
      link.download = company.document.name || "company_document"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleBack = () => {
    navigate(-1) // Go back to previous page
  }

  return (
    <div
      style={{
        backgroundColor: "#f8faff",
        minHeight: "100vh",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        color: "#1a2b4b",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "1000px",
          width: "100%",
          margin: "0 auto",
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "32px",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "28px",
                fontWeight: "700",
                color: "#1a2b4b",
                margin: 0,
                letterSpacing: "-0.02em",
              }}
            >
              Company Profile
            </h1>
            <p
              style={{
                fontSize: "16px",
                color: "#5a6482",
                margin: "8px 0 0 0",
              }}
            >
              View and manage your company information
            </p>
          </div>
          <button
            onClick={handleBack}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 16px",
              backgroundColor: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "500",
              color: "#5a6482",
              cursor: "pointer",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              transition: "all 0.2s ease",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
        </header>

        {isLoading ? (
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "16px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)",
              overflow: "hidden",
              border: "1px solid rgba(226, 232, 240, 0.8)",
              padding: "64px 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                border: "3px solid #f1f5f9",
                borderTopColor: "#6366f1",
                animation: "spin 1s linear infinite",
                marginBottom: "16px",
              }}
            ></div>
            <p
              style={{
                margin: 0,
                fontSize: "14px",
                color: "#5a6482",
              }}
            >
              Loading company profile...
            </p>
          </div>
        ) : (
          <>
            {/* Company Overview Card */}
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "16px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)",
                overflow: "hidden",
                border: "1px solid rgba(226, 232, 240, 0.8)",
                marginBottom: "32px",
              }}
            >
              <div
                style={{
                  padding: "32px",
                  display: "flex",
                  alignItems: "center",
                  gap: "24px",
                  borderBottom: "1px solid #f1f5f9",
                }}
              >
                {company.companyLogo ? (
                  <div
                    style={{
                      width: "96px",
                      height: "96px",
                      borderRadius: "16px",
                      overflow: "hidden",
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <img
                      src={company.companyLogo || "/placeholder.svg"}
                      alt={`${company.companyName} logo`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      width: "96px",
                      height: "96px",
                      borderRadius: "16px",
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#94a3b8",
                      fontSize: "32px",
                      fontWeight: "600",
                    }}
                  >
                    {company.companyName ? company.companyName.charAt(0).toUpperCase() : "C"}
                  </div>
                )}

                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                    }}
                  >
                    <h2
                      style={{
                        margin: 0,
                        fontSize: "24px",
                        fontWeight: "600",
                        color: "#1a2b4b",
                      }}
                    >
                      {company.companyName}
                    </h2>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "4px 12px",
                        borderRadius: "16px",
                        backgroundColor: company.isAccepted ? "rgba(34, 197, 94, 0.1)" : "rgba(245, 158, 11, 0.1)",
                        color: company.isAccepted ? "#22c55e" : "#f59e0b",
                        fontSize: "13px",
                        fontWeight: "500",
                      }}
                    >
                      <span
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          backgroundColor: company.isAccepted ? "#22c55e" : "#f59e0b",
                          marginRight: "6px",
                        }}
                      ></span>
                      {company.isAccepted ? "Verified" : "Pending Approval"}
                    </div>
                  </div>
                  <p
                    style={{
                      margin: "0 0 8px 0",
                      fontSize: "15px",
                      color: "#5a6482",
                    }}
                  >
                    {company.companyEmail}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      gap: "16px",
                    }}
                  >
                    {company.industry && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "14px",
                          color: "#64748b",
                        }}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                        </svg>
                        {company.industry}
                      </div>
                    )}
                    {company.companySize && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "14px",
                          color: "#64748b",
                        }}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        {company.companySize} employees
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Company Details */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "24px",
                marginBottom: "32px",
              }}
            >
              {/* Basic Information */}
              <div
                style={{
                  backgroundColor: "white",
                  borderRadius: "16px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)",
                  overflow: "hidden",
                  border: "1px solid rgba(226, 232, 240, 0.8)",
                }}
              >
                <div
                  style={{
                    padding: "16px 24px",
                    borderBottom: "1px solid #f1f5f9",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      backgroundColor: "rgba(59, 130, 246, 0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                  </div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#1a2b4b",
                    }}
                  >
                    Basic Information
                  </h3>
                </div>
                <div style={{ padding: "24px" }}>
                  <div
                    style={{
                      display: "grid",
                      gap: "16px",
                    }}
                  >
                    <div>
                      <p
                        style={{
                          margin: "0 0 4px 0",
                          fontSize: "13px",
                          fontWeight: "500",
                          color: "#64748b",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        Email Address
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "15px",
                          color: "#1a2b4b",
                        }}
                      >
                        {company.companyEmail}
                      </p>
                    </div>
                    <div>
                      <p
                        style={{
                          margin: "0 0 4px 0",
                          fontSize: "13px",
                          fontWeight: "500",
                          color: "#64748b",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        Industry
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "15px",
                          color: "#1a2b4b",
                        }}
                      >
                        {company.industry || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p
                        style={{
                          margin: "0 0 4px 0",
                          fontSize: "13px",
                          fontWeight: "500",
                          color: "#64748b",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        Company Size
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "15px",
                          color: "#1a2b4b",
                        }}
                      >
                        {company.companySize || "Not specified"}
                      </p>
                    </div>
                    {company.location && (
                      <div>
                        <p
                          style={{
                            margin: "0 0 4px 0",
                            fontSize: "13px",
                            fontWeight: "500",
                            color: "#64748b",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          }}
                        >
                          Location
                        </p>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "15px",
                            color: "#1a2b4b",
                          }}
                        >
                          {company.location}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div
                style={{
                  backgroundColor: "white",
                  borderRadius: "16px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)",
                  overflow: "hidden",
                  border: "1px solid rgba(226, 232, 240, 0.8)",
                }}
              >
                <div
                  style={{
                    padding: "16px 24px",
                    borderBottom: "1px solid #f1f5f9",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      backgroundColor: "rgba(139, 92, 246, 0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#8b5cf6"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                  </div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#1a2b4b",
                    }}
                  >
                    Documents
                  </h3>
                </div>
                <div style={{ padding: "24px" }}>
                  {company.document ? (
                    <div
                      style={{
                        backgroundColor: "#f8fafc",
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        padding: "16px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          marginBottom: "16px",
                        }}
                      >
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "8px",
                            backgroundColor: "rgba(139, 92, 246, 0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#8b5cf6"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                          </svg>
                        </div>
                        <div>
                          <p
                            style={{
                              margin: "0 0 4px 0",
                              fontSize: "15px",
                              fontWeight: "500",
                              color: "#1a2b4b",
                            }}
                          >
                            {company.document.name || "Company Document"}
                          </p>
                          <p
                            style={{
                              margin: 0,
                              fontSize: "13px",
                              color: "#64748b",
                            }}
                          >
                            {company.document.type || "Document"}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={downloadDocument}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                          width: "100%",
                          padding: "10px",
                          backgroundColor: "#8b5cf6",
                          color: "white",
                          border: "none",
                          borderRadius: "8px",
                          fontSize: "14px",
                          fontWeight: "500",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          boxShadow: "0 2px 4px rgba(139, 92, 246, 0.2)",
                        }}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="7 10 12 15 17 10"></polyline>
                          <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        Download Document
                      </button>
                    </div>
                  ) : (
                    <div
                      style={{
                        backgroundColor: "#f8fafc",
                        borderRadius: "8px",
                        border: "1px dashed #e2e8f0",
                        padding: "24px",
                        textAlign: "center",
                      }}
                    >
                      <div
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "50%",
                          backgroundColor: "#f1f5f9",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto 16px",
                        }}
                      >
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#94a3b8"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                          <line x1="12" y1="18" x2="12" y2="12"></line>
                          <line x1="9" y1="15" x2="15" y2="15"></line>
                        </svg>
                      </div>
                      <p
                        style={{
                          margin: "0 0 8px 0",
                          fontSize: "15px",
                          fontWeight: "500",
                          color: "#1a2b4b",
                        }}
                      >
                        No documents uploaded
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "14px",
                          color: "#64748b",
                        }}
                      >
                        Upload company documents for verification
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "16px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)",
                overflow: "hidden",
                border: "1px solid rgba(226, 232, 240, 0.8)",
                padding: "24px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "16px",
                }}
              >
                <button
                  style={{
                    padding: "10px 16px",
                    backgroundColor: "white",
                    color: "#5a6482",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    transition: "all 0.2s ease",
                  }}
                  onClick={handleBack}
                >
                  Cancel
                </button>
                <button
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#3b82f6",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    transition: "all 0.2s ease",
                    boxShadow: "0 2px 4px rgba(59, 130, 246, 0.2)",
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  Edit Profile
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* CSS Animations */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes spin {
              0% {
                transform: rotate(0deg);
              }
              100% {
                transform: rotate(360deg);
              }
            }
          `,
        }}
      />
    </div>
  )
}

export default CompanyProfile
