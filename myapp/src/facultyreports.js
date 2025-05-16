"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import SidebarFac from "./sidebarfaculty"
import Sidebar from "./sidebarscad"

// Helper function to simulate notification service
const setNotification = (message, email) => {
  console.log(`Notification to ${email}: ${message}`)
  // In a real app, this would send a notification to the user
}

const FacultyReport = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [notification, setNotificationState] = useState({ show: false, message: "", type: "" })
  const [confirmLogout, setConfirmLogout] = useState(false)
  const [downloading, setDownloading] = useState(false)

  // Reports state
  const [reports, setReports] = useState([])
  const [filterMajor, setFilterMajor] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [expandedReportId, setExpandedReportId] = useState(null)
  const [showCommentModal, setShowCommentModal] = useState(false)
  const [comment, setComment] = useState("")
  const [commentingReportId, setCommentingReportId] = useState(null)
  const [pendingStatus, setPendingStatus] = useState("")
  const [commentError, setCommentError] = useState("")
  const [editingComment, setEditingComment] = useState(false)

  // Determine user type from location state
  const userType = location.state?.type || "faculty"
  const isSCAD = userType === "scad"

  // Load reports on component mount
  useEffect(() => {
    setLoading(true)

    // Get all internship reports from localStorage
    setTimeout(() => {
      // Get all reports from localStorage
      const allReports = []
      const uniqueIds = new Set()

      // First, check if there are any reports in the "reports" key
      const savedReports = localStorage.getItem("reports")
      if (savedReports) {
        const parsedReports = JSON.parse(savedReports)
        parsedReports.forEach((report) => {
          allReports.push(report)
          uniqueIds.add(report.id)
        })
      }

      // Then, check for reports in individual internship records
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith("report_")) {
          const reportData = JSON.parse(localStorage.getItem(key))
          if (reportData && reportData.submitted) {
            const internshipId = key.split("report_")[1]

            // Try to find the internship details
            let internshipDetails = null
            for (let j = 0; j < localStorage.length; j++) {
              const internKey = localStorage.key(j)
              if (internKey && internKey.startsWith("companyInterns_")) {
                const internsData = JSON.parse(localStorage.getItem(internKey))
                if (internsData) {
                  for (const intern of internsData) {
                    const uniqueId =
                      `${intern.email}_${intern.jobTitle}_${internKey.split("companyInterns_")[1]}_${intern.startDate}`.replace(
                        /\s+/g,
                        "_",
                      )
                    if (uniqueId === internshipId) {
                      internshipDetails = intern
                      break
                    }
                  }
                }
                if (internshipDetails) break
              }
            }

            if (internshipDetails && !uniqueIds.has(internshipId)) {
              const report = {
                id: internshipId,
                studentname: internshipDetails.name || "Student",
                studentemail: internshipDetails.email,
                title: reportData.title || internshipDetails.jobTitle,
                major: reportData.major || "Not specified",
                introduction: reportData.introduction || "No introduction provided",
                body: reportData.body || "No content provided",
                courses: reportData.courses || [],
                pdfFilename: reportData.pdfFileName || "report.pdf",
                status: reportData.status || "pending" || "draft_saved",
                comment: reportData.evaluatorComments || "",
              }
              allReports.push(report)
              uniqueIds.add(internshipId)
            }
          }
        }
      }

      setReports(allReports)
      setLoading(false)
      showNotification("Reports loaded successfully", "success")
    }, 800)
  }, [])

  const handleLogout = () => {
    setConfirmLogout(true)
  }

  const confirmLogoutAction = (confirm) => {
    setConfirmLogout(false)
    if (confirm) {
      setLoading(true)
      showNotification("Logging out...", "info")
      setTimeout(() => {
        navigate("/")
      }, 1000)
    }
  }

  const toggleMenu = () => {
    setMenuOpen(!menuOpen)
  }

  const showNotification = (message, type = "info") => {
    setNotificationState({ show: true, message, type })
    setTimeout(() => {
      setNotificationState({ show: false, message: "", type: "" })
    }, 3000)
  }

  const handleStatusWithComment = (id, status) => {
    setCommentingReportId(id)
    setPendingStatus(status)

    // Find the current comment for this report
    const report = reports.find((r) => r.id === id)
    setComment(report?.comment || "")

    setCommentError("")
    setShowCommentModal(true)
    setEditingComment(false) // This is for status change + comment
  }

  const handleEditComment = (id) => {
    setCommentingReportId(id)

    // Find the current comment for this report
    const report = reports.find((r) => r.id === id)
    setComment(report?.comment || "")
    setPendingStatus(report?.status || "pending"|| "draft_saved") // Preserve current status

    setCommentError("")
    setShowCommentModal(true)
    setEditingComment(true) // This is for editing/adding comment only
  }

  const saveCommentAndStatus = () => {
    if (!comment.trim()) {
      setCommentError("Comment is required.")
      return
    }

    const updatedReports = reports.map((report) =>
      report.id === commentingReportId ? { ...report, status: pendingStatus, comment } : report,
    )
    setReports(updatedReports)

    // Update the report in localStorage
    const reportKey = `report_${commentingReportId}`
    const reportData = localStorage.getItem(reportKey)

    if (reportData) {
      const parsedReport = JSON.parse(reportData)
      const updatedReport = {
        ...parsedReport,
        status: pendingStatus,
        evaluatorComments: comment,
      }
      localStorage.setItem(reportKey, JSON.stringify(updatedReport))
    }

    // Also update in the reports collection if it exists
    const savedReports = localStorage.getItem("reports")
    if (savedReports) {
      const parsedReports = JSON.parse(savedReports)
      const updatedSavedReports = parsedReports.map((report) =>
        report.id === commentingReportId ? { ...report, status: pendingStatus, comment } : report,
      )
      localStorage.setItem("reports", JSON.stringify(updatedSavedReports))
    }

    const report = reports.find((r) => r.id === commentingReportId)
    if (report) {
      const email = report.studentemail
      const title = report.title
      const message = editingComment
        ? `Your internship report "${title}" has been updated with a new comment: ${comment}`
        : `Your internship report "${title}" has been ${pendingStatus}. Comment: ${comment}`
      setNotification(message, email)
      showNotification(
        editingComment ? "Comment updated successfully" : `Report ${pendingStatus} successfully`,
        "success",
      )
    }

    setShowCommentModal(false)
    setComment("")
    setCommentError("")
    setCommentingReportId(null)
    setEditingComment(false)
  }

  const toggleReportDetails = (id) => {
    setExpandedReportId(expandedReportId === id ? null : id)
  }

  const handleDownloadPDF = (e, filename) => {
    e.preventDefault()
    setDownloading(true)

    // Create a link element
    const link = document.createElement("a")

    // Set the href to the PDF file in the public folder
    link.href = process.env.PUBLIC_URL ? `${process.env.PUBLIC_URL}/Report.pdf` : "/Report.pdf"

    // Set download attribute to suggest filename
    link.download = filename || "Student_Report.pdf"

    // Append to the document
    document.body.appendChild(link)

    // Trigger the download
    link.click()

    // Clean up
    document.body.removeChild(link)

    // Show success message
    setTimeout(() => {
      setDownloading(false)
      showNotification("Report downloaded successfully", "success")
    }, 1000)
  }

  const filteredReports = reports.filter(
    (report) =>
      (filterMajor === "" || report.major === filterMajor) &&
      (filterStatus === "all" || report.status === filterStatus),
  )

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#f0ad4e"
      case "accepted":
        return "#5cb85c"
      case "rejected":
        return "#d9534f"
      case "flagged":
        return "#ff9800"
      default:
        return "#6c757d"
    }
  }

  // Get unique majors for the filter dropdown
  const uniqueMajors = [...new Set(reports.map((report) => report.major))].filter(Boolean)

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        height: "100vh",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f8f9fa",
        overflow: "hidden",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      {/* Conditional Sidebar based on user type */}
      {isSCAD ? (
        <Sidebar menuOpen={menuOpen} toggleMenu={toggleMenu} />
      ) : (
        <SidebarFac menuOpen={menuOpen} toggleMenu={toggleMenu} />
      )}

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflowX: "hidden",
          position: "relative",
          transition: "margin-left 0.3s ease",
          marginLeft: menuOpen ? "280px" : "0", // Push content when sidebar is open
        }}
      >
        {/* Top Navigation Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "15px 20px",
            backgroundColor: "white",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            zIndex: 5,
            position: "sticky",
            top: 0,
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          {/* Hamburger Icon */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              cursor: "pointer",
              padding: "10px",
              borderRadius: "8px",
              transition: "background-color 0.2s",
              backgroundColor: menuOpen ? "rgba(181, 199, 248, 0.2)" : "transparent",
            }}
            onClick={toggleMenu}
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

          <h1
            style={{
              margin: "0 0 0 20px",
              fontSize: "20px",
              color: "#4a4a6a",
              fontWeight: "bold",
            }}
          >
            {isSCAD ? "SCAD Reports" : "Faculty Reports"}
          </h1>

          {/* Navigation Breadcrumbs */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginLeft: "20px",
            }}
          >
            <span style={{ color: "#6a6a8a", fontSize: "14px" }}>Home</span>
            <span style={{ margin: "0 8px", color: "#6a6a8a" }}>/</span>
            <span style={{ color: "#4a4a6a", fontSize: "14px", fontWeight: "bold" }}>Reports</span>
          </div>

          {/* User Profile */}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                backgroundColor: isSCAD ? "#b5c7f8" : "#d5c5f7", // Different colors for SCAD vs Faculty
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#4a4a6a",
                fontWeight: "bold",
                fontSize: "16px",
                marginRight: "10px",
              }}
            >
              {isSCAD ? "SA" : "FP"}
            </div>
            <div style={{ marginRight: "20px" }}>
              <div style={{ fontSize: "14px", fontWeight: "bold", color: "#4a4a6a" }}>
                {isSCAD ? "SCAD Admin" : "Faculty User"}
              </div>
              <div style={{ fontSize: "12px", color: "#6a6a8a" }}>{isSCAD ? "Administrator" : "Mariam"}</div>
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

        {/* Main Content Area */}
        <div
          style={{
            flex: 1,
            padding: "20px",
            overflowY: "auto",
          }}
        >
          {/* Loading Indicator */}
          {loading && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  margin: "0 auto 10px",
                  border: "4px solid rgba(181, 199, 248, 0.3)",
                  borderRadius: "50%",
                  borderTop: "4px solid #b5c7f8",
                  animation: "spin 1s linear infinite",
                }}
              ></div>
              <div style={{ color: "#4a4a6a" }}>Loading...</div>
            </div>
          )}

          {!loading && (
            <>
              {/* Welcome Section */}
              <div
                style={{
                  backgroundColor: "white",
                  borderRadius: "8px",
                  padding: "20px",
                  marginBottom: "20px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                }}
              >
                <h2
                  style={{
                    margin: "0 0 10px 0",
                    color: "#4a4a6a",
                    fontSize: "22px",
                  }}
                >
                  {isSCAD ? "SCAD Internship Reports Review" : "Faculty Internship Reports Review"}
                </h2>
                <p
                  style={{
                    margin: "0",
                    color: "#6a6a8a",
                    lineHeight: "1.5",
                  }}
                >
                  {isSCAD
                    ? "Monitor and review all student internship reports. You can filter, view details, and add or edit comments."
                    : "Review and manage student internship reports. You can filter, view details, and provide feedback."}
                </p>
              </div>

              {/* Filters Section */}
              <div
                style={{
                  backgroundColor: "white",
                  borderRadius: "8px",
                  padding: "20px",
                  marginBottom: "20px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 15px 0",
                    color: "#4a4a6a",
                    fontSize: "18px",
                  }}
                >
                  Filter Reports
                </h3>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "20px",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "5px",
                        fontSize: "14px",
                        color: "#6a6a8a",
                        fontWeight: "bold",
                      }}
                    >
                      Major:
                    </label>
                    <select
                      value={filterMajor}
                      onChange={(e) => setFilterMajor(e.target.value)}
                      style={{
                        padding: "8px 12px",
                        borderRadius: "6px",
                        border: "1px solid #ddd",
                        backgroundColor: "white",
                        fontSize: "14px",
                        color: "#4a4a6a",
                        minWidth: "200px",
                      }}
                    >
                      <option value="">All Majors</option>
                      {uniqueMajors.map((major, index) => (
                        <option key={index} value={major}>
                          {major}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "5px",
                        fontSize: "14px",
                        color: "#6a6a8a",
                        fontWeight: "bold",
                      }}
                    >
                      Status:
                    </label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      style={{
                        padding: "8px 12px",
                        borderRadius: "6px",
                        border: "1px solid #ddd",
                        backgroundColor: "white",
                        fontSize: "14px",
                        color: "#4a4a6a",
                        minWidth: "200px",
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
              {filteredReports.length === 0 ? (
                <div
                  style={{
                    backgroundColor: "white",
                    borderRadius: "8px",
                    padding: "20px",
                    marginBottom: "20px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                    textAlign: "center",
                    color: "#6a6a8a",
                  }}
                >
                  No reports match your current filters.
                </div>
              ) : (
                filteredReports.map((report) => (
                  <div
                    key={report.id}
                    style={{
                      backgroundColor: "white",
                      borderRadius: "8px",
                      marginBottom: "20px",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                      overflow: "hidden",
                    }}
                  >
                    {/* Report Header */}
                    <div
                      onClick={() => toggleReportDetails(report.id)}
                      style={{
                        padding: "15px 20px",
                        borderBottom: expandedReportId === report.id ? "1px solid #eee" : "none",
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <h3
                          style={{
                            margin: "0 0 5px 0",
                            fontSize: "18px",
                            color: "#4a4a6a",
                          }}
                        >
                          {report.title}
                        </h3>
                        <div
                          style={{
                            fontSize: "14px",
                            color: "#6a6a8a",
                          }}
                        >
                          By {report.studentname} • {report.major}
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            fontWeight: "bold",
                            backgroundColor: `${getStatusColor(report.status)}20`,
                            color: getStatusColor(report.status),
                          }}
                        >
                          {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                        </span>
                        <span
                          style={{
                            fontSize: "20px",
                            color: "#6a6a8a",
                            transform: expandedReportId === report.id ? "rotate(180deg)" : "rotate(0)",
                            transition: "transform 0.2s",
                          }}
                        >
                          ▼
                        </span>
                      </div>
                    </div>

                    {/* Report Details */}
                    {expandedReportId === report.id && (
                      <div style={{ padding: "20px" }}>
                        <div style={{ marginBottom: "15px" }}>
                          <h4
                            style={{
                              margin: "0 0 5px 0",
                              fontSize: "16px",
                              color: "#4a4a6a",
                            }}
                          >
                            Introduction
                          </h4>
                          <p
                            style={{
                              margin: "0",
                              fontSize: "14px",
                              color: "#6a6a8a",
                              lineHeight: "1.5",
                            }}
                          >
                            {report.introduction}
                          </p>
                        </div>

                        <div style={{ marginBottom: "15px" }}>
                          <h4
                            style={{
                              margin: "0 0 5px 0",
                              fontSize: "16px",
                              color: "#4a4a6a",
                            }}
                          >
                            Body
                          </h4>
                          <p
                            style={{
                              margin: "0",
                              fontSize: "14px",
                              color: "#6a6a8a",
                              lineHeight: "1.5",
                            }}
                          >
                            {report.body}
                          </p>
                        </div>

                        <div style={{ marginBottom: "15px" }}>
                          <h4
                            style={{
                              margin: "0 0 5px 0",
                              fontSize: "16px",
                              color: "#4a4a6a",
                            }}
                          >
                            Relevant Courses
                          </h4>
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: "5px",
                            }}
                          >
                            {report.courses.length > 0 ? (
                              report.courses.map((course, index) => (
                                <span
                                  key={index}
                                  style={{
                                    display: "inline-block",
                                    padding: "4px 8px",
                                    borderRadius: "4px",
                                    fontSize: "12px",
                                    backgroundColor: "#f0f0f0",
                                    color: "#6a6a8a",
                                  }}
                                >
                                  {course}
                                </span>
                              ))
                            ) : (
                              <span style={{ color: "#6a6a8a", fontStyle: "italic" }}>No courses specified</span>
                            )}
                          </div>
                        </div>

                        {report.comment && (
                          <div
                            style={{
                              marginBottom: "15px",
                              padding: "10px",
                              backgroundColor: "#f8f9fa",
                              borderRadius: "6px",
                              border: "1px solid #eee",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "5px",
                              }}
                            >
                              <h4
                                style={{
                                  margin: "0",
                                  fontSize: "16px",
                                  color: "#4a4a6a",
                                }}
                              >
                                Comment
                              </h4>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleEditComment(report.id)
                                }}
                                style={{
                                  padding: "4px 8px",
                                  backgroundColor: "#f0f0f0",
                                  color: "#6a6a8a",
                                  border: "none",
                                  borderRadius: "4px",
                                  fontSize: "12px",
                                  cursor: "pointer",
                                }}
                              >
                                Edit Comment
                              </button>
                            </div>
                            <p
                              style={{
                                margin: "0",
                                fontSize: "14px",
                                color: "#6a6a8a",
                                lineHeight: "1.5",
                              }}
                            >
                              {report.comment}
                            </p>
                          </div>
                        )}

                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "10px",
                            marginTop: "20px",
                          }}
                        >
                          <button
                            onClick={(e) => handleDownloadPDF(e, report.pdfFilename)}
                            disabled={downloading}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              padding: "8px 16px",
                              backgroundColor: downloading ? "#a5d8e7" : "#c5e8f7",
                              color: "#4a6a8a",
                              border: "none",
                              borderRadius: "6px",
                              cursor: downloading ? "default" : "pointer",
                              fontSize: "14px",
                              fontWeight: "bold",
                              transition: "background-color 0.2s",
                            }}
                            onMouseOver={(e) => {
                              if (!downloading) e.target.style.backgroundColor = "#b5d8e7"
                            }}
                            onMouseOut={(e) => {
                              if (!downloading) e.target.style.backgroundColor = "#c5e8f7"
                            }}
                          >
                            {downloading ? (
                              <>
                                <span
                                  style={{
                                    display: "inline-block",
                                    width: "14px",
                                    height: "14px",
                                    border: "2px solid rgba(74, 106, 138, 0.3)",
                                    borderTop: "2px solid #4a6a8a",
                                    borderRadius: "50%",
                                    marginRight: "8px",
                                    animation: "spin 1s linear infinite",
                                  }}
                                ></span>
                                Downloading...
                              </>
                            ) : (
                              <>📥 Download PDF</>
                            )}
                          </button>

                          {/* Status buttons - only visible to faculty and only for pending reports */}
                          {!isSCAD && (report.status === "pending"|| "draft_saved") && (
                            <>
                              <button
                                onClick={() => handleStatusWithComment(report.id, "rejected")}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  padding: "8px 16px",
                                  backgroundColor: "rgba(255, 200, 200, 0.5)",
                                  color: "#9a4a4a",
                                  border: "none",
                                  borderRadius: "6px",
                                  cursor: "pointer",
                                  fontSize: "14px",
                                  fontWeight: "bold",
                                  transition: "background-color 0.2s",
                                }}
                                onMouseOver={(e) => (e.target.style.backgroundColor = "rgba(255, 200, 200, 0.7)")}
                                onMouseOut={(e) => (e.target.style.backgroundColor = "rgba(255, 200, 200, 0.5)")}
                              >
                                ❌ Reject
                              </button>
                              <button
                                onClick={() => handleStatusWithComment(report.id, "flagged")}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  padding: "8px 16px",
                                  backgroundColor: "rgba(255, 230, 180, 0.5)",
                                  color: "#9a7a4a",
                                  border: "none",
                                  borderRadius: "6px",
                                  cursor: "pointer",
                                  fontSize: "14px",
                                  fontWeight: "bold",
                                  transition: "background-color 0.2s",
                                }}
                                onMouseOver={(e) => (e.target.style.backgroundColor = "rgba(255, 230, 180, 0.7)")}
                                onMouseOut={(e) => (e.target.style.backgroundColor = "rgba(255, 230, 180, 0.5)")}
                              >
                                🚩 Flag
                              </button>
                              <button
                                onClick={() => handleStatusWithComment(report.id, "accepted")}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  padding: "8px 16px",
                                  backgroundColor: "rgba(200, 255, 200, 0.5)",
                                  color: "#4a9a4a",
                                  border: "none",
                                  borderRadius: "6px",
                                  cursor: "pointer",
                                  fontSize: "14px",
                                  fontWeight: "bold",
                                  transition: "background-color 0.2s",
                                }}
                                onMouseOver={(e) => (e.target.style.backgroundColor = "rgba(200, 255, 200, 0.7)")}
                                onMouseOut={(e) => (e.target.style.backgroundColor = "rgba(200, 255, 200, 0.5)")}
                              >
                                ✅ Accept
                              </button>
                            </>
                          )}

                          {!report.comment && (
                            <button
                              onClick={() => handleEditComment(report.id)}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                padding: "8px 16px",
                                backgroundColor: "#f0f0f0",
                                color: "#6a6a8a",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "14px",
                                fontWeight: "bold",
                                transition: "background-color 0.2s",
                              }}
                              onMouseOver={(e) => (e.target.style.backgroundColor = "#e0e0e0")}
                              onMouseOut={(e) => (e.target.style.backgroundColor = "#f0f0f0")}
                            >
                              ✏️ Add Comment
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>

      {/* Notification Toast */}
      {notification.show && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            backgroundColor:
              notification.type === "success"
                ? "rgba(76, 175, 80, 0.9)"
                : notification.type === "error"
                  ? "rgba(244, 67, 54, 0.9)"
                  : "rgba(33, 150, 243, 0.9)",
            color: "white",
            padding: "12px 20px",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            zIndex: 1000,
            maxWidth: "300px",
            animation: "fadeIn 0.3s ease-out",
          }}
        >
          {notification.message}
        </div>
      )}

      {/* Comment Modal */}
      {showCommentModal && (
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
              width: "400px",
              maxWidth: "90%",
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
              {editingComment
                ? "Edit Comment"
                : `${pendingStatus.charAt(0).toUpperCase() + pendingStatus.slice(1)} Report`}
            </h3>
            <p
              style={{
                margin: "0 0 15px 0",
                color: "#6a6a8a",
                fontSize: "14px",
              }}
            >
              {editingComment
                ? "Update your comment for this report."
                : "Please provide a comment explaining your decision."}
            </p>
            <textarea
              placeholder="Enter comment/reason..."
              value={comment}
              onChange={(e) => {
                setComment(e.target.value)
                if (commentError) setCommentError("")
              }}
              style={{
                width: "100%",
                height: "120px",
                padding: "10px",
                borderRadius: "6px",
                border: commentError ? "1px solid #d9534f" : "1px solid #ddd",
                fontSize: "14px",
                color: "#4a4a6a",
                resize: "vertical",
                marginBottom: commentError ? "5px" : "15px",
              }}
            />
            {commentError && (
              <p
                style={{
                  color: "#d9534f",
                  margin: "0 0 15px 0",
                  fontSize: "12px",
                }}
              >
                {commentError}
              </p>
            )}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <button
                onClick={() => {
                  setShowCommentModal(false)
                  setComment("")
                  setCommentError("")
                  setEditingComment(false)
                }}
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
                onClick={saveCommentAndStatus}
                style={{
                  padding: "8px 16px",
                  backgroundColor: editingComment
                    ? "#c5e8f7" // Blue-ish for generic comment update
                    : pendingStatus === "accepted"
                      ? "rgba(200, 255, 200, 0.5)" // Green for accept
                      : pendingStatus === "rejected"
                        ? "rgba(255, 200, 200, 0.5)" // Red for reject
                        : "rgba(255, 230, 180, 0.5)", // Orange for flag
                  color: editingComment
                    ? "#4a6a8a"
                    : pendingStatus === "accepted"
                      ? "#4a9a4a"
                      : pendingStatus === "rejected"
                        ? "#9a4a4a"
                        : "#9a7a4a",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "bold",
                }}
              >
                {editingComment ? "Update Comment" : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

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
            from { opacity: 0; transform: translateY(20px); }
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

export default FacultyReport
