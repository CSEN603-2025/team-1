"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { getNotification, clearNotifications,setNotification} from "./notification"

function CompanyPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [companyName, setCompanyName] = useState("")
  const [isJobModalOpen, setIsJobModalOpen] = useState(false)
  const [editingIndex, setEditingIndex] = useState(null) // Stores the index in postedJobs
  const [jobData, setJobData] = useState({
    id: null, // Added to manage ID explicitly
    title: "",
    duration: "",
    isPaid: false,
    salary: "",
    skills: "",
    description: "",
    industry: "",
    applicants: [], // Keep applicants associated if editing
  })
  const [postedJobs, setPostedJobs] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterPaid, setFilterPaid] = useState({ paid: false, unpaid: false })
  const [filterDuration, setFilterDuration] = useState({
    "1 month": false,
    "2 months": false,
    "3 months": false,
  })
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  const [selectedJobApplicants, setSelectedJobApplicants] = useState(null)
  const [currentJobIndex, setCurrentJobIndex] = useState(null) // Index for viewing applicants
  const [isApplicantsModalOpen, setIsApplicantsModalOpen] = useState(false)
  const [selectedApplicant, setSelectedApplicant] = useState(null)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [applicantFilter, setApplicantFilter] = useState({
    status: "",
    search: "",
    jobTitle: "", // For the specific job's applicants modal
  })
  const [allApplicantsFilter, setAllApplicantsFilter] = useState({ // For the main applicants tab
    status: "",
    search: "",
    jobTitle: "",
  })
  const [acceptedInterns, setAcceptedInterns] = useState([])
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [activeTab, setActiveTab] = useState("jobs")

  const navigate = useNavigate()
  const location = useLocation()
  const storedCompany = location.state?.company

  // Load initial data
  useEffect(() => {
    if (storedCompany?.companyEmail) {
      setCompanyName(storedCompany.companyName || storedCompany.companyEmail)

      // Load posted jobs
      const storedJobsString = localStorage.getItem(`companyJobs_${storedCompany.companyEmail}`)
      let companyJobs = []
      if (storedJobsString) {
        try {
          const parsedJobs = JSON.parse(storedJobsString)
          if (Array.isArray(parsedJobs)) {
            companyJobs = parsedJobs
          }
        } catch (error) {
          console.error("Error parsing company jobs from localStorage:", error)
        }
      }
      
      // Ensure all jobs have a unique ID
      const jobsWithEnsuredIds = companyJobs.map((job, index) => ({
        ...job,
        id: job.id || `job_${storedCompany.companyEmail}_${Date.now()}_${index}_${Math.random().toString(36).substring(2,9)}`
      }));
      setPostedJobs(jobsWithEnsuredIds)

      // Load accepted interns
      const companyInternsKey = `companyInterns_${storedCompany.companyEmail}`
      const storedInterns = localStorage.getItem(companyInternsKey)
      if (storedInterns) {
        try {
            const parsedInterns = JSON.parse(storedInterns);
            if (Array.isArray(parsedInterns)) setAcceptedInterns(parsedInterns);
        } catch(e) { console.error("Error parsing interns:", e)}
      }
    } else {
        // Optional: Redirect if no company info
        // navigate("/company-login");
    }
  }, [storedCompany?.companyEmail, storedCompany?.companyName, navigate]) // More specific dependencies

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Update localStorage when postedJobs changes
  useEffect(() => {
    if (storedCompany?.companyEmail) {
      localStorage.setItem(`companyJobs_${storedCompany.companyEmail}`, JSON.stringify(postedJobs))
      updateGlobalJobList(
        storedCompany.companyName || storedCompany.companyEmail,
        storedCompany.companyEmail,
        postedJobs
      )
    }
  }, [postedJobs, storedCompany?.companyEmail, storedCompany?.companyName])

  const updateGlobalJobList = (currentCompanyName, currentCompanyEmail, currentCompanyJobs) => {
    const allJobsString = localStorage.getItem("allJobs") || "[]"
    let allJobs = []
    try {
      const parsed = JSON.parse(allJobsString)
      if (Array.isArray(parsed)) allJobs = parsed
    } catch (e) {
      console.error("Error parsing allJobs from localStorage:", e)
    }

    // Filter out jobs from the current company
    const otherCompanyJobs = allJobs.filter((job) => job.companyEmail !== currentCompanyEmail)

    // Add/update jobs for the current company, ensuring companyName and companyEmail are set
    const jobsWithCompanyInfo = currentCompanyJobs.map(job => ({
      ...job, // job should already have its ID from handleJobSubmit or initial load
      companyName: currentCompanyName,
      companyEmail: currentCompanyEmail,
    }));

    const updatedAllJobs = [...otherCompanyJobs, ...jobsWithCompanyInfo]
    localStorage.setItem("allJobs", JSON.stringify(updatedAllJobs))
  }

  const toggleMenu = () => setMenuOpen((prev) => !prev)
  const handleLogout = () => navigate("/company-login")

  const handleJobModalToggle = (editMode = false) => {
    setIsJobModalOpen((prev) => !prev);
    if (!editMode || !isJobModalOpen) { // Reset if opening for new or closing
      setEditingIndex(null);
      setJobData({
        id: null,
        title: "",
        duration: "",
        isPaid: false,
        salary: "",
        skills: "",
        description: "",
        industry: "",
        applicants: [],
      });
    }
  };

  const handleJobInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setJobData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleJobSubmit = (e) => {
    e.preventDefault();
    if (!storedCompany?.companyEmail) {
        alert("Error: Company information is missing. Cannot save job.");
        return;
    }

    const updatedJobs = [...postedJobs];
    let jobToSave;

    if (editingIndex !== null && postedJobs[editingIndex]) {
      // Editing existing job, ensure ID and applicants are preserved from original if not directly in jobData
      jobToSave = {
        ...postedJobs[editingIndex], // Start with original job data (includes id, applicants)
        ...jobData, // Override with form data
        id: postedJobs[editingIndex].id, // Explicitly keep original ID
      };
      updatedJobs[editingIndex] = jobToSave;
    } else {
      // Creating new job
      jobToSave = {
        ...jobData,
        id: `job_${storedCompany.companyEmail}_${Date.now()}_${Math.random().toString(36).substring(2,9)}`,
        applicants: jobData.applicants || [], // Ensure applicants array exists
      };
      updatedJobs.push(jobToSave);
    }

    setPostedJobs(updatedJobs);
    handleJobModalToggle(false); // Close modal and reset form
  };


  const handleEditJob = (jobToEdit) => {
    const indexInPostedJobs = postedJobs.findIndex(job => job.id === jobToEdit.id);
    if (indexInPostedJobs === -1) {
        console.error("Job to edit not found in postedJobs:", jobToEdit);
        return;
    }
    setEditingIndex(indexInPostedJobs);
    // Make sure to spread to avoid direct state mutation issues if jobToEdit is directly from state
    setJobData({ ...jobToEdit }); 
    setIsJobModalOpen(true);
  };

  const handleDeleteJob = (jobToDelete) => {
    const indexInPostedJobs = postedJobs.findIndex(job => job.id === jobToDelete.id);
    if (indexInPostedJobs === -1) {
        console.error("Job to delete not found in postedJobs:", jobToDelete);
        return;
    }
    // Filter out the job by its unique ID
    const updatedPostedJobs = postedJobs.filter((job) => job.id !== jobToDelete.id)
    setPostedJobs(updatedPostedJobs)
    // The useEffect for postedJobs will handle localStorage updates.
  }


  const handleViewApplicants = (job, index) => {
    setSelectedJobApplicants(job.applicants || [])
    setCurrentJobIndex(index) // This index is relative to postedJobs
    setIsApplicantsModalOpen(true)
    // Reset applicant filter for this specific job's modal
    setApplicantFilter({ status: "", search: "", jobTitle: job.title })
  }

  const handleCloseApplicantsModal = () => {
    setIsApplicantsModalOpen(false)
    setSelectedJobApplicants(null)
    setCurrentJobIndex(null)
  }

 const handleViewApplicantProfile = (applicant) => {
  if (!applicant.name) {
    if (applicant.email === "student@example.com") {
      applicant.name = "Mariam";
    } else {
      applicant.name = "John";
    }
    if (!applicant.skills) {
      applicant.skills = "React, JavaScript, CSS";
    }
    if (!applicant.experience) {
      applicant.experience = "1 year of React experience, built 3 personal projects";
    }
  }

  // Create the object to store (now includes company profile)
  const profileToStore = {
    studentProfile: applicant.email,
    companyEmail: storedCompany?.companyEmail, // Company email
    companyName: storedCompany?.companyName,
    companysize: storedCompany?.companySize,
    companyindustry: storedCompany?.companyIndustry,
    timestamp: new Date().toISOString(),
  };
  // Get existing stored profiles or initialize empty array
  const storedProfiles = JSON.parse(localStorage.getItem("storedviewprofile") || "[]");
  
  // Add new profile to the beginning of the array
  const updatedProfiles = [profileToStore, ...storedProfiles];
  
  // Store in local storage
  localStorage.setItem("storedviewprofile", JSON.stringify(updatedProfiles));

  // For debugging: Log the stored profiles
  console.log("Stored Profiles:", updatedProfiles);

  setSelectedApplicant(applicant);
  setIsProfileModalOpen(true);
};
  const handleCloseProfileModal = () => {
    setIsProfileModalOpen(false)
    setSelectedApplicant(null)
  }

  const handleUpdateApplicantStatus = (applicantEmail, newStatus) => {
    if (currentJobIndex === null || currentJobIndex >= postedJobs.length || !storedCompany?.companyEmail) {
      console.error("Invalid job index or company data:", currentJobIndex, storedCompany);
      return
    }

    const updatedJobs = postedJobs.map((job, index) => {
        if (index === currentJobIndex) {
            const updatedApplicants = (job.applicants || []).map(applicant => 
                applicant.email === applicantEmail ? { ...applicant, status: newStatus } : applicant
            );
            return { ...job, applicants: updatedApplicants };
        }
        return job;
    });
    setPostedJobs(updatedJobs); // This will trigger localStorage updates via useEffect

    // Update global appliedInternships localStorage
    const allAppliedString = localStorage.getItem("appliedInternships") || "[]";
    let allApplied = [];
    try { allApplied = JSON.parse(allAppliedString); if(!Array.isArray(allApplied)) allApplied = []; }
    catch(e) { console.error("Error parsing appliedInternships", e)}

    const updatedApplied = allApplied.map((app) => {
      if (
        app.studentProfile?.email === applicantEmail &&
        app.jobId === postedJobs[currentJobIndex].id && // Match by unique job ID
        app.companyEmail === storedCompany.companyEmail
      ) {
        return { ...app, status: newStatus }
      }
      return app
    })
    localStorage.setItem("appliedInternships", JSON.stringify(updatedApplied))

    // Update applicants in the currently viewed modal if open
    if (selectedJobApplicants) {
      setSelectedJobApplicants((prev) =>
        prev.map((app) => (app.email === applicantEmail ? { ...app, status: newStatus } : app))
      )
    }
    if (selectedApplicant?.email === applicantEmail) {
        setSelectedApplicant(prev => ({ ...prev, status: newStatus }));
    }

    // Handle adding to accepted interns list
      if (newStatus === "accepted") {
      let storedApplied = [];
  try {
    const interns = localStorage.getItem("appliedInternships");
    console.log(interns)
    storedApplied = interns ? JSON.parse(interns) : [];
  } catch (e) {
    console.error("Failed to parse appliedInternships from localStorage", e);
    return;
  }

  // Step 2: Find the applicant(s) to update
  const targetApplicants = storedApplied.filter(app => app.student?.email === applicantEmail);
  console.log(targetApplicants)
  if (targetApplicants.length === 0) {
    console.warn("No applicant found with email:", applicantEmail);
    return;
  }

  // Step 3: Update their status
  const updated = storedApplied.map(app =>
    app.student?.email === applicantEmail
      ? { ...app, status: "accepted" }
      : app
  );

  // Step 4: Store back in localStorage
  localStorage.setItem("appliedInternships", JSON.stringify(updated));
  console.log(updated)
  setNotification(`You have been accepted in ${storedCompany.companyEmail}`, applicantEmail);

}

  if (newStatus === "rejected") {
      // const job = postedJobs[currentJobIndex];
          let storedApplied = [];
  try {
    const interns = localStorage.getItem("appliedInternships");
    console.log(interns)
    storedApplied = interns ? JSON.parse(interns) : [];
  } catch (e) {
    console.error("Failed to parse appliedInternships from localStorage", e);
    return;
  }

  // Step 2: Find the applicant(s) to update
  const targetApplicants = storedApplied.filter(app => app.student?.email === applicantEmail);
  console.log(targetApplicants)
  if (targetApplicants.length === 0) {
    console.warn("No applicant found with email:", applicantEmail);
    return;
  }

  // Step 3: Update their status
  const updated = storedApplied.map(app =>
    app.student?.email === applicantEmail
      ? { ...app, status: "rejected" }
      : app
  );

  // Step 4: Store back in localStorage
  localStorage.setItem("appliedInternships", JSON.stringify(updated));
  console.log(updated)
       setNotification(`You have been rejected in ${storedCompany.companyEmail}`, applicantEmail);
    }

       if(newStatus === "finalized"){
         let storedApplied = [];
  try {
    const interns = localStorage.getItem("appliedInternships");
    console.log(interns)
    storedApplied = interns ? JSON.parse(interns) : [];
  } catch (e) {
    console.error("Failed to parse appliedInternships from localStorage", e);
    return;
  }

  // Step 2: Find the applicant(s) to update
  const targetApplicants = storedApplied.filter(app => app.student?.email === applicantEmail);
  console.log(targetApplicants)
  if (targetApplicants.length === 0) {
    console.warn("No applicant found with email:", applicantEmail);
    return;
  }

  // Step 3: Update their status
  const updated = storedApplied.map(app =>
    app.student?.email === applicantEmail
      ? { ...app, status: "finalized" }
      : app
  );

  // Step 4: Store back in localStorage
  localStorage.setItem("appliedInternships", JSON.stringify(updated));
  console.log(updated)
       setNotification(`You have been finalized in ${storedCompany.companyEmail}`, applicantEmail);
    }



  }


  const filteredJobs = postedJobs.filter((job) => {
    const matchesSearchQuery =
      (job.title && job.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase())) ||
      (job.skills && job.skills.toLowerCase().includes(debouncedSearchQuery.toLowerCase()))

    const matchesPaid =
      (!filterPaid.paid && !filterPaid.unpaid) || (filterPaid.paid && job.isPaid) || (filterPaid.unpaid && !job.isPaid)

    const selectedDurations = Object.entries(filterDuration)
      .filter(([_, checked]) => checked)
      .map(([duration]) => duration)

    const matchesDuration = selectedDurations.length === 0 || (job.duration && selectedDurations.includes(job.duration))

    return matchesSearchQuery && matchesPaid && matchesDuration
  })

  const getAllApplicants = () => {
    return postedJobs.flatMap((job) =>
      (job.applicants || []).map((applicant) => ({
        ...applicant,
        jobId: job.id, // Include job ID
        jobTitle: job.title,
        jobDuration: job.duration,
        isPaid: job.isPaid,
        salary: job.salary,
      })),
    )
  }
  
  // Applicants for the "All Applicants" tab
  const filteredAllApplicants = getAllApplicants().filter((applicant) => {
    const matchesStatus = !allApplicantsFilter.status || applicant.status === allApplicantsFilter.status
    const matchesSearch =
      !allApplicantsFilter.search ||
      (applicant.name && applicant.name.toLowerCase().includes(allApplicantsFilter.search.toLowerCase())) ||
      (applicant.email && applicant.email.toLowerCase().includes(allApplicantsFilter.search.toLowerCase()))
    const matchesJobTitle =
      !allApplicantsFilter.jobTitle ||
      (applicant.jobTitle && applicant.jobTitle.toLowerCase().includes(allApplicantsFilter.jobTitle.toLowerCase()))
    return matchesStatus && matchesSearch && matchesJobTitle
  })

  // Applicants for the "View Applicants" modal (specific job)
  const filteredModalApplicants = (selectedJobApplicants || []).filter(applicant => {
    const matchesStatus = !applicantFilter.status || applicant.status === applicantFilter.status;
    const matchesSearch =
        !applicantFilter.search ||
        (applicant.name && applicant.name.toLowerCase().includes(applicantFilter.search.toLowerCase())) ||
        (applicant.email && applicant.email.toLowerCase().includes(applicantFilter.search.toLowerCase()));
    // jobTitle filter is implicitly handled as we are in a specific job's applicant modal
    return matchesStatus && matchesSearch;
  });


  const navigateToAcceptedInterns = () => {
    navigate("/company/interns", {
      state: {
        acceptedInterns, // Pass current state
        companyEmail: storedCompany?.companyEmail, // Pass email to fetch/update if needed
        companyName: companyName
      },
    })
  }

  const navigateToProfile = () => {
    navigate("/companyprofile", { state: { company: storedCompany } })
  }

  useEffect(() => {
    if (!storedCompany?.companyEmail) return;
    const interval = setInterval(() => {
      const newNotifications = getNotification(storedCompany.companyEmail) || []
      setNotifications(newNotifications)
    }, 3000)

    return () => clearInterval(interval)
  }, [storedCompany?.companyEmail])

  const handleBellClick = () => {
    if (!storedCompany?.companyEmail) return;
    const fetchedNotifications = getNotification(storedCompany.companyEmail) || []
    setNotifications(fetchedNotifications)
    setIsPopupOpen((prev) => !prev)
  }

  const handleClosePopup = () => {
    if (!storedCompany?.companyEmail) return;
    clearNotifications(storedCompany.companyEmail)
    setNotifications([])
    setIsPopupOpen(false)
  }

  const theme = {
    primary: "#6b46c1", primaryTransparent: "rgba(47, 2, 68, 0.42)", primaryLight: "#e9d8fd", primaryDark: "#553c9a",
    neutral: { lightest: "#f8fafc", light: "#e2e8f0", medium: "#64748b", dark: "#334155", darkest: "#1e293b" },
    status: { success: "#10b981", warning: "#f59e0b", error: "#ef4444", info: "#3b82f6", pending: "#64748b" },
  }

  const menuItems = [
    { text: "Dashboard", to: "/company-dashboard", state: { company: storedCompany }, icon: (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>) },
    { text: "Profile", onClick: navigateToProfile, icon: (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>) },
    { text: "Post a Job", onClick: () => handleJobModalToggle(false), icon: (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>) },
    { text: "Posted Jobs", to: "/companyallpostedjobs", state: { companyEmail: storedCompany?.companyEmail }, icon: (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>) },
    { text: "Your Interns", onClick: navigateToAcceptedInterns, icon: (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>) },
    { text: "Logout", onClick: handleLogout, icon: (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>) },
  ]

  const buttonStyle = {
    primary: { backgroundColor: theme.primary, color: "white", border: "none", borderRadius: "4px", padding: "8px 16px", fontSize: "14px", fontWeight: "500", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", transition: "background-color 0.2s",},
    secondary: { backgroundColor: "white", color: theme.primary, border: `1px solid ${theme.primary}`, borderRadius: "4px", padding: "8px 16px", fontSize: "14px", fontWeight: "500", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", transition: "all 0.2s", },
    danger: { backgroundColor: "white", color: theme.status.error, border: `1px solid ${theme.status.error}`, borderRadius: "4px", padding: "8px 16px", fontSize: "14px", fontWeight: "500", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", transition: "all 0.2s", },
    info: { backgroundColor: "white", color: theme.status.info, border: `1px solid ${theme.status.info}`, borderRadius: "4px", padding: "8px 16px", fontSize: "14px", fontWeight: "500", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", transition: "all 0.2s",}
  }

  return (
    <div style={{ display: "flex", backgroundColor: theme.neutral.lightest, minHeight: "100vh", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Sidebar */}
      <div style={{ width: menuOpen ? "240px" : "0", height: "100vh", backgroundColor: "transparent", backdropFilter: "blur(10px)", overflowX: "hidden", transition: "all 0.3s ease-in-out", padding: menuOpen ? "20px 0 0 0" : "0", boxShadow: menuOpen ? "0 0 15px rgba(0, 0, 0, 0.1)" : "none", position: "fixed", top: 0, left: 0, zIndex: 1000, color: "white", borderRight: menuOpen ? `1px solid ${theme.primaryTransparent}` : "none", background: `linear-gradient(to bottom, ${theme.primaryTransparent}, rgba(107, 70, 193, 0.3))` }}>
        {menuOpen && (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px 20px 20px", borderBottom: "1px solid rgba(255, 255, 255, 0.1)", marginBottom: "20px" }}>
              <h1 style={{ margin: 0, fontSize: "20px", fontWeight: "600", color: "white" }}>Company Portal</h1>
              <button onClick={toggleMenu} style={{ background: "none", border: "none", color: "white", fontSize: "20px", cursor: "pointer", padding: "5px", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
            </div>
            <ul style={{ listStyleType: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column" }}>
              {menuItems.map((item, index) => (
                <li key={index} style={{ margin: "0", transition: "all 0.2s ease" }}>
                  {item.to ? (
                    <Link to={item.to} state={item.state || {}} style={{ color: "white", textDecoration: "none", fontSize: "15px", fontWeight: "500", display: "flex", alignItems: "center", gap: "12px", padding: "12px 20px", transition: "all 0.2s", borderLeft: "3px solid transparent", backgroundColor: "rgba(255, 255, 255, 0.05)", margin: "2px 0" }}>
                      {item.icon}{item.text}
                    </Link>
                  ) : (
                    <button onClick={item.onClick} style={{ background: "rgba(255, 255, 255, 0.05)", border: "none", color: "white", textDecoration: "none", fontSize: "15px", fontWeight: "500", cursor: "pointer", padding: "12px 20px", width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: "12px", transition: "all 0.2s", borderLeft: "3px solid transparent", margin: "2px 0" }}>
                      {item.icon}{item.text}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* Main Content */}
      <div style={{ marginLeft: menuOpen ? "240px" : "0", transition: "margin-left 0.3s", padding: "0", width: "100%", backgroundColor: theme.neutral.lightest }}>
        {/* Header */}
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 30px", backgroundColor: "white", boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)", position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <button onClick={toggleMenu} style={{ fontSize: "24px", background: "transparent", border: "none", cursor: "pointer", color: theme.neutral.dark, display: "flex", alignItems: "center", justifyContent: "center" }}>☰</button>
            <h1 style={{ margin: 0, fontSize: "20px", fontWeight: "600", color: theme.neutral.darkest }}>Dashboard</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div onClick={handleBellClick} style={{ cursor: "pointer", color: theme.neutral.dark, display: "flex", alignItems: "center", justifyContent: "center", width: "36px", height: "36px", borderRadius: "50%", backgroundColor: theme.neutral.lightest, transition: "background-color 0.2s", position: "relative" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              {notifications.length > 0 && (<span style={{ position: "absolute", top: "0", right: "0", backgroundColor: theme.status.error, color: "white", borderRadius: "50%", width: "16px", height: "16px", fontSize: "10px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center" }}>{notifications.length}</span>)}
            </div>
            <div onClick={navigateToProfile} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: theme.primaryLight, color: theme.primary, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "600", fontSize: "14px" }}>{companyName.charAt(0).toUpperCase()}</div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: "500", color: theme.neutral.darkest }}>{companyName}</div>
                <div style={{ fontSize: "12px", color: theme.neutral.medium }}>Company</div>
              </div>
            </div>
          </div>
        </header>

        {/* Notification Popup */}
        {isPopupOpen && (
          <div style={{ position: "absolute", top: "70px", right: "30px", backgroundColor: "white", boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)", padding: "20px", borderRadius: "8px", width: "320px", zIndex: 9999, border: `1px solid ${theme.neutral.light}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px", borderBottom: `1px solid ${theme.neutral.light}`, paddingBottom: "10px" }}><h4 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: theme.neutral.darkest }}>Notifications</h4><button onClick={handleClosePopup} style={{ background: "transparent", border: "none", fontSize: "20px", cursor: "pointer", color: theme.neutral.medium, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button></div>
            {notifications.length === 0 ? (<div style={{ padding: "20px 0", textAlign: "center", color: theme.neutral.medium, fontSize: "14px" }}>No notifications</div>) : (notifications.map((notification, index) => (<div key={index} style={{ marginBottom: "15px", padding: "12px", backgroundColor: theme.neutral.lightest, borderRadius: "6px", borderLeft: `3px solid ${theme.primary}` }}><p style={{ margin: "0 0 5px 0", fontSize: "14px", fontWeight: "500", color: theme.neutral.darkest }}>{notification.message}</p><p style={{ margin: 0, fontSize: "12px", color: theme.neutral.medium }}>{new Date(notification.timestamp).toLocaleString()}</p></div>)))}
          </div>
        )}

        <div style={{ padding: "30px" }}>
          <div style={{ backgroundColor: "white", borderRadius: "8px", padding: "24px", marginBottom: "24px", boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)" }}>
            <h1 style={{ fontSize: "24px", fontWeight: "600", color: theme.neutral.darkest, marginTop: 0, marginBottom: "8px" }}>Welcome {companyName}</h1>
            <p style={{ fontSize: "15px", color: theme.neutral.medium, margin: 0 }}>This is your dashboard where you can manage job postings, view applicants, and access company resources.</p>
          </div>

          <div style={{ display: "flex", marginBottom: "24px", borderBottom: `1px solid ${theme.neutral.light}` }}>
            <button onClick={() => setActiveTab("jobs")} style={{ padding: "12px 24px", backgroundColor: "transparent", color: activeTab === "jobs" ? theme.primary : theme.neutral.medium, border: "none", borderBottom: activeTab === "jobs" ? `2px solid ${theme.primary}` : "none", cursor: "pointer", fontSize: "15px", fontWeight: "500", transition: "all 0.2s ease", marginRight: "8px" }}>Posted Jobs</button>
            <button onClick={() => setActiveTab("applicants")} style={{ padding: "12px 24px", backgroundColor: "transparent", color: activeTab === "applicants" ? theme.primary : theme.neutral.medium, border: "none", borderBottom: activeTab === "applicants" ? `2px solid ${theme.primary}` : "none", cursor: "pointer", fontSize: "15px", fontWeight: "500", transition: "all 0.2s ease" }}>Applicants</button>
          </div>

          {/* Posted Jobs Tab */}
          {activeTab === "jobs" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: theme.neutral.darkest }}>{companyName}'s Posted Jobs</h2>
                <button onClick={() => handleJobModalToggle(false)} style={{ ...buttonStyle.primary, backgroundColor: theme.primary }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>Post New Job
                </button>
              </div>
              
              {/* Filter Section for Jobs */}
              <div style={{ marginBottom: "24px", padding: "20px", backgroundColor: "white", borderRadius: "8px", border: `1px solid ${theme.neutral.light}`, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <div style={{ position: "relative", marginBottom: "20px" }}>
                  <svg style={{ position: "absolute", top: "50%", left: "12px", transform: "translateY(-50%)", pointerEvents: "none" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={theme.neutral.medium} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  <input type="text" placeholder="Search by job title or required skills..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ padding: "10px 12px 10px 36px", width: "calc(100% - 24px)", border: `1px solid ${theme.neutral.light}`, borderRadius: "4px", fontSize: "14px", backgroundColor: theme.neutral.lightest, outline: "none", transition: "all 0.2s ease" }}/>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", backgroundColor: theme.neutral.lightest, padding: "8px 16px", borderRadius: "4px", border: `1px solid ${theme.neutral.light}` }}>
                    <span style={{ marginRight: "12px", fontWeight: "500", fontSize: "14px", color: theme.neutral.medium }}>Payment:</span>
                    <label style={{ marginRight: "16px", display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", color: theme.neutral.dark, cursor: "pointer" }}><input type="checkbox" checked={filterPaid.paid} onChange={(e) => setFilterPaid((prev) => ({ ...prev, paid: e.target.checked }))} style={{ width: "14px", height: "14px", accentColor: theme.primary }}/>Paid</label>
                    <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", color: theme.neutral.dark, cursor: "pointer" }}><input type="checkbox" checked={filterPaid.unpaid} onChange={(e) => setFilterPaid((prev) => ({ ...prev, unpaid: e.target.checked }))} style={{ width: "14px", height: "14px", accentColor: theme.primary }}/>Unpaid</label>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", backgroundColor: theme.neutral.lightest, padding: "8px 16px", borderRadius: "4px", border: `1px solid ${theme.neutral.light}` }}>
                    <span style={{ marginRight: "12px", fontWeight: "500", fontSize: "14px", color: theme.neutral.medium }}>Duration:</span>
                    {["1 month", "2 months", "3 months"].map((duration) => (<label key={duration} style={{ marginRight: "16px", display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", color: theme.neutral.dark, cursor: "pointer" }}><input type="checkbox" checked={filterDuration[duration]} onChange={(e) => setFilterDuration((prev) => ({ ...prev, [duration]: e.target.checked }))} style={{ width: "14px", height: "14px", accentColor: theme.primary }}/>{duration}</label>))}
                  </div>
                </div>
              </div>

              {/* Jobs Table */}
              {filteredJobs.length > 0 ? (
                <div style={{ backgroundColor: "white", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", overflow: "hidden", border: `1px solid ${theme.neutral.light}`, marginBottom: "30px" }}>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ backgroundColor: theme.neutral.lightest, borderBottom: `1px solid ${theme.neutral.light}` }}>
                          <th style={{ padding: "14px 20px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: theme.neutral.medium, textTransform: "uppercase", letterSpacing: "0.05em" }}>Title</th>
                          <th style={{ padding: "14px 20px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: theme.neutral.medium, textTransform: "uppercase", letterSpacing: "0.05em" }}>Duration</th>
                          <th style={{ padding: "14px 20px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: theme.neutral.medium, textTransform: "uppercase", letterSpacing: "0.05em" }}>Compensation</th>
                          <th style={{ padding: "14px 20px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: theme.neutral.medium, textTransform: "uppercase", letterSpacing: "0.05em" }}>Skills</th>
                          <th style={{ padding: "14px 20px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: theme.neutral.medium, textTransform: "uppercase", letterSpacing: "0.05em" }}>Applicants</th>
                          <th style={{ padding: "14px 20px", textAlign: "right", fontSize: "13px", fontWeight: "600", color: theme.neutral.medium, textTransform: "uppercase", letterSpacing: "0.05em" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredJobs.map((job) => ( // job object here has a unique 'id'
                          <tr key={job.id} style={{ borderBottom: `1px solid ${theme.neutral.light}`, transition: "background-color 0.2s" }}>
                            <td style={{ padding: "14px 20px", fontSize: "14px", fontWeight: "500", color: theme.neutral.darkest }}>{job.title}</td>
                            <td style={{ padding: "14px 20px", fontSize: "14px", color: theme.neutral.dark }}>{job.duration}</td>
                            <td style={{ padding: "14px 20px" }}><div style={{ display: "inline-flex", alignItems: "center", padding: "4px 10px", borderRadius: "4px", backgroundColor: job.isPaid ? `${theme.primaryLight}` : theme.neutral.lightest, color: job.isPaid ? theme.primary : theme.neutral.medium, fontSize: "13px", fontWeight: "500" }}><span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: job.isPaid ? theme.primary : theme.neutral.medium, marginRight: "6px" }}></span>{job.isPaid ? job.salary || "Paid" : "Unpaid"}</div></td>
                            <td style={{ padding: "14px 20px" }}><div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>{job.skills && job.skills.split(",").slice(0, 2).map((skill, i) => (<span key={i} style={{ padding: "2px 8px", backgroundColor: theme.primaryLight, color: theme.primary, borderRadius: "4px", fontSize: "13px", fontWeight: "500", whiteSpace: "nowrap" }}>{skill.trim()}</span>))}{job.skills && job.skills.split(",").length > 2 && (<span style={{ padding: "2px 8px", backgroundColor: theme.neutral.lightest, color: theme.neutral.medium, borderRadius: "4px", fontSize: "13px", fontWeight: "500" }}>+{job.skills.split(",").length - 2} more</span>)}</div></td>
                            <td style={{ padding: "14px 20px" }}><span style={{ display: "inline-flex", alignItems: "center", padding: "4px 10px", backgroundColor: job.applicants?.length > 0 ? theme.primaryLight : theme.neutral.lightest, color: job.applicants?.length > 0 ? theme.primary : theme.neutral.medium, borderRadius: "4px", fontSize: "13px", fontWeight: "500", cursor: job.applicants?.length > 0 ? "pointer" : "default" }} onClick={() => job.applicants?.length > 0 && handleViewApplicants(job, postedJobs.findIndex(pJob => pJob.id === job.id))}>{job.applicants ? job.applicants.length : 0} applicant(s)</span></td>
                            <td style={{ padding: "14px 20px", textAlign: "right" }}>
                              <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                                <button onClick={() => handleEditJob(job)} style={buttonStyle.info}>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>Edit
                                </button>
                                <button onClick={() => handleDeleteJob(job)} style={buttonStyle.danger}>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div style={{ padding: "40px", backgroundColor: "white", borderRadius: "8px", textAlign: "center", border: `1px solid ${theme.neutral.light}`, marginBottom: "30px" }}>
                  <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: theme.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto" }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={theme.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg></div>
                  <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: "600", color: theme.neutral.darkest }}>No jobs match your filters</h3>
                  <p style={{ margin: "0 0 20px 0", fontSize: "14px", color: theme.neutral.medium, maxWidth: "400px", marginLeft: "auto", marginRight: "auto" }}>Try adjusting your search criteria or post a new job.</p>
                  <button onClick={() => handleJobModalToggle(false)} style={buttonStyle.primary}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>Post New Job</button>
                </div>
              )}
            </div>
          )}

          {/* Applicants Tab */}
          {activeTab === "applicants" && (
            <div>
              <h2 style={{ margin: "0 0 24px 0", fontSize: "18px", fontWeight: "600", color: theme.neutral.darkest }}>All Applicants</h2>
              {/* Filter Section for All Applicants */}
              <div style={{ marginBottom: "24px", padding: "20px", backgroundColor: "white", borderRadius: "8px", border: `1px solid ${theme.neutral.light}`, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginBottom: "10px" }}>
                  <div style={{ flex: 1, minWidth: "200px" }}>
                    <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500", color: theme.neutral.medium }}>Search by Name or Email:</label>
                    <div style={{ position: "relative" }}>
                      <svg style={{ position: "absolute", top: "50%", left: "12px", transform: "translateY(-50%)", pointerEvents: "none" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={theme.neutral.medium} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                      <input type="text" placeholder="Search applicants..." value={allApplicantsFilter.search} onChange={(e) => setAllApplicantsFilter({ ...allApplicantsFilter, search: e.target.value })} style={{ padding: "10px 12px 10px 36px", width: "calc(100% - 24px)", border: `1px solid ${theme.neutral.light}`, borderRadius: "4px", fontSize: "14px", backgroundColor: theme.neutral.lightest, outline: "none", transition: "all 0.2s ease" }}/>
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: "200px" }}>
                    <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500", color: theme.neutral.medium }}>Filter by Job Title:</label>
                    <select value={allApplicantsFilter.jobTitle} onChange={(e) => setAllApplicantsFilter({ ...allApplicantsFilter, jobTitle: e.target.value })} style={{ padding: "10px 12px", width: "100%", border: `1px solid ${theme.neutral.light}`, borderRadius: "4px", fontSize: "14px", backgroundColor: theme.neutral.lightest, outline: "none", transition: "all 0.2s ease", appearance: "none", backgroundImage: 'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%2364748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>\')', backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", backgroundSize: "16px" }}>
                      <option value="">All Job Titles</option>
                      {Array.from(new Set(postedJobs.map(job => job.title))).map((title, index) => (<option key={index} value={title}>{title}</option>))}
                    </select>
                  </div>
                  <div style={{ flex: 1, minWidth: "200px" }}>
                    <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500", color: theme.neutral.medium }}>Status:</label>
                    <select value={allApplicantsFilter.status} onChange={(e) => setAllApplicantsFilter({ ...allApplicantsFilter, status: e.target.value })} style={{ padding: "10px 12px", width: "100%", border: `1px solid ${theme.neutral.light}`, borderRadius: "4px", fontSize: "14px", backgroundColor: theme.neutral.lightest, outline: "none", transition: "all 0.2s ease", appearance: "none", backgroundImage: 'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%2364748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>\')', backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", backgroundSize: "16px" }}>
                      <option value="">All Statuses</option><option value="pending">Pending</option><option value="finalized">Finalized</option><option value="accepted">Accepted</option><option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              </div>
              {/* All Applicants Table */}
              {filteredAllApplicants.length > 0 ? (
                <div style={{ backgroundColor: "white", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", overflow: "hidden", border: `1px solid ${theme.neutral.light}`, marginBottom: "30px" }}>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ backgroundColor: theme.neutral.lightest, borderBottom: `1px solid ${theme.neutral.light}` }}>
                          <th style={{ padding: "14px 20px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: theme.neutral.medium, textTransform: "uppercase", letterSpacing: "0.05em" }}>Name</th>
                          <th style={{ padding: "14px 20px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: theme.neutral.medium, textTransform: "uppercase", letterSpacing: "0.05em" }}>Email</th>
                          <th style={{ padding: "14px 20px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: theme.neutral.medium, textTransform: "uppercase", letterSpacing: "0.05em" }}>Job Title</th>
                          <th style={{ padding: "14px 20px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: theme.neutral.medium, textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</th>
                          <th style={{ padding: "14px 20px", textAlign: "right", fontSize: "13px", fontWeight: "600", color: theme.neutral.medium, textTransform: "uppercase", letterSpacing: "0.05em" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAllApplicants.map((applicant, index) => (
                          <tr key={applicant.email + (applicant.jobId || index)} style={{ borderBottom: `1px solid ${theme.neutral.light}`, transition: "background-color 0.2s" }}>
                            <td style={{ padding: "14px 20px", fontSize: "14px", fontWeight: "500", color: theme.neutral.darkest }}>{applicant.name || "N/A"}</td>
                            <td style={{ padding: "14px 20px", fontSize: "14px", color: theme.neutral.dark }}>{applicant.email || "N/A"}</td>
                            <td style={{ padding: "14px 20px", fontSize: "14px", color: theme.neutral.darkest }}>{applicant.jobTitle || "N/A"}</td>
                            <td style={{ padding: "14px 20px" }}><div style={{ display: "inline-flex", alignItems: "center", padding: "4px 10px", borderRadius: "4px", backgroundColor: applicant.status === "accepted" ? "rgba(16, 185, 129, 0.1)" : applicant.status === "rejected" ? "rgba(239, 68, 68, 0.1)" : applicant.status === "finalized" ? theme.primaryLight : theme.neutral.lightest, color: applicant.status === "accepted" ? theme.status.success : applicant.status === "rejected" ? theme.status.error : applicant.status === "finalized" ? theme.primary : theme.neutral.medium, fontSize: "13px", fontWeight: "500" }}><span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: applicant.status === "accepted" ? theme.status.success : applicant.status === "rejected" ? theme.status.error : applicant.status === "finalized" ? theme.primary : theme.neutral.medium, marginRight: "6px" }}></span>{applicant.status || "pending"}</div></td>
                            <td style={{ padding: "14px 20px", textAlign: "right" }}>
                              <button onClick={() => { const jobIndex = postedJobs.findIndex(job => job.id === applicant.jobId); if (jobIndex !== -1) { setCurrentJobIndex(jobIndex); setSelectedJobApplicants(postedJobs[jobIndex].applicants || []); handleViewApplicantProfile(applicant); } else { console.warn("Original job not found for applicant"); handleViewApplicantProfile(applicant); /* Still show profile, but job context might be limited */ } }} style={buttonStyle.primary}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>View Profile
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div style={{ padding: "40px", backgroundColor: "white", borderRadius: "8px", textAlign: "center", border: `1px solid ${theme.neutral.light}`, marginBottom: "30px" }}>
                  <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: theme.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto" }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={theme.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg></div>
                  <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: "600", color: theme.neutral.darkest }}>No applicants match your filters</h3><p style={{ margin: "0", fontSize: "14px", color: theme.neutral.medium, maxWidth: "400px", marginLeft: "auto", marginRight: "auto" }}>Try adjusting your search criteria.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Job Modal */}
        {isJobModalOpen && (
          <div style={{ position: "fixed", top: "0", left: "0", width: "100%", height: "100%", backgroundColor: "rgba(0, 0, 0, 0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1400 }}>
            <div style={{ background: "white", padding: "24px", borderRadius: "8px", width: "600px", maxWidth: "90%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: `1px solid ${theme.neutral.light}`, paddingBottom: "16px" }}>
                <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: theme.neutral.darkest }}>{editingIndex !== null ? "Edit Job" : "Post a New Job"}</h2>
                <button onClick={() => handleJobModalToggle(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: theme.neutral.medium, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
              </div>
              <form onSubmit={handleJobSubmit}>
                <div style={{ marginBottom: "16px" }}><label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500", color: theme.neutral.darkest }}>Job Title</label><input type="text" name="title" value={jobData.title} onChange={handleJobInputChange} required style={{ width: "calc(100% - 24px)", padding: "10px 12px", borderRadius: "4px", border: `1px solid ${theme.neutral.light}`, fontSize: "14px", backgroundColor: theme.neutral.lightest, outline: "none", transition: "all 0.2s ease" }}/></div>
                <div style={{ marginBottom: "16px" }}><label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500", color: theme.neutral.darkest }}>Duration</label><select name="duration" value={jobData.duration} onChange={handleJobInputChange} required style={{ width: "100%", padding: "10px 12px", borderRadius: "4px", border: `1px solid ${theme.neutral.light}`, fontSize: "14px", backgroundColor: theme.neutral.lightest, outline: "none", transition: "all 0.2s ease", appearance: "none", backgroundImage: 'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%2364748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>\')', backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", backgroundSize: "16px" }}><option value="">Select Duration</option><option value="1 month">1 month</option><option value="2 months">2 months</option><option value="3 months">3 months</option></select></div>
                <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", backgroundColor: theme.neutral.lightest, padding: "10px 12px", borderRadius: "4px", border: `1px solid ${theme.neutral.light}` }}><input type="checkbox" id="isPaid" name="isPaid" checked={jobData.isPaid} onChange={handleJobInputChange} style={{ width: "16px", height: "16px", marginRight: "12px", accentColor: theme.primary }}/><label htmlFor="isPaid" style={{ fontSize: "14px", fontWeight: "500", color: theme.neutral.darkest, cursor: "pointer" }}>Paid Position</label></div>
                {jobData.isPaid && (<div style={{ marginBottom: "16px" }}><label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500", color: theme.neutral.darkest }}>Salary</label><input type="text" name="salary" value={jobData.salary} onChange={handleJobInputChange} placeholder="e.g. $2000/month" style={{ width: "calc(100% - 24px)", padding: "10px 12px", borderRadius: "4px", border: `1px solid ${theme.neutral.light}`, fontSize: "14px", backgroundColor: theme.neutral.lightest, outline: "none", transition: "all 0.2s ease" }}/></div>)}
                <div style={{ marginBottom: "16px" }}><label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500", color: theme.neutral.darkest }}>Required Skills</label><input type="text" name="skills" value={jobData.skills} onChange={handleJobInputChange} required placeholder="e.g. React, JavaScript, HTML, CSS" style={{ width: "calc(100% - 24px)", padding: "10px 12px", borderRadius: "4px", border: `1px solid ${theme.neutral.light}`, fontSize: "14px", backgroundColor: theme.neutral.lightest, outline: "none", transition: "all 0.2s ease" }}/><p style={{ margin: "4px 0 0 0", fontSize: "12px", color: theme.neutral.medium }}>Separate skills with commas</p></div>
                <div style={{ marginBottom: "16px" }}><label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500", color: theme.neutral.darkest }}>Job Description</label><textarea name="description" value={jobData.description} onChange={handleJobInputChange} required rows="5" placeholder="Describe the responsibilities and expectations for this internship..." style={{ width: "calc(100% - 24px)", padding: "10px 12px", borderRadius: "4px", border: `1px solid ${theme.neutral.light}`, fontSize: "14px", backgroundColor: theme.neutral.lightest, outline: "none", transition: "all 0.2s ease", resize: "vertical", minHeight: "100px", lineHeight: "1.5", fontFamily: "inherit" }}/></div>
                <div style={{ marginBottom: "20px" }}><label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500", color: theme.neutral.darkest }}>Industry</label><input type="text" name="industry" value={jobData.industry} onChange={handleJobInputChange} placeholder="e.g. Technology, Marketing, Finance" style={{ width: "calc(100% - 24px)", padding: "10px 12px", borderRadius: "4px", border: `1px solid ${theme.neutral.light}`, fontSize: "14px", backgroundColor: theme.neutral.lightest, outline: "none", transition: "all 0.2s ease" }}/></div>
                <button type="submit" style={{ width: "100%", padding: "12px", backgroundColor: theme.primary, color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "14px", fontWeight: "500", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  {editingIndex !== null ? (<><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>Update Job</>) : (<><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>Post Job</>)}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Applicants Modal (for specific job) */}
        {isApplicantsModalOpen && selectedJobApplicants && (
            <div style={{ position: "fixed", top: "0", left: "0", width: "100%", height: "100%", backgroundColor: "rgba(0, 0, 0, 0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1200 }}>
                <div style={{ background: "white", padding: "24px", borderRadius: "8px", maxHeight: "80vh", overflowY: "auto", width: "80%", maxWidth: "900px", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: `1px solid ${theme.neutral.light}`, paddingBottom: "16px" }}><h2 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: theme.neutral.darkest }}>Applicants for {postedJobs[currentJobIndex]?.title}</h2><button onClick={handleCloseApplicantsModal} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: theme.neutral.medium, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button></div>
                    <div style={{ marginBottom: "20px", display: "flex", gap: "16px", flexWrap: "wrap", backgroundColor: theme.neutral.lightest, padding: "16px", borderRadius: "8px", border: `1px solid ${theme.neutral.light}` }}>
                        <div style={{ flex: "1 1 200px" }}><label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500", color: theme.neutral.medium }}>Status:</label><select value={applicantFilter.status} onChange={(e) => setApplicantFilter({ ...applicantFilter, status: e.target.value })} style={{ width: "100%", padding: "10px 12px", borderRadius: "4px", border: `1px solid ${theme.neutral.light}`, fontSize: "14px", backgroundColor: "white", outline: "none", transition: "all 0.2s ease", appearance: "none", backgroundImage: 'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%2364748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>\')', backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", backgroundSize: "16px" }}><option value="">All Statuses</option><option value="pending">Pending</option><option value="finalized">Finalized</option><option value="accepted">Accepted</option><option value="rejected">Rejected</option></select></div>
                        <div style={{ flex: "1 1 200px" }}><label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500", color: theme.neutral.medium }}>Search:</label><div style={{ position: "relative" }}><svg style={{ position: "absolute", top: "50%", left: "12px", transform: "translateY(-50%)", pointerEvents: "none" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={theme.neutral.medium} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg><input type="text" placeholder="Search name/email..." value={applicantFilter.search} onChange={(e) => setApplicantFilter({ ...applicantFilter, search: e.target.value })} style={{ width: "calc(100% - 24px)", padding: "10px 12px 10px 36px", borderRadius: "4px", border: `1px solid ${theme.neutral.light}`, fontSize: "14px", backgroundColor: "white", outline: "none", transition: "all 0.2s ease" }}/></div></div>
                    </div>
                    {filteredModalApplicants.length > 0 ? (
                        <div style={{ backgroundColor: "white", borderRadius: "8px", overflow: "hidden", border: `1px solid ${theme.neutral.light}`, marginBottom: "20px" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead><tr style={{ backgroundColor: theme.neutral.lightest, borderBottom: `1px solid ${theme.neutral.light}` }}><th style={{ padding: "14px 20px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: theme.neutral.medium, textTransform: "uppercase", letterSpacing: "0.05em" }}>Name</th><th style={{ padding: "14px 20px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: theme.neutral.medium, textTransform: "uppercase", letterSpacing: "0.05em" }}>Email</th><th style={{ padding: "14px 20px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: theme.neutral.medium, textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</th><th style={{ padding: "14px 20px", textAlign: "right", fontSize: "13px", fontWeight: "600", color: theme.neutral.medium, textTransform: "uppercase", letterSpacing: "0.05em" }}>Actions</th></tr></thead>
                                <tbody>
                                    {filteredModalApplicants.map((applicant, index) => (<tr key={applicant.email + index} style={{ borderBottom: `1px solid ${theme.neutral.light}`, transition: "background-color 0.2s" }}><td style={{ padding: "14px 20px", fontSize: "14px", fontWeight: "500", color: theme.neutral.darkest }}>{applicant.name || "N/A"}</td><td style={{ padding: "14px 20px", fontSize: "14px", color: theme.neutral.dark }}>{applicant.email || "N/A"}</td><td style={{ padding: "14px 20px" }}><div style={{ display: "inline-flex", alignItems: "center", padding: "4px 10px", borderRadius: "4px", backgroundColor: applicant.status === "accepted" ? "rgba(16, 185, 129, 0.1)" : applicant.status === "rejected" ? "rgba(239, 68, 68, 0.1)" : applicant.status === "finalized" ? theme.primaryLight : theme.neutral.lightest, color: applicant.status === "accepted" ? theme.status.success : applicant.status === "rejected" ? theme.status.error : applicant.status === "finalized" ? theme.primary : theme.neutral.medium, fontSize: "13px", fontWeight: "500" }}><span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: applicant.status === "accepted" ? theme.status.success : applicant.status === "rejected" ? theme.status.error : applicant.status === "finalized" ? theme.primary : theme.neutral.medium, marginRight: "6px" }}></span>{applicant.status || "pending"}</div></td><td style={{ padding: "14px 20px", textAlign: "right" }}><button onClick={() => handleViewApplicantProfile(applicant)} style={buttonStyle.primary}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>View Profile</button></td></tr>))}
                                </tbody>
                            </table>
                        </div>
                    ) : (<div style={{ padding: "30px", backgroundColor: theme.neutral.lightest, borderRadius: "8px", textAlign: "center", border: `1px solid ${theme.neutral.light}`, marginBottom: "20px" }}><p style={{ margin: 0, fontSize: "14px", color: theme.neutral.medium }}>No applicants match your filters for this job.</p></div>)}
                    <button onClick={handleCloseApplicantsModal} style={buttonStyle.secondary}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>Close</button>
                </div>
            </div>
        )}

        {/* Applicant Profile Modal */}
        {isProfileModalOpen && selectedApplicant && (
          <div style={{ position: "fixed", top: "0", left: "0", width: "100%", height: "100%", backgroundColor: "rgba(0, 0, 0, 0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1300 }}>
            <div style={{ background: "white", padding: "24px", borderRadius: "8px", maxHeight: "90vh", overflowY: "auto", width: "80%", maxWidth: "700px", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: `1px solid ${theme.neutral.light}`, paddingBottom: "16px" }}><h2 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: theme.neutral.darkest }}>{selectedApplicant.name || "Applicant Profile"}</h2><button onClick={handleCloseProfileModal} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: theme.neutral.medium, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button></div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px", marginBottom: "20px" }}>
                <div style={{ backgroundColor: theme.neutral.lightest, borderRadius: "8px", padding: "16px", border: `1px solid ${theme.neutral.light}` }}><h3 style={{ margin: "0 0 12px 0", fontSize: "16px", fontWeight: "600", color: theme.neutral.darkest, display: "flex", alignItems: "center", gap: "8px" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={theme.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>Basic Information</h3><div style={{ display: "flex", flexDirection: "column", gap: "12px" }}><div><p style={{ margin: "0 0 4px 0", fontSize: "13px", fontWeight: "500", color: theme.neutral.medium }}>Name</p><p style={{ margin: 0, fontSize: "14px", color: theme.neutral.darkest }}>{selectedApplicant.name || "N/A"}</p></div><div><p style={{ margin: "0 0 4px 0", fontSize: "13px", fontWeight: "500", color: theme.neutral.medium }}>Email</p><p style={{ margin: 0, fontSize: "14px", color: theme.neutral.darkest }}>{selectedApplicant.email || "N/A"}</p></div>{selectedApplicant.jobTitle && (<div><p style={{ margin: "0 0 4px 0", fontSize: "13px", fontWeight: "500", color: theme.neutral.medium }}>Applied for</p><p style={{ margin: 0, fontSize: "14px", color: theme.neutral.darkest }}>{selectedApplicant.jobTitle}</p></div>)}</div></div>
                <div style={{ backgroundColor: theme.neutral.lightest, borderRadius: "8px", padding: "16px", border: `1px solid ${theme.neutral.light}` }}><h3 style={{ margin: "0 0 12px 0", fontSize: "16px", fontWeight: "600", color: theme.neutral.darkest, display: "flex", alignItems: "center", gap: "8px" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={theme.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>Skills</h3>{selectedApplicant.skills ? (<div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>{selectedApplicant.skills.split(",").map((skill, index) => (<span key={index} style={{ padding: "4px 10px", backgroundColor: theme.primaryLight, color: theme.primary, borderRadius: "4px", fontSize: "13px", fontWeight: "500" }}>{skill.trim()}</span>))}</div>) : (<p style={{ margin: 0, fontSize: "14px", color: theme.neutral.medium, fontStyle: "italic" }}>No skills listed</p>)}</div>
              </div>
              <div style={{ backgroundColor: theme.neutral.lightest, borderRadius: "8px", padding: "16px", border: `1px solid ${theme.neutral.light}`, marginBottom: "20px" }}><h3 style={{ margin: "0 0 12px 0", fontSize: "16px", fontWeight: "600", color: theme.neutral.darkest, display: "flex", alignItems: "center", gap: "8px" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={theme.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>Experience</h3>{selectedApplicant.experience ? (<p style={{ margin: 0, fontSize: "14px", color: theme.neutral.darkest, lineHeight: "1.5" }}>{selectedApplicant.experience}</p>) : (<p style={{ margin: 0, fontSize: "14px", color: theme.neutral.medium, fontStyle: "italic" }}>No experience listed</p>)}</div>
              <div style={{ backgroundColor: theme.neutral.lightest, borderRadius: "8px", padding: "16px", border: `1px solid ${theme.neutral.light}`, marginBottom: "20px" }}>
                <h3 style={{ margin: "0 0 12px 0", fontSize: "16px", fontWeight: "600", color: theme.neutral.darkest, display: "flex", alignItems: "center", gap: "8px" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={theme.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>Application Status</h3>
                <div style={{ display: "flex", alignItems: "center", marginBottom: "16px" }}><p style={{ margin: "0 12px 0 0", fontSize: "14px", color: theme.neutral.darkest }}>Current Status:</p><div style={{ display: "inline-flex", alignItems: "center", padding: "4px 10px", borderRadius: "4px", backgroundColor: selectedApplicant.status === "accepted" ? "rgba(16, 185, 129, 0.1)" : selectedApplicant.status === "rejected" ? "rgba(239, 68, 68, 0.1)" : selectedApplicant.status === "finalized" ? theme.primaryLight : theme.neutral.lightest, color: selectedApplicant.status === "accepted" ? theme.status.success : selectedApplicant.status === "rejected" ? theme.status.error : selectedApplicant.status === "finalized" ? theme.primary : theme.neutral.medium, fontSize: "14px", fontWeight: "500" }}><span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: selectedApplicant.status === "accepted" ? theme.status.success : selectedApplicant.status === "rejected" ? theme.status.error : selectedApplicant.status === "finalized" ? theme.primary : theme.neutral.medium, marginRight: "6px" }}></span>{selectedApplicant.status || "pending"}</div></div>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <button onClick={() => { handleUpdateApplicantStatus(selectedApplicant.email, "finalized"); }} style={buttonStyle.secondary}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>Mark as Finalized</button>
                  <button onClick={() => { handleUpdateApplicantStatus(selectedApplicant.email, "accepted"); }} style={{ ...buttonStyle.secondary, backgroundColor: "rgba(16, 185, 129, 0.1)", color: theme.status.success, border: `1px solid rgba(16, 185, 129, 0.2)` }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>Accept</button>
                  <button onClick={() => { handleUpdateApplicantStatus(selectedApplicant.email, "rejected"); }} style={buttonStyle.danger}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>Reject</button>
                </div>
              </div>
              <button onClick={handleCloseProfileModal} style={buttonStyle.secondary}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>Close Profile</button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default CompanyPage