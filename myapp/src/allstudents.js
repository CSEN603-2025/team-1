"use client"

import { useState, useEffect } from "react"
import Sidebar from "./sidebarscad"
import { ChevronDown, ChevronRight, Search, Filter, User, Briefcase, BookOpen, Award } from "lucide-react"

const AllStudents = () => {
  const [menuOpen, setMenuOpen] = useState(() => {
    const storedMenuState = localStorage.getItem("menuOpen")
    return storedMenuState === "true"
  })

  const [statusFilter, setStatusFilter] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [visibleStudentIndex, setVisibleStudentIndex] = useState(null)
  const [confirmLogout, setConfirmLogout] = useState(false)
  const [loading, setLoading] = useState(false)

  const students = JSON.parse(localStorage.getItem("studentusers"))
  sessionStorage.setItem("studentList", JSON.stringify(students))

  useEffect(() => {
    if (performance.navigation.type === 1) {
      console.log("Page was reloaded")
      const student = JSON.parse(sessionStorage.getItem("studentList"))
      console.log("Updated student users in localStorage:", student)
    }
  }, [])

  useEffect(() => {
    let student = JSON.parse(localStorage.getItem("studentusers"))
    if (!Array.isArray(student) || student.length === 0) {
      student = JSON.parse(sessionStorage.getItem("studentList"))
    }
    sessionStorage.setItem("studentList", JSON.stringify(student))
  }, [students])

  const savedList = JSON.parse(sessionStorage.getItem("studentList")) || []

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value)
  }

  const filteredStudents = savedList.filter((student) => {
    // Filter by status if a status filter is selected
    const statusMatch = statusFilter ? student.status === statusFilter : true

    // Filter by search query if one exists
    const searchMatch = searchQuery
      ? student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase())
      : true

    return statusMatch && searchMatch
  })

  const toggleMenu = () => {
    setMenuOpen((prev) => {
      const newState = !prev
      localStorage.setItem("menuOpen", newState.toString())
      return newState
    })
  }

  const toggleStudentDetails = (index) => {
    setVisibleStudentIndex((prevIndex) => (prevIndex === index ? null : index))
  }

  const handleLogout = () => {
    setConfirmLogout(true)
  }

  const confirmLogoutAction = (confirm) => {
    setConfirmLogout(false)
    if (confirm) {
      setLoading(true)
      setTimeout(() => {
        window.location.href = "/"
      }, 1000)
    }
  }

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "pending":
        return {
          backgroundColor: "#fff8e1",
          color: "#f59e0b",
          border: "1px solid #fef3c7",
        }
      case "flagged":
        return {
          backgroundColor: "#fee2e2",
          color: "#ef4444",
          border: "1px solid #fecaca",
        }
      case "rejected":
        return {
          backgroundColor: "#f3f4f6",
          color: "#6b7280",
          border: "1px solid #e5e7eb",
        }
      case "accepted":
        return {
          backgroundColor: "#dcfce7",
          color: "#22c55e",
          border: "1px solid #bbf7d0",
        }
      default:
        return {
          backgroundColor: "#f3f4f6",
          color: "#6b7280",
          border: "1px solid #e5e7eb",
        }
    }
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
              Student Management
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
          {/* Filter and Search Section */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "8px",
              padding: "24px",
              marginBottom: "24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <h2
              style={{
                margin: "0 0 20px 0",
                fontSize: "24px",
                fontWeight: "600",
                color: "#4a4a6a",
              }}
            >
              All Students
            </h2>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "15px",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  flex: "1 1 300px",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    flex: 1,
                  }}
                >
                  <Search
                    size={18}
                    style={{
                      position: "absolute",
                      left: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#6a6a8a",
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Search by name or email"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      padding: "10px 12px 10px 40px",
                      width: "100%",
                      borderRadius: "6px",
                      border: "1px solid #e2e8f0",
                      fontSize: "14px",
                      color: "#4a4a6a",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  flex: "0 0 auto",
                }}
              >
                <Filter size={18} color="#6a6a8a" />
                <select
                  id="statusFilter"
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "6px",
                    border: "1px solid #e2e8f0",
                    fontSize: "14px",
                    color: "#4a4a6a",
                    backgroundColor: "#ffffff",
                    cursor: "pointer",
                  }}
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="flagged">Flagged</option>
                  <option value="rejected">Rejected</option>
                  <option value="accepted">Accepted</option>
                </select>
              </div>
            </div>
          </div>

          {/* Students List */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "8px",
              padding: "24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            {filteredStudents.length === 0 ? (
              <div
                style={{
                  padding: "40px 20px",
                  textAlign: "center",
                  color: "#6a6a8a",
                  fontSize: "16px",
                }}
              >
                No students found matching your criteria.
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                {filteredStudents.map((student, index) => (
                  <div
                    key={index}
                    style={{
                      backgroundColor: "#f8f9fa",
                      borderRadius: "8px",
                      overflow: "hidden",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                      transition: "transform 0.2s, box-shadow 0.2s",
                    }}
                  >
                    <div
                      onClick={() => toggleStudentDetails(index)}
                      style={{
                        padding: "16px 20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer",
                        backgroundColor: visibleStudentIndex === index ? "#f0f4f8" : "transparent",
                        borderBottom: visibleStudentIndex === index ? "1px solid #e2e8f0" : "none",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
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
                          }}
                        >
                          {student.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .substring(0, 2)
                            .toUpperCase()}
                        </div>
                        <div>
                          <h3
                            style={{
                              margin: "0 0 5px 0",
                              fontSize: "16px",
                              fontWeight: "600",
                              color: "#4a4a6a",
                            }}
                          >
                            {student.name}
                          </h3>
                          <div style={{ fontSize: "14px", color: "#6a6a8a" }}>{student.email}</div>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                        <div
                          style={{
                            padding: "4px 10px",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: "500",
                            textTransform: "capitalize",
                            ...getStatusBadgeStyle(student.status),
                          }}
                        >
                          {student.status}
                        </div>
                        {visibleStudentIndex === index ? (
                          <ChevronDown size={20} color="#6a6a8a" />
                        ) : (
                          <ChevronRight size={20} color="#6a6a8a" />
                        )}
                      </div>
                    </div>

                    {visibleStudentIndex === index && (
                      <div
                        style={{
                          padding: "20px",
                          backgroundColor: "#f8f9fa",
                        }}
                      >
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                            gap: "20px",
                          }}
                        >
                          <div
                            style={{
                              backgroundColor: "#ffffff",
                              padding: "16px",
                              borderRadius: "8px",
                              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                            }}
                          >
                            <h4
                              style={{
                                margin: "0 0 12px 0",
                                fontSize: "16px",
                                fontWeight: "600",
                                color: "#4a4a6a",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <User size={16} />
                              Personal Information
                            </h4>
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                              <div>
                                <div style={{ fontSize: "13px", color: "#6a6a8a" }}>Full Name</div>
                                <div style={{ fontSize: "15px", color: "#4a4a6a" }}>{student.name}</div>
                              </div>
                              <div>
                                <div style={{ fontSize: "13px", color: "#6a6a8a" }}>Email</div>
                                <div style={{ fontSize: "15px", color: "#4a4a6a" }}>{student.email}</div>
                              </div>
                            </div>
                          </div>

                          <div
                            style={{
                              backgroundColor: "#ffffff",
                              padding: "16px",
                              borderRadius: "8px",
                              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                            }}
                          >
                            <h4
                              style={{
                                margin: "0 0 12px 0",
                                fontSize: "16px",
                                fontWeight: "600",
                                color: "#4a4a6a",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <Briefcase size={16} />
                              Professional Experience
                            </h4>
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                              <div>
                                <div style={{ fontSize: "13px", color: "#6a6a8a" }}>Previous Internships</div>
                                <div style={{ fontSize: "15px", color: "#4a4a6a" }}>
                                  {student.internships || "None"}
                                </div>
                              </div>
                              <div>
                                <div style={{ fontSize: "13px", color: "#6a6a8a" }}>Part-Time Jobs</div>
                                <div style={{ fontSize: "15px", color: "#4a4a6a" }}>
                                  {student.partTimeJobs || "None"}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div
                            style={{
                              backgroundColor: "#ffffff",
                              padding: "16px",
                              borderRadius: "8px",
                              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                            }}
                          >
                            <h4
                              style={{
                                margin: "0 0 12px 0",
                                fontSize: "16px",
                                fontWeight: "600",
                                color: "#4a4a6a",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <BookOpen size={16} />
                              Academic Information
                            </h4>
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                              <div>
                                <div style={{ fontSize: "13px", color: "#6a6a8a" }}>College Activities</div>
                                <div style={{ fontSize: "15px", color: "#4a4a6a" }}>
                                  {student.collegeActivities || "None"}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div
                            style={{
                              backgroundColor: "#ffffff",
                              padding: "16px",
                              borderRadius: "8px",
                              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                            }}
                          >
                            <h4
                              style={{
                                margin: "0 0 12px 0",
                                fontSize: "16px",
                                fontWeight: "600",
                                color: "#4a4a6a",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <Award size={16} />
                              Interests & Preferences
                            </h4>
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                              <div>
                                <div style={{ fontSize: "13px", color: "#6a6a8a" }}>Job Interests</div>
                                <div style={{ fontSize: "15px", color: "#4a4a6a" }}>
                                  {student.jobInterests || "None specified"}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: "10px",
                            marginTop: "20px",
                          }}
                        >
                          {/* <button
                            style={{
                              padding: "8px 16px",
                              backgroundColor: "#4a4a6a",
                              color: "white",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "14px",
                              fontWeight: "500",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            View Full Profile
                          </button> */}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

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

export default AllStudents
