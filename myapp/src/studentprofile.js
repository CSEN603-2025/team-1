"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
// import { getNotification, clearNotifications } from "./notification" // Original import

// --- START: Dummy Data and Stubs ---

// 1. Define a dummy student object
const dummyStudent = {
  email: "john.doe@example.com",
  name: "John Doe (Default)", // A default name for the student object
};

// 2. Define initial dummy profile data
const dummyInitialProfileData = {
  name: "Johnathan Doe", // Profile name, can be edited
  email: dummyStudent.email, // Email will be tied to dummyStudent
  jobInterests: "Software Development, AI Research, Cloud Computing",
  industry: "Technology",
  internships: "AI Research Intern at Innovatech (Summer 2023)\n- Developed a prototype for a recommendation engine.",
  partTimeJobs: "Freelance Web Developer (2022-Present)\n- Built several small business websites.",
  collegeActivities: "President of the AI Club, Member of Coding Bootcamp",
  major: "Mechatronics",
  semester: "8",
};

// 3. Stub for notification functions (replace actual import)
const getNotification = (userEmail) => {
  // console.log(`[Stub] getNotification for ${userEmail}`);
  if (userEmail === dummyStudent.email) {
    // Return a couple of sample notifications for the dummy user
    return [
      { id: 'dummy_notif_1', message: `Welcome to your profile, ${dummyInitialProfileData.name}! Feel free to look around.`, timestamp: Date.now() - (60 * 60 * 1000) }, // 1 hour ago
      { id: 'dummy_notif_2', message: 'Your internship application for "Tech Solutions" was viewed.', timestamp: Date.now() - (10 * 60 * 1000) }, // 10 minutes ago
    ];
  }
  return []; // Default to empty for other emails
};

const clearNotifications = (userEmail) => {
  console.log(`[Stub] clearNotifications called for ${userEmail}`);
  // In a real app, this would interact with storage or an API.
  // For the stub, we can just log it. The state will be cleared in handleClosePopup.
};

// --- END: Dummy Data and Stubs ---


