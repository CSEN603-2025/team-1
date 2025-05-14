"use client"

import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"

function CompanyInterns() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")

  // Get data from location.state
  const { acceptedInterns: initialInterns = [], storedCompany } = location.state || {}
  const [interns, setInterns] = useState(
    initialInterns.map((intern) => ({ ...intern, status: intern.status || "current" })),
  )

  const [selectedInternForEvaluation, setSelectedInternForEvaluation] = useState(null)
  const [evaluation, setEvaluation] = useState("")
  const [selectedInternEmail, setSelectedInternEmail] = useState("")
  const [evaluationScore, setEvaluationScore] = useState(0)

  // Load interns from localStorage on component mount
  useEffect(() => {
    if (storedCompany?.companyEmail) {
      // Simulate loading data
      setTimeout(() => {
        const companyInternsKey = `companyInterns_${storedCompany.companyEmail}`
        const storedInterns = JSON.parse(localStorage.getItem(companyInternsKey)) || []
        setInterns(storedInterns.map((intern) => ({ ...intern, status: intern.status || "current" })))
        setIsLoading(false)
      }, 800)
    } else {
      setIsLoading(false)
    }
  }, [storedCompany])

  // Update intern status in both state and localStorage
  const updateInternStatus = (email, jobTitle) => {
    if (!storedCompany?.companyEmail) return

    const updatedInterns = interns.map((intern) => {
      if (intern.email === email && intern.jobTitle === jobTitle) {
        return { ...intern, status: "completed" }
      }
      return intern
    })

    setInterns(updatedInterns)

    const companyInternsKey = `companyInterns_${storedCompany.companyEmail}`
    localStorage.setItem(companyInternsKey, JSON.stringify(updatedInterns))

    // Show success toast
    setToastMessage(`${email} marked as completed`)
    setShowSuccessToast(true)
    setTimeout(() => setShowSuccessToast(false), 3000)
  }

  // Filter interns based on search term and status
  const filteredInterns = interns.filter((intern) => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch =
      intern.name?.toLowerCase().includes(searchLower) ||
      intern.email?.toLowerCase().includes(searchLower) ||
      intern.jobTitle?.toLowerCase().includes(searchLower)

    const matchesStatus = statusFilter === "all" || intern.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleSelectIntern = (email, jobTitle) => {
    const selectedIntern = interns.find((i) => i.email === email && i.jobTitle === jobTitle)
    setSelectedInternForEvaluation(selectedIntern)
    const evaluationKey = `evaluation_${email}_${jobTitle}`
    const storedEvaluation = localStorage.getItem(evaluationKey) || ""
    setEvaluation(storedEvaluation)

    // Get stored score or default to 0
    const scoreKey = `evaluationScore_${email}_${jobTitle}`
    const storedScore = localStorage.getItem(scoreKey) || "0"
    setEvaluationScore(Number.parseInt(storedScore, 10))
  }

  const handleCloseEvaluation = () => {
    setSelectedInternForEvaluation(null)
    setEvaluation("")
    setSelectedInternEmail("")
    setEvaluationScore(0)
  }

  const saveEvaluation = () => {
    if (selectedInternForEvaluation) {
      const evaluationKey = `evaluation_${selectedInternForEvaluation.email}_${selectedInternForEvaluation.jobTitle}`
      localStorage.setItem(evaluationKey, evaluation)

      // Save score
      const scoreKey = `evaluationScore_${selectedInternForEvaluation.email}_${selectedInternForEvaluation.jobTitle}`
      localStorage.setItem(scoreKey, evaluationScore.toString())

      // Show success toast
      setToastMessage(`Evaluation for ${selectedInternForEvaluation.name} saved`)
      setShowSuccessToast(true)
      setTimeout(() => setShowSuccessToast(false), 3000)

      handleCloseEvaluation()
    } else {
      alert("Please select an intern first.")
    }
  }

  const deleteEvaluation = () => {
    if (selectedInternForEvaluation) {
      const evaluationKey = `evaluation_${selectedInternForEvaluation.email}_${selectedInternForEvaluation.jobTitle}`
      localStorage.removeItem(evaluationKey)

      // Remove score
      const scoreKey = `evaluationScore_${selectedInternForEvaluation.email}_${selectedInternForEvaluation.jobTitle}`
      localStorage.removeItem(scoreKey)

      setEvaluation("")
      setEvaluationScore(0)

      // Show success toast
      setToastMessage(`Evaluation for ${selectedInternForEvaluation.name} deleted`)
      setShowSuccessToast(true)
      setTimeout(() => setShowSuccessToast(false), 3000)

      handleCloseEvaluation()
    } else {
      alert("No evaluation to delete!")
    }
  }

  // Calculate stats
  const totalInterns = interns.length
  const completedInterns = interns.filter((intern) => intern.status === "completed").length
  const currentInterns = interns.filter((intern) => intern.status === "current").length
  const completionRate = totalInterns > 0 ? Math.round((completedInterns / totalInterns) * 100) : 0
  
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
      {/* Success Toast */}
      {showSuccessToast && (
        <div
          style={{
            position: "fixed",
            top: "24px",
            right: "24px",
            backgroundColor: "white",
            borderLeft: "4px solid #4caf50",
            borderRadius: "4px",
            boxShadow: "0 5px 15px rgba(0,0,0,0.08)",
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            zIndex: 9999,
            animation: "slideIn 0.3s ease-out forwards",
          }}
        >
          <div
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              backgroundColor: "rgba(76, 175, 80, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: "12px",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#4caf50"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: "14px", fontWeight: "500", color: "#333" }}>Success</p>
            <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#666" }}>{toastMessage}</p>
          </div>
        </div>
      )}

      <div
        style={{
          maxWidth: "1200px",
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
              Intern Management
            </h1>
            <p
              style={{
                fontSize: "16px",
                color: "#5a6482",
                margin: "8px 0 0 0",
              }}
            >
              Manage and evaluate your company's interns
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
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

        {/* Main Content */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "16px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)",
            overflow: "hidden",
            border: "1px solid rgba(226, 232, 240, 0.8)",
          }}
        >
          {/* Header with Search and Filter */}
          <div
            style={{
              padding: "24px",
              borderBottom: "1px solid #f1f5f9",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#1a2b4b",
                }}
              >
                Interns
              </h2>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <div
                  style={{
                    padding: "6px 12px",
                    backgroundColor: statusFilter === "all" ? "#f1f5f9" : "transparent",
                    borderRadius: "16px",
                    fontSize: "14px",
                    fontWeight: statusFilter === "all" ? "500" : "400",
                    color: statusFilter === "all" ? "#1a2b4b" : "#5a6482",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onClick={() => setStatusFilter("all")}
                >
                  All
                </div>
                <div
                  style={{
                    padding: "6px 12px",
                    backgroundColor: statusFilter === "current" ? "rgba(59, 130, 246, 0.1)" : "transparent",
                    borderRadius: "16px",
                    fontSize: "14px",
                    fontWeight: statusFilter === "current" ? "500" : "400",
                    color: statusFilter === "current" ? "#3b82f6" : "#5a6482",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onClick={() => setStatusFilter("current")}
                >
                  Current
                </div>
                <div
                  style={{
                    padding: "6px 12px",
                    backgroundColor: statusFilter === "completed" ? "rgba(34, 197, 94, 0.1)" : "transparent",
                    borderRadius: "16px",
                    fontSize: "14px",
                    fontWeight: statusFilter === "completed" ? "500" : "400",
                    color: statusFilter === "completed" ? "#22c55e" : "#5a6482",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onClick={() => setStatusFilter("completed")}
                >
                  Completed
                </div>
              </div>
            </div>
            <div
              style={{
                position: "relative",
              }}
            >
              <svg
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "16px",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                }}
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#94a3b8"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder="Search by name, email, or job title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px 12px 44px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  fontSize: "14px",
                  backgroundColor: "#f8fafc",
                  outline: "none",
                  transition: "all 0.2s ease",
                }}
              />
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div
              style={{
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
                Loading interns...
              </p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredInterns.length === 0 && (
            <div
              style={{
                padding: "64px 24px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  backgroundColor: "#f1f5f9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "16px",
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
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
              <h3
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#1a2b4b",
                }}
              >
                No interns found
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: "14px",
                  color: "#5a6482",
                  maxWidth: "400px",
                }}
              >
                {searchTerm
                  ? `No interns match your search "${searchTerm}". Try a different search term.`
                  : `No ${statusFilter !== "all" ? statusFilter : ""} interns found. Adjust your filters to see more results.`}
              </p>
            </div>
          )}

          {/* Intern List */}
          {!isLoading && filteredInterns.length > 0 && (
            <div>
              <div
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#f8fafc",
                  borderBottom: "1px solid #f1f5f9",
                  display: "grid",
                  gridTemplateColumns: "3fr 2fr 1fr 1fr",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Intern
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Job Details
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Status
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Actions
                </div>
              </div>

              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  maxHeight: "600px",
                  overflowY: "auto",
                }}
              >
                {filteredInterns.map((intern, index) => (
                  <li
                    key={`${intern.email}-${intern.jobTitle}`}
                    style={{
                      borderBottom: index < filteredInterns.length - 1 ? "1px solid #f1f5f9" : "none",
                      transition: "background-color 0.2s ease",
                      ":hover": {
                        backgroundColor: "#f8fafc",
                      },
                    }}
                  >
                    <div
                      style={{
                        padding: "16px 24px",
                        display: "grid",
                        gridTemplateColumns: "3fr 2fr 1fr 1fr",
                        gap: "16px",
                        alignItems: "center",
                      }}
                    >
                      {/* Intern Info */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            backgroundColor: "#f1f5f9",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginRight: "12px",
                            fontSize: "16px",
                            fontWeight: "500",
                            color: "#64748b",
                          }}
                        >
                          {intern.name ? intern.name.charAt(0).toUpperCase() : "N"}
                        </div>
                        <div>
                          <h3
                            style={{
                              margin: "0 0 4px 0",
                              fontSize: "15px",
                              fontWeight: "500",
                              color: "#1a2b4b",
                            }}
                          >
                            {intern.name || "No Name Provided"}
                          </h3>
                          <p
                            style={{
                              margin: 0,
                              fontSize: "13px",
                              color: "#64748b",
                            }}
                          >
                            {intern.email || "N/A"}
                          </p>
                        </div>
                      </div>

                      {/* Job Details */}
                      <div>
                        <p
                          style={{
                            margin: "0 0 4px 0",
                            fontSize: "14px",
                            fontWeight: "500",
                            color: "#1a2b4b",
                          }}
                        >
                          {intern.jobTitle || "N/A"}
                        </p>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "13px",
                            color: "#64748b",
                          }}
                        >
                          Duration: {intern.jobDuration || "N/A"}
                        </p>
                      </div>

                      {/* Status */}
                      <div>
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "4px 8px",
                            borderRadius: "16px",
                            backgroundColor:
                              intern.status === "completed" ? "rgba(34, 197, 94, 0.1)" : "rgba(59, 130, 246, 0.1)",
                            color: intern.status === "completed" ? "#22c55e" : "#3b82f6",
                            fontSize: "13px",
                            fontWeight: "500",
                          }}
                        >
                          <span
                            style={{
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              backgroundColor: intern.status === "completed" ? "#22c55e" : "#3b82f6",
                              marginRight: "6px",
                            }}
                          ></span>
                          {intern.status === "completed" ? "Completed" : "Current"}
                        </div>
                      </div>

                      {/* Actions */}
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                        }}
                      >
                        {intern.status === "completed" ? (
                          <button
                            onClick={() => {
                              setSelectedInternEmail(`${intern.email}__${intern.jobTitle}`)
                              handleSelectIntern(intern.email, intern.jobTitle)
                            }}
                            style={{
                              padding: "8px 12px",
                              backgroundColor: "white",
                              border: "1px solid #e2e8f0",
                              borderRadius: "6px",
                              fontSize: "13px",
                              fontWeight: "500",
                              color: "#5a6482",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              transition: "all 0.2s ease",
                            }}
                          >
                            <svg
                              width="14"
                              height="14"
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
                            Evaluate
                          </button>
                        ) : (
                          <button
                            onClick={() => updateInternStatus(intern.email, intern.jobTitle)}
                            style={{
                              padding: "8px 12px",
                              backgroundColor: "#22c55e",
                              border: "none",
                              borderRadius: "6px",
                              fontSize: "13px",
                              fontWeight: "500",
                              color: "white",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              transition: "all 0.2s ease",
                              boxShadow: "0 2px 4px rgba(34, 197, 94, 0.2)",
                            }}
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                              <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                            Complete
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Evaluation Section */}
        <div
          style={{
            marginTop: "32px",
            backgroundColor: "white",
            borderRadius: "16px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)",
            overflow: "hidden",
            border: "1px solid rgba(226, 232, 240, 0.8)",
          }}
        >
          <div
            style={{
              padding: "24px",
              borderBottom: "1px solid #f1f5f9",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
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
                  marginRight: "12px",
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
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <div>
                <h2
                  style={{
                    margin: "0 0 4px 0",
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#1a2b4b",
                  }}
                >
                  Intern Evaluations
                </h2>
                <p
                  style={{
                    margin: 0,
                    fontSize: "14px",
                    color: "#5a6482",
                  }}
                >
                  Evaluate and rate your completed interns
                </p>
              </div>
            </div>

            <div
              style={{
                backgroundColor: "#f8fafc",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "16px",
              }}
            >
              <p
                style={{
                  margin: "0 0 12px 0",
                  fontSize: "14px",
                  color: "#5a6482",
                }}
              >
                Select a completed intern to write or view their evaluation.
              </p>

              <select
                value={selectedInternEmail}
                onChange={(e) => {
                  const [email, jobTitle] = e.target.value.split("__")
                  setSelectedInternEmail(e.target.value)
                  handleSelectIntern(email, jobTitle)
                }}
                style={{
                  width: "100%",
                  maxWidth: "400px",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  fontSize: "14px",
                  backgroundColor: "white",
                  cursor: "pointer",
                  appearance: "none",
                  backgroundImage:
                    'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%2364748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>\')',
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 12px center",
                  backgroundSize: "16px",
                  outline: "none",
                }}
              >
                <option value="">Select Intern for Evaluation</option>
                {interns
                  .filter((intern) => intern.status === "completed")
                  .map((intern) => (
                    <option key={`${intern.email}__${intern.jobTitle}`} value={`${intern.email}__${intern.jobTitle}`}>
                      {intern.name} - {intern.jobTitle}
                    </option>
                  ))}
              </select>
            </div>

            {/* Completed Evaluations Summary */}
            <div>
              <h3
                style={{
                  margin: "0 0 16px 0",
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#1a2b4b",
                }}
              >
                Completed Evaluations
              </h3>

              {interns.filter((intern) => intern.status === "completed").length === 0 ? (
                <div
                  style={{
                    padding: "24px",
                    backgroundColor: "#f8fafc",
                    borderRadius: "8px",
                    textAlign: "center",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: "14px",
                      color: "#5a6482",
                    }}
                  >
                    No completed internships yet.
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                    gap: "16px",
                  }}
                >
                  {interns
                    .filter((intern) => intern.status === "completed")
                    .map((intern) => {
                      const evaluationKey = `evaluation_${intern.email}_${intern.jobTitle}`
                      const hasEvaluation = localStorage.getItem(evaluationKey)
                      const scoreKey = `evaluationScore_${intern.email}_${intern.jobTitle}`
                      const score = Number.parseInt(localStorage.getItem(scoreKey) || "0", 10)

                      return (
                        <div
                          key={`${intern.email}-${intern.jobTitle}-summary`}
                          style={{
                            padding: "16px",
                            backgroundColor: "#f8fafc",
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                          }}
                          onClick={() => {
                            setSelectedInternEmail(`${intern.email}__${intern.jobTitle}`)
                            handleSelectIntern(intern.email, intern.jobTitle)
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              marginBottom: "12px",
                            }}
                          >
                            <div
                              style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "50%",
                                backgroundColor: "#f1f5f9",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                marginRight: "12px",
                                fontSize: "14px",
                                fontWeight: "500",
                                color: "#64748b",
                              }}
                            >
                              {intern.name ? intern.name.charAt(0).toUpperCase() : "N"}
                            </div>
                            <div>
                              <h4
                                style={{
                                  margin: "0 0 2px 0",
                                  fontSize: "14px",
                                  fontWeight: "500",
                                  color: "#1a2b4b",
                                }}
                              >
                                {intern.name}
                              </h4>
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: "12px",
                                  color: "#64748b",
                                }}
                              >
                                {intern.jobTitle}
                              </p>
                            </div>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <div
                              style={{
                                fontSize: "12px",
                                color: "#64748b",
                              }}
                            >
                              {hasEvaluation ? "Evaluation completed" : "No evaluation yet"}
                            </div>
                            {hasEvaluation && (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <svg
                                    key={star}
                                    width="12"
                                    height="12"
                                    viewBox="0 0 24 24"
                                    fill={star <= score ? "#f59e0b" : "none"}
                                    stroke={star <= score ? "#f59e0b" : "#cbd5e1"}
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                  </svg>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Stats Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "16px",
            marginTop: "32px",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)",
              display: "flex",
              flexDirection: "column",
              border: "1px solid rgba(226, 232, 240, 0.8)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(59, 130, 246, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: "12px",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
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
                Total Interns
              </h3>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
              }}
            >
              <span
                style={{
                  fontSize: "32px",
                  fontWeight: "700",
                  color: "#1a2b4b",
                  letterSpacing: "-0.025em",
                }}
              >
                {totalInterns}
              </span>
              <span
                style={{
                  marginLeft: "8px",
                  fontSize: "14px",
                  color: "#5a6482",
                }}
              >
                interns
              </span>
            </div>
          </div>

          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)",
              display: "flex",
              flexDirection: "column",
              border: "1px solid rgba(226, 232, 240, 0.8)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(79, 70, 229, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: "12px",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
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
                Current Interns
              </h3>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
              }}
            >
              <span
                style={{
                  fontSize: "32px",
                  fontWeight: "700",
                  color: "#1a2b4b",
                  letterSpacing: "-0.025em",
                }}
              >
                {currentInterns}
              </span>
              <span
                style={{
                  marginLeft: "8px",
                  fontSize: "14px",
                  color: "#5a6482",
                }}
              >
                active
              </span>
            </div>
          </div>

          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)",
              display: "flex",
              flexDirection: "column",
              border: "1px solid rgba(226, 232, 240, 0.8)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
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
                  marginRight: "12px",
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
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
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
                Completion Rate
              </h3>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                }}
              >
                <span
                  style={{
                    fontSize: "32px",
                    fontWeight: "700",
                    color: "#1a2b4b",
                    letterSpacing: "-0.025em",
                  }}
                >
                  {completionRate}%
                </span>
                <span
                  style={{
                    marginLeft: "8px",
                    fontSize: "14px",
                    color: "#5a6482",
                  }}
                >
                  {completedInterns} completed
                </span>
              </div>
              <div
                style={{
                  width: "100%",
                  height: "8px",
                  backgroundColor: "#f1f5f9",
                  borderRadius: "4px",
                  marginTop: "12px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${completionRate}%`,
                    height: "100%",
                    backgroundColor: "#22c55e",
                    borderRadius: "4px",
                    transition: "width 1s ease-in-out",
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Evaluation Popup */}
      {selectedInternForEvaluation && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "white",
            borderRadius: "16px",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            zIndex: 1000,
            width: "90%",
            maxWidth: "700px",
            maxHeight: "90vh",
            overflow: "auto",
            border: "1px solid #e2e8f0",
          }}
        >
          <div
            style={{
              padding: "24px",
              borderBottom: "1px solid #f1f5f9",
              position: "sticky",
              top: 0,
              backgroundColor: "white",
              zIndex: 1,
              borderTopLeftRadius: "16px",
              borderTopRightRadius: "16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: "#f1f5f9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: "12px",
                  fontSize: "16px",
                  fontWeight: "500",
                  color: "#64748b",
                }}
              >
                {selectedInternForEvaluation.name ? selectedInternForEvaluation.name.charAt(0).toUpperCase() : "N"}
              </div>
              <div>
                <h3
                  style={{
                    margin: "0 0 4px 0",
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#1a2b4b",
                  }}
                >
                  {selectedInternForEvaluation.name}
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: "14px",
                    color: "#64748b",
                  }}
                >
                  {selectedInternForEvaluation.jobTitle}
                </p>
              </div>
            </div>
            <button
              onClick={handleCloseEvaluation}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                backgroundColor: "#f1f5f9",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#64748b"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div
            style={{
              padding: "24px",
            }}
          >
            <div
              style={{
                marginBottom: "24px",
              }}
            >
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#1a2b4b",
                }}
              >
                Performance Rating
              </label>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setEvaluationScore(star)}
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "8px",
                      backgroundColor: star <= evaluationScore ? "rgba(245, 158, 11, 0.1)" : "#f8fafc",
                      border: "1px solid",
                      borderColor: star <= evaluationScore ? "#f59e0b" : "#e2e8f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill={star <= evaluationScore ? "#f59e0b" : "none"}
                      stroke={star <= evaluationScore ? "#f59e0b" : "#94a3b8"}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                  </button>
                ))}
                <span
                  style={{
                    marginLeft: "8px",
                    fontSize: "14px",
                    color: "#64748b",
                  }}
                >
                  {evaluationScore === 0
                    ? "Not rated"
                    : evaluationScore === 1
                      ? "Poor"
                      : evaluationScore === 2
                        ? "Fair"
                        : evaluationScore === 3
                          ? "Good"
                          : evaluationScore === 4
                            ? "Very Good"
                            : "Excellent"}
                </span>
              </div>
            </div>

            <div
              style={{
                marginBottom: "24px",
              }}
            >
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#1a2b4b",
                }}
              >
                Evaluation Notes
              </label>
              <textarea
                value={evaluation}
                onChange={(e) => setEvaluation(e.target.value)}
                placeholder="Write your evaluation here..."
                style={{
                  width: "100%",
                  padding: "16px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  fontSize: "14px",
                  minHeight: "200px",
                  boxSizing: "border-box",
                  backgroundColor: "#f8fafc",
                  outline: "none",
                  transition: "all 0.2s ease",
                  lineHeight: "1.5",
                  resize: "vertical",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
              }}
            >
              <button
                onClick={deleteEvaluation}
                style={{
                  padding: "10px 16px",
                  backgroundColor: "white",
                  color: "#ef4444",
                  border: "1px solid #fecaca",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
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
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
                Delete Evaluation
              </button>
              <button
                onClick={saveEvaluation}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#8b5cf6",
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
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
                Save Evaluation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay for the popup */}
      {selectedInternForEvaluation && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(15, 23, 42, 0.5)",
            backdropFilter: "blur(4px)",
            zIndex: 999,
          }}
          onClick={handleCloseEvaluation}
        ></div>
      )}

      {/* CSS Animations */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
                    @keyframes slideIn {
                        from {
                            transform: translateX(100%);
                            opacity: 0;
                        }
                        to {
                            transform: translateX(0);
                            opacity: 1;
                        }
                    }
                    
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

export default CompanyInterns
