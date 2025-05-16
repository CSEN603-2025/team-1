"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"

const CompaniesForStudents = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("companies")
  const [loading, setLoading] = useState(true)
  const [notificationContent, setNotificationContent] = useState({ show: false, message: "", type: "" })
  const [confirmLogout, setConfirmLogout] = useState(false)

  const [companies, setCompanies] = useState([])
  const [filteredCompanies, setFilteredCompanies] = useState([])
  const [showFiltered, setShowFiltered] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [profile, setProfile] = useState({ jobInterests: "", industry: "" })
  const [appliedCompanies, setAppliedCompanies] = useState([])

  // For notifications
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [viewedNotifications, setViewedNotifications] = useState([])
  const [error, setError] = useState(null)

  const student = location.state?.user ||
    location.state?.studentj ||
    location.state?.student || { email: "default@example.com" }

      const allUsers = JSON.parse(localStorage.getItem("allUsers")) || []
  const s = allUsers.find((user) => user.email === student.email)
  const studentrole = s?.role

  const profileKey = student?.email ? `studentProfile_${student.email}` : "studentProfile_default"
  const viewedNotificationsKey = student?.email ? `viewedNotifications_${student.email}` : "viewedNotifications_default"
  const appliedCompaniesKey = student?.email ? `appliedCompanies_${student.email}` : "appliedCompanies_default"

  useEffect(() => {
    // Load applied companies from localStorage
    try {
      const savedAppliedCompanies = localStorage.getItem(appliedCompaniesKey)
      if (savedAppliedCompanies) {
        setAppliedCompanies(JSON.parse(savedAppliedCompanies))
      }
    } catch (err) {
      console.error("Error loading applied companies:", err)
    }

    // Mock data for companies
    const mockCompanies = [
      {
        id: 1,
        companyName: "Tech Innovations Inc.",
        companyEmail: "info@techinnovations.com",
        industry: "Technology",
        companySize: "50-200",
        jobs: [
          { title: "Software Engineer Intern", duration: "3 months", skills: "JavaScript, React" },
          { title: "Data Science Intern", duration: "6 months", skills: "Python, Machine Learning" },
        ],
        description: "A leading tech company focused on AI and machine learning solutions.",
        internRecommendations: 24,
      },
      {
        id: 2,
        companyName: "Green Solutions Ltd.",
        companyEmail: "contact@greensolutions.com",
        industry: "Environmental",
        companySize: "20-80",
        jobs: ["Environmental Consultant", "Research Assistant"],
        description: "Committed to sustainable solutions and environmental conservation.",
        internRecommendations: 15,
      },
      {
        id: 3,
        companyName: "HealthFirst Corp",
        companyEmail: "hr@healthfirst.com",
        industry: "Healthcare",
        companySize: "100-500",
        jobs: [
          { title: "Medical Research Intern", duration: "4 months", skills: "Biology, Chemistry" },
          { title: "Healthcare Data Analyst", skills: "Data Analysis, SQL" },
        ],
        description: "Dedicated to improving healthcare through innovation and research.",
        internRecommendations: 32,
      },
      {
        id: 4,
        companyName: "EduGlobal Services",
        companyEmail: "info@eduglobal.com",
        industry: "Education",
        companySize: "30-150",
        jobs: ["Curriculum Developer", "Online Tutor"],
        description: "Providing quality education and learning resources worldwide.",
        internRecommendations: 8,
      },
      {
        id: 5,
        companyName: "FinancePlus Group",
        companyEmail: "careers@financeplus.com",
        industry: "Finance",
        companySize: "80-300",
        jobs: [
          { title: "Financial Analyst Intern", duration: "6 months", skills: "Finance, Economics" },
          { title: "Investment Research Associate", skills: "Investment Analysis, Market Research" },
        ],
        description: "A leading financial services firm offering investment and advisory solutions.",
        internRecommendations: 19,
      },
      {
        id: 6,
        companyName: "CreativeMinds Agency",
        companyEmail: "jobs@creativeminds.com",
        industry: "Marketing",
        companySize: "15-60",
        jobs: ["Marketing Intern", "Graphic Designer"],
        description: "A creative marketing agency specializing in branding and digital campaigns.",
        internRecommendations: 11,
      },
    ]

    setCompanies(mockCompanies)

    // Mock data for student profile
    const mockProfile = {
      jobInterests: "Software Engineer, Data Science",
      industry: "Technology",
    }
    setProfile(mockProfile)

    setTimeout(() => {
      setLoading(false)
      showAppNotification("Welcome to Student Portal", "info")
    }, 800)
  }, [appliedCompaniesKey])

  // Dashboard cards data
