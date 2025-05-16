"use client"

import { useState, useEffect, useMemo } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { setNotification } from "./notification"

// ... (majorsWithCourses, defaultEvaluationState, defaultReportState remain the same) ...
const majorsWithCourses = [
  {
    major: "Computer Science",
    courses: [
      "Data Structures and Algorithms",
      "Operating Systems",
      "Database Management Systems",
      "Computer Networks",
      "Artificial Intelligence",
      "Web Development",
      "Machine Learning",
    ],
  },
  {
    major: "Electrical Engineering",
    courses: [
      "Circuit Analysis",
      "Electromagnetics",
      "Digital Logic Design",
      "Control Systems",
      "Power Systems",
      "Microprocessors",
      "Signal Processing",
    ],
  },
  {
    major: "Mechanical Engineering",
    courses: [
      "Thermodynamics",
      "Fluid Mechanics",
      "Machine Design",
      "Heat Transfer",
      "Manufacturing Processes",
      "Dynamics of Machinery",
      "Engineering Drawing",
    ],
  },
  {
    major: "Business Administration",
    courses: [
      "Principles of Management",
      "Marketing Fundamentals",
      "Financial Accounting",
      "Organizational Behavior",
      "Business Ethics",
      "Operations Management",
      "Strategic Management",
    ],
  },
  {
    major: "Psychology",
    courses: [
      "Introduction to Psychology",
      "Developmental Psychology",
      "Cognitive Psychology",
      "Abnormal Psychology",
      "Social Psychology",
      "Research Methods",
      "Psychological Assessment",
    ],
  },
  {
    major: "Civil Engineering",
    courses: [
      "Structural Analysis",
      "Geotechnical Engineering",
      "Transportation Engineering",
      "Concrete Design",
      "Surveying",
      "Construction Management",
      "Environmental Engineering",
    ],
  },
  {
    major: "Biology",
    courses: [
      "Cell Biology",
      "Genetics",
      "Ecology",
      "Human Anatomy and Physiology",
      "Microbiology",
      "Evolutionary Biology",
      "Biochemistry",
    ],
  },
]

const defaultEvaluationState = {
  text: "",
  recommend: false,
  submitted: false,
}

const defaultReportState = {
  title: "",
  introduction: "",
  body: "",
  major: "",
  courses: [],
  pdfFile: null,
  pdfFileName: "",
  submitted: false,
  finalSubmitted: false,
  status: "not_submitted",
  evaluatorComments: "",
  appealMessage: "",
  appealSubmitted: false,
}

function MyInternshipsPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("internships")
  const [loading, setLoading] = useState(true)
  const [notificationContent, setNotificationContent] = useState({ show: false, message: "", type: "" })
  const [confirmLogout, setConfirmLogout] = useState(false)
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [viewedNotifications, setViewedNotifications] = useState([])

  const student = location.state?.studentj ||
    location.state?.student || { email: "default@example.com", name: "Default Student" }
  const viewedNotificationsKey = student?.email ? `viewedNotifications_${student.email}` : "viewedNotifications_default"

  const [allInternships, setAllInternships] = useState([])
  const [internships, setInternships] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [companies, setCompanies] = useState([])

  const [showEvaluationPopup, setShowEvaluationPopup] = useState(false)
  const [currentInternshipIdForPopup, setCurrentInternshipIdForPopup] = useState(null)

  const [popupEvaluationData, setPopupEvaluationData] = useState({ ...defaultEvaluationState })
  const [evaluationError, setEvaluationError] = useState("")

  const [showReportPopup, setShowReportPopup] = useState(false)
  const [popupReportData, setPopupReportData] = useState({ ...defaultReportState })
  const [reportErrors, setReportErrors] = useState({})

  const [showFinalReportView, setShowFinalReportView] = useState(false)

  const [showCommentsPopup, setShowCommentsPopup] = useState(false)
  const [commentsToView, setCommentsToView] = useState("")
  const [showAppealPopup, setShowAppealPopup] = useState(false)
  const [appealMessageInput, setAppealMessageInput] = useState("")
  const [appealError, setAppealError] = useState("")

  const [reports, setReports] = useState([]) // Add reports state

  // 1. Add state to track disabled buttons
  const [disabledButtons, setDisabledButtons] = useState({
    evaluations: {},
    reports: {},
  })

  // Add a new function to handle opening the internship details popup
  const [showInternshipDetailsPopup, setShowInternshipDetailsPopup] = useState(false)
  const [currentInternshipDetails, setCurrentInternshipDetails] = useState(null)

  const handleOpenInternshipDetails = (internship) => {
    setCurrentInternshipDetails(internship)
    setShowInternshipDetailsPopup(true)
  }

  useEffect(() => {
    setLoading(true)
    if (student?.email) {
      const foundInternships = []
      const foundCompanies = []
      const allcomp = JSON.parse(localStorage.getItem("companies")) || []

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith("companyInterns_")) {
          const companyEmail = key.split("companyInterns_")[1]
          const internsDataFromStorage = JSON.parse(localStorage.getItem(key)) || []
          const company = allcomp.find((c) => c.companyEmail === companyEmail)
          const companyName = company ? company.companyName : "N/A"

          internsDataFromStorage.forEach((intern) => {
            if (intern.email === student.email) {
              const uniqueInternshipId =
                `${student.email}_${intern.jobTitle}_${companyEmail}_${intern.startDate}`.replace(/\s+/g, "_")

              const savedEvaluation = JSON.parse(localStorage.getItem(`evaluation_${uniqueInternshipId}`)) || {
                ...defaultEvaluationState,
              }
              let savedReport = JSON.parse(localStorage.getItem(`report_${uniqueInternshipId}`))
              if (savedReport) {
                savedReport = { ...defaultReportState, ...savedReport, pdfFile: null }
              } else {
                savedReport = { ...defaultReportState }
              }

              foundInternships.push({
                ...intern,
                uniqueInternshipId,
                companyEmail,
                companyName,
                evaluation: savedEvaluation,
                report: savedReport,
              })
              if (!foundCompanies.some((c) => c.companyEmail === companyEmail)) {
                foundCompanies.push({ companyEmail, companyName })
              }
            }
          })
        }
      }
      setAllInternships(foundInternships)
      setCompanies(foundCompanies)
      const savedReports = JSON.parse(localStorage.getItem("reports")) || [] // Get reports
      setReports(savedReports.filter((report) => report.studentemail === student.email)) // Only get reports for the student
    }

    try {
      const savedViewedNotifications = localStorage.getItem(viewedNotificationsKey)
      if (savedViewedNotifications) {
        setViewedNotifications(JSON.parse(savedViewedNotifications))
      }
    } catch (err) {
      console.error("Error loading viewed notifications:", err)
    }

    setTimeout(() => {
      setLoading(false)
      showAppNotification("Internships loaded successfully", "success")
    }, 800)
  }, [student, viewedNotificationsKey])

  const processedInternships = useMemo(() => {
    return allInternships.map((internship) => ({
      ...internship,
      derivedStatus: internship.status,
    }))
  }, [allInternships])

  useEffect(() => {
    let tempFiltered = [...processedInternships]
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase()
      tempFiltered = tempFiltered.filter(
        (internship) =>
          internship.jobTitle.toLowerCase().includes(lowerSearchTerm) ||
          (internship.companyEmail && internship.companyEmail.toLowerCase().includes(lowerSearchTerm)) ||
          internship.companyName?.toLowerCase().includes(lowerSearchTerm),
      )
    }
    tempFiltered = tempFiltered.filter(
      (internship) => statusFilter === "all" || internship.derivedStatus === statusFilter,
    )
    setInternships(tempFiltered)
  }, [statusFilter, processedInternships, searchTerm])

  const handleSearch = () => {}

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
  }

  const handleDownloadSampleReport = () => {
    const link = document.createElement("a")
    const publicUrl = process.env.PUBLIC_URL || ""
    link.href = `${publicUrl}/Report.pdf`
    link.setAttribute("download", "Report.pdf")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // 2. Modify handleOpenEvaluationPopup to disable the button after click
  const handleOpenEvaluationPopup = (internshipId) => {
    const internshipToEdit = allInternships.find((intern) => intern.uniqueInternshipId === internshipId)
    if (internshipToEdit) {
      setCurrentInternshipIdForPopup(internshipId)
      setPopupEvaluationData({ ...internshipToEdit.evaluation })
      setEvaluationError("")
      setShowEvaluationPopup(true)

      // Disable the evaluation button for this internship
      setDisabledButtons((prev) => ({
        ...prev,
        evaluations: {
          ...prev.evaluations,
          [internshipId]: true,
        },
      }))
    }
  }

  // 4. Modify handleOpenReportForm to disable the button after click
  const handleOpenReportForm = (internshipId, actionType = "edit_or_add") => {
    const internshipToEdit = allInternships.find((intern) => intern.uniqueInternshipId === internshipId)
    if (!internshipToEdit) return

    setCurrentInternshipIdForPopup(internshipId)
    let reportDataForPopup

    if (
      actionType === "create_new_version" ||
      (internshipToEdit.report.finalSubmitted && actionType === "edit_or_add")
    ) {
      // Student wants to edit an already finalized report or explicitly create a new version
      const currentFinalReport = internshipToEdit.report
      reportDataForPopup = {
        title: currentFinalReport.title,
        introduction: currentFinalReport.introduction,
        body: currentFinalReport.body,
        major: currentFinalReport.major,
        courses: [...currentFinalReport.courses],
        pdfFile: null,
        pdfFileName: currentFinalReport.pdfFileName, // Keep the existing PDF filename
        submitted: true, // It's a draft being created
        finalSubmitted: false, // New version is not finalized yet
        status: "draft_saved", // This new draft's status
        evaluatorComments: "", // Reset for this new version
        appealMessage: "",
        appealSubmitted: false,
      }
    } else if (
      internshipToEdit.report.submitted &&
      (internshipToEdit.report.status === "draft_saved" || internshipToEdit.report.status === "edited_after_final")
    ) {
      // Editing an existing draft
      reportDataForPopup = { ...internshipToEdit.report, pdfFile: null }
    } else {
      // Adding a brand new report (status was not_submitted and submitted was false)
      reportDataForPopup = { ...defaultReportState, pdfFile: null }
    }

    setPopupReportData(reportDataForPopup)
    setReportErrors({})
    setShowReportPopup(true)

    // Disable the report button for this internship
    setDisabledButtons((prev) => ({
      ...prev,
      reports: {
        ...prev.reports,
        [internshipId]: true,
      },
    }))
  }

  const handleOpenFinalReportView = (internshipId) => {
    const internshipToView = allInternships.find((intern) => intern.uniqueInternshipId === internshipId)
    if (internshipToView) {
      setCurrentInternshipIdForPopup(internshipId)
      // Load the current state of the report for viewing.
      // This data (popupReportData) will be used if the user proceeds to submit.
      setPopupReportData({ ...internshipToView.report, pdfFile: null })
      setShowFinalReportView(true)
    }
  }

  const handleSaveEvaluation = () => {
    if (!popupEvaluationData.text.trim()) {
      setEvaluationError("Evaluation cannot be empty.")
      return
    }
    const updatedEvaluation = { ...popupEvaluationData, submitted: true }
    localStorage.setItem(`evaluation_${currentInternshipIdForPopup}`, JSON.stringify(updatedEvaluation))
    setAllInternships((prevInternships) =>
      prevInternships.map((intern) =>
        intern.uniqueInternshipId === currentInternshipIdForPopup
          ? { ...intern, evaluation: updatedEvaluation }
          : intern,
      ),
    )
    setEvaluationError("")
    setShowEvaluationPopup(false)
    showAppNotification("Evaluation saved successfully", "success")
  }

  // 3. Modify handleDeleteEvaluation to disable the button after click
  const handleDeleteEvaluation = (internshipId) => {
    if (window.confirm("Are you sure you want to delete this evaluation? This action cannot be undone.")) {
      localStorage.removeItem(`evaluation_${internshipId}`)
      setAllInternships((prevInternships) =>
        prevInternships.map((intern) =>
          intern.uniqueInternshipId === internshipId
            ? { ...intern, evaluation: { ...defaultEvaluationState } } // Reset to default
            : intern,
        ),
      )
      if (showEvaluationPopup && currentInternshipIdForPopup === internshipId) {
        setShowEvaluationPopup(false) // Close popup if it was for the deleted item
      }
      showAppNotification("Evaluation deleted successfully.", "success")

      // Disable the delete button for this internship
      setDisabledButtons((prev) => ({
        ...prev,
        evaluations: {
          ...prev.evaluations,
          [`delete_${internshipId}`]: true,
        },
      }))
    }
  }

  // 5. Modify handleDeleteReport to disable the button after click
  const handleDeleteReport = (internshipId) => {
    if (window.confirm("Are you sure you want to delete this report? This action cannot be undone.")) {
      localStorage.removeItem(`report_${internshipId}`)
      setAllInternships((prevInternships) =>
        prevInternships.map((intern) =>
          intern.uniqueInternshipId === internshipId
            ? { ...intern, report: { ...defaultReportState } } // Reset to default
            : intern,
        ),
      )
      if (showReportPopup && currentInternshipIdForPopup === internshipId) {
        setShowReportPopup(false)
      }
      if (showFinalReportView && currentInternshipIdForPopup === internshipId) {
        setShowFinalReportView(false)
      }
      showAppNotification("Report deleted successfully.", "success")

      // Disable the delete button for this internship
      setDisabledButtons((prev) => ({
        ...prev,
        reports: {
          ...prev.reports,
          [`delete_${internshipId}`]: true,
        },
      }))
    }
  }

  // 6. Modify handleSaveReport to automatically open the final report view after saving
  const handleSaveReport = () => {
    const errors = {}
    if (!popupReportData.title.trim()) errors.title = "Title is required."
    if (!popupReportData.introduction.trim()) errors.introduction = "Introduction is required."
    if (!popupReportData.body.trim()) errors.body = "Body is required."
    if (!popupReportData.major) errors.major = "Major must be selected."
    if (popupReportData.courses.length === 0) errors.courses = "Select at least one course."
    if (!popupReportData.pdfFile && !popupReportData.pdfFileName) errors.pdfFile = "Upload a PDF file."

    setReportErrors(errors)

    if (Object.keys(errors).length === 0) {
      // Create the report to save in localStorage
      const reportToSaveInLocalStorage = {
        ...popupReportData,
        submitted: true,
        status: "draft_saved",
        pdfFileName: popupReportData.pdfFile ? popupReportData.pdfFile.name : popupReportData.pdfFileName,
        pdfFile: null, // Don't save the File object in localStorage
      }

      // Save to localStorage
      localStorage.setItem(`report_${currentInternshipIdForPopup}`, JSON.stringify(reportToSaveInLocalStorage))

      // Update the state with the saved report
      const updatedReportForState = {
        ...reportToSaveInLocalStorage,
        pdfFile: popupReportData.pdfFile, // Keep File object in state for immediate re-edit/view if needed
      }

      setAllInternships((prevInternships) =>
        prevInternships.map((intern) =>
          intern.uniqueInternshipId === currentInternshipIdForPopup
            ? { ...intern, report: updatedReportForState }
            : intern,
        ),
      )

      // Close the report form popup
      setShowReportPopup(false)

      // Show success notification
      showAppNotification("Report draft saved successfully", "success")

      // Important: Update the popupReportData with the latest data before showing the final view
      setPopupReportData(updatedReportForState)

      // Open the final report view with a slight delay to ensure state updates are processed
      setTimeout(() => {
        setShowFinalReportView(true)
      }, 100)
    }
  }

  const handleFinalReportSubmit = () => {
    const internshipToFinalize = allInternships.find(
      (intern) => intern.uniqueInternshipId === currentInternshipIdForPopup,
    )

    if (internshipToFinalize) {
      // The content for submission is already in popupReportData (loaded when final view was opened)
      const reportContentToFinalize = {
        title: popupReportData.title,
        introduction: popupReportData.introduction,
        body: popupReportData.body,
        major: popupReportData.major,
        courses: [...popupReportData.courses],
        pdfFileName: popupReportData.pdfFileName,
      }

      const finalizedReport = {
        ...reportContentToFinalize,
        submitted: true,
        finalSubmitted: true, // This action makes it final
        status: "pending",
        evaluatorComments: "",
        appealMessage: "",
        appealSubmitted: false,
        pdfFile: null,
      }
      localStorage.setItem(`report_${currentInternshipIdForPopup}`, JSON.stringify(finalizedReport))

      const updatedReportForState = {
        ...finalizedReport,
        pdfFile: null, // Clear any transient File object from state upon final submission
      }

      setAllInternships((prevInternships) =>
        prevInternships.map((intern) =>
          intern.uniqueInternshipId === currentInternshipIdForPopup
            ? { ...intern, report: updatedReportForState }
            : intern,
        ),
      )
    }
    setShowFinalReportView(false)
    showAppNotification("Final report submitted successfully", "success")
  }

  const handleOpenCommentsPopup = (comments) => {
    setCommentsToView(comments)
    setShowCommentsPopup(true)
  }

  const handleOpenAppealPopup = (internshipId) => {
    setCurrentInternshipIdForPopup(internshipId)
    setAppealMessageInput("")
    setAppealError("")
    setShowAppealPopup(true)
  }

  const handleSaveAppeal = () => {
    // Remove validation for empty message since it's optional
    // if (!appealMessageInput.trim()) {
    //   setAppealError("Appeal message cannot be empty.")
    //   return
    // }

    const internshipToUpdate = allInternships.find(
      (intern) => intern.uniqueInternshipId === currentInternshipIdForPopup,
    )
    if (internshipToUpdate) {
      const appealedReport = {
        ...internshipToUpdate.report,
        appealMessage: appealMessageInput.trim(),
        appealSubmitted: true,
        status: "pending_appeal",
        pdfFile: null,
      }
      localStorage.setItem(`report_${currentInternshipIdForPopup}`, JSON.stringify(appealedReport))
      setNotification( ' ${appealMessage} for {currentInternshipIdForPopup} ', "scad@example.com")
      setNotification(' ${appealMessage} for {currentInternshipIdForPopup} ', "faculty@example.com")
      const updatedReportForState = {
        ...appealedReport,
        pdfFile: internshipToUpdate.report.pdfFile,
      }
      setAllInternships((prevInternships) =>
        prevInternships.map((intern) =>
          intern.uniqueInternshipId === currentInternshipIdForPopup
            ? { ...intern, report: updatedReportForState }
            : intern,
        ),
      )
    }
    setShowAppealPopup(false)
    setAppealMessageInput("")
    showAppNotification("Appeal submitted successfully", "success")
  }

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

  const resetViews = () => {}

  const handleHomeClick = () => {
    resetViews()
    navigate("/studentpage", { state: { student } })
  }

  const handleProfileClick = () => {
    resetViews()
    navigate("/studentprofile", { state: { student } })
  }

  const handleCoursesClick = () => {
    resetViews()
    navigate("/studentpage", { state: { student } })
  }

  const handleBrowseJobsClick = () => {
    resetViews()
    navigate("/jobspage", { state: { student } })
  }

  const handleMyApplicationsClick = () => {
    resetViews()
    navigate("/studentapplications", { state: { student } })
  }

  const handleMyInternshipsClick = () => {
    resetViews()
    setActiveSection("internships")
  }

  const handleCompaniesClick = () => {
    resetViews()
    navigate("/companiesforstudents", { state: { student } })
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

  const unreadNotifications = notifications.filter((n) => !viewedNotifications.includes(n.id))

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
                  textTransform: "uppercase",
                }}
              >
                {student.name ? student.name.charAt(0) : "S"}
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
                  color: "#9a4a6a",
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

  const reportStatusStyle = (status) => {
    const styles = {
      accepted: { backgroundColor: "#dcfce7", color: "#166534", border: "1px solid #bbf7d0" },
      rejected: { backgroundColor: "#fee2e2", color: "#b91c1c", border: "1px solid #fecaca" },
      flagged: { backgroundColor: "#fef9c3", color: "#854d0e", border: "1px solid #fde047" },
      pending: { backgroundColor: "#e0f2fe", color: "#0369a1", border: "1px solid #bae6fd" },
      pending_appeal: { backgroundColor: "#ede9fe", color: "#6d28d9", border: "1px solid #ddd6fe" },
      edited_after_final: { backgroundColor: "#ffedd5", color: "#9a3412", border: "1px solid #fed7aa" },
      draft_saved: { backgroundColor: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0" },
      not_submitted: { backgroundColor: "#f8fafc", color: "#64748b", border: "1px solid #e2e8f0" },
    }
    return styles[status] || { backgroundColor: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0" }
  }

  if (!student?.email) {
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
        <h2 style={{ color: "#4a4a6a" }}>Student Information Missing</h2>
        <p style={{ color: "#6a6a8a" }}>Please return to the dashboard to continue.</p>
        <button
          onClick={() => navigate("/studentpage")}
          style={{
            padding: "10px 20px",
            backgroundColor: "#6b46c1",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "bold",
          }}
        >
          Back to Dashboard
        </button>
      </div>
    )
  }

  const reportForFinalView =
    allInternships.find((intern) => intern.uniqueInternshipId === currentInternshipIdForPopup)?.report ||
    defaultReportState

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
            My Internships
          </h1>
          <div style={{ display: "flex", alignItems: "center", marginLeft: "20px" }}>
            <span style={{ color: "#6a6a8a", fontSize: "14px", cursor: "pointer" }} onClick={handleHomeClick}>
              Home
            </span>
            <span style={{ margin: "0 8px", color: "#6a6a8a" }}>/</span>
            <span style={{ color: "#4a4a6a", fontSize: "14px", fontWeight: "bold" }}>Internships</span>
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
                  {" "}
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
                textTransform: "uppercase",
              }}
            >
              {student.name ? student.name.charAt(0) : "S"}
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
              <div style={{ color: "#4a4a6a" }}>Loading internships...</div>
            </div>
          ) : (
            <>
              <div
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}
              >
                <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "#1e293b" }}>
                  My Internship History
                </h2>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#64748b",
                    backgroundColor: "#f8fafc",
                    padding: "4px 10px",
                    borderRadius: "4px",
                  }}
                >{`Total: ${allInternships.length} internships`}</div>
              </div>

              <div
                style={{
                  marginBottom: "20px",
                  border: "1px solid #e2e8f0",
                  padding: "15px",
                  borderRadius: "8px",
                  backgroundColor: "white",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}
              >
                <h3 style={{ margin: "0 0 15px 0", fontSize: "16px", color: "#334155", fontWeight: "600" }}>
                  Companies with your internships:
                </h3>
                {companies.length > 0 ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                    {companies.map((company, index) => (
                      <div
                        key={index}
                        style={{
                          backgroundColor: "#f1f5f9",
                          padding: "10px 15px",
                          borderRadius: "6px",
                          fontSize: "14px",
                          color: "#334155",
                        }}
                      >
                        <div style={{ fontWeight: "600", marginBottom: "4px" }}>{company.companyName || "N/A"}</div>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>{company.companyEmail}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: "#64748b", margin: 0, fontStyle: "italic" }}>
                    No companies found for this student.
                  </p>
                )}
              </div>

              <div
                style={{
                  marginBottom: "20px",
                  backgroundColor: "#f8fafc",
                  padding: "15px",
                  borderRadius: "8px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}
              >
                <div style={{ display: "flex", flexWrap: "wrap", gap: "15px", marginBottom: "15px" }}>
                  <input
                    type="text"
                    placeholder="Search by Job Title or Company..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      padding: "10px",
                      borderRadius: "5px",
                      border: "1px solid #e2e8f0",
                      flexGrow: 1,
                      minWidth: "200px",
                    }}
                  />
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "15px", alignItems: "flex-end" }}>
                  <div style={{ minWidth: "150px" }}>
                    <label
                      htmlFor="statusFilter"
                      style={{
                        display: "block",
                        marginBottom: "5px",
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#334155",
                      }}
                    >
                      Status:
                    </label>
                    <select
                      id="statusFilter"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: "5px",
                        border: "1px solid #e2e8f0",
                        backgroundColor: "white",
                        color: "#334155",
                      }}
                    >
                      <option value="all">All</option>
                      <option value="current">Current</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <button
                    onClick={clearFilters}
                    style={{
                      padding: "10px 16px",
                      backgroundColor: "#f1f5f9",
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
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    Clear Filters
                  </button>
                </div>
              </div>

              {internships.length > 0 ? (
                <div
                  style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "20px" }}
                >
                  {internships.map((internship) => {
                    const report = internship.report
                    const isReportFinalizedAndEvaluated =
                      report.finalSubmitted &&
                      !["draft_saved", "edited_after_final", "not_submitted"].includes(report.status)
                    const isReportDraft =
                      report.submitted && (report.status === "draft_saved" || report.status === "edited_after_final")
                    const isReportNotStarted = report.status === "not_submitted" && !report.submitted

                    return (
                      <div
                        key={internship.uniqueInternshipId}
                        style={{
                          backgroundColor: "white",
                          borderRadius: "8px",
                          padding: "20px",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                          border: "1px solid #e2e8f0",
                          transition: "transform 0.2s, box-shadow 0.2s",
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform = "translateY(-2px)"
                          e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)"
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = "translateY(0)"
                          e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)"
                        }}
                      >
                        <h3
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenInternshipDetails(internship)
                          }}
                          style={{
                            margin: "0 0 10px 0",
                            color: "#6b46c1",
                            fontSize: "18px",
                            fontWeight: "600",
                            cursor: "pointer",
                          }}
                        >
                          {internship.jobTitle}
                        </h3>
                        <div style={{ marginBottom: "15px" }}>
                          <div style={{ display: "flex", alignItems: "center", marginBottom: "5px" }}>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#64748b"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16"></path>
                              <path d="M1 21h22"></path>
                              <path d="M18 5h-2"></path>
                              <path d="M18 9h-2"></path>
                              <path d="M18 13h-2"></path>
                              <path d="M18 17h-2"></path>
                            </svg>
                            <span style={{ marginLeft: "8px", color: "#334155", fontWeight: "500" }}>
                              {internship.companyName || "N/A"}
                            </span>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "4px 10px",
                              borderRadius: "4px",
                              fontSize: "13px",
                              fontWeight: "500",
                              backgroundColor: internship.derivedStatus === "current" ? "#dcfce7" : "#f1f5f9",
                              color: internship.derivedStatus === "current" ? "#166534" : "#475569",
                            }}
                          >
                            {internship.derivedStatus.charAt(0).toUpperCase() + internship.derivedStatus.slice(1)}
                          </span>
                        </div>
                        {internship.description && (
                          <div style={{ marginBottom: "15px" }}>
                            <p
                              style={{
                                margin: "0",
                                fontSize: "14px",
                                color: "#475569",
                                lineHeight: "1.5",
                                maxHeight: "60px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                display: "-webkit-box",
                                WebkitLineClamp: "2",
                                WebkitBoxOrient: "vertical",
                              }}
                            >
                              {internship.description}
                            </p>
                          </div>
                        )}
                        {internship.derivedStatus === "completed" && (
                          <div style={{ marginTop: "15px", borderTop: "1px solid #e2e8f0", paddingTop: "15px" }}>
                            <div style={{ marginBottom: "15px" }}>
                              <h4
                                style={{ margin: "0 0 8px 0", fontSize: "15px", fontWeight: "600", color: "#334155" }}
                              >
                                Your Evaluation of {internship.companyName || "Company"}
                              </h4>
                              {internship.evaluation.submitted ? (
                                <div
                                  style={{
                                    padding: "10px",
                                    backgroundColor: "#f8fafc",
                                    borderRadius: "4px",
                                    border: "1px solid #e2e8f0",
                                  }}
                                >
                                  <p
                                    style={{
                                      fontSize: "14px",
                                      color: "#475569",
                                      whiteSpace: "pre-wrap",
                                      margin: "0 0 8px 0",
                                    }}
                                  >
                                    {internship.evaluation.text}
                                  </p>
                                  <p
                                    style={{
                                      fontSize: "14px",
                                      color: internship.evaluation.recommend ? "#166534" : "#b91c1c",
                                      fontWeight: "500",
                                      margin: 0,
                                    }}
                                  >
                                    {internship.evaluation.recommend ? "✓ Recommended" : "✗ Not Recommended"}
                                  </p>
                                </div>
                              ) : (
                                <p style={{ fontSize: "14px", color: "#64748b", fontStyle: "italic" }}>
                                  No evaluation submitted yet.
                                </p>
                              )}
                              <div style={{ marginTop: "8px", display: "flex", gap: "8px" }}>
                                {/* Replace the evaluation button with: */}
                                <button
                                  onClick={() => handleOpenEvaluationPopup(internship.uniqueInternshipId)}
                                  disabled={disabledButtons.evaluations[internship.uniqueInternshipId]}
                                  style={{
                                    padding: "6px 10px",
                                    backgroundColor: disabledButtons.evaluations[internship.uniqueInternshipId]
                                      ? "#e2e8f0"
                                      : "#eef2ff",
                                    color: disabledButtons.evaluations[internship.uniqueInternshipId]
                                      ? "#94a3b8"
                                      : "#4338ca",
                                    border: "1px solid #c7d2fe",
                                    borderRadius: "4px",
                                    cursor: disabledButtons.evaluations[internship.uniqueInternshipId]
                                      ? "not-allowed"
                                      : "pointer",
                                    fontSize: "13px",
                                    fontWeight: "500",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "6px",
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
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                  </svg>
                                  {internship.evaluation.submitted ? "Edit Evaluation" : "Add Evaluation"}
                                </button>
                                {internship.evaluation.submitted && (
                                  /* Replace the delete evaluation button with: */
                                  <button
                                    onClick={() => handleDeleteEvaluation(internship.uniqueInternshipId)}
                                    disabled={disabledButtons.evaluations[`delete_${internship.uniqueInternshipId}`]}
                                    title="Delete Evaluation"
                                    style={{
                                      padding: "6px 10px",
                                      backgroundColor: disabledButtons.evaluations[
                                        `delete_${internship.uniqueInternshipId}`
                                      ]
                                        ? "#fef2f2"
                                        : "#fee2e2",
                                      color: disabledButtons.evaluations[`delete_${internship.uniqueInternshipId}`]
                                        ? "#ef4444"
                                        : "#dc2626",
                                      border: "1px solid #fecaca",
                                      borderRadius: "4px",
                                      cursor: disabledButtons.evaluations[`delete_${internship.uniqueInternshipId}`]
                                        ? "not-allowed"
                                        : "pointer",
                                      fontSize: "13px",
                                      fontWeight: "500",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: "6px",
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
                                      <polyline points="3 6 5 6 21 6"></polyline>
                                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                      <line x1="10" y1="11" x2="10" y2="17"></line>
                                      <line x1="14" y1="11" x2="14" y2="17"></line>
                                    </svg>
                                    Delete
                                  </button>
                                )}
                              </div>
                            </div>

                            <div style={{ marginTop: "15px", borderTop: "1px solid #e2e8f0", paddingTop: "15px" }}>
                              <h4
                                style={{ margin: "0 0 10px 0", fontSize: "15px", fontWeight: "600", color: "#334155" }}
                              >
                                Internship Report
                              </h4>

                              {/* Case 1: Report is fully finalized (pending, accepted, rejected, flagged) */}
                              {isReportFinalizedAndEvaluated ? (
                                <div>
                                  <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
                                    <span style={{ marginRight: "8px", color: "#64748b", fontSize: "14px" }}>
                                      Report Status:
                                    </span>
                                    <span
                                      style={{
                                        display: "inline-block",
                                        padding: "3px 8px",
                                        borderRadius: "4px",
                                        fontSize: "12px",
                                        fontWeight: "500",
                                        ...reportStatusStyle(report.status),
                                      }}
                                    >
                                      {report.status.replace(/_/g, " ").toUpperCase()}
                                    </span>
                                  </div>
                                  {/* Display report status outside popup */}
                                  {isReportFinalizedAndEvaluated && (
                                    <div style={{ marginTop: "8px" }}>
                                      <span
                                        style={{
                                          display: "inline-block",
                                          padding: "3px 8px",
                                          borderRadius: "4px",
                                          fontSize: "12px",
                                          fontWeight: "500",
                                          ...reportStatusStyle(report.status),
                                        }}
                                      >
                                        {report.status.replace(/_/g, " ").toUpperCase()}
                                      </span>
                                    </div>
                                  )}
                                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
                                    <button
                                      onClick={() => handleOpenFinalReportView(internship.uniqueInternshipId)}
                                      style={
                                        {
                                          /* Style for View Report */
                                        }
                                      }
                                    >
                                      View Submitted Report
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleOpenReportForm(internship.uniqueInternshipId, "create_new_version")
                                      }
                                      style={
                                        {
                                          /* Style for Create New */
                                        }
                                      }
                                    >
                                      Create New Version
                                    </button>
                                    {["rejected", "flagged"].includes(report.status) && report.evaluatorComments && (
                                      <button onClick={() => handleOpenCommentsPopup(report.evaluatorComments)}>
                                        View Comments
                                      </button>
                                    )}
                                    {/* Replace the existing appeal button code with this improved version: */}
                                    {/* Appeal button - only visible for flagged or rejected reports */}
                                    {["rejected", "flagged"].includes(report.status) && !report.appealSubmitted && (
                                      <button
                                        onClick={() => handleOpenAppealPopup(internship.uniqueInternshipId)}
                                        style={{
                                          padding: "6px 10px",
                                          backgroundColor: "#ede9fe",
                                          color: "#6d28d9",
                                          border: "1px solid #ddd6fe",
                                          borderRadius: "4px",
                                          cursor: "pointer",
                                          fontSize: "13px",
                                          fontWeight: "500",
                                          display: "inline-flex",
                                          alignItems: "center",
                                          gap: "6px",
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
                                          <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"></path>
                                        </svg>
                                        Appeal Report
                                      </button>
                                    )}
                                    <button onClick={() => handleDeleteReport(internship.uniqueInternshipId)}>
                                      Delete Report
                                    </button>
                                  </div>
                                  {/* Add a visual indicator for the appeal status by adding this code after the report status display */}
                                  {report.appealSubmitted && (
                                    <div
                                      style={{
                                        marginTop: "10px",
                                        padding: "8px 12px",
                                        backgroundColor: "#ede9fe",
                                        borderRadius: "4px",
                                        fontSize: "13px",
                                        color: "#6d28d9",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px",
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
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <polyline points="12 6 12 12 16 14"></polyline>
                                      </svg>
                                      Appeal submitted - waiting for review
                                    </div>
                                  )}
                                </div>
                              ) : (
                                // Case 2: Report is a draft or not started
                                <div>
                                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
                                    {/* Replace the report button with: */}
                                    <button
                                      onClick={() => handleOpenReportForm(internship.uniqueInternshipId, "edit_or_add")}
                                      disabled={disabledButtons.reports[internship.uniqueInternshipId]}
                                      style={{
                                        padding: "6px 10px",
                                        backgroundColor: disabledButtons.reports[internship.uniqueInternshipId]
                                          ? "#e2e8f0"
                                          : "#6b46c1",
                                        color: disabledButtons.reports[internship.uniqueInternshipId]
                                          ? "#94a3b8"
                                          : "white",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: disabledButtons.reports[internship.uniqueInternshipId]
                                          ? "not-allowed"
                                          : "pointer",
                                        fontSize: "13px",
                                        fontWeight: "500",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "6px",
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
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                      </svg>
                                      {isReportNotStarted ? "Add Internship Report" : "Edit Report Draft"}
                                    </button>
                                    {report.submitted && ( // Show if there's any draft
                                      <button
                                        onClick={() => handleOpenFinalReportView(internship.uniqueInternshipId)}
                                        style={{
                                          padding: "6px 10px",
                                          backgroundColor: "#10b981",
                                          color: "white",
                                          border: "none",
                                          borderRadius: "4px",
                                          cursor: "pointer",
                                          fontSize: "13px",
                                          fontWeight: "500",
                                          display: "inline-flex",
                                          alignItems: "center",
                                          gap: "6px",
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
                                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                        </svg>
                                        View and Submit Final Report
                                      </button>
                                    )}
                                    {!isReportNotStarted && ( // Show delete for any existing report
                                      /* Replace the delete report button with: */
                                      <button
                                        onClick={() => handleDeleteReport(internship.uniqueInternshipId)}
                                        disabled={disabledButtons.reports[`delete_${internship.uniqueInternshipId}`]}
                                        title="Delete Report"
                                        style={{
                                          padding: "6px 10px",
                                          backgroundColor: disabledButtons.reports[
                                            `delete_${internship.uniqueInternshipId}`
                                          ]
                                            ? "#fef2f2"
                                            : "#fee2e2",
                                          color: disabledButtons.reports[`delete_${internship.uniqueInternshipId}`]
                                            ? "#ef4444"
                                            : "#dc2626",
                                          border: "1px solid #fecaca",
                                          borderRadius: "4px",
                                          cursor: disabledButtons.reports[`delete_${internship.uniqueInternshipId}`]
                                            ? "not-allowed"
                                            : "pointer",
                                          fontSize: "13px",
                                          fontWeight: "500",
                                          display: "inline-flex",
                                          alignItems: "center",
                                          gap: "6px",
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
                                          <polyline points="3 6 5 6 21 6"></polyline>
                                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                          <line x1="10" y1="11" x2="10" y2="17"></line>
                                          <line x1="14" y1="11" x2="14" y2="17"></line>
                                        </svg>
                                        Delete Report
                                      </button>
                                    )}
                                  </div>
                                  {isReportNotStarted && (
                                    <p
                                      style={{
                                        fontSize: "13px",
                                        color: "#64748b",
                                        marginTop: "8px",
                                        marginBottom: "0",
                                      }}
                                    >
                                      No report draft started.
                                    </p>
                                  )}
                                  {report.status === "edited_after_final" && report.submitted && (
                                    <div
                                      style={{
                                        marginTop: "8px",
                                        padding: "6px 10px",
                                        backgroundColor: "#ffedd5",
                                        borderRadius: "4px",
                                        fontSize: "13px",
                                        color: "#9a3412",
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
                                        style={{ display: "inline", marginRight: "6px" }}
                                      >
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <line x1="12" y1="8" x2="12" y2="12"></line>
                                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                      </svg>
                                      Editing a new version of a previously finalized report.
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div
                  style={{
                    backgroundColor: "white",
                    borderRadius: "8px",
                    padding: "40px 20px",
                    textAlign: "center",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
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
                      <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16"></path>
                      <path d="M1 21h22"></path>
                      <path d="M18 5h-2"></path>
                      <path d="M18 9h-2"></path>
                      <path d="M18 13h-2"></path>
                      <path d="M18 17h-2"></path>
                    </svg>
                  </div>
                  <h3 style={{ color: "#4a4a6a", margin: "0 0 10px 0", fontSize: "18px" }}>No Internships Found</h3>
                  <p style={{ color: "#6a6a8a", margin: "0 0 20px 0", fontSize: "14px" }}>
                    No internships match your current filters or no internships have been recorded.
                  </p>
                  <button
                    onClick={clearFilters}
                    style={{
                      padding: "10px 20px",
                      backgroundColor: "#6b46c1",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
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
                    Clear Filters
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Evaluation Popup */}
      {showEvaluationPopup && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(3px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "30px",
              borderRadius: "12px",
              width: "90%",
              maxWidth: "600px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
              textAlign: "center",
            }}
          >
            <h3 style={{ margin: "0 0 25px 0", color: "#334155", fontSize: "20px", fontWeight: "600" }}>
              Company Evaluation
            </h3>
            <textarea
              placeholder="Write your evaluation of the company..."
              value={popupEvaluationData.text}
              onChange={(e) => setPopupEvaluationData((prev) => ({ ...prev, text: e.target.value }))}
              rows={6}
              style={{
                width: "100%",
                padding: "15px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                marginBottom: "20px",
                fontSize: "14px",
                color: "#334155",
                resize: "vertical",
                textAlign: "left",
                boxSizing: "border-box",
              }}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "20px",
                fontSize: "14px",
                color: "#334155",
              }}
            >
              <input
                type="checkbox"
                checked={popupEvaluationData.recommend}
                onChange={(e) => setPopupEvaluationData((prev) => ({ ...prev, recommend: e.target.checked }))}
                style={{ marginRight: "10px", transform: "scale(1.1)" }}
              />
              I recommend this company for future internships
            </div>
            {evaluationError && (
              <p style={{ color: "#ef4444", marginBottom: "20px", fontSize: "14px" }}>{evaluationError}</p>
            )}
            <div style={{ display: "flex", justifyContent: "center", gap: "15px", marginTop: "25px" }}>
              <button
                onClick={() => setShowEvaluationPopup(false)}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#f1f5f9",
                  color: "#64748b",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Cancel
              </button>
              {popupEvaluationData.submitted && (
                <button
                  onClick={() => handleDeleteEvaluation(currentInternshipIdForPopup)}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#fee2e2",
                    color: "#dc2626",
                    border: "1px solid #fecaca",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  Delete Evaluation
                </button>
              )}
              <button
                onClick={handleSaveEvaluation}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#6b46c1",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Save Evaluation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Popup */}
      {showReportPopup && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(3px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
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
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}
            >
              <h3
                style={{
                  margin: 0,
                  color: "#334155",
                  fontSize: "18px",
                  fontWeight: "600",
                  flexGrow: 1,
                  textAlign: "center",
                }}
              >
                Internship Report Draft
              </h3>
              <button
                onClick={handleDownloadSampleReport}
                style={{
                  padding: "8px 12px",
                  backgroundColor: "#0ea5e9",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "500",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
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
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download Sample
              </button>
            </div>
            <div style={{ marginBottom: "15px" }}>
              <label
                htmlFor="reportTitle"
                style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500", color: "#334155" }}
              >
                Report Title
              </label>
              <input
                id="reportTitle"
                type="text"
                placeholder="Enter report title"
                value={popupReportData.title}
                onChange={(e) => setPopupReportData((prev) => ({ ...prev, title: e.target.value }))}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "6px",
                  border: reportErrors.title ? "1px solid #ef4444" : "1px solid #e2e8f0",
                  fontSize: "14px",
                  color: "#334155",
                }}
              />
              {reportErrors.title && (
                <p style={{ color: "#ef4444", margin: "4px 0 0 0", fontSize: "13px" }}>{reportErrors.title}</p>
              )}
            </div>
            <div style={{ marginBottom: "15px" }}>
              <label
                htmlFor="reportIntroduction"
                style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500", color: "#334155" }}
              >
                Introduction
              </label>
              <textarea
                id="reportIntroduction"
                placeholder="Write an introduction for your report"
                value={popupReportData.introduction}
                onChange={(e) => setPopupReportData((prev) => ({ ...prev, introduction: e.target.value }))}
                rows={3}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "6px",
                  border: reportErrors.introduction ? "1px solid #ef4444" : "1px solid #e2e8f0",
                  fontSize: "14px",
                  color: "#334155",
                  resize: "vertical",
                }}
              />
              {reportErrors.introduction && (
                <p style={{ color: "#ef4444", margin: "4px 0 0 0", fontSize: "13px" }}>{reportErrors.introduction}</p>
              )}
            </div>
            <div style={{ marginBottom: "15px" }}>
              <label
                htmlFor="reportBody"
                style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500", color: "#334155" }}
              >
                Body
              </label>
              <textarea
                id="reportBody"
                placeholder="Write the main content of your report"
                value={popupReportData.body}
                onChange={(e) => setPopupReportData((prev) => ({ ...prev, body: e.target.value }))}
                rows={6}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "6px",
                  border: reportErrors.body ? "1px solid #ef4444" : "1px solid #e2e8f0",
                  fontSize: "14px",
                  color: "#334155",
                  resize: "vertical",
                }}
              />
              {reportErrors.body && (
                <p style={{ color: "#ef4444", margin: "4px 0 0 0", fontSize: "13px" }}>{reportErrors.body}</p>
              )}
            </div>
            <div style={{ marginBottom: "15px" }}>
              <label
                htmlFor="reportMajor"
                style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500", color: "#334155" }}
              >
                Major
              </label>
              <select
                id="reportMajor"
                value={popupReportData.major}
                onChange={(e) => setPopupReportData((prev) => ({ ...prev, major: e.target.value, courses: [] }))}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "6px",
                  border: reportErrors.major ? "1px solid #ef4444" : "1px solid #e2e8f0",
                  fontSize: "14px",
                  color: "#334155",
                  backgroundColor: "white",
                }}
              >
                <option value="">Select Major</option>
                {majorsWithCourses.map((m, idx) => (
                  <option key={idx} value={m.major}>
                    {m.major}
                  </option>
                ))}
              </select>
              {reportErrors.major && (
                <p style={{ color: "#ef4444", margin: "4px 0 0 0", fontSize: "13px" }}>{reportErrors.major}</p>
              )}
            </div>
            {popupReportData.major && (
              <div
                style={{
                  marginBottom: "15px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  padding: "15px",
                  backgroundColor: "#f8fafc",
                }}
              >
                <label
                  style={{
                    display: "block",
                    marginBottom: "10px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#334155",
                  }}
                >
                  Select courses that helped with this internship:
                </label>
                <div
                  style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "8px" }}
                >
                  {majorsWithCourses
                    .find((m) => m.major === popupReportData.major)
                    ?.courses.map((course, idx) => (
                      <label
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          fontSize: "14px",
                          color: "#475569",
                          padding: "4px",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="checkbox"
                          value={course}
                          checked={popupReportData.courses.includes(course)}
                          onChange={(e) => {
                            const selected = popupReportData.courses.includes(course)
                              ? popupReportData.courses.filter((c) => c !== course)
                              : [...popupReportData.courses, course]
                            setPopupReportData((prev) => ({ ...prev, courses: selected }))
                          }}
                          style={{ marginRight: "8px" }}
                        />
                        {course}
                      </label>
                    ))}
                </div>
                {reportErrors.courses && (
                  <p style={{ color: "#ef4444", margin: "8px 0 0 0", fontSize: "13px" }}>{reportErrors.courses}</p>
                )}
              </div>
            )}
            <div style={{ marginBottom: "15px" }}>
              <label
                htmlFor="reportPdf"
                style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500", color: "#334155" }}
              >
                Upload PDF Report
              </label>
              <input
                id="reportPdf"
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  const file = e.target.files[0]
                  setPopupReportData((prev) => ({ ...prev, pdfFile: file, pdfFileName: file ? file.name : "" }))
                }}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "6px",
                  border: reportErrors.pdfFile ? "1px solid #ef4444" : "1px solid #e2e8f0",
                  fontSize: "14px",
                  color: "#334155",
                  backgroundColor: "white",
                }}
              />
              {popupReportData.pdfFile ? (
                <p style={{ fontSize: "13px", color: "#64748b", margin: "6px 0 0 0" }}>
                  Selected file: {popupReportData.pdfFile.name}
                </p>
              ) : popupReportData.pdfFileName ? (
                <p style={{ fontSize: "13px", color: "#64748b", margin: "6px 0 0 0" }}>
                  Current file: {popupReportData.pdfFileName} (re-select to change)
                </p>
              ) : null}
              {reportErrors.pdfFile && (
                <p style={{ color: "#ef4444", margin: "4px 0 0 0", fontSize: "13px" }}>{reportErrors.pdfFile}</p>
              )}
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "20px" }}>
              <button
                onClick={() => setShowReportPopup(false)}
                style={{
                  padding: "10px 16px",
                  backgroundColor: "#f1f5f9",
                  color: "#64748b",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Cancel
              </button>
              {(popupReportData.submitted || popupReportData.status === "edited_after_final") &&
                !popupReportData.finalSubmitted && (
                  <button
                    onClick={() => handleDeleteReport(currentInternshipIdForPopup)}
                    style={{
                      padding: "10px 16px",
                      backgroundColor: "#fee2e2",
                      color: "#dc2626",
                      border: "1px solid #fecaca",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Delete Draft
                  </button>
                )}
              <button
                onClick={handleSaveReport}
                style={{
                  padding: "10px 16px",
                  backgroundColor: "#6b46c1",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Save Report Draft
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Final Report View Popup */}
      {showFinalReportView && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(3px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
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
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
              textAlign: "center",
            }}
            role="dialog"
            aria-labelledby="finalReportTitle"
          >
            <h3
              id="finalReportTitle"
              style={{
                margin: "0 0 20px 0",
                color: "#334155",
                fontSize: "18px",
                fontWeight: "600",
                borderBottom: "1px solid #e2e8f0",
                paddingBottom: "15px",
              }}
            >
              {popupReportData.finalSubmitted ? "Submitted Report" : "Report Draft Review"}
            </h3>

            {/* Report Status Badge - Only show for finalized reports */}
            {popupReportData.finalSubmitted && (
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "15px" }}>
                <span
                  style={{
                    display: "inline-block",
                    padding: "5px 12px",
                    borderRadius: "4px",
                    fontSize: "14px",
                    fontWeight: "500",
                    ...reportStatusStyle(popupReportData.status),
                  }}
                >
                  {popupReportData.status.replace(/_/g, " ").toUpperCase()}
                </span>
              </div>
            )}

            <div style={{ marginBottom: "15px", textAlign: "left" }}>
              <h4
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#334155",
                  textAlign: "center",
                }}
              >
                Title
              </h4>
              <div
                style={{
                  padding: "12px 15px",
                  backgroundColor: "#f8fafc",
                  borderRadius: "6px",
                  border: "1px solid #e2e8f0",
                  fontSize: "15px",
                  color: "#334155",
                  textAlign: "center",
                }}
              >
                {popupReportData.title || "N/A"}
              </div>
            </div>
            <div style={{ marginBottom: "15px", textAlign: "left" }}>
              <h4
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#334155",
                  textAlign: "center",
                }}
              >
                Introduction
              </h4>
              <div
                style={{
                  padding: "12px 15px",
                  backgroundColor: "#f8fafc",
                  borderRadius: "6px",
                  border: "1px solid #e2e8f0",
                  fontSize: "14px",
                  color: "#334155",
                  whiteSpace: "pre-wrap",
                  maxHeight: "150px",
                  overflowY: "auto",
                  textAlign: "center",
                }}
              >
                {popupReportData.introduction || "N/A"}
              </div>
            </div>
            <div style={{ marginBottom: "15px", textAlign: "left" }}>
              <h4
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#334155",
                  textAlign: "center",
                }}
              >
                Body
              </h4>
              <div
                style={{
                  padding: "12px 15px",
                  backgroundColor: "#f8fafc",
                  borderRadius: "6px",
                  border: "1px solid #e2e8f0",
                  fontSize: "14px",
                  color: "#334155",
                  whiteSpace: "pre-wrap",
                  maxHeight: "200px",
                  overflowY: "auto",
                  textAlign: "center",
                }}
              >
                {popupReportData.body || "N/A"}
              </div>
            </div>
            <div style={{ marginBottom: "15px", textAlign: "left" }}>
              <h4
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#334155",
                  textAlign: "center",
                }}
              >
                Major
              </h4>
              <div
                style={{
                  padding: "12px 15px",
                  backgroundColor: "#f8fafc",
                  borderRadius: "6px",
                  border: "1px solid #e2e8f0",
                  fontSize: "14px",
                  color: "#334155",
                  textAlign: "center",
                }}
              >
                {popupReportData.major || "N/A"}
              </div>
            </div>
            {popupReportData.major && popupReportData.courses.length > 0 && (
              <div style={{ marginBottom: "15px", textAlign: "left" }}>
                <h4
                  style={{
                    margin: "0 0 8px 0",
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#334155",
                    textAlign: "center",
                  }}
                >
                  Relevant Courses
                </h4>
                <div
                  style={{
                    padding: "12px 15px",
                    backgroundColor: "#f8fafc",
                    borderRadius: "6px",
                    border: "1px solid #e2e8f0",
                    fontSize: "14px",
                    color: "#334155",
                    textAlign: "center",
                  }}
                >
                  <ul style={{ margin: "0", paddingLeft: "20px", listStylePosition: "inside", textAlign: "left" }}>
                    {popupReportData.courses.map((course) => (
                      <li key={course} style={{ marginBottom: "4px" }}>
                        {course}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            <div style={{ marginBottom: "15px", textAlign: "left" }}>
              <h4
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#334155",
                  textAlign: "center",
                }}
              >
                Uploaded PDF
              </h4>
              <div
                style={{
                  padding: "12px 15px",
                  backgroundColor: "#f8fafc",
                  borderRadius: "6px",
                  border: "1px solid #e2e8f0",
                  fontSize: "14px",
                  color: "#334155",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#64748b"
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
                {popupReportData.pdfFileName || "None"}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "10px",
                marginTop: "20px",
                paddingTop: "15px",
                borderTop: "1px solid #e2e8f0",
              }}
            >
              {popupReportData.status === "draft_saved" || popupReportData.status === "edited_after_final" ? (
                <>
                  <button
                    onClick={() => {
                      setShowFinalReportView(false)
                    }}
                    style={{
                      padding: "10px 16px",
                      backgroundColor: "#f1f5f9",
                      color: "#64748b",
                      border: "1px solid #e2e8f0",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setShowFinalReportView(false)
                      handleOpenReportForm(currentInternshipIdForPopup, "edit_or_add")
                    }}
                    style={{
                      padding: "10px 16px",
                      backgroundColor: "#eef2ff",
                      color: "#4338ca",
                      border: "1px solid #c7d2fe",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Edit Draft
                  </button>
                  <button
                    onClick={() => handleDeleteReport(currentInternshipIdForPopup)}
                    style={{
                      padding: "10px 16px",
                      backgroundColor: "#fee2e2",
                      color: "#dc2626",
                      border: "1px solid #fecaca",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Delete Draft
                  </button>
                  <button
                    onClick={handleFinalReportSubmit}
                    style={{
                      padding: "10px 16px",
                      backgroundColor: "#6b46c1",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Submit Final Report
                  </button>
                </> // Viewing an already finalized report
              ) : (
                <>
                  <button
                    onClick={() => setShowFinalReportView(false)}
                    style={{
                      padding: "10px 16px",
                      backgroundColor: "#f1f5f9",
                      color: "#64748b",
                      border: "1px solid #e2e8f0",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setShowFinalReportView(false)
                      handleOpenReportForm(currentInternshipIdForPopup, "create_new_version")
                    }}
                    style={{
                      padding: "10px 16px",
                      backgroundColor: "#fbbf24",
                      color: "#78350f",
                      border: "1px solid #f59e0b",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Create New Version
                  </button>
                  <button
                    onClick={() => handleDeleteReport(currentInternshipIdForPopup)}
                    style={{
                      padding: "10px 16px",
                      backgroundColor: "#fee2e2",
                      color: "#dc2626",
                      border: "1px solid #fecaca",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Delete Report
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Comments Popup - CENTERED */}
      {showCommentsPopup && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(3px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "25px",
              borderRadius: "12px",
              width: "90%",
              maxWidth: "600px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
              textAlign: "center",
            }}
          >
            <h3 style={{ margin: "0 0 15px 0", color: "#334155", fontSize: "18px", fontWeight: "600" }}>
              Evaluator Comments
            </h3>
            <div
              style={{
                padding: "15px",
                backgroundColor: "#fef9c3",
                borderRadius: "6px",
                border: "1px solid #fde047",
                fontSize: "14px",
                color: "#854d0e",
                whiteSpace: "pre-wrap",
                marginBottom: "20px",
                textAlign: "left",
              }}
            >
              {commentsToView || "No comments provided."}
            </div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <button
                onClick={() => setShowCommentsPopup(false)}
                style={{
                  padding: "10px 16px",
                  backgroundColor: "#6b46c1",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Appeal Popup - CENTERED */}
      {showAppealPopup && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(3px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "25px",
              borderRadius: "12px",
              width: "90%",
              maxWidth: "600px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
              textAlign: "center",
            }}
          >
            <h3 style={{ margin: "0 0 15px 0", color: "#334155", fontSize: "18px", fontWeight: "600" }}>
              Appeal Rejected/Flagged Report
            </h3>
            <div
              style={{
                backgroundColor: "#ede9fe",
                padding: "12px",
                borderRadius: "6px",
                marginBottom: "15px",
                color: "#6d28d9",
                fontSize: "14px",
                textAlign: "left",
              }}
            >
              <p style={{ margin: "0 0 10px 0" }}>
                <strong>Important:</strong> Your appeal will be reviewed by faculty. Please provide clear and specific
                reasons why you believe the decision should be reconsidered.
              </p>
            </div>
            <p style={{ margin: "0 0 15px 0", color: "#475569", fontSize: "14px" }}>
              Please provide your reasons for appealing the decision on your report. This message is optional.
            </p>
            <textarea
              placeholder="Enter your appeal message to faculty (optional)..."
              value={appealMessageInput}
              onChange={(e) => setAppealMessageInput(e.target.value)}
              rows={6}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "6px",
                border: appealError ? "1px solid #ef4444" : "1px solid #e2e8f0",
                fontSize: "14px",
                color: "#334155",
                resize: "vertical",
                marginBottom: "15px",
                textAlign: "left",
              }}
            />
            {appealError && <p style={{ color: "#ef4444", margin: "0 0 15px 0", fontSize: "14px" }}>{appealError}</p>}
            <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
              <button
                onClick={() => setShowAppealPopup(false)}
                style={{
                  padding: "10px 16px",
                  backgroundColor: "#f1f5f9",
                  color: "#64748b",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAppeal}
                style={{
                  padding: "10px 16px",
                  backgroundColor: "#6d28d9",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Submit Appeal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Internship Details Popup */}
      {showInternshipDetailsPopup && currentInternshipDetails && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(3px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "25px",
              borderRadius: "12px",
              width: "90%",
              maxWidth: "600px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            }}
          >
            <h3
              style={{
                margin: "0 0 20px 0",
                color: "#334155",
                fontSize: "20px",
                fontWeight: "600",
                textAlign: "center",
              }}
            >
              Internship Details
            </h3>

            <div style={{ marginBottom: "15px" }}>
              <h4 style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: "600", color: "#334155" }}>Position</h4>
              <div
                style={{
                  padding: "12px 15px",
                  backgroundColor: "#f8fafc",
                  borderRadius: "6px",
                  border: "1px solid #e2e8f0",
                }}
              >
                {currentInternshipDetails.jobTitle}
              </div>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <h4 style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: "600", color: "#334155" }}>Company</h4>
              <div
                style={{
                  padding: "12px 15px",
                  backgroundColor: "#f8fafc",
                  borderRadius: "6px",
                  border: "1px solid #e2e8f0",
                }}
              >
                {currentInternshipDetails.companyName}
              </div>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <h4 style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: "600", color: "#334155" }}>Duration</h4>
              <div
                style={{
                  padding: "12px 15px",
                  backgroundColor: "#f8fafc",
                  borderRadius: "6px",
                  border: "1px solid #e2e8f0",
                }}
              >
                {currentInternshipDetails.startDate} - {currentInternshipDetails.endDate || "Present"}
              </div>
            </div>

            {currentInternshipDetails.description && (
              <div style={{ marginBottom: "15px" }}>
                <h4 style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: "600", color: "#334155" }}>
                  Description
                </h4>
                <div
                  style={{
                    padding: "12px 15px",
                    backgroundColor: "#f8fafc",
                    borderRadius: "6px",
                    border: "1px solid #e2e8f0",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {currentInternshipDetails.description}
                </div>
              </div>
            )}

            {currentInternshipDetails.report && currentInternshipDetails.report.status !== "not_submitted" && (
              <div style={{ marginBottom: "15px" }}>
                <h4 style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: "600", color: "#334155" }}>
                  Report Status
                </h4>
                <div
                  style={{
                    padding: "8px 12px",
                    backgroundColor: "#f8fafc",
                    borderRadius: "6px",
                    border: "1px solid #e2e8f0",
                    display: "inline-block",
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      padding: "3px 8px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      fontWeight: "500",
                      ...reportStatusStyle(currentInternshipDetails.report.status),
                    }}
                  >
                    {currentInternshipDetails.report.status.replace(/_/g, " ").toUpperCase()}
                  </span>
                </div>
              </div>
            )}

            {currentInternshipDetails.report && currentInternshipDetails.report.evaluatorComments && (
              <div style={{ marginBottom: "15px" }}>
                <h4 style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: "600", color: "#334155" }}>
                  Faculty Comments
                </h4>
                <div
                  style={{
                    padding: "12px 15px",
                    backgroundColor: "#f8fafc",
                    borderRadius: "6px",
                    border: "1px solid #e2e8f0",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {currentInternshipDetails.report.evaluatorComments}
                </div>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
              <button
                onClick={() => setShowInternshipDetailsPopup(false)}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#6b46c1",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast - CENTERED TEXT */}
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
            textAlign: "center",
          }}
        >
          {notificationContent.message}
        </div>
      )}

      {/* Logout Confirmation Dialog - ALREADY CENTERED */}
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

export default MyInternshipsPage
