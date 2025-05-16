"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { setNotification, getNotification, clearNotifications } from "./notification"

const StudentJobs = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("jobs")
  const [loading, setLoading] = useState(true)
  const [notificationContent, setNotificationContent] = useState({ show: false, message: "", type: "" })
  const [confirmLogout, setConfirmLogout] = useState(false)

  // Jobs specific states
  const [jobs, setJobs] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [industryFilter, setIndustryFilter] = useState("")
  const [durationFilter, setDurationFilter] = useState("")
  const [paidFilter, setPaidFilter] = useState("")
  const [filteredJobs, setFilteredJobs] = useState([])
  const [showFiltered, setShowFiltered] = useState(false)
  const [selectedJob, setSelectedJob] = useState(null)
  const [extraDocuments, setExtraDocuments] = useState([])
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [profile, setProfile] = useState({ jobInterests: "", industry: "" })

  // For notifications
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [viewedNotifications, setViewedNotifications] = useState([])
  const [error, setError] = useState(null)

  // For modal
  const [showInternshipInfoModal, setShowInternshipInfoModal] = useState(false)

  const student = location.state?.user ||
    location.state?.studentj ||
    location.state?.student || { email: "default@example.com" }

  const [appliedInternships, setAppliedInternships] = useState(() => {
    const storedApplied = localStorage.getItem("appliedInternships")
    return storedApplied ? JSON.parse(storedApplied) : []
  })

  const profileKey = student?.email ? `studentProfile_${student.email}` : "studentProfile_default"
  const viewedNotificationsKey = student?.email ? `viewedNotifications_${student.email}` : "viewedNotifications_default"

  useEffect(() => {
    // Load jobs from localStorage
    const allJobsString = localStorage.getItem("allJobs")
    if (allJobsString) {
      const parsedJobs = JSON.parse(allJobsString)
      setJobs(parsedJobs)
      setFilteredJobs(parsedJobs)
    } else {
      // Mock data for jobs if none exist
      const mockJobs = [
        {
          id: 1,
          title: "Software Engineer Intern",
          companyName: "Tech Innovations Inc.",
          companyEmail: "info@techinnovations.com",
          duration: "3 months",
          isPaid: true,
          industry: "Technology",
          description: "Join our engineering team to develop cutting-edge web applications using React and Node.js.",
          skills: "JavaScript, React, Node.js",
          location: "San Francisco, CA",
          internRecommendations: 24,
          applicants: [],
        },
        {
          id: 2,
          title: "Data Science Intern",
          companyName: "Tech Innovations Inc.",
          companyEmail: "info@techinnovations.com",
          duration: "6 months",
          isPaid: true,
          industry: "Technology",
          description: "Work with our data science team on machine learning models and data analysis projects.",
          skills: "Python, Machine Learning, SQL",
          location: "San Francisco, CA",
          internRecommendations: 18,
          applicants: [],
        },
        {
          id: 3,
          title: "Environmental Consultant Intern",
          companyName: "Green Solutions Ltd.",
          companyEmail: "contact@greensolutions.com",
          duration: "3 months",
          isPaid: true,
          industry: "Environmental",
          description: "Assist in environmental impact assessments and sustainability projects.",
          skills: "Environmental Science, Research, Analysis",
          location: "Portland, OR",
          internRecommendations: 15,
          applicants: [],
        },
        {
          id: 4,
          title: "Medical Research Intern",
          companyName: "HealthFirst Corp",
          companyEmail: "hr@healthfirst.com",
          duration: "4 months",
          isPaid: true,
          industry: "Healthcare",
          description: "Support our research team in conducting medical studies and analyzing results.",
          skills: "Biology, Chemistry, Research Methods",
          location: "Boston, MA",
          internRecommendations: 32,
          applicants: [],
        },
        {
          id: 5,
          title: "Healthcare Data Analyst Intern",
          companyName: "HealthFirst Corp",
          companyEmail: "hr@healthfirst.com",
          duration: "3 months",
          isPaid: true,
          industry: "Healthcare",
          description: "Analyze healthcare data to identify trends and improve patient outcomes.",
          skills: "Data Analysis, SQL, Statistics",
          location: "Boston, MA",
          internRecommendations: 27,
          applicants: [],
        },
        {
          id: 6,
          title: "Curriculum Developer Intern",
          companyName: "EduGlobal Services",
          companyEmail: "info@eduglobal.com",
          duration: "2 months",
          isPaid: false,
          industry: "Education",
          description: "Develop educational content and curriculum for K-12 students.",
          skills: "Education, Content Creation, Research",
          location: "Chicago, IL",
          internRecommendations: 8,
          applicants: [],
        },
        {
          id: 7,
          title: "Financial Analyst Intern",
          companyName: "FinancePlus Group",
          companyEmail: "careers@financeplus.com",
          duration: "6 months",
          isPaid: true,
          industry: "Finance",
          description: "Assist in financial analysis, reporting, and investment research.",
          skills: "Finance, Economics, Excel",
          location: "New York, NY",
          internRecommendations: 19,
          applicants: [],
        },
        {
          id: 8,
          title: "Marketing Intern",
          companyName: "CreativeMinds Agency",
          companyEmail: "jobs@creativeminds.com",
          duration: "3 months",
          isPaid: false,
          industry: "Marketing",
          description: "Support our marketing team in campaign development and social media management.",
          skills: "Marketing, Social Media, Communication",
          location: "Los Angeles, CA",
          internRecommendations: 11,
          applicants: [],
        },
      ]
      setJobs(mockJobs)
      setFilteredJobs(mockJobs)
      localStorage.setItem("allJobs", JSON.stringify(mockJobs))
    }

    // Load profile from localStorage
    try {
      const savedProfile = localStorage.getItem(profileKey)
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile))
      }
    } catch (err) {
      console.error("Error loading profile:", err)
    }

    setTimeout(() => {
      setLoading(false)
      showAppNotification("Welcome to Jobs Portal", "info")
    }, 800)
  }, [profileKey])

  useEffect(() => {
    localStorage.setItem("appliedInternships", JSON.stringify(appliedInternships))
  }, [appliedInternships])

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

  // Filter jobs based on search and filters
  useEffect(() => {
    if (!showFiltered) {
      let results = jobs

      if (searchTerm) {
        const lowerSearchTerm = searchTerm.toLowerCase()
        results = results.filter(
          (job) =>
            job.title.toLowerCase().includes(lowerSearchTerm) ||
            job.companyName.toLowerCase().includes(lowerSearchTerm) ||
            (job.description && job.description.toLowerCase().includes(lowerSearchTerm)),
        )
      }

      if (industryFilter) {
        results = results.filter((job) => job.industry && job.industry.toLowerCase() === industryFilter.toLowerCase())
      }

      if (durationFilter) {
        results = results.filter(
          (job) => job.duration && job.duration.toLowerCase().includes(durationFilter.toLowerCase()),
        )
      }

      if (paidFilter === "paid") {
        results = results.filter((job) => job.isPaid)
      } else if (paidFilter === "unpaid") {
        results = results.filter((job) => !job.isPaid)
      }

      setFilteredJobs(results)
    }
  }, [jobs, searchTerm, industryFilter, durationFilter, paidFilter, showFiltered])

  const unreadNotifications = notifications.filter((n) => !viewedNotifications.includes(n.id))

  // Dashboard cards data
