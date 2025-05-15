"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { getNotification, clearNotifications } from "./notification" // Assuming this file exists

// --- START: Added Dummy Course Data ---
const majorCourses = {
  MET: [
    {
      id: 1,
      code: "MET101",
      title: "Introduction to Mechanical Engineering",
      semester: 1,
      description: "Fundamentals of mechanical systems, materials, and thermodynamics.",
    },
    {
      id: 2,
      code: "MET201",
      title: "Thermodynamics I",
      semester: 3,
      description: "Basic principles of energy conversion and heat transfer.",
    },
    {
      id: 3,
      code: "MET305",
      title: "Fluid Mechanics",
      semester: 5,
      description: "Behavior of fluids at rest and in motion.",
    },
    {
      id: 4,
      code: "MET410",
      title: "Machine Design",
      semester: 7,
      description: "Design and analysis of machine components.",
    },
  ],
  IET: [
    {
      id: 11,
      code: "IET101",
      title: "Introduction to Industrial Engineering",
      semester: 1,
      description: "Overview of industrial engineering principles and practices.",
    },
    {
      id: 12,
      code: "IET205",
      title: "Operations Research I",
      semester: 4,
      description: "Introduction to optimization techniques and modeling.",
    },
    {
      id: 13,
      code: "IET315",
      title: "Work Systems Design",
      semester: 6,
      description: "Analysis and design of efficient work processes.",
    },
    {
      id: 14,
      code: "IET420",
      title: "Supply Chain Management",
      semester: 8,
      description: "Planning and management of supply chain activities.",
    },
  ],
  Mechatronics: [
    {
      id: 21,
      code: "MTR101",
      title: "Introduction to Mechatronics",
      semester: 1,
      description: "Synergistic integration of mechanics, electronics, and computing.",
    },
    {
      id: 22,
      code: "MTR210",
      title: "Digital Logic Design",
      semester: 3,
      description: "Fundamentals of digital circuits and systems.",
    },
    {
      id: 23,
      code: "MTR320",
      title: "Control Systems",
      semester: 5,
      description: "Analysis and design of feedback control systems.",
    },
    {
      id: 24,
      code: "MTR430",
      title: "Robotics",
      semester: 7,
      description: "Kinematics, dynamics, and control of robotic manipulators.",
    },
  ],
  "Business Informatics": [
    {
      id: 31,
      code: "BINF101",
      title: "Introduction to Business Informatics",
      semester: 1,
      description: "Intersection of business processes and information technology.",
    },
    {
      id: 32,
      code: "BINF220",
      title: "Database Management Systems",
      semester: 4,
      description: "Design, implementation, and management of databases.",
    },
    {
      id: 33,
      code: "BINF330",
      title: "Enterprise Resource Planning (ERP)",
      semester: 6,
      description: "Concepts and application of ERP systems in business.",
    },
    {
      id: 34,
      code: "BINF440",
      title: "Business Intelligence & Analytics",
      semester: 8,
      description: "Using data for business decision-making.",
    },
  ],
  Pharmacy: [
    {
      id: 41,
      code: "PHM101",
      title: "Introduction to Pharmacy",
      semester: 1,
      description: "Overview of the pharmacy profession and pharmaceutical sciences.",
    },
    {
      id: 42,
      code: "PHM210",
      title: "Organic Chemistry for Pharmacy",
      semester: 3,
      description: "Fundamental organic chemistry principles relevant to drugs.",
    },
    {
      id: 43,
      code: "PHM315",
      title: "Pharmacology I",
      semester: 5,
      description: "Study of drug actions and their effects on the body.",
    },
    {
      id: 44,
      code: "PHM425",
      title: "Pharmaceutics I",
      semester: 7,
      description: "Principles of drug formulation and delivery systems.",
    },
  ],
}
// --- END: Added Dummy Course Data ---

// Sample recent activities data
const recentActivities = [
  { id: 1, activity: "Viewed available courses", date: "Today, 10:30 AM", status: "Completed" },
  { id: 2, activity: "Updated profile information", date: "Yesterday, 2:15 PM", status: "Completed" },
  { id: 3, activity: "Applied for Software Developer Internship", date: "May 15, 2023", status: "Pending" },
]

function StudentPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("dashboard")
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState({ show: false, message: "", type: "" })
  const [confirmLogout, setConfirmLogout] = useState(false)

  // Student specific states
  const [selectedMajor, setSelectedMajor] = useState("")
  const [selectedSemester, setSelectedSemester] = useState("")
  const [showProfile, setShowProfile] = useState(false)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [showCompanies, setShowCompanies] = useState(false)
  const [showmyinternships, setshowmyinternships] = useState(false)
  const [showCourses, setShowCourses] = useState(false)
  const companies = JSON.parse(localStorage.getItem("companies")) || []
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [viewedNotifications, setViewedNotifications] = useState([])
  const [error, setError] = useState(null)

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    jobInterests: "",
    industry: "",
    internships: "",
    partTimeJobs: "",
    collegeActivities: "",
    major: "",
    semester: "",
  })
  const [draftProfile, setDraftProfile] = useState({ ...profile })

  // Robust check for student data in location state
  const student = location.state?.user ||
    location.state?.studentj ||
    location.state?.student || { email: "default@example.com" }

  // Use student email for profile key, ensure student exists
  const profileKey = student?.email ? `studentProfile_${student.email}` : "studentProfile_default"

  // Track viewed notifications in local storage
  const viewedNotificationsKey = student?.email ? `viewedNotifications_${student.email}` : "viewedNotifications_default"

  //online assessments scores
  const [showScoresPopup, setShowScoresPopup] = useState(false);
  const [assessmentScores, setAssessmentScores] = useState([]);

  useEffect(() => {
    // Load completed assessments from localStorage
    const savedScores = localStorage.getItem('completedAssessments');
    if (savedScores) {
      setAssessmentScores(JSON.parse(savedScores));
    }
  }, []);

  const showAssessmentScores = () => {
    if (assessmentScores.length === 0) {
      showNotification("You haven't completed any assessments yet!", "info");
    } else {
      setShowScoresPopup(true);
    }
  };


  // Dashboard cards data
  const dashboardCards = [
    {
      title: "Available Courses",
      count: profile.major ? majorCourses[profile.major]?.length || 0 : 0,
      icon: "📚",
      color: "#d5c5f7",
      action: () => handleCoursesClick(),
    },
    {
      title: "Active Applications",
      count: 0,
      icon: "📝",
      color: "#c5e8f7",
      action: () => handleMyApplicationsClick(),
    },
    {
      title: "Statistics Report",
      count: 4,
      icon: "📊",
      color: "#f7d5c5",
      action: () => showNotification("Statistics feature coming soon!", "info"),
    },
      {
    title: "Assessment Scores",
    count: assessmentScores.length,
    icon: "🧪",
    color: "#c5f7d5",
    action: () => showAssessmentScores(),
  },
  ]


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

  // Simulate loading data on component mount
  useEffect(() => {
    setLoading(true)
    try {
      const savedProfile = localStorage.getItem(profileKey)
      const initialProfile = savedProfile
        ? JSON.parse(savedProfile)
        : {
            name: "",
            email: student?.email || "",
            jobInterests: "",
            industry: "",
            internships: "",
            partTimeJobs: "",
            collegeActivities: "",
            major: "",
            semester: "",
          }
      setProfile(initialProfile)
      setDraftProfile(initialProfile)
      setSelectedMajor(initialProfile.major || "")
      setSelectedSemester(initialProfile.semester || "")

      // Simulate API call
      setTimeout(() => {
        setLoading(false)
        showNotification("Welcome to Student Portal", "info")
      }, 800)
    } catch (err) {
      setError("Failed to load profile data. Please try again.")
      setLoading(false)
    }
  }, [student?.email, profileKey])

  // Notification logic
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
  }, [student?.email, notifications])

  // Calculate unread notifications
  const unreadNotifications = notifications.filter((notification) => {
    // Check if this notification ID is not in the viewedNotifications array
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
        navigate("/")
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

  // Navigation handlers
  const handleHomeClick = () => {
    setShowProfile(false)
    setShowCompanies(false)
    setshowmyinternships(false)
    setShowCourses(false)
    setActiveSection("dashboard")
    showNotification("Welcome to your dashboard!", "success")
  }

  const handleProfileClick = () => {
    setShowProfile(false)
    setShowCompanies(false)
    setshowmyinternships(false)
    setShowCourses(false)
    setIsEditingProfile(false)
    navigate("/studentprofile", { state: { student } })
    setActiveSection("profile")
    showNotification("Navigating to profile page...", "info")
  }

  const handleCoursesClick = () => {
    setShowProfile(false)
    setShowCompanies(false)
    setshowmyinternships(false)
    setShowCourses(true)
    setActiveSection("courses")
    showNotification("Viewing available courses for your major", "success")
  }

  const handleBrowseJobsClick = () => {
    setShowProfile(false)
    setShowCompanies(false)
    setshowmyinternships(false)
    setShowCourses(false)
    setActiveSection("jobs")
    navigate("/jobspage", { state: { student } })
    showNotification("Navigating to jobs page...", "info")
  }

  const handleMyApplicationsClick = () => {
    setShowProfile(false)
    setShowCompanies(false)
    setshowmyinternships(false)
    setShowCourses(false)
    setActiveSection("applications")
    navigate("/studentapplications", { state: { student } })
    showNotification("Navigating to applications page...", "info")
  }

  const handleMyInternshipsClick = () => {
    setShowProfile(false)
    setShowCompanies(false)
    setshowmyinternships(false)
    setShowCourses(false)
    navigate("/myinternships", { state: { student } })
    setActiveSection("internships")
    showNotification("Navigating to internships page...", "info")
  }

  const handleCompaniesClick = () => {
    setShowProfile(false)
    setShowCompanies(false)
    setshowmyinternships(false)
    setShowCourses(false)
    setActiveSection("companies")
    navigate("/companiesforstudents", { state: { student } })
    showNotification("Navigating to companies page...", "info")
  }

  const handleSettingsClick = () => {
    setShowProfile(false)
    setShowCompanies(false)
    setshowmyinternships(false)
    setShowCourses(false)
    setActiveSection("settings")
    showNotification("Settings page coming soon!", "info")
  }

  const handleBellClick = () => {
    if (student?.email) {
      const fetchedNotifications = getNotification(student.email) || []
      setNotifications(fetchedNotifications)
      setIsPopupOpen((prev) => !prev)

      // Hide any active notification toast when opening the popup
      if (!isPopupOpen) {
        setNotification({ show: false, message: "", type: "" })

        // Mark all current notifications as viewed
        const notificationIds = fetchedNotifications.map((notification) => notification.id)
        const updatedViewedNotifications = [...new Set([...viewedNotifications, ...notificationIds])]
        setViewedNotifications(updatedViewedNotifications)

        // Save to local storage
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
      clearNotifications(student.email) // clear from storage
    }
    setNotifications([]) // clear from state
    setIsPopupOpen(false) // close popup
  }

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

  const commonItems = [
    { id: "dashboard", label: "Homepage", icon: "🏠", action: handleHomeClick },
    { id: "profile", label: "Profile", icon: "👤", action: handleProfileClick },
    { id: "courses", label: "All Courses", icon: "📚", action: handleCoursesClick },
    { id: "jobs", label: "Browse Jobs", icon: "💼", action: handleBrowseJobsClick },
    { id: "applications", label: "All Applications", icon: "📝", action: handleMyApplicationsClick },
    { id: "internships", label: "My Internships", icon: "🏆", action: handleMyInternshipsClick },
    { id: "companies", label: "Companies", icon: "🏢", action: handleCompaniesClick },
  ]
  const proSpecificItems = [
    { id: "appointments", label: "Appointments", icon: "📅", action: handleAppointmentsClick },
    { id: "assessments", label: "Online Assessments", icon: "📋", action: handleAssessmentsClick },
    { id: "workshops", label: "Workshops", icon: "🔧", action: handleWorkshopsClick }, // Pro gets the detailed workshop link
  ]

  const Sidebar = ({ menuOpen, toggleMenu }) => {
    const sidebarItems = [...commonItems] // Start with common items

    if (student && student.role === "pro") {
      sidebarItems.push(...proSpecificItems)
    }

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
                {profile.name ? profile.name.charAt(0).toUpperCase() : "S"}
              </div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: "bold", color: "#4a4a6a" }}>Student User{student.role === "pro" && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginLeft: "8px",
                      backgroundColor: "#ffd700", // Gold color
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
                )}</div>
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
                  onClick={item.action}
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

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
          gap: "20px",
          padding: "20px",
          textAlign: "center",
          backgroundColor: "#f8f9fa",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            width: "70px",
            height: "70px",
            borderRadius: "50%",
            backgroundColor: "rgba(244, 67, 54, 0.1)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "#f44336",
            fontSize: "40px",
          }}
        >
          !
        </div>
        <h2 style={{ color: "#4a4a6a" }}>Error Loading Dashboard</h2>
        <p style={{ color: "#6a6a8a" }}>{error}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: "10px 20px",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "bold",
          }}
        >
          Try Again
        </button>
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
            <span style={{ color: "#6a6a8a", fontSize: "14px" }}>Home</span>
            {activeSection !== "dashboard" && (
              <>
                <span style={{ margin: "0 8px", color: "#6a6a8a" }}>/</span>
                <span style={{ color: "#4a4a6a", fontSize: "14px", fontWeight: "bold" }}>
                  {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
                </span>
              </>
            )}
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
                            key={index}
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
              {profile.name ? profile.name.charAt(0).toUpperCase() : "S"}
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
                {student.role === "pro" && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginLeft: "8px",
                      backgroundColor: "#ffd700", // Gold color
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
              {/* Dashboard Content */}
              {activeSection === "dashboard" && (
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
                      Welcome to Student Portal
                    </h2>
                    <p
                      style={{
                        margin: "0",
                        color: "#6a6a8a",
                        lineHeight: "1.5",
                      }}
                    >
                      This is your dashboard where you can manage courses, browse jobs, track applications, and access
                      all student resources.
                    </p>
                  </div>

                  {/* Dashboard Cards */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                      gap: "30px",
                      marginBottom: "30px",
                      maxWidth: "1200px",
                      width: "100%",
                    }}
                  >
                    {dashboardCards.map((card, index) => (
                      <div
                        key={index}
                        style={{
                          backgroundColor: "white",
                          borderRadius: "12px",
                          padding: "30px",
                          boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
                          cursor: "pointer",
                          transition: "transform 0.2s, box-shadow 0.2s",
                          position: "relative",
                          overflow: "hidden",
                        }}
                        onClick={card.action}
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform = "translateY(-5px)"
                          e.currentTarget.style.boxShadow = "0 5px 15px rgba(0,0,0,0.1)"
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = "translateY(0)"
                          e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)"
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === "Enter" && card.action()}
                        aria-label={`View ${card.title}`}
                      >
                        <div
                          style={{
                            position: "absolute",
                            top: "0",
                            right: "0",
                            width: "100px",
                            height: "100px",
                            borderRadius: "0 0 0 100px",
                            backgroundColor: card.color,
                            opacity: "0.2",
                          }}
                        ></div>
                        <div
                          style={{
                            fontSize: "48px",
                            marginBottom: "10px",
                          }}
                        >
                          {card.icon}
                        </div>
                        <div
                          style={{
                            fontSize: "38px",
                            fontWeight: "bold",
                            color: "#4a4a6a",
                            marginBottom: "5px",
                          }}
                        >
                          {card.count}
                        </div>
                        <div
                          style={{
                            fontSize: "16px",
                            color: "#6a6a8a",
                          }}
                        >
                          {card.title}
                        </div>
                      </div>
                    ))}
                  </div>
                  {showScoresPopup && (
  <div
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
    }}
    onClick={() => setShowScoresPopup(false)}
  >
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)',
        width: '90%',
        maxWidth: '400px',
        maxHeight: '80vh',
        overflowY: 'auto',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '15px',
          paddingBottom: '10px',
          borderBottom: '1px solid #e6e6fa',
        }}
      >
        <h3
          style={{
            margin: 0,
            color: '#4a4a6a',
            fontSize: '16px',
            fontWeight: '600',
          }}
        >
          Assessment Scores
        </h3>
        <button
          onClick={() => setShowScoresPopup(false)}
          style={{
            background: 'transparent',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            color: '#6a6a8a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
          }}
        >
          &times;
        </button>
      </div>
      <div>
        {assessmentScores.map((assessment, index) => (
          <div
            key={index}
            style={{
              padding: '10px',
              marginBottom: '8px',
              backgroundColor: '#f8f5ff',
              borderRadius: '6px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                fontWeight: '500',
                color: '#4a4a6a',
                fontSize: '14px',
              }}
            >
              {assessment.title}
            </div>
            <div
              style={{
                fontWeight: 'bold',
                color: '#6b46c1',
                fontSize: '16px',
                backgroundColor: '#e9d8fd',
                padding: '4px 10px',
                borderRadius: '12px',
              }}
            >
              {assessment.score.toFixed(0)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)}

                  {/* Recent Activities */}
                  <div
                    style={{
                      backgroundColor: "white",
                      borderRadius: "8px",
                      padding: "20px",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                    }}
                  >
                    <h2
                      style={{
                        margin: "0 0 20px 0",
                        color: "#4a4a6a",
                        fontSize: "18px",
                      }}
                    >
                      Recent Activities
                    </h2>

                    <div style={{ overflowX: "auto" }}>
                      <table
                        style={{
                          width: "100%",
                          borderCollapse: "collapse",
                          fontSize: "14px",
                        }}
                      >
                        <thead>
                          <tr>
                            <th
                              style={{
                                textAlign: "left",
                                padding: "12px 15px",
                                borderBottom: "1px solid #eee",
                                color: "#4a4a6a",
                              }}
                            >
                              Activity
                            </th>
                            <th
                              style={{
                                textAlign: "left",
                                padding: "12px 15px",
                                borderBottom: "1px solid #eee",
                                color: "#4a4a6a",
                              }}
                            >
                              Date
                            </th>
                            <th
                              style={{
                                textAlign: "left",
                                padding: "12px 15px",
                                borderBottom: "1px solid #eee",
                                color: "#4a4a6a",
                              }}
                            >
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentActivities.map((activity) => (
                            <tr key={activity.id}>
                              <td
                                style={{
                                  padding: "12px 15px",
                                  borderBottom: "1px solid #eee",
                                  color: "#6a6a8a",
                                }}
                              >
                                {activity.activity}
                              </td>
                              <td
                                style={{
                                  padding: "12px 15px",
                                  borderBottom: "1px solid #eee",
                                  color: "#6a6a8a",
                                }}
                              >
                                {activity.date}
                              </td>
                              <td
                                style={{
                                  padding: "12px 15px",
                                  borderBottom: "1px solid #eee",
                                }}
                              >
                                <span
                                  style={{
                                    display: "inline-block",
                                    padding: "4px 8px",
                                    borderRadius: "4px",
                                    fontSize: "12px",
                                    fontWeight: "bold",
                                    backgroundColor:
                                      activity.status === "Completed"
                                        ? "rgba(76, 175, 80, 0.1)"
                                        : "rgba(255, 152, 0, 0.1)",
                                    color: activity.status === "Completed" ? "#4CAF50" : "#FF9800",
                                  }}
                                >
                                  {activity.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              {/* Courses Section */}
              {showCourses && (
                <div
                  style={{
                    backgroundColor: "white",
                    borderRadius: "8px",
                    padding: "20px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                  }}
                >
                  <h2
                    style={{
                      margin: "0 0 20px 0",
                      color: "#4a4a6a",
                      fontSize: "22px",
                    }}
                  >
                    Available Courses for {profile.major || "Your Major"}
                  </h2>

                  {profile.major ? (
                    (() => {
                      const coursesForMajor = majorCourses[profile.major] || []
                      if (coursesForMajor.length > 0) {
                        return (
                          <div>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "20px",
                                padding: "10px 15px",
                                backgroundColor: "#f9f9fa",
                                borderRadius: "6px",
                              }}
                            >
                              <div>
                                <span style={{ fontWeight: "bold", color: "#4a4a6a" }}>
                                  Total courses: {coursesForMajor.length}
                                </span>
                              </div>
                              <div>
                                <label htmlFor="semesterFilter" style={{ marginRight: "10px", color: "#6a6a8a" }}>
                                  Filter by semester:
                                </label>
                                <select
                                  id="semesterFilter"
                                  value={selectedSemester}
                                  onChange={(e) => setSelectedSemester(e.target.value)}
                                  style={{
                                    padding: "8px 12px",
                                    borderRadius: "6px",
                                    border: "1px solid #ddd",
                                    backgroundColor: "white",
                                    color: "#4a4a6a",
                                    fontSize: "14px",
                                  }}
                                >
                                  <option value="">All Semesters</option>
                                  <option value="1">Semester 1</option>
                                  <option value="2">Semester 2</option>
                                  <option value="3">Semester 3</option>
                                  <option value="4">Semester 4</option>
                                  <option value="5">Semester 5</option>
                                  <option value="6">Semester 6</option>
                                  <option value="7">Semester 7</option>
                                  <option value="8">Semester 8</option>
                                </select>
                              </div>
                            </div>

                            <div style={{ display: "grid", gap: "15px" }}>
                              {coursesForMajor
                                .filter(
                                  (course) => !selectedSemester || course.semester.toString() === selectedSemester,
                                )
                                .map((course) => (
                                  <div
                                    key={course.id}
                                    style={{
                                      backgroundColor: "white",
                                      borderRadius: "8px",
                                      padding: "15px",
                                      boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                                      border: "1px solid #eee",
                                      transition: "transform 0.2s, box-shadow 0.2s",
                                    }}
                                    onMouseOver={(e) => {
                                      e.currentTarget.style.transform = "translateY(-2px)"
                                      e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)"
                                    }}
                                    onMouseOut={(e) => {
                                      e.currentTarget.style.transform = "translateY(0)"
                                      e.currentTarget.style.boxShadow = "0 2px 5px rgba(0,0,0,0.05)"
                                    }}
                                  >
                                    <h3
                                      style={{
                                        margin: "0 0 10px 0",
                                        color: "#4a4a6a",
                                        fontSize: "16px",
                                        fontWeight: "bold",
                                      }}
                                    >
                                      {course.code} - {course.title}
                                    </h3>
                                    <p
                                      style={{
                                        margin: "0 0 8px 0",
                                        color: "#6a6a8a",
                                        fontSize: "14px",
                                      }}
                                    >
                                      <strong>Semester:</strong> {course.semester}
                                    </p>
                                    <p
                                      style={{
                                        margin: "0",
                                        color: "#6a6a8a",
                                        fontSize: "14px",
                                        lineHeight: "1.5",
                                      }}
                                    >
                                      {course.description}
                                    </p>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )
                      } else {
                        return (
                          <div
                            style={{
                              textAlign: "center",
                              padding: "40px 20px",
                              backgroundColor: "#f9f9fa",
                              borderRadius: "8px",
                            }}
                          >
                            <p
                              style={{
                                fontSize: "16px",
                                color: "#6a6a8a",
                                marginBottom: "20px",
                              }}
                            >
                              No courses listed for the selected major ({profile.major}).
                            </p>
                            <button
                              onClick={handleProfileClick}
                              style={{
                                padding: "10px 20px",
                                backgroundColor: "#6c757d",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "14px",
                                fontWeight: "bold",
                              }}
                            >
                              Update Profile
                            </button>
                          </div>
                        )
                      }
                    })()
                  ) : (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "40px 20px",
                        backgroundColor: "#f9f9fa",
                        borderRadius: "8px",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "16px",
                          color: "#6a6a8a",
                          marginBottom: "20px",
                        }}
                      >
                        Please select a major in your profile to view available courses.
                      </p>
                      <button
                        onClick={handleProfileClick}
                        style={{
                          padding: "10px 20px",
                          backgroundColor: "#6c757d",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "14px",
                          fontWeight: "bold",
                        }}
                      >
                        Update Profile
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* My Internships Section */}
              {showmyinternships && (
                <div
                  style={{
                    backgroundColor: "white",
                    borderRadius: "8px",
                    padding: "20px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                  }}
                >
                  <h2
                    style={{
                      margin: "0 0 20px 0",
                      color: "#4a4a6a",
                      fontSize: "22px",
                    }}
                  >
                    My Internships
                  </h2>
                  <div
                    style={{
                      textAlign: "center",
                      padding: "40px 20px",
                      backgroundColor: "#f9f9fa",
                      borderRadius: "8px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "16px",
                        color: "#6a6a8a",
                        marginBottom: "20px",
                      }}
                    >
                      You currently have no active internships. Browse available opportunities in the Jobs section.
                    </p>
                    <button
                      onClick={handleBrowseJobsClick}
                      style={{
                        padding: "10px 20px",
                        backgroundColor: "#6c757d",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "bold",
                      }}
                    >
                      Find Internships
                    </button>
                  </div>
                </div>
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

export default StudentPage
