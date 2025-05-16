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
    // ... other MET courses
  ],
  IET: [
    {
      id: 11,
      code: "IET101",
      title: "Introduction to Industrial Engineering",
      semester: 1,
      description: "Overview of industrial engineering principles and practices.",
    },
    // ... other IET courses
  ],
  Mechatronics: [
    {
      id: 21,
      code: "MTR101",
      title: "Introduction to Mechatronics",
      semester: 1,
      description: "Synergistic integration of mechanics, electronics, and computing.",
    },
    // ... other Mechatronics courses
  ],
  "Business Informatics": [
    {
      id: 31,
      code: "BINF101",
      title: "Introduction to Business Informatics",
      semester: 1,
      description: "Intersection of business processes and information technology.",
    },
    // ... other Business Informatics courses
  ],
  Pharmacy: [
    {
      id: 41,
      code: "PHM101",
      title: "Introduction to Pharmacy",
      semester: 1,
      description: "Overview of the pharmacy profession and pharmaceutical sciences.",
    },
    // ... other Pharmacy courses
  ],
}
// --- END: Added Dummy Course Data ---

// --- START: Dummy Company Data (similar to CompaniesForStudentsPage) ---
const dummyCompaniesData = [
  {
    companyEmail: "techinnovations@example.com",
    companyName: "Tech Innovations Inc.",
    industry: "Technology",
    companySize: "50-200 employees",
    jobs: ["Software Development", "Data Science", "UI/UX Design"],
    description: "A leading tech company focused on innovative solutions.",
  },
  {
    companyEmail: "globalmanufacturing@example.com",
    companyName: "Global Manufacturing Ltd.",
    industry: "Manufacturing",
    companySize: "1000+ employees",
    jobs: [
      { title: "Mechanical Engineering Intern", duration: "3 months", skills: "CAD, Problem-solving" },
      "Supply Chain Management Trainee",
    ],
    description: "A global leader in industrial manufacturing.",
  },
  {
    companyEmail: "creativeagency@example.com",
    companyName: "Creative Agency Pro",
    industry: "Marketing & Advertising",
    companySize: "20-50 employees",
    jobs: [
      "Digital Marketing Specialist",
      { title: "Graphic Design Intern", duration: "6 months", skills: "Adobe Creative Suite" },
      "Content Creator",
    ],
    description: "A vibrant agency specializing in creative campaigns.",
  },
  {
    companyEmail: "healthfirst@example.com",
    companyName: "HealthFirst Group",
    industry: "Healthcare",
    companySize: "500+ employees",
    jobs: ["Research Assistant", "Healthcare Administration"],
    description: "Committed to providing quality healthcare services.",
  },
  {
    companyEmail: "greenearth@example.com",
    companyName: "Green Earth Solutions",
    industry: "Environmental Science", // Matched to student profile for testing
    companySize: "10-30 employees",
    jobs: ["Environmental Consulting Intern", "Sustainability Research Fellow"],
    description: "Dedicated to creating a sustainable future.",
  },
]
// --- END: Dummy Company Data ---

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
  const [notificationContent, setNotificationContent] = useState({ show: false, message: "", type: "" }) // Renamed to avoid conflict
  const [confirmLogout, setConfirmLogout] = useState(false)

  // Student specific states
  const [selectedMajorForCourses, setSelectedMajorForCourses] = useState("") // Renamed for clarity
  const [selectedSemesterForCourses, setSelectedSemesterForCourses] = useState("") // Renamed for clarity
  // No need for showProfile, isEditingProfile here if StudentProfilePage handles it
  const [showCompaniesView, setShowCompaniesView] = useState(false) // To show companies section
  const [showMyInternshipsView, setShowMyInternshipsView] = useState(false) // To show my internships section
  const [showCoursesView, setShowCoursesView] = useState(false) // To show courses section

  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [viewedNotifications, setViewedNotifications] = useState([])
  const [error, setError] = useState(null)

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    jobInterests: "",
    industry: "", // Make sure this can be set in profile for filter to work
    internships: "",
    partTimeJobs: "",
    collegeActivities: "",
    major: "",
    semester: "",
  })
  // draftProfile is not directly used in this page if editing is on StudentProfilePage

  const student = location.state?.user ||
    location.state?.studentj ||
    location.state?.student || { email: "default@example.com" } // Default for safety

  const profileKey = student?.email ? `studentProfile_${student.email}` : "studentProfile_default"
  const viewedNotificationsKey = student?.email ? `viewedNotifications_${student.email}` : "viewedNotifications_default"

  // --- START: Company Filtering States and Logic ---
  const [allCompaniesForFiltering, setAllCompaniesForFiltering] = useState([])
  const [filteredCompaniesList, setFilteredCompaniesList] = useState([])
  const [showFilteredCompanies, setShowFilteredCompanies] = useState(false)
  const [showRecommendedCompanies, setShowRecommendedCompanies] = useState(false)
  // --- END: Company Filtering States and Logic ---

  // Initialize companies from localStorage or use dummy data
  useEffect(() => {
    try {
      const storedCompanies = localStorage.getItem("companies")
      if (storedCompanies) {
        setAllCompaniesForFiltering(JSON.parse(storedCompanies))
      } else {
        localStorage.setItem("companies", JSON.stringify(dummyCompaniesData))
        setAllCompaniesForFiltering(dummyCompaniesData)
        console.log("Initialized localStorage 'companies' with dummy data.")
      }
    } catch (e) {
      console.error("Error handling companies in localStorage:", e)
      setAllCompaniesForFiltering(dummyCompaniesData) // Fallback
    }
  }, [])

  const allUsers = JSON.parse(localStorage.getItem("allUsers")) || []
  const s = allUsers.find((user) => user.email === student.email)
  const studentrole = s?.role // Added optional chaining for safety

  const dashboardCards = [
    {
      title: "Available Courses",
      count: profile.major ? majorCourses[profile.major]?.length || 0 : Object.values(majorCourses).flat().length,
      icon: "📚",
      color: "#d5c5f7",
      action: () => handleCoursesClick(),
    },
    {
      title: "Companies & Opportunities",
      count: allCompaniesForFiltering.length, // Show total companies
      icon: "🏢",
      color: "#c5d5f7", // Different color
      action: () => handleCompaniesClick(),
    },
    {
      title: "Active Applications",
      count: 0, // Placeholder
      icon: "📝",
      color: "#c5e8f7",
      action: () => handleMyApplicationsClick(),
    },
  ]

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

  useEffect(() => {
    setLoading(true)
    try {
      const savedProfile = localStorage.getItem(profileKey)
      const initialProfile = savedProfile
        ? JSON.parse(savedProfile)
        : {
            name: student?.name || "Student User", // Use student.name if available
            email: student?.email || "default@example.com",
            jobInterests: "",
            industry: "", // Example: "Environmental Science" to test filter
            internships: "",
            partTimeJobs: "",
            collegeActivities: "",
            major: "",
            semester: "",
          }
      setProfile(initialProfile)
      setSelectedMajorForCourses(initialProfile.major || "")
      setSelectedSemesterForCourses(initialProfile.semester || "")

      setTimeout(() => {
        setLoading(false)
        showAppNotification("Welcome to Student Portal", "info")
      }, 800)
    } catch (err) {
      setError("Failed to load profile data. Please try again.")
      setLoading(false)
    }
  }, [student?.email, student?.name, profileKey])

  useEffect(() => {
    if (student?.email) {
      const interval = setInterval(() => {
        try {
          const newNotifications = getNotification(student.email) || []
          if (JSON.stringify(newNotifications) !== JSON.stringify(notifications)) {
            setNotifications(newNotifications)
          }
        } catch (err) {
          console.error("Error fetching notifications:", err)
        }
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [student?.email, notifications])

  const unreadNotifications = notifications.filter((n) => !viewedNotifications.includes(n.id))

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
    // Renamed
    setNotificationContent({ show: true, message, type })
    setTimeout(() => setNotificationContent({ show: false, message: "", type: "" }), 3000)
  }

  const resetViews = () => {
    setShowCoursesView(false)
    setShowCompaniesView(false)
    setShowMyInternshipsView(false)
  }

  const handleHomeClick = () => {
    resetViews()
    setActiveSection("dashboard")
    showAppNotification("Welcome to your dashboard!", "success")
  }

  const handleProfileClick = () => {
    resetViews()
    // Navigation to a separate profile page is good
    navigate("/studentprofile", { state: { student } })
    // setActiveSection("profile") // Set on StudentProfilePage if needed
    showAppNotification("Navigating to profile page...", "info")
  }

  const handleCoursesClick = () => {
    resetViews()
    setShowCoursesView(true)
    setActiveSection("courses")
    showAppNotification("Viewing available courses", "info")
  }

  const handleBrowseJobsClick = () => {
    resetViews()
    setActiveSection("jobs")
    navigate("/studentjobs", { state: { student } })
    showAppNotification("Navigating to jobs page...", "info")
  }

  const handleMyApplicationsClick = () => {
    resetViews()
    setActiveSection("applications")
    navigate("/studentapplications", { state: { student } })
    showAppNotification("Navigating to applications page...", "info")
  }

  const handleMyInternshipsClick = () => {
    resetViews()
    // setShowMyInternshipsView(true); // Keep if you want to display internships here
    setActiveSection("internships")
    navigate("/myinternships", { state: { student } }) // Or display content here
    showAppNotification("Navigating to internships page...", "info")
  }

  const handleCompaniesClick = () => {
    resetViews()
    setShowCompaniesView(true) // This will make the companies section visible
    setActiveSection("companies")
    showAppNotification("Browsing companies...", "info")
     navigate("/companiesforstudents", { state: { student } })
    // No navigation, companies will be shown within this page
  }

  // --- START: Company Filter Functions (adapted from CompaniesForStudentsPage) ---
  const handleFilterCompaniesListClick = () => {
    if (!profile.jobInterests && !profile.industry) {
      alert("Please update your profile with your job interests or industry to use the filter.")
      return
    }

    const interestedJobsRaw = profile.jobInterests || ""
    const interestedJobs = interestedJobsRaw
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean)
    const studentIndustry = (profile.industry || "").toLowerCase().trim()

    const filtered = allCompaniesForFiltering.filter((company) => {
      // Process company jobs data
      const companyJobs = Array.isArray(company.jobs)
        ? company.jobs.flatMap((job) => {
            if (typeof job === "string") {
              return job.toLowerCase()
            } else if (job && typeof job === "object") {
              // Extract both title and skills if available
              const jobData = []
              if (job.title) jobData.push(job.title.toLowerCase())
              if (job.skills) {
                const skillsList = job.skills.toLowerCase().split(",")
                jobData.push(...skillsList.map((s) => s.trim()))
              }
              return jobData
            }
            return ""
          })
        : typeof company.jobs === "string"
          ? company.jobs.split(",").map((job) => job.trim().toLowerCase())
          : []

      const companyIndustry = (company.industry || "").toLowerCase().trim()
      const companyDescription = (company.description || "").toLowerCase().trim()

      // Check for job interest matches (more flexible matching)
      const hasJobMatch =
        interestedJobs.length > 0
          ? interestedJobs.some((interest) =>
              companyJobs.some(
                (job) => job.includes(interest) || (Array.isArray(job) && job.some((j) => j.includes(interest))),
              ),
            )
          : true

      // Check for industry match
      const isIndustryMatch = studentIndustry
        ? companyIndustry.includes(studentIndustry) ||
          (companyDescription && companyDescription.includes(studentIndustry))
        : true

      // Return companies that match either job interests OR industry
      return hasJobMatch || isIndustryMatch
    })

    setFilteredCompaniesList(filtered)
    setShowFilteredCompanies(true)

    // Show a notification about the filter results
    if (filtered.length === 0) {
      showAppNotification("No companies match your profile. Try updating your interests.", "info")
    } else {
      showAppNotification(`Found ${filtered.length} companies matching your profile!`, "success")
    }
  }

  const handleShowRecommendedCompanies = () => {
    // This would normally fetch from a database
    // For demo purposes, we'll just filter to show 2-3 companies as "recommended"
    const recommendedCompanies = allCompaniesForFiltering.filter((_, index) => [0, 2, 4].includes(index))
    setFilteredCompaniesList(recommendedCompanies)
    setShowFilteredCompanies(true)
    setShowRecommendedCompanies(true)
    showAppNotification("Showing companies recommended by other interns", "success")
  }

  const handleShowAllCompaniesClick = () => {
    setShowFilteredCompanies(false)
    setFilteredCompaniesList([])
    setShowRecommendedCompanies(false)
  }
  // --- END: Company Filter Functions ---

  const handleSettingsClick = () => {
    resetViews()
    setActiveSection("settings")
    showAppNotification("Settings page coming soon!", "info")
  }

  const handleBellClick = () => {
    if (student?.email) {
      const fetchedNotifications = getNotification(student.email) || []
      setNotifications(fetchedNotifications)
      setIsPopupOpen((prev) => !prev)
      if (!isPopupOpen) {
        setNotificationContent({ show: false, message: "", type: "" })
        const notificationIds = fetchedNotifications.map((n) => n.id)
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
    if (student?.email) clearNotifications(student.email)
    setNotifications([])
    setIsPopupOpen(false)
  }

  const handleAppointmentsClick = () => {
    resetViews()
    setActiveSection("appointments")
    navigate("/appointments", { state: { student } })
  }

  const handleAssessmentsClick = () => {
    resetViews()
    setActiveSection("assessments")
    navigate("/online-assessments", { state: { student } })
  }

  const handleWorkshopsClick = () => {
    resetViews()
    setActiveSection("workshops")
    navigate("/studentworkshops", { state: { student } })
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
                {profile.name ? profile.name.charAt(0).toUpperCase() : "S"}
              </div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: "bold", color: "#4a4a6a" }}>
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
            Student Portal
          </h1>
          <div style={{ display: "flex", alignItems: "center", marginLeft: "20px" }}>
            <span style={{ color: "#6a6a8a", fontSize: "14px", cursor: "pointer" }} onClick={handleHomeClick}>
              Home
            </span>
            {activeSection !== "dashboard" && (
              <>
                <span style={{ margin: "0 8px", color: "#6a6a8a" }}>/</span>
                <span style={{ color: "#4a4a6a", fontSize: "14px", fontWeight: "bold" }}>
                  {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
                </span>
              </>
            )}
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

        <div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
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
              {activeSection === "dashboard" && (
                <>
                  <div
                    style={{
                      backgroundColor: "white",
                      borderRadius: "8px",
                      padding: "20px",
                      marginBottom: "20px",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                    }}
                  >
                    <h2 style={{ margin: "0 0 10px 0", color: "#4a4a6a", fontSize: "22px" }}>
                      Welcome, {profile.name || "Student"}!
                    </h2>
                    <p style={{ margin: "0", color: "#6a6a8a", lineHeight: "1.5" }}>
                      This is your dashboard. Manage courses, browse companies, track applications, and access student
                      resources.
                    </p>
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                      gap: "20px",
                      marginBottom: "20px",
                    }}
                  >
                    {dashboardCards.map((card, index) => (
                      <div
                        key={index}
                        style={{
                          backgroundColor: card.color || "white",
                          borderRadius: "12px",
                          padding: "25px",
                          boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
                          cursor: "pointer",
                          transition: "transform 0.2s, box-shadow 0.2s",
                          position: "relative",
                          overflow: "hidden",
                          border: "1px solid rgba(0,0,0,0.05)",
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
                        <div style={{ fontSize: "40px", marginBottom: "10px", color: "rgba(0,0,0,0.6)" }}>
                          {card.icon}
                        </div>
                        <div style={{ fontSize: "32px", fontWeight: "bold", color: "#4a4a6a", marginBottom: "5px" }}>
                          {card.count}
                        </div>
                        <div style={{ fontSize: "16px", color: "#5a5a7a", fontWeight: "500" }}>{card.title}</div>
                      </div>
                    ))}
                  </div>
                  <div
                    style={{
                      backgroundColor: "white",
                      borderRadius: "8px",
                      padding: "20px",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                    }}
                  >
                    <h2 style={{ margin: "0 0 20px 0", color: "#4a4a6a", fontSize: "18px" }}>Recent Activities</h2>
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
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
                              <td style={{ padding: "12px 15px", borderBottom: "1px solid #eee", color: "#6a6a8a" }}>
                                {activity.activity}
                              </td>
                              <td style={{ padding: "12px 15px", borderBottom: "1px solid #eee", color: "#6a6a8a" }}>
                                {activity.date}
                              </td>
                              <td style={{ padding: "12px 15px", borderBottom: "1px solid #eee" }}>
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

              {showCoursesView && (
                <div
                  style={{
                    backgroundColor: "white",
                    borderRadius: "8px",
                    padding: "20px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                  }}
                >
                  <h2 style={{ margin: "0 0 20px 0", color: "#4a4a6a", fontSize: "22px" }}>
                    Available Courses for {profile.major || "Your Major"}
                  </h2>
                  {profile.major && majorCourses[profile.major] ? (
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
                                  value={selectedSemesterForCourses}
                                  onChange={(e) => setSelectedSemesterForCourses(e.target.value)}
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
                                  {[...new Set(coursesForMajor.map((c) => c.semester))]
                                    .sort((a, b) => a - b)
                                    .map((sem) => (
                                      <option key={sem} value={sem}>
                                        Semester {sem}
                                      </option>
                                    ))}
                                </select>
                              </div>
                            </div>
                            <div
                              style={{
                                display: "grid",
                                gap: "15px",
                                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                              }}
                            >
                              {coursesForMajor
                                .filter(
                                  (course) =>
                                    !selectedSemesterForCourses ||
                                    course.semester.toString() === selectedSemesterForCourses,
                                )
                                .map((course) => (
                                  <div
                                    key={course.id}
                                    style={{
                                      backgroundColor: "#f9f9fc",
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
                                    <p style={{ margin: "0 0 8px 0", color: "#6a6a8a", fontSize: "14px" }}>
                                      <strong>Semester:</strong> {course.semester}
                                    </p>
                                    <p style={{ margin: "0", color: "#6a6a8a", fontSize: "14px", lineHeight: "1.5" }}>
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
                            <p style={{ fontSize: "16px", color: "#6a6a8a", marginBottom: "20px" }}>
                              No courses listed for {profile.major}.
                            </p>
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
                      <p style={{ fontSize: "16px", color: "#6a6a8a", marginBottom: "20px" }}>
                        Please select a major in your profile to view courses.
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

              {/* --- START: Companies Section with Filter --- */}
              {showCompaniesView && (
                <div
                  style={{
                    backgroundColor: "white",
                    borderRadius: "8px",
                    padding: "20px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "24px",
                    }}
                  >
                    <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "#1e293b" }}>
                      Companies & Opportunities
                    </h2>
                    <div
                      style={{
                        fontSize: "14px",
                        color: "#64748b",
                        backgroundColor: "#f8fafc",
                        padding: "4px 10px",
                        borderRadius: "4px",
                      }}
                    >
                      {showFilteredCompanies
                        ? `Showing ${filteredCompaniesList.length} companies`
                        : `Showing all ${allCompaniesForFiltering.length} companies`}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "20px" }}>
                    <button
                      onClick={handleFilterCompaniesListClick}
                      style={{
                        padding: "10px 16px",
                        backgroundColor: "#6b46c1",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "500",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        transition: "background-color 0.2s",
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#553c9a")}
                      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#6b46c1")}
                      disabled={loading}
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
                        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                      </svg>
                      Filter Based on My Profile
                    </button>

                    <button
                      onClick={handleShowRecommendedCompanies}
                      style={{
                        padding: "10px 16px",
                        backgroundColor: showRecommendedCompanies ? "#e9d8fd" : "white",
                        color: "#6b46c1",
                        border: "1px solid #6b46c1",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "500",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        transition: "all 0.2s",
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = "#e9d8fd"
                        e.currentTarget.style.borderColor = "#553c9a"
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = showRecommendedCompanies ? "#e9d8fd" : "white"
                        e.currentTarget.style.borderColor = "#6b46c1"
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
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                      Intern Recommendations
                    </button>

                    {showFilteredCompanies && (
                      <button
                        onClick={handleShowAllCompaniesClick}
                        style={{
                          padding: "10px 16px",
                          backgroundColor: "white",
                          color: "#64748b",
                          border: "1px solid #e2e8f0",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "14px",
                          fontWeight: "500",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          transition: "all 0.2s",
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = "#f8fafc"
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = "white"
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
                          <line x1="8" y1="6" x2="21" y2="6"></line>
                          <line x1="8" y1="12" x2="21" y2="12"></line>
                          <line x1="8" y1="18" x2="21" y2="18"></line>
                          <line x1="3" y1="6" x2="3.01" y2="6"></line>
                          <line x1="3" y1="12" x2="3.01" y2="12"></line>
                          <line x1="3" y1="18" x2="3.01" y2="18"></line>
                        </svg>
                        Show All Companies
                      </button>
                    )}
                  </div>

                  <div
                    style={{
                      backgroundColor: "white",
                      borderRadius: "8px",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                      overflow: "hidden",
                      border: "1px solid #e2e8f0",
                      marginBottom: "30px",
                    }}
                  >
                    {(showFilteredCompanies ? filteredCompaniesList : allCompaniesForFiltering).length > 0 ? (
                      (showFilteredCompanies ? filteredCompaniesList : allCompaniesForFiltering).map(
                        (company, index) => (
                          <div
                            key={index}
                            style={{
                              padding: "20px",
                              borderBottom:
                                index <
                                (showFilteredCompanies ? filteredCompaniesList : allCompaniesForFiltering).length - 1
                                  ? "1px solid #e2e8f0"
                                  : "none",
                              transition: "background-color 0.2s",
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "white")}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                marginBottom: "15px",
                              }}
                            >
                              <div>
                                <h3
                                  style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: "600", color: "#1e293b" }}
                                >
                                  {company.companyName}
                                </h3>
                                <div
                                  style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: "15px",
                                    fontSize: "14px",
                                    color: "#64748b",
                                  }}
                                >
                                  <div>
                                    <strong style={{ color: "#334155" }}>Email:</strong> {company.companyEmail}
                                  </div>
                                  <div>
                                    <strong style={{ color: "#334155" }}>Industry:</strong> {company.industry}
                                  </div>
                                  <div>
                                    <strong style={{ color: "#334155" }}>Size:</strong> {company.companySize}
                                  </div>
                                </div>
                              </div>
                              <button
                                style={{
                                  backgroundColor: "#e9d8fd",
                                  color: "#6b46c1",
                                  border: "none",
                                  borderRadius: "4px",
                                  padding: "8px 12px",
                                  fontSize: "13px",
                                  fontWeight: "500",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "6px",
                                  transition: "all 0.2s",
                                }}
                                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#d6bcfa")}
                                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#e9d8fd")}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                  <circle cx="8.5" cy="7" r="4"></circle>
                                  <polyline points="17 11 19 13 23 9"></polyline>
                                </svg>
                                Apply Now
                              </button>
                            </div>

                            <div
                              style={{
                                backgroundColor: "#f8fafc",
                                borderRadius: "6px",
                                padding: "15px",
                                marginTop: "10px",
                              }}
                            >
                              <h4
                                style={{
                                  margin: "0 0 12px 0",
                                  fontSize: "15px",
                                  fontWeight: "600",
                                  color: "#334155",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="#6b46c1"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                                  <line x1="12" y1="22.08" x2="12" y2="12"></line>
                                </svg>
                                Jobs/Internships Offered
                              </h4>

                              {Array.isArray(company.jobs) && company.jobs.length > 0 ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                  {company.jobs.map((job, jobIndex) => (
                                    <div
                                      key={jobIndex}
                                      style={{
                                        padding: "10px 15px",
                                        backgroundColor: "white",
                                        borderRadius: "4px",
                                        border: "1px solid #e2e8f0",
                                        fontSize: "14px",
                                        color: "#334155",
                                      }}
                                    >
                                      {typeof job === "object" && job !== null ? (
                                        <>
                                          <div style={{ fontWeight: "600", marginBottom: "4px", color: "#1e293b" }}>
                                            {job.title || "N/A"}
                                          </div>
                                          <div
                                            style={{ display: "flex", flexWrap: "wrap", gap: "10px", fontSize: "13px" }}
                                          >
                                            {job.duration && (
                                              <span
                                                style={{
                                                  backgroundColor: "#e9d8fd",
                                                  color: "#6b46c1",
                                                  padding: "2px 8px",
                                                  borderRadius: "4px",
                                                  fontWeight: "500",
                                                }}
                                              >
                                                {job.duration}
                                              </span>
                                            )}
                                            {job.skills && (
                                              <span
                                                style={{
                                                  backgroundColor: "#f1f5f9",
                                                  color: "#64748b",
                                                  padding: "2px 8px",
                                                  borderRadius: "4px",
                                                }}
                                              >
                                                {job.skills}
                                              </span>
                                            )}
                                          </div>
                                        </>
                                      ) : (
                                        <div>{job}</div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : typeof company.jobs === "string" && company.jobs.trim() !== "" ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                  {company.jobs.split(",").map((job, jobIndex) => (
                                    <div
                                      key={jobIndex}
                                      style={{
                                        padding: "10px 15px",
                                        backgroundColor: "white",
                                        borderRadius: "4px",
                                        border: "1px solid #e2e8f0",
                                        fontSize: "14px",
                                        color: "#334155",
                                      }}
                                    >
                                      {job.trim()}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p style={{ margin: "0", fontSize: "14px", color: "#64748b", fontStyle: "italic" }}>
                                  No specific jobs listed.
                                </p>
                              )}
                            </div>
                          </div>
                        ),
                      )
                    ) : (
                      <div style={{ padding: "40px", textAlign: "center" }}>
                        <div
                          style={{
                            width: "64px",
                            height: "64px",
                            borderRadius: "50%",
                            backgroundColor: "#e9d8fd",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 16px auto",
                          }}
                        >
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#6b46c1"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                          </svg>
                        </div>
                        <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: "600", color: "#1e293b" }}>
                          {showFilteredCompanies ? "No companies match your filter criteria" : "No companies available"}
                        </h3>
                        <p
                          style={{
                            margin: "0",
                            fontSize: "14px",
                            color: "#64748b",
                            maxWidth: "400px",
                            marginLeft: "auto",
                            marginRight: "auto",
                          }}
                        >
                          {showFilteredCompanies
                            ? "Try updating your profile with different interests or industry preferences."
                            : "Check back later for available companies."}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {/* --- END: Companies Section with Filter --- */}

              {showMyInternshipsView && ( // Re-enable if you want this section
                <div
                  style={{
                    backgroundColor: "white",
                    borderRadius: "8px",
                    padding: "20px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                  }}
                >
                  <h2 style={{ margin: "0 0 20px 0", color: "#4a4a6a", fontSize: "22px" }}>My Internships</h2>
                  <div
                    style={{
                      textAlign: "center",
                      padding: "40px 20px",
                      backgroundColor: "#f9f9fa",
                      borderRadius: "8px",
                    }}
                  >
                    <p style={{ fontSize: "16px", color: "#6a6a8a", marginBottom: "20px" }}>
                      You currently have no active internships. Browse available opportunities.
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

      {notificationContent.show && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            backgroundColor:
              notificationContent.type === "success"
                ? "rgba(76, 175, 80, 0.9)"
                : notificationContent.type === "error"
                  ? "rgba(244, 67, 54, 0.9)"
                  : "rgba(33, 150, 243, 0.9)",
            color: "white",
            padding: "12px 20px",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            zIndex: 2000,
            maxWidth: "300px",
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
              borderRadius: "8px",
              padding: "25px",
              width: "320px",
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

export default StudentPage
