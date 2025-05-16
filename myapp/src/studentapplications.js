"use client"

import { useState, useEffect, useCallback } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { getNotification } from "./notification"

const MyApplications = () => {
  const [myApplications, setMyApplications] = useState([])
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("applications")
  const [loading, setLoading] = useState(true)
  const [notificationContent, setNotificationContent] = useState({ show: false, message: "", type: "" })
  const [confirmLogout, setConfirmLogout] = useState(false)
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [viewedNotifications, setViewedNotifications] = useState([])

  const student = location.state?.studentj || location.state?.student || location.state?.user|| location.state ||{ email: "default@example.com" }
    const allUsers = JSON.parse(localStorage.getItem("allUsers")) || []
  const s = allUsers.find((user) => user.email === student.email)
  const studentrole = s?.role // Added optional chaining for safety
  console.log(student)
  const viewedNotificationsKey = student?.email ? `viewedNotifications_${student.email}` : "viewedNotifications_default"

  const loadApplications = useCallback(() => {
    setLoading(true)
    // Ensure storedApplied is an array, defaulting to [] if not found or invalid
    const storedAppliedString = localStorage.getItem("appliedInternships")
    const storedApplied = storedAppliedString ? JSON.parse(storedAppliedString) : [] // Default to []

    if (student?.email) {
      // Now storedApplied is guaranteed to be an array, so .filter will work
      const studentApps = storedApplied.filter((app) => app.student?.email === student.email)
      setMyApplications(studentApps)
      console.log(studentApps)
    } else {
      setMyApplications([]) // Clear applications if no profile
    }

    setTimeout(() => {
      setLoading(false)
      showAppNotification("Applications loaded successfully", "success")
      getNotification(student.email)
      console.log(student.email)
      console.log(student)
    }, 800)
  }, [student])

  useEffect(() => {
    loadApplications()

    const handleStatusUpdate = (e) => {
      // Ensure student is available before accessing email
      if (student && e.detail?.applicantEmail === student.email) {
        loadApplications()
      }
    }

    const handleStorageChange = (event) => {
      // Specifically check if the 'appliedInternships' key changed
      if (event.key === "appliedInternships" || event.key === null) {
        // null for clearStorage
        loadApplications()
      }
    }

    window.addEventListener("applicationStatusUpdated", handleStatusUpdate)
    window.addEventListener("storage", handleStorageChange)

    try {
      const savedViewedNotifications = localStorage.getItem(viewedNotificationsKey)
      if (savedViewedNotifications) {
        setViewedNotifications(JSON.parse(savedViewedNotifications))
      }
    } catch (err) {
      console.error("Error loading viewed notifications:", err)
    }

    return () => {
      window.removeEventListener("applicationStatusUpdated", handleStatusUpdate)
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [loadApplications, student, viewedNotificationsKey])

  const handleLogout = () => setConfirmLogout(true)

  const confirmLogoutAction = (confirm) => {
    setConfirmLogout(false)
    if (confirm) {
      setLoading(true)
      showAppNotification("Logging out...", "info")
      setTimeout(() => navigate("/"), 1000)
    }
  }

  const toggleMenu = () => setMenuOpen(!menuOpen)

  const showAppNotification = (message, type = "info") => {
    setNotificationContent({ show: true, message, type })
    setTimeout(() => setNotificationContent({ show: false, message: "", type: "" }), 3000)
  }

  const resetViews = () => {
    // Reset any specific views if needed
  }

  const handleHomeClick = () => {
    resetViews()
    navigate("/studentpage", { state: { student } })
    showAppNotification("Navigating to dashboard...", "info")
  }

  const handleProfileClick = () => {
    resetViews()
    navigate("/studentprofile", { state: { student } })
    showAppNotification("Navigating to profile page...", "info")
  }

  const handleCoursesClick = () => {
    resetViews()
    navigate("/studentpage", { state: { student } })
    showAppNotification("Navigating to courses...", "info")
  }

  const handleBrowseJobsClick = () => {
    resetViews()
    navigate("/studentjobs", { state: { student } })
    showAppNotification("Navigating to jobs page...", "info")
  }

  const handleMyApplicationsClick = () => {
    resetViews()
    setActiveSection("applications")
    showAppNotification("Viewing applications...", "info")
  }

  const handleMyInternshipsClick = () => {
    resetViews()
    navigate("/myinternships", { state: { student } })
    showAppNotification("Navigating to internships page...", "info")
  }

  const handleCompaniesClick = () => {
    resetViews()
    navigate("/companiesforstudents", { state: { student } })
    showAppNotification("Navigating to companies page...", "info")
  }

  const handleSettingsClick = () => {
    resetViews()
    showAppNotification("Settings page coming soon!", "info")
  }

  const handleBellClick = () => {
    setIsPopupOpen((prev) => !prev)
    if (!isPopupOpen) {
      setNotificationContent({ show: false, message: "", type: "" })
      const notificationIds = notifications.map((n) => n.id)
      const updatedViewedNotifications = [...new Set([...viewedNotifications, ...notificationIds])]
      setViewedNotifications(updatedViewedNotifications)
      try {
        localStorage.setItem(viewedNotificationsKey, JSON.stringify(updatedViewedNotifications))
      } catch (err) {
        console.error("Error saving viewed notifications:", err)
      }
    }
  }

  const handleClosePopup = () => {
    setNotifications([])
    setIsPopupOpen(false)
  }

  const handleBack = () => {
    navigate("/studentpage", { state: { student } })
  }

  const unreadNotifications = notifications.filter((n) => !viewedNotifications.includes(n.id))
    
  const handleAppointmentsClick = () => {
  
    setActiveSection("appointments")
    navigate("/appointments", { state: { student } })
  }

  const handleAssessmentsClick = () => {
   
    setActiveSection("assessments")
    navigate("/online-assessments", { state: { student } })
  }

  const handleWorkshopsClick = () => {
   
    setActiveSection("workshops")
    navigate("/studentworkshops", { state: { student } })
  }

    const handleviewedprofile = () => {
    setActiveSection("jobs")
    navigate("/viewprofile", { state: { ...location.state } })
  }
 const commonItems = [
    { id: "dashboard", label: "Homepage", icon: "🏠", action: handleHomeClick },
    { id: "profile", label: "Profile", icon: "👤", action: handleProfileClick },
    { id: "courses", label: "All Courses", icon: "📚", action: handleCoursesClick },
    { id: "companies", label: "Companies", icon: "🏢", action: handleCompaniesClick }, // Action updated
    { id: "jobs", label: "Browse Jobs", icon: "💼", action: handleBrowseJobsClick },
    { id: "applications", label: "All Applications", icon: "📝", action: handleMyApplicationsClick },
    { id: "internships", label: "My Internships", icon: "🏆", action: handleMyInternshipsClick },
  ]
  const proSpecificItems = [
    { id: "appointments", label: "Appointments", icon: "📅", action: handleAppointmentsClick },
    { id: "assessments", label: "Online Assessments", icon: "📋", action: handleAssessmentsClick },
    { id: "workshops", label: "Workshops", icon: "🔧", action: handleWorkshopsClick },
    { id: "Who viewed my profile", label: "Who viewed my profile", icon: "👁", action: handleviewedprofile},
  ]

 
 const Sidebar = ({ menuOpen, toggleMenu }) => {
    const sidebarItems = [...commonItems]
    if (student && studentrole === "pro") {
      sidebarItems.push(...proSpecificItems)
    }
    // Add settings at the end
    sidebarItems.push({ id: "settings", label: "Settings", icon: "⚙️", action: handleSettingsClick })

    return (
      <div
        style={{
          width: menuOpen ? "250px" : "0",
          height: "100vh",
          backgroundColor: "#e6e6fa",
          transition: "width 0.3s ease",
          overflow: "hidden",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          boxShadow: menuOpen ? "2px 0 10px rgba(0,0,0,0.1)" : "none",
        }}
      >
        {menuOpen && (
          <>
            <div
              style={{
                padding: "20px",
                borderBottom: "1px solid rgba(0,0,0,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <h2 style={{ margin: 0, fontSize: "20px", color: "#4a4a6a", fontWeight: "bold" }}>Student Portal</h2>
            </div>
            <div
              style={{
                padding: "15px",
                backgroundColor: "rgba(255,255,255,0.5)",
                margin: "10px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: "#d5c5f7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#4a4a6a",
                  fontWeight: "bold",
                  fontSize: "16px",
                  marginRight: "10px",
                }}
              >
                {student.name ? student.name.charAt(0).toUpperCase() : "S"}
              </div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: "bold", color: "#4a4a6a" }}>Student User{studentrole === "pro" && (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginLeft: "8px",
                        backgroundColor: "#ffd700",
                        color: "#4a4a6a",
                        fontSize: "10px",
                        fontWeight: "bold",
                        padding: "2px 6px",
                        borderRadius: "10px",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      }}
                    >
                      PRO
                    </span>
                  )}
                </div>
                <div style={{ fontSize: "12px", color: "#6a6a8a" }}>{student.name || student.email}</div>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
              {sidebarItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "12px 15px",
                    margin: "5px 0",
                    borderRadius: "8px",
                    cursor: "pointer",
                    backgroundColor: activeSection === item.id ? "rgba(255,255,255,0.7)" : "transparent",
                    transition: "background-color 0.2s",
                    color: "#4a4a6a",
                  }}
                  onClick={item.action}
                  onMouseOver={(e) => {
                    if (activeSection !== item.id) e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.3)"
                  }}
                  onMouseOut={(e) => {
                    if (activeSection !== item.id) e.currentTarget.style.backgroundColor = "transparent"
                  }}
                >
                  <span style={{ marginRight: "10px", fontSize: "18px" }}>{item.icon}</span>
                  <span style={{ fontSize: "14px", fontWeight: activeSection === item.id ? "bold" : "normal" }}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
            <div style={{ padding: "15px", borderTop: "1px solid rgba(0,0,0,0.1)" }}>
              <button
                onClick={handleLogout}
                style={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  padding: "12px 15px",
                  backgroundColor: "rgba(255, 200, 200, 0.5)",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  color: "#9a4a4a",
                  fontSize: "14px",
                  fontWeight: "bold",
                  transition: "background-color 0.2s",
                }}
                onMouseOver={(e) => (e.target.style.backgroundColor = "rgba(255, 200, 200, 0.7)")}
                onMouseOut={(e) => (e.target.style.backgroundColor = "rgba(255, 200, 200, 0.5)")}
              >
                <span style={{ marginRight: "10px", fontSize: "18px" }}>🚪</span>Logout
              </button>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        height: "100vh",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f8f9fa",
        overflow: "hidden",
      }}
    >
      <Sidebar menuOpen={menuOpen} toggleMenu={toggleMenu} />
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflowX: "hidden",
          position: "relative",
          marginLeft: menuOpen ? "250px" : "0",
          transition: "margin-left 0.3s ease",
          width: menuOpen ? "calc(100% - 250px)" : "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "15px 20px",
            backgroundColor: "white",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            zIndex: 5,
          }}
        >
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
          <h1 style={{ margin: "0 0 0 20px", fontSize: "20px", color: "#4a4a6a", fontWeight: "bold" }}>
            My Applications
          </h1>
          <div style={{ display: "flex", alignItems: "center", marginLeft: "20px" }}>
            <span style={{ color: "#6a6a8a", fontSize: "14px", cursor: "pointer" }} onClick={handleHomeClick}>
              Home
            </span>
            <span style={{ margin: "0 8px", color: "#6a6a8a" }}>/</span>
            <span style={{ color: "#4a4a6a", fontSize: "14px", fontWeight: "bold" }}>Applications</span>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center" }}>
            <div style={{ position: "relative", marginRight: "20px" }}>
              <div
                onClick={handleBellClick}
                style={{
                  cursor: "pointer",
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "42px",
                  height: "42px",
                  borderRadius: "50%",
                  backgroundColor: isPopupOpen ? "rgba(230, 230, 250, 0.5)" : "transparent",
                  transition: "background-color 0.2s",
                }}
                aria-label="Notifications"
                onMouseOver={(e) => {
                  if (!isPopupOpen) e.currentTarget.style.backgroundColor = "rgba(230, 230, 250, 0.3)"
                }}
                onMouseOut={(e) => {
                  if (!isPopupOpen) e.currentTarget.style.backgroundColor = "transparent"
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: "#4a4a6a" }}
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {!isPopupOpen && unreadNotifications.length > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "0",
                      right: "0",
                      backgroundColor: "#f44336",
                      color: "white",
                      borderRadius: "50%",
                      width: "20px",
                      height: "20px",
                      fontSize: "11px",
                      fontWeight: "bold",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "2px solid white",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    }}
                  >
                    {unreadNotifications.length > 9 ? "9+" : unreadNotifications.length}
                  </span>
                )}
              </div>
              {isPopupOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "45px",
                    right: "-10px",
                    backgroundColor: "white",
                    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                    borderRadius: "12px",
                    width: "320px",
                    zIndex: 1001,
                    border: "1px solid rgba(230, 230, 250, 0.5)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "15px 20px",
                      borderBottom: "1px solid rgba(230, 230, 250, 0.7)",
                      backgroundColor: "rgba(230, 230, 250, 0.2)",
                    }}
                  >
                    <h4 style={{ margin: "0", color: "#4a4a6a", fontSize: "16px", fontWeight: "600" }}>
                      Notifications
                    </h4>
                    <button
                      onClick={() => setIsPopupOpen(false)}
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        color: "#6a6a8a",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "5px",
                        borderRadius: "50%",
                        transition: "background-color 0.2s",
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "rgba(230, 230, 250, 0.5)")}
                      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
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
                  <div style={{ maxHeight: "350px", overflowY: "auto", padding: "10px 0" }}>
                    {notifications.length === 0 ? (
                      <div
                        style={{
                          padding: "30px 20px",
                          textAlign: "center",
                          color: "#6a6a8a",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="40"
                          height="40"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{ color: "#d5c5f7", opacity: 0.7 }}
                        >
                          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                        <p style={{ margin: "0" }}>No new notifications</p>
                      </div>
                    ) : (
                      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                        {notifications.map((n, index) => (
                          <li
                            key={n.id || index}
                            style={{
                              padding: "12px 20px",
                              borderBottom:
                                index < notifications.length - 1 ? "1px solid rgba(230, 230, 250, 0.4)" : "none",
                              transition: "background-color 0.2s",
                              cursor: "default",
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "rgba(230, 230, 250, 0.2)")}
                            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                          >
                            <p
                              style={{
                                margin: "0 0 5px 0",
                                fontWeight: "500",
                                color: "#4a4a6a",
                                fontSize: "14px",
                                lineHeight: "1.4",
                              }}
                            >
                              {n.message}
                            </p>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "5px",
                                fontSize: "12px",
                                color: "#6a6a8a",
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="12"
                                height="12"
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
                              <span>{new Date(n.timestamp).toLocaleString()}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div
                      style={{
                        padding: "12px 20px",
                        borderTop: "1px solid rgba(230, 230, 250, 0.7)",
                        backgroundColor: "rgba(230, 230, 250, 0.2)",
                        textAlign: "center",
                      }}
                    >
                      <button
                        onClick={handleClosePopup}
                        style={{
                          backgroundColor: "#d5c5f7",
                          color: "#4a4a6a",
                          border: "none",
                          borderRadius: "6px",
                          padding: "8px 16px",
                          fontSize: "13px",
                          fontWeight: "500",
                          cursor: "pointer",
                          transition: "background-color 0.2s",
                          width: "100%",
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#c5b5e7")}
                        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#d5c5f7")}
                      >
                        Clear all notifications
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
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
              }}
            >
              {student.name ? student.name.charAt(0).toUpperCase() : "S"}
            </div>
            <div style={{ marginRight: "20px" }}>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  color: "#4a4a6a",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                Student User
              {studentrole === "pro" && (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginLeft: "8px",
                        backgroundColor: "#ffd700",
                        color: "#4a4a6a",
                        fontSize: "10px",
                        fontWeight: "bold",
                        padding: "2px 6px",
                        borderRadius: "10px",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      }}
                    >
                      PRO
                    </span>
                  )}
                </div>
              <div style={{ fontSize: "12px", color: "#6a6a8a" }}>{student.name || student.email}</div>
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

        <div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
          {loading ? (
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
              <div style={{ color: "#4a4a6a" }}>Loading applications...</div>
            </div>
          ) : (
            <>
              <div
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}
              >
                <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "#1e293b" }}>
                  My Internship Applications
                </h2>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#64748b",
                      backgroundColor: "#f8fafc",
                      padding: "4px 10px",
                      borderRadius: "4px",
                    }}
                  >
                    {`Total: ${myApplications.length} applications`}
                  </div>
                </div>
              </div>

              {myApplications.length > 0 ? (
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      borderRadius: "8px",
                      overflow: "hidden",
                      minWidth: "600px",
                    }}
                  >
                    <thead
                      style={{
                        backgroundColor: "#6b46c1",
                        color: "white",
                      }}
                    >
                      <tr>
                        <th
                          style={{
                            padding: "12px 15px",
                            textAlign: "left",
                            borderBottom: "1px solid #ddd",
                          }}
                        >
                          Company
                        </th>
                        <th
                          style={{
                            padding: "12px 15px",
                            textAlign: "left",
                            borderBottom: "1px solid #ddd",
                          }}
                        >
                          Title
                        </th>
                        <th
                          style={{
                            padding: "12px 15px",
                            textAlign: "left",
                            borderBottom: "1px solid #ddd",
                          }}
                        >
                          Duration
                        </th>
                        <th
                          style={{
                            padding: "12px 15px",
                            textAlign: "left",
                            borderBottom: "1px solid #ddd",
                          }}
                        >
                          Paid
                        </th>
                        <th
                          style={{
                            padding: "12px 15px",
                            textAlign: "left",
                            borderBottom: "1px solid #ddd",
                          }}
                        >
                          Status
                        </th>
                        <th
                          style={{
                            padding: "12px 15px",
                            textAlign: "left",
                            borderBottom: "1px solid #ddd",
                          }}
                        >
                          Documents
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {myApplications.map((appliedJob, index) => (
                        <tr
                          key={appliedJob.id || `${appliedJob.title}-${index}`}
                          style={{
                            borderBottom: "1px solid #ddd",
                            backgroundColor: index % 2 === 0 ? "#fff" : "#f9f9f9",
                            transition: "background-color 0.2s",
                          }}
                          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#f1f5f9")}
                          onMouseOut={(e) =>
                            (e.currentTarget.style.backgroundColor = index % 2 === 0 ? "#fff" : "#f9f9f9")
                          }
                        >
                          <td style={{ padding: "12px 15px" }}>{appliedJob.companyName}</td>
                          <td style={{ padding: "12px 15px" }}>{appliedJob.title}</td>
                          <td style={{ padding: "12px 15px" }}>{appliedJob.duration}</td>
                          <td style={{ padding: "12px 15px" }}>
                            {appliedJob.isPaid ? (
                              <span
                                style={{
                                  backgroundColor: "#dcfce7",
                                  color: "#166534",
                                  padding: "2px 8px",
                                  borderRadius: "4px",
                                  fontSize: "12px",
                                  fontWeight: "500",
                                }}
                              >
                                Yes
                              </span>
                            ) : (
                              <span
                                style={{
                                  backgroundColor: "#fee2e2",
                                  color: "#991b1b",
                                  padding: "2px 8px",
                                  borderRadius: "4px",
                                  fontSize: "12px",
                                  fontWeight: "500",
                                }}
                              >
                                No
                              </span>
                            )}
                          </td>
                          <td style={{ padding: "12px 15px" }}>
                            <span
                              style={{
                                display: "inline-block",
                                fontWeight: "500",
                                padding: "4px 8px",
                                borderRadius: "4px",
                                fontSize: "12px",
                                color: "white",
                                backgroundColor:
                                  appliedJob.status === "accepted"
                                    ? "#10b981"
                                    : appliedJob.status === "rejected"
                                      ? "#ef4444"
                                      : appliedJob.status === "finalized"
                                        ? "#3b82f6"
                                        : "#f59e0b",
                              }}
                            >
                              {(appliedJob.status || "pending").toUpperCase()}
                            </span>
                          </td>
                          <td style={{ padding: "12px 15px" }}>
                            {appliedJob.documents && appliedJob.documents.length > 0 ? (
                              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                                {appliedJob.documents.map((doc, idx) => (
                                  <span
                                    key={idx}
                                    style={{
                                      backgroundColor: "#e9d8fd",
                                      color: "#6b46c1",
                                      padding: "2px 8px",
                                      borderRadius: "4px",
                                      fontSize: "12px",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "4px",
                                    }}
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="12"
                                      height="12"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
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
                                    {doc}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span style={{ color: "#94a3b8", fontStyle: "italic", fontSize: "13px" }}>N/A</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div
                  style={{
                    backgroundColor: "white",
                    borderRadius: "8px",
                    padding: "40px 20px",
                    textAlign: "center",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    marginTop: "20px",
                  }}
                >
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      backgroundColor: "rgba(107, 70, 193, 0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 20px",
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="30"
                      height="30"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#6b46c1"
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
                  <h3 style={{ color: "#4a4a6a", margin: "0 0 10px 0", fontSize: "18px" }}>No Applications Yet</h3>
                  <p style={{ color: "#6a6a8a", margin: "0 0 20px 0", fontSize: "14px" }}>
                    You haven't applied to any internships yet. Browse available opportunities to get started.
                  </p>
                  <button
                    onClick={handleBrowseJobsClick}
                    style={{
                      padding: "10px 20px",
                      backgroundColor: "#6b46c1",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "500",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      transition: "background-color 0.2s",
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#553c9a")}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#6b46c1")}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    Browse Internships
                  </button>
                </div>
              )}

              <div style={{ marginTop: "30px", display: "flex", justifyContent: "flex-start" }}>
                <button
                  onClick={handleBack}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#f1f5f9",
                    color: "#64748b",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    transition: "all 0.2s",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = "#e2e8f0"
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = "#f1f5f9"
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                  </svg>
                  Back to Dashboard
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {notificationContent.show && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            backgroundColor:
              notificationContent.type === "success"
                ? "rgba(16, 185, 129, 0.9)"
                : notificationContent.type === "error"
                  ? "rgba(239, 68, 68, 0.9)"
                  : "rgba(59, 130, 246, 0.9)",
            color: "white",
            padding: "12px 20px",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            zIndex: 2000,
            maxWidth: "350px",
            animation: "fadeIn 0.3s ease-out",
          }}
        >
          {notificationContent.message}
        </div>
      )}

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
            zIndex: 2000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "25px",
              width: "350px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              textAlign: "center",
            }}
          >
            <h3 style={{ margin: "0 0 15px 0", color: "#4a4a6a", fontSize: "18px", fontWeight: 600 }}>
              Confirm Logout
            </h3>
            <p style={{ margin: "0 0 25px 0", color: "#6a6a8a", fontSize: "15px" }}>
              Are you sure you want to log out?
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "15px" }}>
              <button
                onClick={() => confirmLogoutAction(false)}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#f1f1f1",
                  color: "#4a4a6a",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 500,
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => confirmLogoutAction(true)}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#f44336",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 500,
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{` @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } } `}</style>
    </div>
  )
}

export default MyApplications
