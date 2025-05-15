"use client"

import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"

const SidebarStudent = ({ menuOpen, toggleMenu }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeSection, setActiveSection] = useState("dashboard")

  // Navigation handlers
  const handleHomeClick = () => {
    setActiveSection("dashboard")
    navigate("/studentpage", { state: { ...location.state } })
  }

  const handleProfileClick = () => {
    setActiveSection("profile")
    navigate("/studentprofile", { state: { ...location.state } })
  }

  const handleCoursesClick = () => {
    setActiveSection("courses")
    navigate("/courses", { state: { ...location.state } })
  }

  const handleBrowseJobsClick = () => {
    setActiveSection("jobs")
    navigate("/jobspage", { state: { ...location.state } })
  }

  const handleMyApplicationsClick = () => {
    setActiveSection("applications")
    navigate("/studentapplications", { state: { ...location.state } })
  }

  const handleMyInternshipsClick = () => {
    setActiveSection("internships")
    navigate("/myinternships", { state: { ...location.state } })
  }

  const handleCompaniesClick = () => {
    setActiveSection("companies")
    navigate("/companiesforstudents", { state: { ...location.state } })
  }

  const handleAppointmentsClick = () => {
    setActiveSection("appointments")
    navigate("/appointments", { state: { ...location.state } })
  }

  const handleAssessmentsClick = () => {
    setActiveSection("assessments")
    navigate("/online-assessments", { state: { ...location.state } })
  }

  const handleWorkshopsClick = () => {
    setActiveSection("workshops")
    navigate("/workshops", { state: { ...location.state } })
  }

  const handleSettingsClick = () => {
    setActiveSection("settings")
    navigate("/settings", { state: { ...location.state } })
  }

  const handleLogout = () => {
    // This will be handled by the parent component
    if (location.state?.onLogout) {
      location.state.onLogout()
    } else {
      navigate("/")
    }
  }

  // Sidebar items including the new requested buttons
  const sidebarItems = [
    { id: "dashboard", label: "Homepage", icon: "🏠", action: handleHomeClick },
    { id: "profile", label: "Profile", icon: "👤", action: handleProfileClick },
    { id: "courses", label: "All Courses", icon: "📚", action: handleCoursesClick },
    { id: "jobs", label: "Browse Jobs", icon: "💼", action: handleBrowseJobsClick },
    { id: "applications", label: "All Applications", icon: "📝", action: handleMyApplicationsClick },
    { id: "internships", label: "My Internships", icon: "🏆", action: handleMyInternshipsClick },
    { id: "companies", label: "Companies", icon: "🏢", action: handleCompaniesClick },
    // New buttons as requested
    { id: "appointments", label: "Appointments", icon: "📅", action: handleAppointmentsClick },
    { id: "assessments", label: "Online Assessments", icon: "📋", action: handleAssessmentsClick },
    { id: "workshops", label: "Workshops", icon: "🔧", action: handleWorkshopsClick },
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
              {location.state?.user?.name ? location.state.user.name.charAt(0).toUpperCase() : "S"}
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
              <div style={{ fontSize: "12px", color: "#6a6a8a" }}>
                {location.state?.user?.name || location.state?.user?.email || "Student"}
              </div>
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

export default SidebarStudent