function StudentProfilePage() {
  const navigate = useNavigate()
  const location = useLocation() // Kept for other potential uses or if parts of navigation rely on it
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("profile")
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState({ show: false, message: "", type: "" })
  const [confirmLogout, setConfirmLogout] = useState(false)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [viewedNotifications, setViewedNotifications] = useState([])

  // Use the dummyStudent object
  const student = location.state?.user ||
    location.state?.studentj ||
    location.state?.student || dummyStudent;
  const profileKey = `studentProfile_${student.email}`; // Key for localStorage, specific to the dummy student
  const viewedNotificationsKey = student?.email ? `viewedNotifications_${student.email}` : "viewedNotifications_default"
  const status = null // Kept from original code

  // Profile state - initial values will be set by useEffect
  const [profile, setProfile] = useState({
    name: "",
    email: student.email, // Default to dummy student's email
    jobInterests: "",
    industry: "",
    internships: "",
    partTimeJobs: "",
    collegeActivities: "",
    major: "",
    semester: "",
  })
  const [draftProfile, setDraftProfile] = useState({ ...profile })
  const [selectedMajor, setSelectedMajor] = useState("")
  const [selectedSemester, setSelectedSemester] = useState("")

  // Load viewed notifications from local storage
  useEffect(() => {
    try {
      const savedViewedNotifications = localStorage.getItem(viewedNotificationsKey)
      if (savedViewedNotifications) {
        setViewedNotifications(JSON.parse(savedViewedNotifications))
      }
    } catch (err) {
      console.error("Error loading viewed notifications:", err)
    }
  }, [viewedNotificationsKey])

  // Load profile data on component mount
  useEffect(() => {
    setLoading(true)
    try {
      const savedProfile = localStorage.getItem(profileKey)
      // If a profile is saved in localStorage for the dummy student, use it. Otherwise, use dummyInitialProfileData.
      const initialProfile = savedProfile
        ? JSON.parse(savedProfile)
        : { ...dummyInitialProfileData, email: student.email }; // Ensure email is correct

      setProfile(initialProfile)
      setDraftProfile(initialProfile)
      setSelectedMajor(initialProfile.major || "")
      setSelectedSemester(initialProfile.semester || "")

      // Simulate API call
      setTimeout(() => {
        setLoading(false)
        showNotification(savedProfile ? "Profile loaded from saved session" : "Profile loaded with dummy data", "info")
      }, 800)
    } catch (err) {
      console.error("Error loading profile:", err)
      setProfile({ ...dummyInitialProfileData, email: student.email }); // Fallback to dummy on error
      setDraftProfile({ ...dummyInitialProfileData, email: student.email });
      setSelectedMajor(dummyInitialProfileData.major || "");
      setSelectedSemester(dummyInitialProfileData.semester || "");
      setLoading(false)
      showNotification("Failed to load profile data, using defaults", "error")
    }
  }, [profileKey, student.email]) // student.email comes from dummyStudent

  // Notification logic (uses stubbed getNotification)
  useEffect(() => {
    if (student?.email) {
      const interval = setInterval(() => {
        try {
          const newNotifications = getNotification(student.email) || []
          // Only update state if notifications have actually changed to avoid unnecessary re-renders
          if (JSON.stringify(newNotifications) !== JSON.stringify(notifications)) {
            setNotifications(newNotifications)
          }
        } catch (err) {
          console.error("Error fetching notifications:", err)
        }
      }, 3000) // check every 3 seconds

      return () => clearInterval(interval) // cleanup on unmount
    }
  }, [student?.email, notifications]) // notifications dependency to re-check if cleared

  // Calculate unread notifications
  const unreadNotifications = notifications.filter((notification) => {
    return !viewedNotifications.includes(notification.id)
  })

  const handleLogout = () => {
    setConfirmLogout(true)
  }

  const confirmLogoutAction = (confirm) => {
    setConfirmLogout(false)
    if (confirm) {
      setLoading(true)
      showNotification("Logging out...", "info")
      setTimeout(() => {
        navigate("/") // Navigate to home or login page
      }, 1000)
    }
  }

  const toggleMenu = () => {
    setMenuOpen(!menuOpen)
  }

  const showNotification = (message, type = "info") => {
    setNotification({ show: true, message, type })
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" })
    }, 3000)
  }

  const handleBellClick = () => {
    if (student?.email) {
      const fetchedNotifications = getNotification(student.email) || [] // Uses stubbed getNotification
      setNotifications(fetchedNotifications)
      setIsPopupOpen((prev) => !prev)

      if (!isPopupOpen) {
        setNotification({ show: false, message: "", type: "" })
        const notificationIds = fetchedNotifications.map((notification) => notification.id)
        const updatedViewedNotifications = [...new Set([...viewedNotifications, ...notificationIds])]
        setViewedNotifications(updatedViewedNotifications)
        try {
          localStorage.setItem(viewedNotificationsKey, JSON.stringify(updatedViewedNotifications))
        } catch (err) {
          console.error("Error saving viewed notifications:", err)
        }
      }
    } else {
      console.warn("Student email not available for fetching notifications.")
    }
  }

  const handleClosePopup = () => {
    if (student?.email) {
      clearNotifications(student.email) // Calls stubbed clearNotifications
    }
    setNotifications([]) // Clear from state
    setIsPopupOpen(false) // Close popup
    // Clear viewed notifications from localStorage as well, or they will persist
    // setViewedNotifications([]); // Optionally clear viewed state too
    // localStorage.removeItem(viewedNotificationsKey); // Optionally clear from storage
    showNotification("Notifications cleared", "info");
  }

  // Navigation handlers - `student` is now `dummyStudent`
  const handleHomeClick = () => {
    navigate("/studentpage", { state: { student } })
  }

  const handleProfileClick = () => {
    setActiveSection("profile")
    // If using react-router to navigate to #profile or similar, do it here
    // For now, it just sets the active section for styling
  }

  const handleCoursesClick = () => {
    navigate("/studentpage", { state: { student } }) // Or navigate to a specific courses page
  }

  const handleBrowseJobsClick = () => {
    navigate("/jobspage", { state: { student } })
  }

  const handleMyApplicationsClick = () => {
    navigate("/studentapplications", { state: { student } })
  }

  const handleMyInternshipsClick = () => {
    navigate("/myinternships", { state: { student } })
  }

  const handleCompaniesClick = () => {
    navigate("/companiesforstudents", { state: { student } })
  }

  const handleSettingsClick = () => {
    showNotification("Settings page coming soon!", "info")
  }

  // Profile edit handlers
  const handleEditClick = () => {
    setIsEditingProfile(true)
    setDraftProfile(profile) // Start editing with current profile data
  }

  const handleCancelEdit = () => {
    setIsEditingProfile(false)
    setDraftProfile(profile) // Reset draft to current profile
    // Also reset selectedMajor and selectedSemester to match the current profile
    setSelectedMajor(profile.major || "");
    setSelectedSemester(profile.semester || "");
    showNotification("Edit cancelled", "info")
  }

  const handleDraftChange = (e) => {
    const { name, value } = e.target
    setDraftProfile({ ...draftProfile, [name]: value })
  }

  const handleSaveProfile = () => {
    setLoading(true)

    try {
      const updatedDraftProfile = {
        ...draftProfile,
        major: selectedMajor,
        semester: selectedSemester,
        email: student.email, // Ensure email is from the (dummy) student object
      }

      // Save to localStorage for persistence of the dummy profile's edits
      localStorage.setItem(profileKey, JSON.stringify(updatedDraftProfile))

      // This part for 'studentusers' can be kept if it's part of a larger system simulation
      const profileWithStatus = { ...updatedDraftProfile, status } // status is null
      const studentUsers = JSON.parse(localStorage.getItem("studentusers")) || []
      const existingUserIndex = studentUsers.findIndex((user) => user.email === updatedDraftProfile.email)

      if (existingUserIndex > -1) {
        studentUsers[existingUserIndex] = profileWithStatus
      } else {
        studentUsers.push(profileWithStatus)
      }
      localStorage.setItem("studentusers", JSON.stringify(studentUsers))

      setProfile(updatedDraftProfile) // Update the main profile state
      setIsEditingProfile(false)
      showNotification("Profile updated successfully!", "success")
    } catch (err) {
      console.error("Error saving profile:", err)
      showNotification("Failed to save profile data", "error")
    } finally {
      setLoading(false)
    }
  }

  // Sidebar component (remains largely unchanged, uses `profile` state which is now dummy-driven)
  const Sidebar = ({ menuOpen, toggleMenu }) => {
    const sidebarItems = [
      { id: "dashboard", label: "Homepage", icon: "🏠", action: handleHomeClick },
      { id: "profile", label: "Profile", icon: "👤", action: handleProfileClick },
      { id: "courses", label: "All Courses", icon: "📚", action: handleCoursesClick },
      { id: "jobs", label: "Browse Jobs", icon: "💼", action: handleBrowseJobsClick },
      { id: "applications", label: "All Applications", icon: "📝", action: handleMyApplicationsClick },
      { id: "internships", label: "My Internships", icon: "🏆", action: handleMyInternshipsClick },
      { id: "companies", label: "Companies", icon: "🏢", action: handleCompaniesClick },
      { id: "settings", label: "Settings", icon: "⚙️", action: handleSettingsClick },
    ]

    return (
      <div
        style={{
          width: menuOpen ? "250px" : "0",
          height: "100vh",
          backgroundColor: "#e6e6fa", // Light purple background
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
              <h2
                style={{
                  margin: 0,
                  fontSize: "20px",
                  color: "#4a4a6a",
                  fontWeight: "bold",
                }}
              >
                Student Portal
              </h2>
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
                {profile.name ? profile.name.charAt(0).toUpperCase() : (student.name ? student.name.charAt(0).toUpperCase() : "S")}
              </div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: "bold", color: "#4a4a6a" }}>Student User</div>
                <div style={{ fontSize: "12px", color: "#6a6a8a" }}>{profile.name || student.email}</div>
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
                  onClick={() => { item.action(); if(item.id === 'profile') setActiveSection('profile');}}
                  onMouseOver={(e) => {
                    if (activeSection !== item.id) {
                      e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.3)"
                    }
                  }}
                  onMouseOut={(e) => {
                    if (activeSection !== item.id) {
                      e.currentTarget.style.backgroundColor = "transparent"
                    }
                  }}
                >
                  <span style={{ marginRight: "10px", fontSize: "18px" }}>{item.icon}</span>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: activeSection === item.id ? "bold" : "normal",
                    }}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            <div
              style={{
                padding: "15px",
                borderTop: "1px solid rgba(0,0,0,0.1)",
              }}
            >
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
                <span style={{ marginRight: "10px", fontSize: "18px" }}>🚪</span>
                Logout
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
      {/* Sidebar */}
      <Sidebar menuOpen={menuOpen} toggleMenu={toggleMenu} />

      {/* Main Content */}
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
        {/* Top Navigation Bar */}
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
            Student Portal
          </h1>

          {/* Navigation Breadcrumbs */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginLeft: "20px",
            }}
          >
            <span style={{ color: "#6a6a8a", fontSize: "14px", cursor: "pointer" }} onClick={handleHomeClick}>
              Home
            </span>
            <span style={{ margin: "0 8px", color: "#6a6a8a" }}>/</span>
            <span style={{ color: "#4a4a6a", fontSize: "14px", fontWeight: "bold" }}>Profile</span>
          </div>

          {/* User Profile - Rearranged order with bell first */}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center" }}>
            {/* Notification Bell - Now comes first */}
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
                {/* Only show the notification badge when popup is closed and there are unread notifications */}
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

              {/* Notification Popup */}
              {isPopupOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "45px", // Adjusted for bell icon size
                    right: "-10px", // Adjusted for alignment
                    backgroundColor: "white",
                    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                    borderRadius: "12px",
                    width: "320px",
                    zIndex: 1001, // Ensure it's above other content
                    border: "1px solid rgba(230, 230, 250, 0.5)",
                    overflow: "hidden", // Ensures rounded corners are applied to children
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "15px 20px",
                      borderBottom: "1px solid rgba(230, 230, 250, 0.7)",
                      backgroundColor: "rgba(230, 230, 250, 0.2)", // Light purple tint for header
                    }}
                  >
                    <h4
                      style={{
                        margin: "0",
                        color: "#4a4a6a",
                        fontSize: "16px",
                        fontWeight: "600",
                      }}
                    >
                      Notifications
                    </h4>
                    <button
                      onClick={() => setIsPopupOpen(false)} // Only close the popup without clearing
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
                      <ul
                        style={{
                          listStyle: "none",
                          padding: 0,
                          margin: 0,
                        }}
                      >
                        {notifications.map((notification, index) => (
                          <li
                            key={notification.id || index} // Use notification.id if available
                            style={{
                              padding: "12px 20px",
                              borderBottom:
                                index < notifications.length - 1 ? "1px solid rgba(230, 230, 250, 0.4)" : "none",
                              transition: "background-color 0.2s",
                              cursor: "default", // Or 'pointer' if notifications are clickable
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "rgba(230, 230, 250, 0.2)")}
                            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                          >
                            <p
                              style={{
                                margin: "0 0 5px 0",
                                fontWeight: "500", // Slightly bolder for message
                                color: "#4a4a6a",
                                fontSize: "14px",
                                lineHeight: "1.4",
                              }}
                            >
                              {notification.message}
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
                              <span>{new Date(notification.timestamp).toLocaleString()}</span>
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
                        onClick={handleClosePopup} // This now calls the modified clear logic
                        style={{
                          backgroundColor: "#d5c5f7", // A slightly more prominent purple
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

            {/* User Profile - Now comes after the bell */}
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
              {profile.name ? profile.name.charAt(0).toUpperCase() : (student.name ? student.name.charAt(0).toUpperCase() : "S")}
            </div>
            <div style={{ marginRight: "20px" }}>
              <div style={{ fontSize: "14px", fontWeight: "bold", color: "#4a4a6a" }}>Student User</div>
              <div style={{ fontSize: "12px", color: "#6a6a8a" }}>{profile.name || student.email}</div>
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
                position: "absolute", // Changed from fixed to absolute for centering within this div
                top: "50%",
                left: "50%", // This will be 50% of the main content area if sidebar is open
                transform: "translate(-50%, -50%)",
                textAlign: "center",
                zIndex: 10, // Ensure it's above profile content but below nav/sidebar
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
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "8px",
                padding: "25px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                maxWidth: "1000px", // Max width for content
                margin: "0 auto", // Center content
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                  borderBottom: "1px solid #eee",
                  paddingBottom: "15px",
                }}
              >
                <h2
                  style={{
                    margin: "0",
                    color: "#4a4a6a",
                    fontSize: "22px",
                  }}
                >
                  Student Profile
                </h2>
                {!isEditingProfile && (
                  <button
                    onClick={handleEditClick}
                    style={{
                      padding: "10px 20px",
                      backgroundColor: "#b5c7f8",
                      color: "#4a4a6a",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "500",
                      display: "flex",
                      alignItems: "center",
                      transition: "background-color 0.2s",
                    }}
                    onMouseOver={(e) => (e.target.style.backgroundColor = "#a5b7e8")}
                    onMouseOut={(e) => (e.target.style.backgroundColor = "#b5c7f8")}
                  >
                    <span style={{ marginRight: "8px", fontSize: "16px" }}>✏️</span>
                    Edit Profile
                  </button>
                )}
              </div>

              {!isEditingProfile ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", // Responsive columns
                    gap: "30px", // Gap between grid items
                  }}
                >
                  {/* Personal Information Card */}
                  <div
                    style={{
                      backgroundColor: "#f9f9fa",
                      borderRadius: "8px",
                      padding: "20px",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                    }}
                  >
                    <h3
                      style={{
                        margin: "0 0 15px 0",
                        color: "#4a4a6a",
                        fontSize: "18px",
                        borderBottom: "1px solid #eee",
                        paddingBottom: "10px",
                      }}
                    >
                      Personal Information
                    </h3>
                    <div style={{ marginBottom: "15px" }}>
                      <div style={{ color: "#6a6a8a", fontSize: "14px", marginBottom: "5px" }}>Name</div>
                      <div style={{ color: "#4a4a6a", fontSize: "16px", fontWeight: "500" }}>
                        {profile.name || "Not set"}
                      </div>
                    </div>
                    <div style={{ marginBottom: "15px" }}>
                      <div style={{ color: "#6a6a8a", fontSize: "14px", marginBottom: "5px" }}>Email</div>
                      <div style={{ color: "#4a4a6a", fontSize: "16px", fontWeight: "500" }}>{profile.email}</div>
                    </div>
                    <div style={{ marginBottom: "15px" }}>
                      <div style={{ color: "#6a6a8a", fontSize: "14px", marginBottom: "5px" }}>Major</div>
                      <div style={{ color: "#4a4a6a", fontSize: "16px", fontWeight: "500" }}>
                        {profile.major || "Not selected"}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: "#6a6a8a", fontSize: "14px", marginBottom: "5px" }}>Semester</div>
                      <div style={{ color: "#4a4a6a", fontSize: "16px", fontWeight: "500" }}>
                        {profile.semester ? `Semester ${profile.semester}` : "Not selected"}
                      </div>
                    </div>
                  </div>

                  {/* Career Interests Card */}
                  <div
                    style={{
                      backgroundColor: "#f9f9fa",
                      borderRadius: "8px",
                      padding: "20px",
                       boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                    }}
                  >
                    <h3
                      style={{
                        margin: "0 0 15px 0",
                        color: "#4a4a6a",
                        fontSize: "18px",
                        borderBottom: "1px solid #eee",
                        paddingBottom: "10px",
                      }}
                    >
                      Career Interests
                    </h3>
                    <div style={{ marginBottom: "15px" }}>
                      <div style={{ color: "#6a6a8a", fontSize: "14px", marginBottom: "5px" }}>Job Interests</div>
                      <div style={{ color: "#4a4a6a", fontSize: "16px", fontWeight: "500", whiteSpace: "pre-line" }}>
                        {profile.jobInterests || "Not specified"}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: "#6a6a8a", fontSize: "14px", marginBottom: "5px" }}>Industry Preference</div>
                      <div style={{ color: "#4a4a6a", fontSize: "16px", fontWeight: "500" }}>
                        {profile.industry || "Not specified"}
                      </div>
                    </div>
                  </div>

                  {/* Experience Card - Spans full width if needed, or adjust grid */}
                  <div
                    style={{
                      backgroundColor: "#f9f9fa",
                      borderRadius: "8px",
                      padding: "20px",
                      gridColumn: "1 / -1", // Make this card span all columns
                       boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                    }}
                  >
                    <h3
                      style={{
                        margin: "0 0 15px 0",
                        color: "#4a4a6a",
                        fontSize: "18px",
                        borderBottom: "1px solid #eee",
                        paddingBottom: "10px",
                      }}
                    >
                      Experience & Activities
                    </h3>
                    <div style={{ marginBottom: "15px" }}>
                      <div style={{ color: "#6a6a8a", fontSize: "14px", marginBottom: "5px" }}>
                        Previous Internships
                      </div>
                      <div
                        style={{
                          color: "#4a4a6a",
                          fontSize: "16px",
                          fontWeight: "500",
                          whiteSpace: "pre-line", // Preserve line breaks from textarea
                        }}
                      >
                        {profile.internships || "None specified"}
                      </div>
                    </div>
                    <div style={{ marginBottom: "15px" }}>
                      <div style={{ color: "#6a6a8a", fontSize: "14px", marginBottom: "5px" }}>Part-time Jobs</div>
                      <div
                        style={{
                          color: "#4a4a6a",
                          fontSize: "16px",
                          fontWeight: "500",
                          whiteSpace: "pre-line",
                        }}
                      >
                        {profile.partTimeJobs || "None specified"}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: "#6a6a8a", fontSize: "14px", marginBottom: "5px" }}>College Activities</div>
                      <div
                        style={{
                          color: "#4a4a6a",
                          fontSize: "16px",
                          fontWeight: "500",
                          whiteSpace: "pre-line",
                        }}
                      >
                        {profile.collegeActivities || "None specified"}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Editing Form
                <div style={{ maxWidth: "900px", margin: "0 auto" }}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr", // Single column for editing form sections
                      gap: "30px",
                      marginBottom: "30px",
                    }}
                  >
                    {/* Personal Information Edit Section */}
                    <div
                      style={{
                        backgroundColor: "#f9f9fa",
                        borderRadius: "8px",
                        padding: "25px", // Increased padding for edit form sections
                        boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                      }}
                    >
                      <h3
                        style={{
                          margin: "0 0 20px 0",
                          color: "#4a4a6a",
                          fontSize: "18px",
                          borderBottom: "1px solid #eee",
                          paddingBottom: "10px",
                        }}
                      >
                        Edit Personal Information
                      </h3>

                      <div style={{ marginBottom: "20px" }}>
                        <label
                          htmlFor="name"
                          style={{
                            display: "block",
                            marginBottom: "8px",
                            color: "#4a4a6a",
                            fontSize: "14px",
                            fontWeight: "500",
                          }}
                        >
                          Name
                        </label>
                        <input
                          id="name"
                          type="text"
                          name="name"
                          value={draftProfile.name}
                          onChange={handleDraftChange}
                          style={{
                            width: "100%",
                            padding: "12px 15px",
                            border: "1px solid #ddd",
                            borderRadius: "6px",
                            fontSize: "14px",
                            color: "#4a4a6a",
                            boxSizing: "border-box",
                          }}
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div style={{ marginBottom: "20px" }}>
                        <label
                           htmlFor="email"
                          style={{
                            display: "block",
                            marginBottom: "8px",
                            color: "#4a4a6a",
                            fontSize: "14px",
                            fontWeight: "500",
                          }}
                        >
                          Email
                        </label>
                        <input
                          id="email"
                          type="email"
                          name="email"
                          value={student.email} // Display dummy student's email
                          style={{
                            width: "100%",
                            padding: "12px 15px",
                            border: "1px solid #ddd",
                            borderRadius: "6px",
                            fontSize: "14px",
                            color: "#6a6a8a",
                            backgroundColor: "#f1f1f1", // Indicate it's not editable
                            boxSizing: "border-box",
                          }}
                          readOnly
                        />
                        <div style={{ fontSize: "12px", color: "#6a6a8a", marginTop: "8px" }}>
                          Email cannot be changed.
                        </div>
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr", // Two columns for major and semester
                          gap: "20px",
                          marginBottom: "10px", // Reduced bottom margin as it's inside a section
                        }}
                      >
                        <div> {/* Removed marginBottom: "20px" from here */}
                          <label
                            htmlFor="major"
                            style={{
                              display: "block",
                              marginBottom: "8px",
                              color: "#4a4a6a",
                              fontSize: "14px",
                              fontWeight: "500",
                            }}
                          >
                            Major
                          </label>
                          <select
                            id="major"
                            name="major"
                            value={selectedMajor}
                            onChange={(e) => setSelectedMajor(e.target.value)}
                            style={{
                              width: "100%",
                              padding: "12px 15px",
                              border: "1px solid #ddd",
                              borderRadius: "6px",
                              fontSize: "14px",
                              color: "#4a4a6a",
                              backgroundColor: "white",
                              boxSizing: "border-box",
                            }}
                          >
                            <option value="">Select a major</option>
                            <option value="MET">MET</option>
                            <option value="IET">IET</option>
                            <option value="Mechatronics">Mechatronics</option>
                            <option value="Business Informatics">Business Informatics</option>
                            <option value="Pharmacy">Pharmacy</option>
                            <option value="CS">Computer Science</option> {/* Added one more */}
                          </select>
                        </div>

                        <div> {/* Removed marginBottom: "20px" from here */}
                          <label
                            htmlFor="semester"
                            style={{
                              display: "block",
                              marginBottom: "8px",
                              color: "#4a4a6a",
                              fontSize: "14px",
                              fontWeight: "500",
                            }}
                          >
                            Semester
                          </label>
                          <select
                            id="semester"
                            name="semester"
                            value={selectedSemester}
                            onChange={(e) => setSelectedSemester(e.target.value)}
                            style={{
                              width: "100%",
                              padding: "12px 15px",
                              border: "1px solid #ddd",
                              borderRadius: "6px",
                              fontSize: "14px",
                              color: "#4a4a6a",
                              backgroundColor: "white",
                              boxSizing: "border-box",
                            }}
                          >
                            <option value="">Select semester</option>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                              <option key={num} value={num}>
                                Semester {num}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Career Interests Edit Section */}
                    <div
                      style={{
                        backgroundColor: "#f9f9fa",
                        borderRadius: "8px",
                        padding: "25px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                      }}
                    >
                      <h3
                        style={{
                          margin: "0 0 20px 0",
                          color: "#4a4a6a",
                          fontSize: "18px",
                          borderBottom: "1px solid #eee",
                          paddingBottom: "10px",
                        }}
                      >
                        Edit Career Interests
                      </h3>

                      <div style={{ marginBottom: "20px" }}>
                        <label
                          htmlFor="jobInterests"
                          style={{
                            display: "block",
                            marginBottom: "8px",
                            color: "#4a4a6a",
                            fontSize: "14px",
                            fontWeight: "500",
                          }}
                        >
                          Job Interests (comma-separated or one per line)
                        </label>
                        <textarea
                          id="jobInterests"
                          name="jobInterests"
                          value={draftProfile.jobInterests}
                          onChange={handleDraftChange}
                          style={{
                            width: "100%",
                            padding: "12px 15px",
                            border: "1px solid #ddd",
                            borderRadius: "6px",
                            fontSize: "14px",
                            color: "#4a4a6a",
                            minHeight: "100px",
                            resize: "vertical",
                            boxSizing: "border-box",
                          }}
                          placeholder="e.g., Software Development, Data Analysis, Project Management"
                        />
                      </div>

                      <div style={{ marginBottom: "20px" }}> {/* Consistent margin for last item in section */}
                        <label
                          htmlFor="industry"
                          style={{
                            display: "block",
                            marginBottom: "8px",
                            color: "#4a4a6a",
                            fontSize: "14px",
                            fontWeight: "500",
                          }}
                        >
                          Preferred Industry
                        </label>
                        <input
                          id="industry"
                          type="text"
                          name="industry"
                          value={draftProfile.industry}
                          onChange={handleDraftChange}
                          style={{
                            width: "100%",
                            padding: "12px 15px",
                            border: "1px solid #ddd",
                            borderRadius: "6px",
                            fontSize: "14px",
                            color: "#4a4a6a",
                            boxSizing: "border-box",
                          }}
                          placeholder="e.g., Technology, Finance, Healthcare"
                        />
                      </div>
                    </div>
                    
                    {/* Experience Edit Section */}
                    <div
                      style={{
                        backgroundColor: "#f9f9fa",
                        borderRadius: "8px",
                        padding: "25px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                      }}
                    >
                      <h3
                        style={{
                          margin: "0 0 20px 0",
                          color: "#4a4a6a",
                          fontSize: "18px",
                          borderBottom: "1px solid #eee",
                          paddingBottom: "10px",
                        }}
                      >
                        Edit Experience & Activities
                      </h3>

                      <div style={{ marginBottom: "20px" }}>
                        <label
                          htmlFor="internships"
                          style={{
                            display: "block",
                            marginBottom: "8px",
                            color: "#4a4a6a",
                            fontSize: "14px",
                            fontWeight: "500",
                          }}
                        >
                          Previous Internships (Details, one per line recommended)
                        </label>
                        <textarea
                          id="internships"
                          name="internships"
                          value={draftProfile.internships}
                          onChange={handleDraftChange}
                          style={{
                            width: "100%",
                            padding: "12px 15px",
                            border: "1px solid #ddd",
                            borderRadius: "6px",
                            fontSize: "14px",
                            color: "#4a4a6a",
                            minHeight: "120px",
                            resize: "vertical",
                            boxSizing: "border-box",
                          }}
                          placeholder="e.g., Web Dev Intern at TechCorp (Summer 2024) - Built UI components using React."
                        />
                      </div>

                      <div style={{ marginBottom: "20px" }}>
                        <label
                          htmlFor="partTimeJobs"
                          style={{
                            display: "block",
                            marginBottom: "8px",
                            color: "#4a4a6a",
                            fontSize: "14px",
                            fontWeight: "500",
                          }}
                        >
                          Part-time Jobs (Details, one per line recommended)
                        </label>
                        <textarea
                          id="partTimeJobs"
                          name="partTimeJobs"
                          value={draftProfile.partTimeJobs}
                          onChange={handleDraftChange}
                          style={{
                            width: "100%",
                            padding: "12px 15px",
                            border: "1px solid #ddd",
                            borderRadius: "6px",
                            fontSize: "14px",
                            color: "#4a4a6a",
                            minHeight: "120px",
                            resize: "vertical",
                            boxSizing: "border-box",
                          }}
                          placeholder="e.g., Barista at CoffeeShop (2023-Present) - Customer service, cash handling."
                        />
                      </div>

                      <div style={{ marginBottom: "20px" }}> {/* Consistent margin for last item in section */}
                        <label
                          htmlFor="collegeActivities"
                          style={{
                            display: "block",
                            marginBottom: "8px",
                            color: "#4a4a6a",
                            fontSize: "14px",
                            fontWeight: "500",
                          }}
                        >
                          College Activities/Clubs (one per line recommended)
                        </label>
                        <textarea
                          id="collegeActivities"
                          name="collegeActivities"
                          value={draftProfile.collegeActivities}
                          onChange={handleDraftChange}
                          style={{
                            width: "100%",
                            padding: "12px 15px",
                            border: "1px solid #ddd",
                            borderRadius: "6px",
                            fontSize: "14px",
                            color: "#4a4a6a",
                            minHeight: "100px",
                            resize: "vertical",
                            boxSizing: "border-box",
                          }}
                          placeholder="e.g., President of Coding Club, Volunteer Tutor"
                        />
                      </div>

                      {/* Action Buttons for Edit Mode */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: "15px",
                          marginTop: "30px", // Space above buttons
                          paddingTop: "20px", // Additional space, visual separation
                          borderTop: "1px solid #eee" // Separator line
                        }}
                      >
                        <button
                          onClick={handleCancelEdit}
                          style={{
                            padding: "12px 25px",
                            backgroundColor: "#f1f1f1", // Lighter cancel button
                            color: "#4a4a6a",
                            border: "1px solid #ddd",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "14px",
                            fontWeight: "500",
                            transition: "background-color 0.2s",
                          }}
                          onMouseOver={(e) => (e.target.style.backgroundColor = "#e0e0e0")}
                          onMouseOut={(e) => (e.target.style.backgroundColor = "#f1f1f1")}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveProfile}
                          style={{
                            padding: "12px 25px",
                            backgroundColor: "#4CAF50", // Standard green for save
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "14px",
                            fontWeight: "500",
                            transition: "background-color 0.2s",
                          }}
                          onMouseOver={(e) => (e.target.style.backgroundColor = "#3e9142")}
                          onMouseOut={(e) => (e.target.style.backgroundColor = "#4CAF50")}
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
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
            zIndex: 2000, // Ensure it's above everything
            maxWidth: "300px",
            animation: "fadeIn 0.3s ease-out",
          }}
        >
          {notification.message}
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
            zIndex: 2000, // Ensure it's above everything
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "25px", // Increased padding
              width: "320px", // Slightly wider
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              textAlign: "center", // Center text content
            }}
          >
            <h3
              style={{
                margin: "0 0 15px 0",
                color: "#4a4a6a",
                fontSize: "18px",
                fontWeight: "600",
              }}
            >
              Confirm Logout
            </h3>
            <p
              style={{
                margin: "0 0 25px 0", // Increased margin
                color: "#6a6a8a",
                fontSize: "15px", // Slightly larger
              }}
            >
              Are you sure you want to log out?
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "center", // Center buttons
                gap: "15px", // Increased gap
              }}
            >
              <button
                onClick={() => confirmLogoutAction(false)}
                style={{
                  padding: "10px 20px", // Larger padding
                  backgroundColor: "#f1f1f1",
                  color: "#4a4a6a",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => confirmLogoutAction(true)}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#f44336", // Red for logout confirmation
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
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

export default StudentProfilePage