//   const dashboardCards = [
//     {
//       title: "Available Internships",
//       count: jobs.length,
//       icon: "💼",
//       color: "#c5d5f7",
//       action: () => {
//         setShowFiltered(false)
//         setFilteredJobs(jobs)
//       },
//     },
//     {
//       title: "Applied Internships",
//       count: appliedInternships.length,
//       icon: "📝",
//       color: "#d5c5f7",
//       action: () => handleGoToMyApplications(),
//     },
//     {
//       title: "Recommended Internships",
//       count: jobs.filter((job) => job.internRecommendations > 20).length,
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
    setActiveSection("jobs")
    showAppNotification("Browsing jobs...", "info")
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
    navigate("/companiesforstudents", { state: { student } })
    showAppNotification("Navigating to companies page...", "info")
  }

  const handleSettingsClick = () => {
    resetViews()
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

  const handleShowAll = () => {
    setFilteredJobs(jobs)
    setShowFiltered(false)
    setSearchTerm("")
    setIndustryFilter("")
    setDurationFilter("")
    setPaidFilter("")
    showAppNotification("Showing all internships", "info")
  }

  const handleFilterByProfile = () => {
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

      const filtered = jobs.filter((job) => {
        const jobTitle = (job.title || "").toLowerCase()
        const jobSkills = (job.skills || "").toLowerCase()
        const jobIndustry = (job.industry || "").toLowerCase().trim()
        const jobDescription = (job.description || "").toLowerCase().trim()

        // Check for job interest matches
        const hasJobMatch =
          interestedJobs.length > 0
            ? interestedJobs.some(
                (interest) =>
                  jobTitle.includes(interest) || jobSkills.includes(interest) || jobDescription.includes(interest),
              )
            : true

        // Check for industry match
        const isIndustryMatch = studentIndustry
          ? jobIndustry.includes(studentIndustry) || (jobDescription && jobDescription.includes(studentIndustry))
          : true

        // Return jobs that match either job interests OR industry
        return hasJobMatch || isIndustryMatch
      })

      setFilteredJobs(filtered)
      setShowFiltered(true)
      setLoadingProfile(false)

      // Show a notification about the filter results
      if (filtered.length === 0) {
        showAppNotification("No internships match your profile. Try updating your interests.", "info")
      } else {
        showAppNotification(`Found ${filtered.length} internships matching your profile!`, "success")
      }
    }, 1000) // Simulate loading delay
  }

  const handleRecommendations = () => {
    setLoadingProfile(true)

    setTimeout(() => {
      // Filter jobs with high recommendations
      const recommendedJobs = jobs.filter((job) => job.internRecommendations > 15)
      setFilteredJobs(recommendedJobs)
      setShowFiltered(true)
      setLoadingProfile(false)
      showAppNotification("Showing internships recommended by other interns", "success")
    }, 1000) // Simulate loading delay
  }

  const handleSelectJob = (job) => {
    setSelectedJob(job)
  }

  const handleDocumentChange = (event) => {
    const files = Array.from(event.target.files)
    setExtraDocuments(files)
  }

  const handleApply = () => {
    if (selectedJob && selectedJob.companyEmail && student) {
      const alreadyApplied = appliedInternships.some(
        (applied) => applied.title === selectedJob.title && applied.companyName === selectedJob.companyName,
      )
      if (!alreadyApplied) {
        const message = `${student.email} has applied to ${selectedJob.title}.`
        setNotification(message, selectedJob.companyEmail)
        const newApplication = {
          ...selectedJob,
          status: "pending",
          documents: extraDocuments.map((file) => file.name),
          studentProfile: student,
        }
        setAppliedInternships([...appliedInternships, newApplication])
        showAppNotification(`Applied to ${selectedJob.title} at ${selectedJob.companyName}!`, "success")

        // Update the jobs list to mark this job as applied
        const updatedAllJobs = jobs.map((job) => {
          if (job.id === selectedJob.id) {
            return { ...job, applicants: [...(job.applicants || []), student] }
          }
          return job
        })
        localStorage.setItem("allJobs", JSON.stringify(updatedAllJobs))
        setJobs(updatedAllJobs)

        // Clear the selected job and documents
        setSelectedJob(null)
        setExtraDocuments([])
      } else {
        showAppNotification("You have already applied to this internship.", "info")
      }
    } else if (!selectedJob) {
      showAppNotification("Please select an internship to apply.", "error")
    } else if (!selectedJob.companyEmail) {
      showAppNotification("Error applying: Internship details missing company information.", "error")
    } else if (!student) {
      showAppNotification("Student information not found. Please log in again.", "error")
    }
  }

  const handleGoToMyApplications = () => {
    navigate("/studentapplications", { state: { student } })
  }

  const isAlreadyApplied = (job) => {
    return appliedInternships.some((applied) => applied.title === job.title && applied.companyName === job.companyName)
  }

  const getInternshipVideoInfo = () => {
    const defaultVideo = {
      title: "General Internship Guidance Video",
      embedHtml: `<iframe width="560" height="315" src="https://www.youtube.com/embed/VSkvwzqo-Pk?si=ngv6R1pNMKALFV_-" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`,
      description:
        "This video provides general tips for finding and succeeding in internships. For specific requirements related to your major, please consult your academic advisor.",
    }

    if (student?.major) {
      switch (student.major.toLowerCase()) {
        case "computer science":
          return {
            title: "Internship Insights for Computer Science Majors",
            embedHtml: `<iframe width="560" height="315" src="https://www.youtube.com/embed/VSkvwzqo-Pk?si=ngv6R1pNMKALFV_-" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`,
            description: "Learn about typical internships for CS students and how to make the most of them.",
          }
        case "electrical engineering":
          return {
            title: "Electrical Engineering Internship Opportunities",
            embedHtml: `<iframe width="560" height="315" src="https://www.youtube.com/embed/VSkvwzqo-Pk?si=ngv6R1pNMKALFV_-" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`,
            description: "Explore internships in the field of Electrical Engineering.",
          }
        case "business administration":
          return {
            title: "Business Administration Internship Pathways",
            embedHtml: `<iframe width="560" height="315" src="https://www.youtube.com/embed/VSkvwzqo-Pk?si=ngv6R1pNMKALFV_-" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`,
            description: "Discover various internship roles for Business Administration students.",
          }
        default:
          return {
            title: `Internship Guidance for ${student.major} Majors`,
            embedHtml: `<iframe width="560" height="315" src="https://www.youtube.com/embed/VSkvwzqo-Pk?si=ngv6R1pNMKALFV_-" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`,
            description: `This video offers general internship advice. Specific guidance for ${student.major} should be sought from your department.`,
          }
      }
    }
    return defaultVideo
  }

  const commonItems = [
    { id: "dashboard", label: "Homepage", icon: "🏠", action: handleHomeClick },
    { id: "profile", label: "Profile", icon: "👤", action: handleProfileClick },
    { id: "courses", label: "All Courses", icon: "📚", action: handleCoursesClick },
    { id: "companies", label: "Companies", icon: "🏢", action: handleCompaniesClick },
    { id: "jobs", label: "Browse Jobs", icon: "💼", action: handleBrowseJobsClick },
    { id: "applications", label: "All Applications", icon: "📝", action: handleMyApplicationsClick },
    { id: "internships", label: "My Internships", icon: "🏆", action: handleMyInternshipsClick },
  ]

  const Sidebar = ({ menuOpen, toggleMenu }) => {
    const sidebarItems = [...commonItems]
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
                <div style={{ fontSize: "14px", fontWeight: "bold", color: "#4a4a6a" }}>Student User</div>
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
        <h2 style={{ color: "#4a4a6a" }}>Error Loading Jobs</h2>
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
          <h1 style={{ margin: "0 0 0 20px", fontSize: "20px", color: "#4a4a6a", fontWeight: "bold" }}>Jobs Portal</h1>
          <div style={{ display: "flex", alignItems: "center", marginLeft: "20px" }}>
            <span style={{ color: "#6a6a8a", fontSize: "14px", cursor: "pointer" }} onClick={handleHomeClick}>
              Home
            </span>
            <span style={{ margin: "0 8px", color: "#6a6a8a" }}>/</span>
            <span style={{ color: "#4a4a6a", fontSize: "14px", fontWeight: "bold" }}>Jobs</span>
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
              <div style={{ color: "#4a4a6a" }}>Loading...</div>
            </div>
          ) : (
            <>
              {/* Jobs Section */}
              <div
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}
              >
                <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "#1e293b" }}>
                  Available Internships
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
                    {showFiltered
                      ? `Showing ${filteredJobs.length} internships`
                      : `Showing all ${jobs.length} internships`}
                  </div>
                  <button
                    onClick={() => setShowInternshipInfoModal(true)}
                    title="Internship Requirement Info"
                    style={{
                      background: "none",
                      border: "none",
                      fontSize: "1.5em",
                      cursor: "pointer",
                      color: "#6b46c1",
                      padding: "0 5px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
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
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                      <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Search and Filter Controls */}
              <div style={{ marginBottom: "20px", backgroundColor: "#f8f9fa", padding: "15px", borderRadius: "8px" }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "15px", marginBottom: "15px" }}>
                  <input
                    type="text"
                    placeholder="Search by job title or company"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      padding: "10px",
                      borderRadius: "5px",
                      border: "1px solid #ccc",
                      flexGrow: 1,
                      minWidth: "200px",
                    }}
                  />
                  <select
                    value={industryFilter}
                    onChange={(e) => setIndustryFilter(e.target.value)}
                    style={{
                      padding: "10px",
                      borderRadius: "5px",
                      border: "1px solid #ccc",
                      backgroundColor: "white",
                    }}
                  >
                    <option value="">All Industries</option>
                    {Array.from(new Set(jobs.map((job) => job.industry).filter(Boolean))).map((industry) => (
                      <option key={industry} value={industry}>
                        {industry}
                      </option>
                    ))}
                  </select>
                  <select
                    value={durationFilter}
                    onChange={(e) => setDurationFilter(e.target.value)}
                    style={{
                      padding: "10px",
                      borderRadius: "5px",
                      border: "1px solid #ccc",
                      backgroundColor: "white",
                    }}
                  >
                    <option value="">Any Duration</option>
                    <option value="1 month">1 Month</option>
                    <option value="2 months">2 Months</option>
                    <option value="3 months">3 Months</option>
                    <option value="6 months">6 Months</option>
                  </select>
                  <select
                    value={paidFilter}
                    onChange={(e) => setPaidFilter(e.target.value)}
                    style={{
                      padding: "10px",
                      borderRadius: "5px",
                      border: "1px solid #ccc",
                      backgroundColor: "white",
                    }}
                  >
                    <option value="">All (Paid/Unpaid)</option>
                    <option value="paid">Paid</option>
                    <option value="unpaid">Unpaid</option>
                  </select>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  <button
                    onClick={handleFilterByProfile}
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

                  <button
                    onClick={handleGoToMyApplications}
                    style={{
                      padding: "10px 16px",
                      backgroundColor: "#4a4a6a",
                      color: "white",
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
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#3a3a5a")}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#4a4a6a")}
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
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                    View My Applications
                  </button>

                  {(showFiltered || searchTerm || industryFilter || durationFilter || paidFilter) && (
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
                      Show All Internships
                    </button>
                  )}
                </div>
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
                  <p style={{ color: "#6a6a8a", margin: 0 }}>Loading internships...</p>
                </div>
              ) : (
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
                            textAlign: "center",
                            borderBottom: "1px solid #ddd",
                          }}
                        >
                          Recommendations
                        </th>
                        <th
                          style={{
                            padding: "12px 15px",
                            textAlign: "center",
                            borderBottom: "1px solid #ddd",
                          }}
                        >
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredJobs.length > 0 ? (
                        filteredJobs.map((job, index) => (
                          <tr
                            key={job.id || `${job.title}-${job.companyName}-${index}`}
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
                            <td style={{ padding: "12px 15px" }}>{job.companyName}</td>
                            <td style={{ padding: "12px 15px" }}>{job.title}</td>
                            <td style={{ padding: "12px 15px" }}>{job.duration}</td>
                            <td style={{ padding: "12px 15px" }}>
                              {job.isPaid ? (
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
                            <td style={{ padding: "12px 15px", textAlign: "center" }}>
                              <span
                                style={{
                                  backgroundColor: job.internRecommendations > 20 ? "#e9d8fd" : "#f1f5f9",
                                  color: job.internRecommendations > 20 ? "#6b46c1" : "#64748b",
                                  padding: "2px 8px",
                                  borderRadius: "4px",
                                  fontSize: "12px",
                                  fontWeight: "500",
                                }}
                              >
                                {job.internRecommendations}
                              </span>
                            </td>
                            <td style={{ padding: "12px 15px", textAlign: "center" }}>
                              <button
                                onClick={() => handleSelectJob(job)}
                                style={{
                                  padding: "8px 12px",
                                  backgroundColor: "#6b46c1",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "5px",
                                  cursor: "pointer",
                                  fontSize: "14px",
                                  transition: "background-color 0.2s",
                                }}
                                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#553c9a")}
                                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#6b46c1")}
                              >
                                View & Apply
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="6"
                            style={{
                              padding: "30px 15px",
                              textAlign: "center",
                              fontStyle: "italic",
                              color: "#777",
                            }}
                          >
                            No internships match your criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {selectedJob && (
                <div
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    backdropFilter: "blur(5px)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 1500,
                  }}
                >
                  <div
                    style={{
                      width: "90%",
                      maxWidth: "800px",
                      maxHeight: "90vh",
                      overflowY: "auto",
                      backgroundColor: "white",
                      borderRadius: "12px",
                      padding: "25px",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <h2 style={{ color: "#6b46c1", marginBottom: "15px", marginTop: 0 }}>
                        Apply for: {selectedJob.title}
                      </h2>
                      <span
                        style={{
                          backgroundColor: selectedJob.internRecommendations > 20 ? "#e9d8fd" : "#f1f5f9",
                          color: selectedJob.internRecommendations > 20 ? "#6b46c1" : "#64748b",
                          padding: "4px 10px",
                          borderRadius: "20px",
                          fontSize: "13px",
                          fontWeight: "500",
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
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
                          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                        </svg>
                        {selectedJob.internRecommendations} Recommendations
                      </span>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                        gap: "15px",
                        marginBottom: "20px",
                      }}
                    >
                      <div>
                        <p style={{ margin: "0 0 5px 0", color: "#64748b", fontSize: "14px" }}>Company</p>
                        <p style={{ margin: 0, fontWeight: "500", color: "#334155" }}>{selectedJob.companyName}</p>
                      </div>
                      <div>
                        <p style={{ margin: "0 0 5px 0", color: "#64748b", fontSize: "14px" }}>Duration</p>
                        <p style={{ margin: 0, fontWeight: "500", color: "#334155" }}>{selectedJob.duration}</p>
                      </div>
                      <div>
                        <p style={{ margin: "0 0 5px 0", color: "#64748b", fontSize: "14px" }}>Paid</p>
                        <p style={{ margin: 0, fontWeight: "500", color: "#334155" }}>
                          {selectedJob.isPaid ? "Yes" : "No"}
                        </p>
                      </div>
                      {selectedJob.industry && (
                        <div>
                          <p style={{ margin: "0 0 5px 0", color: "#64748b", fontSize: "14px" }}>Industry</p>
                          <p style={{ margin: 0, fontWeight: "500", color: "#334155" }}>{selectedJob.industry}</p>
                        </div>
                      )}
                      {selectedJob.location && (
                        <div>
                          <p style={{ margin: "0 0 5px 0", color: "#64748b", fontSize: "14px" }}>Location</p>
                          <p style={{ margin: 0, fontWeight: "500", color: "#334155" }}>{selectedJob.location}</p>
                        </div>
                      )}
                    </div>

                    {selectedJob.description && (
                      <div style={{ marginBottom: "20px" }}>
                        <p style={{ margin: "0 0 5px 0", color: "#64748b", fontSize: "14px" }}>Description</p>
                        <p style={{ margin: 0, lineHeight: "1.6", color: "#334155" }}>{selectedJob.description}</p>
                      </div>
                    )}

                    {selectedJob.skills && (
                      <div style={{ marginBottom: "20px" }}>
                        <p style={{ margin: "0 0 5px 0", color: "#64748b", fontSize: "14px" }}>Required Skills</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                          {selectedJob.skills.split(",").map((skill, index) => (
                            <span
                              key={index}
                              style={{
                                backgroundColor: "#f1f5f9",
                                color: "#64748b",
                                padding: "4px 10px",
                                borderRadius: "4px",
                                fontSize: "13px",
                              }}
                            >
                              {skill.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div
                      style={{
                        marginTop: "25px",
                        padding: "20px",
                        backgroundColor: "#f8fafc",
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <h3 style={{ margin: "0 0 15px 0", fontSize: "16px", color: "#334155" }}>
                        Application Documents
                      </h3>
                      <div>
                        <label
                          htmlFor="extraDocuments"
                          style={{
                            display: "block",
                            marginBottom: "8px",
                            fontWeight: "500",
                            color: "#334155",
                            fontSize: "14px",
                          }}
                        >
                          Upload Supporting Documents (CV, Cover Letter, etc.):
                        </label>
                        <input
                          type="file"
                          id="extraDocuments"
                          multiple
                          onChange={handleDocumentChange}
                          style={{
                            padding: "10px",
                            border: "1px solid #e2e8f0",
                            borderRadius: "5px",
                            width: "100%",
                            backgroundColor: "white",
                          }}
                        />
                        {extraDocuments.length > 0 && (
                          <div style={{ marginTop: "15px" }}>
                            <p style={{ margin: "0 0 8px 0", fontWeight: "500", color: "#334155", fontSize: "14px" }}>
                              Selected Files:
                            </p>
                            <ul
                              style={{
                                margin: 0,
                                padding: "0 0 0 20px",
                                listStyle: "disc",
                                color: "#64748b",
                                fontSize: "14px",
                              }}
                            >
                              {extraDocuments.map((file, index) => (
                                <li key={index} style={{ marginBottom: "4px" }}>
                                  {file.name}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                        <button
                          onClick={handleApply}
                          disabled={isAlreadyApplied(selectedJob)}
                          style={{
                            padding: "12px 20px",
                            backgroundColor: isAlreadyApplied(selectedJob) ? "#cbd5e1" : "#10b981",
                            color: isAlreadyApplied(selectedJob) ? "#64748b" : "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: isAlreadyApplied(selectedJob) ? "not-allowed" : "pointer",
                            fontSize: "16px",
                            fontWeight: "500",
                            transition: "background-color 0.2s",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                          onMouseOver={(e) => {
                            if (!isAlreadyApplied(selectedJob)) e.currentTarget.style.backgroundColor = "#0d9488"
                          }}
                          onMouseOut={(e) => {
                            if (!isAlreadyApplied(selectedJob)) e.currentTarget.style.backgroundColor = "#10b981"
                          }}
                        >
                          {isAlreadyApplied(selectedJob) ? (
                            <>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M20 6L9 17l-5-5"></path>
                              </svg>
                              Already Applied
                            </>
                          ) : (
                            <>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
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
                        <button
                          onClick={() => setSelectedJob(null)}
                          style={{
                            padding: "12px 20px",
                            backgroundColor: "#f1f5f9",
                            color: "#64748b",
                            border: "1px solid #e2e8f0",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "16px",
                            fontWeight: "500",
                            transition: "background-color 0.2s",
                          }}
                          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#e2e8f0")}
                          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#f1f5f9")}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showInternshipInfoModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1200,
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "25px",
              borderRadius: "12px",
              width: "90%",
              maxWidth: "700px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}
            >
              <h3 style={{ color: "#6b46c1", margin: 0, fontSize: "20px", fontWeight: "600" }}>
                {getInternshipVideoInfo().title}
              </h3>
              <button
                onClick={() => setShowInternshipInfoModal(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#64748b",
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
                  width="24"
                  height="24"
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
                position: "relative",
                overflow: "hidden",
                width: "100%",
                paddingTop: "56.25%" /* 16:9 Aspect Ratio */,
                backgroundColor: "#f1f5f9",
                borderRadius: "8px",
                marginBottom: "20px",
              }}
            >
              <div
                dangerouslySetInnerHTML={{ __html: getInternshipVideoInfo().embedHtml }}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  width: "100%",
                  height: "100%",
                }}
              />
            </div>

            <div
              style={{
                backgroundColor: "#f8fafc",
                padding: "20px",
                borderRadius: "8px",
                marginBottom: "20px",
              }}
            >
              <p style={{ lineHeight: "1.6", margin: "0 0 15px 0", color: "#334155" }}>
                {getInternshipVideoInfo().description}
              </p>
              <p style={{ lineHeight: "1.6", fontSize: "14px", color: "#64748b", margin: 0 }}>
                Please consult your academic advisor or department's internship coordinator for official requirements
                and approval processes.
              </p>
            </div>

            <button
              onClick={() => setShowInternshipInfoModal(false)}
              style={{
                padding: "10px 20px",
                backgroundColor: "#6b46c1",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "500",
                transition: "background-color 0.2s",
                display: "block",
                marginLeft: "auto",
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#553c9a")}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#6b46c1")}
            >
              Close
            </button>
          </div>
        </div>
      )}

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

export default StudentJobs
