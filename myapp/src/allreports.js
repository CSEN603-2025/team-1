"use client"

import { useState, useEffect } from "react"
import Sidebar from "./sidebarscad"
import {
  ChevronDown,
  ChevronRight,
  Filter,
  FileText,
  BookOpen,
  Bookmark,
  Download,
  User,
  MessageSquare,
} from "lucide-react"

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
    studentName: "Alex Johnson",
    submissionDate: "2023-11-15",
    comments: [
      {
        author: "SCAD Admin",
        text: "Great report, Alex! Your insights into machine learning applications are valuable.",
        timestamp: new Date().toISOString(),
      },
    ],
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
    studentName: "Sarah Williams",
    submissionDate: "2023-11-10",
    comments: [
      {
        author: "SCAD Admin",
        text: "Sarah, your understanding of financial analysis is commendable. Keep up the good work!",
        timestamp: new Date().toISOString(),
      },
    ],
  },
]

const AllReportsPage = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [reports, setReports] = useState([])
  const [filterMajor, setFilterMajor] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [expandedReportId, setExpandedReportId] = useState(null)
  const [confirmLogout, setConfirmLogout] = useState(false)
  const [loading, setLoading] = useState(false)
  const [downloadLoading, setDownloadLoading] = useState(false)
  const [comments, setComments] = useState({})

 useEffect(() => {
  const savedReports = JSON.parse(localStorage.getItem("reports"))
  if (savedReports) {
    setReports(savedReports)

    // Extract comments properly from each report
    const extractedComments = {}
    savedReports.forEach((report) => {
      if (Array.isArray(report.comment)) {
        extractedComments[report.id] = report.comment
      }
    })

    setComments(extractedComments)
  } 
  // else {
  //   setReports(initialReports)
  //   localStorage.setItem("reports", JSON.stringify(initialReports))
  // }
}, [])


  const filteredReports = reports.filter(
    (report) =>
      (filterMajor === "" || report.major === filterMajor) &&
      (filterStatus === "all" || report.status === filterStatus),
  )

  const toggleReportDetails = (id) => {
    setExpandedReportId(expandedReportId === id ? null : id)
  }

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev)
  }

  const handleLogout = () => {
    setConfirmLogout(true)
  }

  const confirmLogoutAction = (confirm) => {
    setConfirmLogout(false)
    if (confirm) {
      setLoading(true)
      setTimeout(() => {
        window.location.href = "/"
      }, 1000)
    }
  }

  // Function to handle PDF download using Fetch API and Blob
  const handleDownloadPDF = async (filename) => {
    try {
      setDownloadLoading(true)

      const response = await fetch(`/${filename}`) // Not window.location.origin
      if (!response.ok) throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`)

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)

      const link = document.createElement("a")
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Download error:", error)
      alert(`Error downloading PDF: ${error.message}`)
    } finally {
      setDownloadLoading(false)
    }
  }

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "pending":
        return {
          backgroundColor: "#fff8e1",
          color: "#f59e0b",
          border: "1px solid #fef3c7",
        }
      case "flagged":
        return {
          backgroundColor: "#fee2e2",
          color: "#ef4444",
          border: "1px solid #fecaca",
        }
      case "rejected":
        return {
          backgroundColor: "#f3f4f6",
          color: "#6b7280",
          border: "1px solid #e5e7eb",
        }
      case "accepted":
        return {
          backgroundColor: "#dcfce7",
          color: "#22c55e",
          border: "1px solid #bbf7d0",
        }
      default:
        return {
          backgroundColor: "#f3f4f6",
          color: "#6b7280",
          border: "1px solid #e5e7eb",
        }
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100vh", // Fixed height
        overflow: "hidden", // Prevent overall page scrolling
        backgroundColor: "#f8f9fa",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      <Sidebar menuOpen={menuOpen} toggleMenu={toggleMenu} style={{ position: "fixed", height: "100vh", zIndex: 20 }} />

      <div
        style={{
          flex: 1,
          padding: "0",
          boxSizing: "border-box",
          transition: "margin-left 0.3s ease",
          marginLeft: menuOpen ? "280px" : "0", // Push content to the right when sidebar is open
          position: "relative",
          height: "100vh",
          overflow: "hidden", // Hide overflow
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Top Navigation Bar */}
        <div
          style={{
            backgroundColor: "#ffffff",
            padding: "15px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            position: "sticky",
            top: 0,
            zIndex: 10,
            width: "100%",
            boxSizing: "border-box", // Add this to include padding in width calculation
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            {!menuOpen && (
              <div
                onClick={toggleMenu}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  cursor: "pointer",
                  padding: "10px",
                  borderRadius: "8px",
                  transition: "background-color 0.2s",
                  backgroundColor: menuOpen ? "rgba(181, 199, 248, 0.2)" : "transparent",
                  marginRight: "16px",
                }}
                aria-label="Toggle menu"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && toggleMenu()}
              >
                <div
                  style={{
                    width: "25px",
                    height: "3px",
                    backgroundColor: "#4a4a6a",
                    margin: "2px 0",
                    transition: "transform 0.2s",
                    transform: menuOpen ? "rotate(45deg) translate(5px, 5px)" : "none",
                  }}
                ></div>
                <div
                  style={{
                    width: "25px",
                    height: "3px",
                    backgroundColor: "#4a4a6a",
                    margin: "2px 0",
                    opacity: menuOpen ? 0 : 1,
                    transition: "opacity 0.2s",
                  }}
                ></div>
                <div
                  style={{
                    width: "25px",
                    height: "3px",
                    backgroundColor: "#4a4a6a",
                    margin: "2px 0",
                    transition: "transform 0.2s",
                    transform: menuOpen ? "rotate(-45deg) translate(5px, -5px)" : "none",
                  }}
                ></div>
              </div>
            )}
            <h1
              style={{
                margin: 0,
                fontSize: "20px",
                fontWeight: "600",
                color: "#4a4a6a",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                flexShrink: 1, // Allow title to shrink if needed
              }}
            >
              Internship Reports
            </h1>
          </div>

          {/* User Profile and Logout */}
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              flexShrink: 0, // Prevent this section from shrinking
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                backgroundColor: "#d5c5f7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#4a4a6a",
                fontWeight: "bold",
                fontSize: "16px",
                marginRight: "10px",
                flexShrink: 0, // Prevent avatar from shrinking
              }}
            >
              SA
            </div>
            <div style={{ marginRight: "15px", flexShrink: 1 }}>
              <div style={{ fontSize: "14px", fontWeight: "bold", color: "#4a4a6a" }}>SCAD Admin</div>
              <div style={{ fontSize: "12px", color: "#6a6a8a" }}>Administrator</div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                padding: "8px 12px",
                backgroundColor: "rgba(255, 200, 200, 0.5)",
                color: "#9a4a4a",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                transition: "background-color 0.2s",
                whiteSpace: "nowrap", // Prevent text wrapping
                flexShrink: 0, // Prevent button from shrinking
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = "rgba(255, 200, 200, 0.7)")}
              onMouseOut={(e) => (e.target.style.backgroundColor = "rgba(255, 200, 200, 0.5)")}
              disabled={loading}
              aria-label="Logout"
            >
              {loading ? "Please wait..." : "Logout"}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div
          style={{
            padding: "20px",
            flex: 1,
            overflowY: "auto", // Enable vertical scrolling
            height: "calc(100vh - 70px)", // Subtract the height of the top nav
          }}
        >
          {/* Filter Section */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "8px",
              padding: "24px",
              marginBottom: "24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <h2
              style={{
                margin: "0 0 20px 0",
                fontSize: "24px",
                fontWeight: "600",
                color: "#4a4a6a",
              }}
            >
              Submitted Internship Reports
            </h2>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "15px",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  flex: "1 1 300px",
                }}
              >
                <Filter size={18} color="#6a6a8a" />
                <select
                  id="majorFilter"
                  value={filterMajor}
                  onChange={(e) => setFilterMajor(e.target.value)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "6px",
                    border: "1px solid #e2e8f0",
                    fontSize: "14px",
                    color: "#4a4a6a",
                    backgroundColor: "#ffffff",
                    cursor: "pointer",
                    flex: 1,
                  }}
                >
                  <option value="">All Majors</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  flex: "1 1 300px",
                }}
              >
                <Filter size={18} color="#6a6a8a" />
                <select
                  id="statusFilter"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "6px",
                    border: "1px solid #e2e8f0",
                    fontSize: "14px",
                    color: "#4a4a6a",
                    backgroundColor: "#ffffff",
                    cursor: "pointer",
                    flex: 1,
                  }}
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="flagged">Flagged</option>
                  <option value="rejected">Rejected</option>
                  <option value="accepted">Accepted</option>
                </select>
              </div>
            </div>
          </div>

          {/* Reports List */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "8px",
              padding: "24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            {filteredReports.length === 0 ? (
              <div
                style={{
                  padding: "40px 20px",
                  textAlign: "center",
                  color: "#6a6a8a",
                  fontSize: "16px",
                }}
              >
                No reports match your filters.
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                {filteredReports.map((report) => (
                  <div
                    key={report.id}
                    style={{
                      backgroundColor: "#f8f9fa",
                      borderRadius: "8px",
                      overflow: "hidden",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                      transition: "transform 0.2s, box-shadow 0.2s",
                    }}
                  >
                    <div
                      onClick={() => toggleReportDetails(report.id)}
                      style={{
                        padding: "16px 20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer",
                        backgroundColor: expandedReportId === report.id ? "#f0f4f8" : "transparent",
                        borderBottom: expandedReportId === report.id ? "1px solid #e2e8f0" : "none",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "8px",
                            backgroundColor: "#d5c5f7",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#4a4a6a",
                          }}
                        >
                          <FileText size={20} />
                        </div>
                        <div>
                          <h3
                            style={{
                              margin: "0 0 5px 0",
                              fontSize: "16px",
                              fontWeight: "600",
                              color: "#4a4a6a",
                            }}
                          >
                            {report.title}
                          </h3>
                          <div style={{ fontSize: "14px", color: "#6a6a8a" }}>
                            {report.studentName} • {report.major}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                        <div
                          style={{
                            padding: "4px 10px",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: "500",
                            textTransform: "capitalize",
                            ...getStatusBadgeStyle(report.status),
                          }}
                        >
                          {report.status}
                        </div>
                        {expandedReportId === report.id ? (
                          <ChevronDown size={20} color="#6a6a8a" />
                        ) : (
                          <ChevronRight size={20} color="#6a6a8a" />
                        )}
                      </div>
                    </div>

                    {expandedReportId === report.id && (
                      <div
                        style={{
                          padding: "20px",
                          backgroundColor: "#f8f9fa",
                        }}
                      >
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                            gap: "20px",
                            marginBottom: "20px",
                          }}
                        >
                          <div
                            style={{
                              backgroundColor: "#ffffff",
                              padding: "16px",
                              borderRadius: "8px",
                              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                            }}
                          >
                            <h4
                              style={{
                                margin: "0 0 12px 0",
                                fontSize: "16px",
                                fontWeight: "600",
                                color: "#4a4a6a",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <User size={16} />
                              Student Information
                            </h4>
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                              <div>
                                <div style={{ fontSize: "13px", color: "#6a6a8a" }}>Student Name</div>
                                <div style={{ fontSize: "15px", color: "#4a4a6a" }}>{report.studentName}</div>
                              </div>
                              <div>
                                <div style={{ fontSize: "13px", color: "#6a6a8a" }}>Major</div>
                                <div style={{ fontSize: "15px", color: "#4a4a6a" }}>{report.major}</div>
                              </div>
                              <div>
                                <div style={{ fontSize: "13px", color: "#6a6a8a" }}>Submission Date</div>
                                <div style={{ fontSize: "15px", color: "#4a4a6a" }}>
                                  {formatDate(report.submissionDate)}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div
                            style={{
                              backgroundColor: "#ffffff",
                              padding: "16px",
                              borderRadius: "8px",
                              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                            }}
                          >
                            <h4
                              style={{
                                margin: "0 0 12px 0",
                                fontSize: "16px",
                                fontWeight: "600",
                                color: "#4a4a6a",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <BookOpen size={16} />
                              Relevant Courses
                            </h4>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                              {report.courses.map((course, index) => (
                                <div
                                  key={index}
                                  style={{
                                    padding: "6px 10px",
                                    backgroundColor: "#f0f4f8",
                                    borderRadius: "20px",
                                    fontSize: "13px",
                                    color: "#4a4a6a",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                  }}
                                >
                                  <Bookmark size={14} />
                                  {course}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div
                          style={{
                            backgroundColor: "#ffffff",
                            padding: "16px",
                            borderRadius: "8px",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                            marginBottom: "20px",
                          }}
                        >
                          <h4
                            style={{
                              margin: "0 0 12px 0",
                              fontSize: "16px",
                              fontWeight: "600",
                              color: "#4a4a6a",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <FileText size={16} />
                            Report Content
                          </h4>
                          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <div>
                              <div
                                style={{ fontSize: "14px", fontWeight: "500", color: "#4a4a6a", marginBottom: "4px" }}
                              >
                                Introduction
                              </div>
                              <p
                                style={{
                                  margin: "0",
                                  fontSize: "15px",
                                  color: "#4a4a6a",
                                  lineHeight: "1.6",
                                }}
                              >
                                {report.introduction}
                              </p>
                            </div>
                            <div>
                              <div
                                style={{ fontSize: "14px", fontWeight: "500", color: "#4a4a6a", marginBottom: "4px" }}
                              >
                                Body
                              </div>
                              <p
                                style={{
                                  margin: "0",
                                  fontSize: "15px",
                                  color: "#4a4a6a",
                                  lineHeight: "1.6",
                                }}
                              >
                                {report.body}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Comments Section - Only display if comments exist */}
                        {comments[report.id] && comments[report.id].length > 0 && (
                          <div
                            style={{
                              backgroundColor: "#ffffff",
                              padding: "16px",
                              borderRadius: "8px",
                              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                              marginBottom: "20px",
                            }}
                          >
                            <h4
                              style={{
                                margin: "0 0 12px 0",
                                fontSize: "16px",
                                fontWeight: "600",
                                color: "#4a4a6a",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <MessageSquare size={16} />
                              Comments & Feedback
                            </h4>

                            {/* Display existing comments */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                              {comments[report.id].map((comment, index) => (
                                <div
                                  key={index}
                                  style={{
                                    backgroundColor: "#f8f9fa",
                                    padding: "12px",
                                    borderRadius: "6px",
                                    border: "1px solid #e2e8f0",
                                  }}
                                >
                                  <div
                                    style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}
                                  >
                                    <div style={{ fontWeight: "500", fontSize: "14px", color: "#4a4a6a" }}>
                                      {comment.author || "SCAD Admin"}
                                    </div>
                                    <div style={{ fontSize: "12px", color: "#6a6a8a" }}>
                                      {comment.timestamp
                                        ? new Date(comment.timestamp).toLocaleString()
                                        : "No timestamp"}
                                    </div>
                                  </div>
                                  <p style={{ margin: "0", fontSize: "14px", color: "#4a4a6a", lineHeight: "1.5" }}>
                                    {comment.text}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: "10px",
                            marginTop: "20px",
                          }}
                        >
                          <button
                            onClick={() => handleDownloadPDF(report.pdfFilename)}
                            disabled={downloadLoading}
                            style={{
                              padding: "10px 16px",
                              backgroundColor: "#4a4a6a",
                              color: "white",
                              border: "none",
                              borderRadius: "6px",
                              cursor: downloadLoading ? "default" : "pointer",
                              fontSize: "14px",
                              fontWeight: "500",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              textDecoration: "none",
                              opacity: downloadLoading ? 0.7 : 1,
                            }}
                          >
                            {downloadLoading ? (
                              <>
                                <div
                                  style={{
                                    width: "16px",
                                    height: "16px",
                                    border: "2px solid rgba(255,255,255,0.3)",
                                    borderTop: "2px solid white",
                                    borderRadius: "50%",
                                    animation: "spin 1s linear infinite",
                                  }}
                                ></div>
                                Downloading...
                              </>
                            ) : (
                              <>
                                <Download size={16} />
                                Download Full Report
                              </>
                            )}
                          </button>

                          <div style={{ display: "flex", gap: "10px" }}>
                            <button
                              style={{
                                padding: "10px 16px",
                                backgroundColor: "rgba(255, 200, 200, 0.5)",
                                color: "#9a4a4a",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "14px",
                                fontWeight: "500",
                              }}
                            >
                              Reject
                            </button>
                            <button
                              style={{
                                padding: "10px 16px",
                                backgroundColor: "rgba(200, 255, 200, 0.5)",
                                color: "#4a9a4a",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "14px",
                                fontWeight: "500",
                              }}
                            >
                              Accept
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      {confirmLogout && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "20px",
              width: "300px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            <h3
              style={{
                margin: "0 0 15px 0",
                color: "#4a4a6a",
                fontSize: "18px",
              }}
            >
              Confirm Logout
            </h3>
            <p
              style={{
                margin: "0 0 20px 0",
                color: "#6a6a8a",
              }}
            >
              Are you sure you want to log out?
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <button
                onClick={() => confirmLogoutAction(false)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#f1f1f1",
                  color: "#6a6a8a",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => confirmLogoutAction(true)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "rgba(255, 200, 200, 0.5)",
                  color: "#9a4a4a",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "bold",
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>
        {`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
            }
            
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
      </style>
    </div>
  )
}

export default AllReportsPage
