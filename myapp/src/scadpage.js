"use client"

import { useState, useEffect } from "react"
import Sidebar from "./sidebarscad"
import { setNotification } from "./notification"
import { Calendar, Clock, X, ChevronRight } from "lucide-react"

function SCADPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [showDateModal, setShowDateModal] = useState(false)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [loading, setLoading] = useState(false)
  const [notification, setNotificationState] = useState({ show: false, message: "", type: "" })
  const [confirmLogout, setConfirmLogout] = useState(false)
  const [stats] = useState({
    activeStudents: 124,
    pendingReports: 18,
    completedInternships: 42,
  })

  const toggleMenu = () => setMenuOpen((prev) => !prev)

  useEffect(() => {
    const savedStart = localStorage.getItem("scadStartDate")
    const savedEnd = localStorage.getItem("scadEndDate")
    if (savedStart && savedEnd) {
      setStartDate(savedStart)
      setEndDate(savedEnd)
    }
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
        window.location.href = "/"
      }, 1000)
    }
  }

  const handleDateSubmit = () => {
    if (!startDate || !endDate) {
      showNotification("Please select both start and end dates", "error")
      return
    }

    if (new Date(startDate) >= new Date(endDate)) {
      showNotification("End date must be after start date", "error")
      return
    }

    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      // Set start and end date in localStorage
      localStorage.setItem("scadStartDate", startDate)
      localStorage.setItem("scadEndDate", endDate)

      // Close the date modal
      setShowDateModal(false)

      // Generate the notification message
      const message = `The internship cycle will start on ${formatDate(startDate)} and end on ${formatDate(endDate)}.`

      // Retrieve all users from localStorage (assuming you have a list of users)
      const allUsers = JSON.parse(localStorage.getItem("allUsers")) || []

      // Find all users with the 'student' role and send them notifications
      allUsers.forEach((user) => {
        if (user.role === "student") {
          setNotification(message, user.email)
          console.log(`Sending notification to ${user.email}: ${message}`)
        }
      })

      showNotification("Internship cycle dates have been set and notifications sent to students", "success")
      setLoading(false)
    }, 1500)
  }

  const showNotification = (message, type = "info") => {
    setNotificationState({ show: true, message, type })
    setTimeout(() => {
      setNotificationState({ show: false, message: "", type: "" })
    }, 4000)
  }

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const getTimeRemaining = () => {
    if (!startDate) return null

    const start = new Date(startDate)
    const now = new Date()

    if (now > start) return null

    const diffTime = Math.abs(start - now)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays
  }

  const timeRemaining = getTimeRemaining()

  // Navigation handlers for stats cards
  const navigateToStudents = () => {
    window.location.href = "/allstudents"
  }

  const navigateToReports = () => {
    window.location.href = "/facultyreports"
  }

  const navigateToCompletedInternships = () => {
    window.location.href = "/jobspage"
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
              SCAD Administration Dashboard
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
          {/* Welcome Section */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "8px",
              padding: "24px",
              marginBottom: "24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h2
                  style={{
                    margin: "0 0 8px 0",
                    fontSize: "24px",
                    fontWeight: "600",
                    color: "#4a4a6a",
                  }}
                >
                  Welcome to SCAD Administration
                </h2>
                <p
                  style={{
                    margin: "0 0 16px 0",
                    color: "#6a6a8a",
                    maxWidth: "600px",
                    lineHeight: "1.5",
                  }}
                >
                  Manage internship cycles, student applications, and faculty evaluations from this dashboard. Set
                  important dates and monitor progress throughout the internship process.
                </p>
              </div>

              {startDate && endDate ? (
                <div
                  style={{
                    backgroundColor: "#ebf8ff",
                    borderRadius: "6px",
                    padding: "12px 16px",
                    border: "1px solid #bee3f8",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <Calendar size={20} color="#3182ce" />
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: "500", color: "#2c5282" }}>
                      Current Internship Cycle
                    </div>
                    <div style={{ fontSize: "14px", color: "#4a5568" }}>
                      {formatDate(startDate)} - {formatDate(endDate)}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDateModal(true)}
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: "4px",
                      marginLeft: "8px",
                      color: "#3182ce",
                      fontSize: "13px",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    Edit <ChevronRight size={14} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowDateModal(true)}
                  style={{
                    padding: "10px 16px",
                    backgroundColor: "#4a4a6a",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "500",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    transition: "background-color 0.2s",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#3a3a5a")}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#4a4a6a")}
                >
                  <Calendar size={18} />
                  Set Internship Cycle Dates
                </button>
              )}
            </div>

            {timeRemaining && (
              <div
                style={{
                  marginTop: "16px",
                  backgroundColor: "#fffaf0",
                  borderRadius: "6px",
                  padding: "12px 16px",
                  border: "1px solid #feebc8",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <Clock size={20} color="#dd6b20" />
                <div style={{ fontSize: "14px", color: "#7b341e" }}>
                  <strong>Upcoming:</strong> Internship cycle starts in {timeRemaining} days
                </div>
              </div>
            )}
          </div>

          {/* Stats Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "30px",
              marginBottom: "30px",
            }}
          >
            {/* Active Students Card */}
            <div
              onClick={navigateToStudents}
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "12px",
                padding: "30px",
                boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
                cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)"
                e.currentTarget.style.boxShadow = "0 5px 15px rgba(0,0,0,0.1)"
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)"
                e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.08)"
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && navigateToStudents()}
              aria-label="View all students"
            >
              <div
                style={{
                  position: "absolute",
                  top: "0",
                  right: "0",
                  width: "100px",
                  height: "100px",
                  borderRadius: "0 0 0 100px",
                  backgroundColor: "#d5c5f7",
                  opacity: "0.2",
                }}
              ></div>
              <div style={{ fontSize: "48px", marginBottom: "10px" }}>👥</div>
              <div style={{ fontSize: "38px", fontWeight: "bold", color: "#4a4a6a", marginBottom: "5px" }}>
                {stats.activeStudents}
              </div>
              <div style={{ fontSize: "16px", color: "#6a6a8a" }}>Active Students</div>
              <div
                style={{
                  fontSize: "13px",
                  color: "#4a4a6a",
                  marginTop: "15px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                View all students <ChevronRight size={14} style={{ marginLeft: "4px" }} />
              </div>
            </div>

            {/* Pending Reports Card */}
            <div
              onClick={navigateToReports}
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "12px",
                padding: "30px",
                boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
                cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)"
                e.currentTarget.style.boxShadow = "0 5px 15px rgba(0,0,0,0.1)"
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)"
                e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.08)"
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && navigateToReports()}
              aria-label="View pending reports"
            >
              <div
                style={{
                  position: "absolute",
                  top: "0",
                  right: "0",
                  width: "100px",
                  height: "100px",
                  borderRadius: "0 0 0 100px",
                  backgroundColor: "#c5e8f7",
                  opacity: "0.2",
                }}
              ></div>
              <div style={{ fontSize: "48px", marginBottom: "10px" }}>📝</div>
              <div style={{ fontSize: "38px", fontWeight: "bold", color: "#4a4a6a", marginBottom: "5px" }}>
                {stats.pendingReports}
              </div>
              <div style={{ fontSize: "16px", color: "#6a6a8a" }}>Pending Reports</div>
              <div
                style={{
                  fontSize: "13px",
                  color: "#4a4a6a",
                  marginTop: "15px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                View all reports <ChevronRight size={14} style={{ marginLeft: "4px" }} />
              </div>
            </div>

            {/* Completed Internships Card */}
            <div
              onClick={navigateToCompletedInternships}
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "12px",
                padding: "30px",
                boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
                cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)"
                e.currentTarget.style.boxShadow = "0 5px 15px rgba(0,0,0,0.1)"
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)"
                e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.08)"
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && navigateToCompletedInternships()}
              aria-label="View completed internships"
            >
              <div
                style={{
                  position: "absolute",
                  top: "0",
                  right: "0",
                  width: "100px",
                  height: "100px",
                  borderRadius: "0 0 0 100px",
                  backgroundColor: "#f7d5c5",
                  opacity: "0.2",
                }}
              ></div>
              <div style={{ fontSize: "48px", marginBottom: "10px" }}>📊</div>
              <div style={{ fontSize: "38px", fontWeight: "bold", color: "#4a4a6a", marginBottom: "5px" }}>
                {stats.completedInternships}
              </div>
              <div style={{ fontSize: "16px", color: "#6a6a8a" }}>Available Internships</div>
              <div
                style={{
                  fontSize: "13px",
                  color: "#4a4a6a",
                  marginTop: "15px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                View all internships <ChevronRight size={14} style={{ marginLeft: "4px" }} />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "8px",
              padding: "24px",
              marginBottom: "24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <h3
              style={{
                margin: "0 0 16px 0",
                fontSize: "18px",
                fontWeight: "600",
                color: "#4a4a6a",
              }}
            >
              Quick Actions
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "16px",
              }}
            >
              <button
                onClick={() => (window.location.href = "/view-registration")}
                style={{
                  padding: "16px",
                  backgroundColor: "#f7fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  cursor: "pointer",
                  textAlign: "left",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  transition: "all 0.2s",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#edf2f7"
                  e.currentTarget.style.borderColor = "#cbd5e0"
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "#f7fafc"
                  e.currentTarget.style.borderColor = "#e2e8f0"
                }}
              >
                <div style={{ fontSize: "14px", fontWeight: "500", color: "#4a4a6a" }}>Company Registration</div>
                <div style={{ fontSize: "12px", color: "#6a6a8a" }}>View and manage company registrations</div>
              </button>

              <button
                onClick={() => (window.location.href = "/workshop")}
                style={{
                  padding: "16px",
                  backgroundColor: "#f7fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  cursor: "pointer",
                  textAlign: "left",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  transition: "all 0.2s",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#edf2f7"
                  e.currentTarget.style.borderColor = "#cbd5e0"
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "#f7fafc"
                  e.currentTarget.style.borderColor = "#e2e8f0"
                }}
              >
                <div style={{ fontSize: "14px", fontWeight: "500", color: "#4a4a6a" }}>Workshop</div>
                <div style={{ fontSize: "12px", color: "#6a6a8a" }}>Manage workshop sessions</div>
              </button>

              <button
                onClick={() => (window.location.href = "/all-students")}
                style={{
                  padding: "16px",
                  backgroundColor: "#f7fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  cursor: "pointer",
                  textAlign: "left",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  transition: "all 0.2s",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#edf2f7"
                  e.currentTarget.style.borderColor = "#cbd5e0"
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "#f7fafc"
                  e.currentTarget.style.borderColor = "#e2e8f0"
                }}
              >
                <div style={{ fontSize: "14px", fontWeight: "500", color: "#4a4a6a" }}>Students</div>
                <div style={{ fontSize: "12px", color: "#6a6a8a" }}>View all student profiles</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Date Range Modal */}
      {showDateModal && (
        <div
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
            zIndex: 2000,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "24px",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              width: "400px",
              maxWidth: "90%",
              animation: "fadeIn 0.3s ease-out",
            }}
          >
            <div
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}
            >
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "#4a4a6a" }}>
                Set Internship Cycle Dates
              </h3>
              <button
                onClick={() => setShowDateModal(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#6a6a8a",
                }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ margin: "0 0 20px 0", color: "#6a6a8a", fontSize: "14px" }}>
              Set the start and end dates for the internship cycle. Students will be notified automatically when dates
              are confirmed.
            </p>

            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#6a6a8a",
                }}
              >
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "6px",
                  border: "1px solid #e2e8f0",
                  fontSize: "14px",
                  color: "#4a4a6a",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#6a6a8a",
                }}
              >
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "6px",
                  border: "1px solid #e2e8f0",
                  fontSize: "14px",
                  color: "#4a4a6a",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button
                onClick={() => setShowDateModal(false)}
                style={{
                  padding: "10px 16px",
                  backgroundColor: "#f7fafc",
                  color: "#6a6a8a",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "500",
                  fontSize: "14px",
                  transition: "background-color 0.2s",
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#edf2f7")}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#f7fafc")}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleDateSubmit}
                style={{
                  padding: "10px 16px",
                  backgroundColor: "#4a4a6a",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: loading ? "default" : "pointer",
                  fontWeight: "500",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  opacity: loading ? 0.7 : 1,
                  transition: "background-color 0.2s",
                }}
                onMouseOver={(e) => {
                  if (!loading) e.currentTarget.style.backgroundColor = "#3a3a5a"
                }}
                onMouseOut={(e) => {
                  if (!loading) e.currentTarget.style.backgroundColor = "#4a4a6a"
                }}
                disabled={loading}
              >
                {loading ? (
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
                    Processing...
                  </>
                ) : (
                  <>Confirm</>
                )}
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
            zIndex: 2000,
            maxWidth: "400px",
            animation: "fadeIn 0.3s ease-out",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          {notification.type === "success" ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM8 15L3 10L4.41 8.59L8 12.17L15.59 4.58L17 6L8 15Z"
                fill="white"
              />
            </svg>
          ) : notification.type === "error" ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM11 15H9V13H11V15ZM11 11H9V5H11V11Z"
                fill="white"
              />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM11 15H9V9H11V15ZM11 7H9V5H11V7Z"
                fill="white"
              />
            </svg>
          )}
          <div style={{ flex: 1 }}>{notification.message}</div>
          <button
            onClick={() => setNotificationState({ ...notification, show: false })}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              opacity: 0.7,
            }}
            onMouseOver={(e) => (e.currentTarget.style.opacity = 1)}
            onMouseOut={(e) => (e.currentTarget.style.opacity = 0.7)}
          >
            <X size={16} />
          </button>
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

export default SCADPage
