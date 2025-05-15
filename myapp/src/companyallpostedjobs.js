"use client"

import { useState, useEffect } from "react"

function AllJobsPosted() {
  const [jobs, setJobs] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [industryFilter, setIndustryFilter] = useState("")
  const [durationFilter, setDurationFilter] = useState("")
  const [paidFilter, setPaidFilter] = useState("")
  const [filteredJobs, setFilteredJobs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState("grid") // "grid" or "table"
  const [selectedJob, setSelectedJob] = useState(null)
  const [showModal, setShowModal] = useState(false)

  // Purple color palette
  const colors = {
    purple: {
      50: "#f5f3ff",
      100: "#ede9fe",
      200: "#ddd6fe",
      300: "#c4b5fd",
      400: "#a78bfa",
      500: "#8b5cf6",
      600: "#7c3aed",
      700: "#6d28d9",
      800: "#5b21b6",
      900: "#4c1d95",
    },
    slate: {
      50: "#f8faff",
      100: "#f1f5f9",
      200: "#e2e8f0",
      300: "#cbd5e1",
      400: "#94a3b8",
      500: "#64748b",
      600: "#475569",
      700: "#334155",
      800: "#1e293b",
      900: "#0f172a",
    },
  }

  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true)
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 800))

      const allJobsString = localStorage.getItem("allJobs")
      if (allJobsString) {
        setJobs(JSON.parse(allJobsString))
      } else {
        setJobs([])
      }
      setIsLoading(false)
    }

    fetchJobs()
  }, [])

  useEffect(() => {
    let results = jobs

    // Search filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase()
      results = results.filter(
        (job) =>
          job.title.toLowerCase().includes(lowerSearchTerm) ||
          job.companyName.toLowerCase().includes(lowerSearchTerm) ||
          (job.skills && job.skills.toLowerCase().includes(lowerSearchTerm)) ||
          (job.description && job.description.toLowerCase().includes(lowerSearchTerm)),
      )
    }

    // Industry filter
    if (industryFilter) {
      results = results.filter((job) => job.industry && job.industry.toLowerCase() === industryFilter.toLowerCase())
    }

    // Duration filter
    if (durationFilter) {
      results = results.filter(
        (job) => job.duration && job.duration.toLowerCase().includes(durationFilter.toLowerCase()),
      )
    }

    // Paid filter
    if (paidFilter === "paid") {
      results = results.filter((job) => job.isPaid)
    } else if (paidFilter === "unpaid") {
      results = results.filter((job) => !job.isPaid)
    }

    setFilteredJobs(results)
  }, [jobs, searchTerm, industryFilter, durationFilter, paidFilter])

  const handleViewDetails = (jobId) => {
    const job = jobs.find((j) => j.id === jobId)
    if (job) {
      setSelectedJob(job)
      setShowModal(true)
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedJob(null)
  }

  // Handle click outside modal to close it
  const handleModalBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal()
    }
  }

  const handleGoBack = () => {
    window.history.back()
  }

  return (
    <div
      style={{
        backgroundColor: colors.slate[50],
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
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "8px" }}>
              <button
                onClick={handleGoBack}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "36px",
                  height: "36px",
                  backgroundColor: "white",
                  color: colors.purple[600],
                  border: `1px solid ${colors.purple[200]}`,
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
              <h1
                style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  color: "#c9B7EBD",
                  margin: 0,
                  letterSpacing: "-0.02em",
                }}
              >
                Available Internships
              </h1>
            </div>
            <p
              style={{
                fontSize: "16px",
                color: colors.slate[600],
                margin: "8px 0 0 0",
              }}
            >
              Find and apply for internship opportunities
            </p>
          </div>
          <div
            style={{
              display: "flex",
              gap: "8px",
            }}
          >
            <button
              onClick={() => setViewMode("grid")}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "40px",
                height: "40px",
                backgroundColor: viewMode === "grid" ? colors.purple[600] : "white",
                color: viewMode === "grid" ? "white" : colors.slate[500],
                border: "1px solid",
                borderColor: viewMode === "grid" ? colors.purple[600] : colors.slate[200],
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
            </button>
            <button
              onClick={() => setViewMode("table")}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "40px",
                height: "40px",
                backgroundColor: viewMode === "table" ? colors.purple[600] : "white",
                color: viewMode === "table" ? "white" : colors.slate[500],
                border: "1px solid",
                borderColor: viewMode === "table" ? colors.purple[600] : colors.slate[200],
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
            </button>
          </div>
        </header>

        {/* Filter Section */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "16px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)",
            overflow: "hidden",
            border: `1px solid ${colors.slate[200]}`,
            marginBottom: "24px",
            padding: "24px",
          }}
        >
          <div
            style={{
              position: "relative",
              marginBottom: "16px",
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
              stroke={colors.slate[400]}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder="Search by job title, company, skills, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px 12px 44px",
                borderRadius: "8px",
                border: `1px solid ${colors.slate[200]}`,
                fontSize: "14px",
                backgroundColor: colors.slate[50],
                outline: "none",
                transition: "all 0.2s ease",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "16px",
              alignItems: "center",
            }}
          >
            <div
              style={{
                flex: "1 1 200px",
              }}
            >
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: colors.slate[600],
                }}
              >
                Industry
              </label>
              <select
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  border: `1px solid ${colors.slate[200]}`,
                  fontSize: "14px",
                  backgroundColor: colors.slate[50],
                  outline: "none",
                  transition: "all 0.2s ease",
                  appearance: "none",
                  backgroundImage:
                    'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%2364748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>\')',
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 12px center",
                  backgroundSize: "16px",
                }}
              >
                <option value="">All Industries</option>
                {Array.from(new Set(jobs.map((job) => job.industry).filter(Boolean))).map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
            </div>

            <div
              style={{
                flex: "1 1 200px",
              }}
            >
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: colors.slate[600],
                }}
              >
                Duration
              </label>
              <select
                value={durationFilter}
                onChange={(e) => setDurationFilter(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  border: `1px solid ${colors.slate[200]}`,
                  fontSize: "14px",
                  backgroundColor: colors.slate[50],
                  outline: "none",
                  transition: "all 0.2s ease",
                  appearance: "none",
                  backgroundImage:
                    'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%2364748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>\')',
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 12px center",
                  backgroundSize: "16px",
                }}
              >
                <option value="">Any Duration</option>
                <option value="1 month">1 Month</option>
                <option value="2 months">2 Months</option>
                <option value="3 months">3 Months</option>
              </select>
            </div>

            <div
              style={{
                flex: "1 1 200px",
              }}
            >
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: colors.slate[600],
                }}
              >
                Compensation
              </label>
              <select
                value={paidFilter}
                onChange={(e) => setPaidFilter(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  border: `1px solid ${colors.slate[200]}`,
                  fontSize: "14px",
                  backgroundColor: colors.slate[50],
                  outline: "none",
                  transition: "all 0.2s ease",
                  appearance: "none",
                  backgroundImage:
                    'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%2364748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>\')',
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 12px center",
                  backgroundSize: "16px",
                }}
              >
                <option value="">All</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "16px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)",
              overflow: "hidden",
              border: `1px solid ${colors.slate[200]}`,
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
                border: `3px solid ${colors.slate[200]}`,
                borderTopColor: colors.purple[600],
                animation: "spin 1s linear infinite",
                marginBottom: "16px",
              }}
            ></div>
            <p
              style={{
                margin: 0,
                fontSize: "14px",
                color: colors.slate[600],
              }}
            >
              Loading internships...
            </p>
          </div>
        ) : (
          <>
            {/* Grid View */}
            {viewMode === "grid" && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
                  gap: "24px",
                }}
              >
                {filteredJobs.length > 0 ? (
                  filteredJobs.map((job) => (
                    <div
                      key={job.id}
                      style={{
                        backgroundColor: "white",
                        borderRadius: "16px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)",
                        overflow: "hidden",
                        border: `1px solid ${colors.slate[200]}`,
                        transition: "transform 0.2s ease, box-shadow 0.2s ease",
                        ":hover": {
                          transform: "translateY(-4px)",
                          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                        },
                      }}
                    >
                      <div
                        style={{
                          padding: "24px",
                          borderBottom: `1px solid ${colors.slate[100]}`,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "16px",
                            marginBottom: "16px",
                          }}
                        >
                          <div
                            style={{
                              width: "48px",
                              height: "48px",
                              borderRadius: "8px",
                              overflow: "hidden",
                              backgroundColor: colors.slate[50],
                              border: `1px solid ${colors.slate[200]}`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <img
                              src={job.companyLogo || "/placeholder.svg?height=48&width=48"}
                              alt={`${job.companyName} logo`}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          </div>
                          <div>
                            <h3
                              style={{
                                margin: "0 0 4px 0",
                                fontSize: "18px",
                                fontWeight: "600",
                                color: colors.slate[900],
                              }}
                            >
                              {job.title}
                            </h3>
                            <p
                              style={{
                                margin: 0,
                                fontSize: "14px",
                                color: colors.slate[600],
                              }}
                            >
                              {job.companyName}
                            </p>
                          </div>
                        </div>
                        <p
                          style={{
                            margin: "0 0 16px 0",
                            fontSize: "14px",
                            color: colors.slate[600],
                            lineHeight: "1.5",
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {job.description}
                        </p>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "8px",
                            marginBottom: "16px",
                          }}
                        >
                          {job.skills &&
                            job.skills.split(",").map((skill, index) => (
                              <span
                                key={index}
                                style={{
                                  padding: "4px 10px",
                                  backgroundColor: colors.purple[100],
                                  color: colors.purple[700],
                                  borderRadius: "16px",
                                  fontSize: "12px",
                                  fontWeight: "500",
                                }}
                              >
                                {skill.trim()}
                              </span>
                            ))}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "16px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              fontSize: "14px",
                              color: colors.slate[600],
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
                            {job.industry}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              fontSize: "14px",
                              color: colors.slate[600],
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
                              <circle cx="12" cy="12" r="10"></circle>
                              <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            {job.duration}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              fontSize: "14px",
                              color: colors.slate[600],
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
                              <line x1="12" y1="1" x2="12" y2="23"></line>
                              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                            </svg>
                            {job.isPaid ? job.salary || "Paid" : "Unpaid"}
                          </div>
                        </div>
                      </div>
                      <div
                        style={{
                          padding: "16px 24px",
                        }}
                      >
                        <button
                          onClick={() => handleViewDetails(job.id)}
                          style={{
                            width: "100%",
                            padding: "10px 16px",
                            backgroundColor: "#9B7EBD",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "14px",
                            fontWeight: "500",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            boxShadow: `0 2px 4px ${"#9B7EBD"}`,
                          }}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div
                    style={{
                      backgroundColor: "white",
                      borderRadius: "16px",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)",
                      overflow: "hidden",
                      border: `1px solid ${colors.slate[200]}`,
                      padding: "64px 24px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                      gridColumn: "1 / -1",
                    }}
                  >
                    <div
                      style={{
                        width: "64px",
                        height: "64px",
                        borderRadius: "50%",
                        backgroundColor: colors.slate[100],
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
                        stroke={colors.slate[500]}
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
                        color: colors.slate[900],
                      }}
                    >
                      No internships found
                    </h3>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "14px",
                        color: colors.slate[600],
                        maxWidth: "400px",
                      }}
                    >
                      No internships match your search criteria. Try adjusting your filters or search term.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Table View */}
            {viewMode === "table" && (
              <div
                style={{
                  backgroundColor: "white",
                  borderRadius: "16px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)",
                  overflow: "hidden",
                  border: `1px solid ${colors.slate[200]}`,
                }}
              >
                {filteredJobs.length > 0 ? (
                  <div style={{ overflowX: "auto" }}>
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                      }}
                    >
                      <thead>
                        <tr
                          style={{
                            backgroundColor: colors.slate[50],
                          }}
                        >
                          <th
                            style={{
                              padding: "16px 24px",
                              textAlign: "left",
                              fontSize: "12px",
                              fontWeight: "600",
                              color: colors.slate[700],
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                              borderBottom: `1px solid ${colors.slate[200]}`,
                            }}
                          >
                            Company
                          </th>
                          <th
                            style={{
                              padding: "16px 24px",
                              textAlign: "left",
                              fontSize: "12px",
                              fontWeight: "600",
                              color: colors.slate[700],
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                              borderBottom: `1px solid ${colors.slate[200]}`,
                            }}
                          >
                            Title
                          </th>
                          <th
                            style={{
                              padding: "16px 24px",
                              textAlign: "left",
                              fontSize: "12px",
                              fontWeight: "600",
                              color: colors.slate[700],
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                              borderBottom: `1px solid ${colors.slate[200]}`,
                            }}
                          >
                            Duration
                          </th>
                          <th
                            style={{
                              padding: "16px 24px",
                              textAlign: "left",
                              fontSize: "12px",
                              fontWeight: "600",
                              color: colors.slate[700],
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                              borderBottom: `1px solid ${colors.slate[200]}`,
                            }}
                          >
                            Compensation
                          </th>
                          <th
                            style={{
                              padding: "16px 24px",
                              textAlign: "right",
                              fontSize: "12px",
                              fontWeight: "600",
                              color: colors.slate[700],
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                              borderBottom: `1px solid ${colors.slate[200]}`,
                            }}
                          >
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredJobs.map((job, index) => (
                          <tr
                            key={job.id}
                            style={{
                              borderBottom: index < filteredJobs.length - 1 ? `1px solid ${colors.slate[100]}` : "none",
                            }}
                          >
                            <td
                              style={{
                                padding: "16px 24px",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "12px",
                                }}
                              >
                                <div
                                  style={{
                                    width: "36px",
                                    height: "36px",
                                    borderRadius: "6px",
                                    overflow: "hidden",
                                    backgroundColor: colors.slate[50],
                                    border: `1px solid ${colors.slate[200]}`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <img
                                    src={job.companyLogo || "/placeholder.svg?height=36&width=36"}
                                    alt={`${job.companyName} logo`}
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                    }}
                                  />
                                </div>
                                <span
                                  style={{
                                    fontSize: "14px",
                                    fontWeight: "500",
                                    color: colors.slate[800],
                                  }}
                                >
                                  {job.companyName}
                                </span>
                              </div>
                            </td>
                            <td
                              style={{
                                padding: "16px 24px",
                                fontSize: "14px",
                                fontWeight: "500",
                                color: colors.slate[800],
                              }}
                            >
                              {job.title}
                            </td>
                            <td
                              style={{
                                padding: "16px 24px",
                                fontSize: "14px",
                                color: colors.slate[600],
                              }}
                            >
                              {job.duration}
                            </td>
                            <td
                              style={{
                                padding: "16px 24px",
                              }}
                            >
                              <div
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  padding: "4px 8px",
                                  borderRadius: "16px",
                                  backgroundColor: job.isPaid ? colors.purple[100] : colors.slate[100],
                                  color: job.isPaid ? colors.purple[700] : colors.slate[600],
                                  fontSize: "13px",
                                  fontWeight: "500",
                                }}
                              >
                                <span
                                  style={{
                                    width: "6px",
                                    height: "6px",
                                    borderRadius: "50%",
                                    backgroundColor: job.isPaid ? colors.purple[700] : colors.slate[600],
                                    marginRight: "6px",
                                  }}
                                ></span>
                                {job.isPaid ? job.salary || "Paid" : "Unpaid"}
                              </div>
                            </td>
                            <td
                              style={{
                                padding: "16px 24px",
                                textAlign: "right",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "flex-end",
                                }}
                              >
                                <button
                                  onClick={() => handleViewDetails(job.id)}
                                  style={{
                                    padding: "8px 12px",
                                    backgroundColor: colors.purple[600],
                                    color: "white",
                                    border: "none",
                                    borderRadius: "6px",
                                    fontSize: "13px",
                                    fontWeight: "500",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    transition: "all 0.2s ease",
                                    boxShadow: `0 2px 4px ${colors.slate[200]}`,
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
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                  </svg>
                                  View Details
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
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
                        backgroundColor: colors.slate[100],
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
                        stroke={colors.slate[500]}
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
                        color: colors.slate[900],
                      }}
                    >
                      No internships found
                    </h3>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "14px",
                        color: colors.slate[600],
                        maxWidth: "400px",
                      }}
                    >
                      No internships match your search criteria. Try adjusting your filters or search term.
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Job Details Modal */}
      {showModal && selectedJob && (
        <div
          onClick={handleModalBackdropClick}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              maxWidth: "600px",
              width: "100%",
              maxHeight: "90vh",
              overflow: "auto",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              position: "relative",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "20px 24px",
                borderBottom: `1px solid ${colors.slate[200]}`,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "20px",
                  fontWeight: "600",
                  color: colors.slate[900],
                }}
              >
                Internship Details
              </h2>
              <button
                onClick={closeModal}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: colors.slate[600],
                  padding: "4px",
                  borderRadius: "4px",
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
                  stroke="currentColor"
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
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  marginBottom: "24px",
                }}
              >
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "8px",
                    overflow: "hidden",
                    backgroundColor: colors.slate[50],
                    border: `1px solid ${colors.slate[200]}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <img
                    src={selectedJob.companyLogo || "/placeholder.svg?height=64&width=64"}
                    alt={`${selectedJob.companyName} logo`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
                <div>
                  <h3
                    style={{
                      margin: "0 0 4px 0",
                      fontSize: "22px",
                      fontWeight: "600",
                      color: colors.slate[900],
                    }}
                  >
                    {selectedJob.companyName}
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "16px",
                      color: colors.slate[600],
                    }}
                  >
                    {selectedJob.location || "Location not specified"}
                  </p>
                </div>
              </div>

              <div
                style={{
                  marginBottom: "24px",
                }}
              >
                <div
                  style={{
                    marginBottom: "16px",
                  }}
                >
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: colors.slate[600],
                    }}
                  >
                    Job Title
                  </label>
                  <div
                    style={{
                      fontSize: "16px",
                      color: colors.slate[800],
                      padding: "12px 16px",
                      backgroundColor: colors.slate[50],
                      borderRadius: "8px",
                      border: `1px solid ${colors.slate[200]}`,
                    }}
                  >
                    {selectedJob.title}
                  </div>
                </div>

                <div
                  style={{
                    marginBottom: "16px",
                  }}
                >
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: colors.slate[600],
                    }}
                  >
                    Duration
                  </label>
                  <div
                    style={{
                      fontSize: "16px",
                      color: colors.slate[800],
                      padding: "12px 16px",
                      backgroundColor: colors.slate[50],
                      borderRadius: "8px",
                      border: `1px solid ${colors.slate[200]}`,
                    }}
                  >
                    {selectedJob.duration || "Not specified"}
                  </div>
                </div>

                <div
                  style={{
                    marginBottom: "16px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedJob.isPaid}
                    readOnly
                    style={{
                      marginRight: "8px",
                      accentColor: colors.purple[600],
                    }}
                  />
                  <label
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: colors.slate[600],
                    }}
                  >
                    Paid Position
                  </label>
                  {selectedJob.isPaid && selectedJob.salary && (
                    <span
                      style={{
                        marginLeft: "8px",
                        fontSize: "14px",
                        color: colors.purple[700],
                        fontWeight: "500",
                      }}
                    >
                      ({selectedJob.salary})
                    </span>
                  )}
                </div>

                <div
                  style={{
                    marginBottom: "16px",
                  }}
                >
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: colors.slate[600],
                    }}
                  >
                    Required Skills
                  </label>
                  <div
                    style={{
                      fontSize: "16px",
                      color: colors.slate[800],
                      padding: "12px 16px",
                      backgroundColor: colors.slate[50],
                      borderRadius: "8px",
                      border: `1px solid ${colors.slate[200]}`,
                    }}
                  >
                    {selectedJob.skills ? (
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "8px",
                        }}
                      >
                        {selectedJob.skills.split(",").map((skill, index) => (
                          <span
                            key={index}
                            style={{
                              padding: "4px 10px",
                              backgroundColor: colors.purple[100],
                              color: colors.purple[700],
                              borderRadius: "16px",
                              fontSize: "12px",
                              fontWeight: "500",
                            }}
                          >
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    ) : (
                      "No specific skills required"
                    )}
                  </div>
                </div>

                <div
                  style={{
                    marginBottom: "16px",
                  }}
                >
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: colors.slate[600],
                    }}
                  >
                    Job Description
                  </label>
                  <div
                    style={{
                      fontSize: "16px",
                      color: colors.slate[800],
                      padding: "12px 16px",
                      backgroundColor: colors.slate[50],
                      borderRadius: "8px",
                      border: `1px solid ${colors.slate[200]}`,
                      lineHeight: "1.6",
                      minHeight: "100px",
                    }}
                  >
                    {selectedJob.description || "No description provided"}
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: colors.slate[600],
                    }}
                  >
                    Industry
                  </label>
                  <div
                    style={{
                      fontSize: "16px",
                      color: colors.slate[800],
                      padding: "12px 16px",
                      backgroundColor: colors.slate[50],
                      borderRadius: "8px",
                      border: `1px solid ${colors.slate[200]}`,
                    }}
                  >
                    {selectedJob.industry || "Not specified"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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

export default AllJobsPosted