//   const dashboardCards = [
//     {
//       title: "Available Companies",
//       count: companies.length,
//       icon: "🏢",
//       color: "#c5d5f7",
//       action: () => setActiveSection("companies"),
//     },
//     {
//       title: "Applied Companies",
//       count: appliedCompanies.length,
//       icon: "📝",
//       color: "#d5c5f7",
//       action: () => setActiveSection("applied"),
//     },
//     {
//       title: "Recommended Companies",
//       count: companies.filter((company) => company.internRecommendations > 20).length,
//       icon: "👍",
//       color: "#c5e8f7",
//       action: () => handleRecommendations(),
//     },
//   ]

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
    navigate("/studentapplications", { state: { student } })
    showAppNotification("Navigating to applications page...", "info")
  }

  const handleMyInternshipsClick = () => {
    resetViews()
    navigate("/myinternships", { state: { student } })
    showAppNotification("Navigating to internships page...", "info")
  }

  const handleCompaniesClick = () => {
    resetViews()
    setActiveSection("companies")
    showAppNotification("Browsing companies...", "info")
  }

  const handleSettingsClick = () => {
    resetViews()
    showAppNotification("Settings page coming soon!", "info")
  }

  const handleBellClick = () => {
    setIsPopupOpen((prev) => !prev)
  }

  const handleClosePopup = () => {
    setNotifications([])
    setIsPopupOpen(false)
  }

  const handleShowAll = () => {
    setFilteredCompanies([])
    setShowFiltered(false)
    showAppNotification("Showing all companies", "info")
  }

  const handleFilterCompanies = () => {
    if (!profile.jobInterests && !profile.industry) {
      alert("Please update your profile with your job interests or industry to use the filter.")
      return
    }

    setLoadingProfile(true)

    setTimeout(() => {
      const interestedJobs = (profile.jobInterests || "")
        .split(",")
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean)
      const studentIndustry = (profile.industry || "").toLowerCase().trim()

      const filtered = companies.filter((company) => {
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

      setFilteredCompanies(filtered)
      setShowFiltered(true)
      setLoadingProfile(false)

      // Show a notification about the filter results
      if (filtered.length === 0) {
        showAppNotification("No companies match your profile. Try updating your interests.", "info")
      } else {
        showAppNotification(`Found ${filtered.length} companies matching your profile!`, "success")
      }
    }, 1000) // Simulate loading delay
  }

  const handleRecommendations = () => {
    setLoadingProfile(true)

    setTimeout(() => {
      // Filter companies with high recommendations
      const recommendedCompanies = companies.filter((company) => company.internRecommendations > 15)
      setFilteredCompanies(recommendedCompanies)
      setShowFiltered(true)
      setLoadingProfile(false)
      showAppNotification("Showing companies recommended by other interns", "success")
    }, 1000) // Simulate loading delay
  }

  const handleApplyNow = (companyId) => {
    // Check if already applied
    if (appliedCompanies.includes(companyId)) {
      showAppNotification("You've already applied to this company", "info")
      return
    }

    // Add to applied companies
    const newAppliedCompanies = [...appliedCompanies, companyId]
    setAppliedCompanies(newAppliedCompanies)

    // Save to localStorage
    try {
      localStorage.setItem(appliedCompaniesKey, JSON.stringify(newAppliedCompanies))
    } catch (err) {
      console.error("Error saving applied companies:", err)
    }

    showAppNotification("Application submitted successfully!", "success")
  }

  const isApplied = (companyId) => {
    return appliedCompanies.includes(companyId)
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
        <h2 style={{ color: "#4a4a6a" }}>Error Loading Companies</h2>
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
            <span style={{ margin: "0 8px", color: "#6a6a8a" }}>/</span>
            <span style={{ color: "#4a4a6a", fontSize: "14px", fontWeight: "bold" }}>Companies</span>
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
                  </div>
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
              {/* Dashboard Section */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: "20px",
                  marginBottom: "20px",
                }}
              >
                {/* {dashboardCards.map((card, index) => (
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
                    <div style={{ fontSize: "40px", marginBottom: "10px", color: "rgba(0,0,0,0.6)" }}>{card.icon}</div>
                    <div style={{ fontSize: "32px", fontWeight: "bold", color: "#4a4a6a", marginBottom: "5px" }}>
                      {card.count}
                    </div>
                    <div style={{ fontSize: "16px", color: "#5a5a7a", fontWeight: "500" }}>{card.title}</div>
                  </div>
                ))} */}
              </div>

              {/* Companies Section */}
              <div
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}
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
                  {showFiltered
                    ? `Showing ${filteredCompanies.length} companies`
                    : `Showing all ${companies.length} companies`}
                </div>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "20px" }}>
                <button
                  onClick={handleFilterCompanies}
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
                  disabled={loadingProfile}
                >
                  {loadingProfile ? (
                    <>
                      <div
                        style={{
                          width: "16px",
                          height: "16px",
                          border: "2px solid rgba(255,255,255,0.3)",
                          borderRadius: "50%",
                          borderTop: "2px solid white",
                          animation: "spin 1s linear infinite",
                        }}
                      ></div>
                      Filtering...
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
                </button>

                <button
                  onClick={handleRecommendations}
                  style={{
                    padding: "10px 16px",
                    backgroundColor: "white",
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
                    e.currentTarget.style.backgroundColor = "white"
                    e.currentTarget.style.borderColor = "#6b46c1"
                  }}
                  disabled={loadingProfile}
                >
                  {loadingProfile ? (
                    <>
                      <div
                        style={{
                          width: "16px",
                          height: "16px",
                          border: "2px solid rgba(107, 70, 193, 0.3)",
                          borderRadius: "50%",
                          borderTop: "2px solid #6b46c1",
                          animation: "spin 1s linear infinite",
                        }}
                      ></div>
                      Loading...
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
                </button>

                {showFiltered && (
                  <button
                    onClick={handleShowAll}
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
                    disabled={loadingProfile}
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

              {loadingProfile ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      margin: "0 auto 16px",
                      border: "4px solid rgba(107, 70, 193, 0.2)",
                      borderRadius: "50%",
                      borderTop: "4px solid #6b46c1",
                      animation: "spin 1s linear infinite",
                    }}
                  ></div>
                  <p style={{ color: "#6a6a8a", margin: 0 }}>Loading companies...</p>
                </div>
              ) : (
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
                  {(showFiltered ? filteredCompanies : companies).length > 0 ? (
                    (showFiltered ? filteredCompanies : companies).map((company, index) => (
                      <div
                        key={index}
                        style={{
                          padding: "20px",
                          borderBottom:
                            index < (showFiltered ? filteredCompanies : companies).length - 1
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
                            <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: "600", color: "#1e293b" }}>
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
                              <div>
                                <strong style={{ color: "#334155" }}>Intern Recommendations:</strong>{" "}
                                <span
                                  style={{
                                    backgroundColor: company.internRecommendations > 20 ? "#e9d8fd" : "#f1f5f9",
                                    color: company.internRecommendations > 20 ? "#6b46c1" : "#64748b",
                                    padding: "2px 8px",
                                    borderRadius: "4px",
                                    fontWeight: "500",
                                  }}
                                >
                                  {company.internRecommendations}
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleApplyNow(company.id)}
                            style={{
                              backgroundColor: isApplied(company.id) ? "#f1f5f9" : "#e9d8fd",
                              color: isApplied(company.id) ? "#64748b" : "#6b46c1",
                              border: "none",
                              borderRadius: "4px",
                              padding: "8px 12px",
                              fontSize: "13px",
                              fontWeight: "500",
                              cursor: isApplied(company.id) ? "default" : "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              transition: "all 0.2s",
                              opacity: isApplied(company.id) ? 0.7 : 1,
                            }}
                            onMouseOver={(e) => {
                              if (!isApplied(company.id)) {
                                e.currentTarget.style.backgroundColor = "#d6bcfa"
                              }
                            }}
                            onMouseOut={(e) => {
                              if (!isApplied(company.id)) {
                                e.currentTarget.style.backgroundColor = "#e9d8fd"
                              }
                            }}
                            disabled={isApplied(company.id)}
                          >
                            {isApplied(company.id) ? (
                              <>
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
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                                Already Applied
                              </>
                            ) : (
                              <>
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
                              </>
                            )}
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
                                      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", fontSize: "13px" }}>
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
                    ))
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
                        {showFiltered ? "No companies match your filter criteria" : "No companies available"}
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
                        {showFiltered
                          ? "Try updating your profile with different interests or industry preferences."
                          : "Check back later for available companies."}
                      </p>
                    </div>
                  )}
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

export default CompaniesForStudents
