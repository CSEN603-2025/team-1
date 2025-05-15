"use client"

import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import Sidebar from "./sidebarscad"
import SidebarFac from "./sidebarfaculty"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"

const dummyData = [
  {
    title: "AI Internship",
    status: "accepted",
    reviewedAt: "2025-05-10T10:00:00Z",
    submittedAt: "2025-05-07T09:00:00Z",
    courses: ["Machine Learning", "AI Fundamentals"],
    company: "Tech Solutions",
    studentRating: 5,
  },
  {
    title: "Finance Internship",
    status: "rejected",
    reviewedAt: "2025-05-11T11:00:00Z",
    submittedAt: "2025-05-07T10:00:00Z",
    courses: ["Corporate Finance"],
    company: "Finance Pros",
    studentRating: 3,
  },
  {
    title: "Web Dev Internship",
    status: "flagged",
    reviewedAt: "2025-05-12T12:00:00Z",
    submittedAt: "2025-05-08T10:00:00Z",
    courses: ["React", "CSS"],
    company: "WebX Ltd.",
    studentRating: 4,
  },
  {
    title: "AI Internship",
    status: "accepted",
    reviewedAt: "2025-05-13T09:30:00Z",
    submittedAt: "2025-05-10T09:00:00Z",
    courses: ["AI Fundamentals", "Data Structures"],
    company: "Tech Solutions",
    studentRating: 4,
  },
]

const COLORS = ["#6366f1", "#f87171", "#fde047", "#60a5fa", "#a78bfa"]
const STATUS_COLORS = {
  accepted: "#10b981",
  rejected: "#ef4444",
  flagged: "#f59e0b",
}

export default function StatisticsDashboard() {
  const [stats, setStats] = useState({})
  const [menuOpen, setMenuOpen] = useState(false)
  const [scadsidebar, setScad] = useState(false)
  const [facultyside, setFac] = useState(false)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [confirmLogout, setConfirmLogout] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const state = location.state?.type
    if (state === "scad") {
      setScad(true)
    } else if (state === "faculty") {
      setFac(true)
    }
  }, [location])

  const toggleMenu = () => {
    setMenuOpen(!menuOpen)
  }

  useEffect(() => {
    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      const statusCount = { accepted: 0, rejected: 0, flagged: 0 }
      let totalReviewTime = 0
      const courseFreq = {}
      const companyRatings = {}
      const companyCounts = {}

      dummyData.forEach((r) => {
        statusCount[r.status]++
        totalReviewTime += new Date(r.reviewedAt) - new Date(r.submittedAt)
        r.courses.forEach((c) => {
          courseFreq[c] = (courseFreq[c] || 0) + 1
        })
        if (!companyRatings[r.company]) {
          companyRatings[r.company] = { total: 0, count: 0 }
        }
        companyRatings[r.company].total += r.studentRating
        companyRatings[r.company].count++
        companyCounts[r.company] = (companyCounts[r.company] || 0) + 1
      })

      const avgTime = totalReviewTime / dummyData.length / (1000 * 60 * 60)
      const statusData = Object.entries(statusCount).map(([status, value]) => ({ status, value }))
      const courseData = Object.entries(courseFreq).map(([name, value]) => ({ name, value }))
      const companyRatingData = Object.entries(companyRatings).map(([name, d]) => ({ name, avg: d.total / d.count }))
      const companyCountData = Object.entries(companyCounts).map(([name, count]) => ({ name, count }))

      const computedStats = {
        statusData,
        avgReviewTime: avgTime.toFixed(2),
        courseData,
        companyRatingData,
        companyCountData,
      }

      setStats(computedStats)
      setLoading(false)
    }, 800)
  }, [])

  const generateReport = () => {
    setDownloading(true)

    // Create a link element
    const link = document.createElement("a")

    // Set the href to the PDF file in the public folder
    link.href = process.env.PUBLIC_URL ? `${process.env.PUBLIC_URL}/Report.pdf` : "/Report.pdf"

    // Set download attribute to suggest filename
    link.download = "/Report.pdf"

    // Append to the document
    document.body.appendChild(link)

    // Trigger the download
    link.click()

    // Clean up
    document.body.removeChild(link)

    // Show success message
    setTimeout(() => {
      setDownloading(false)
      //   alert("Report downloaded successfully!");
    }, 1000)
  }

  const handleLogout = () => {
    setConfirmLogout(true)
  }

  const confirmLogoutAction = (confirm) => {
    setConfirmLogout(false)
    if (confirm) {
      setLoading(true)
      // showNotification("Logging out...", "info")
      setTimeout(() => {
        navigate("/")
      }, 1000)
    }
  }

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100%",
        overflow: "hidden",
        backgroundColor: "#f0f2f5",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      {/* Sidebar */}
      {scadsidebar ? (
        <Sidebar menuOpen={menuOpen} toggleMenu={toggleMenu} />
      ) : facultyside ? (
        <SidebarFac menuOpen={menuOpen} toggleMenu={toggleMenu} />
      ) : null}

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <header
          style={{
            backgroundColor: "#ffffff",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            padding: "0 24px",
            height: "64px",
            display: "flex",
            alignItems: "center",
            position: "relative",
            zIndex: 10,
          }}
        >
          {/* Menu Toggle */}
          <button
            onClick={toggleMenu}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              transition: "background-color 0.2s",
              marginRight: "16px",
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#f5f5f5")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <span
              style={{
                display: "block",
                width: "18px",
                height: "2px",
                backgroundColor: "#333",
                marginBottom: "4px",
                transition: "transform 0.2s, opacity 0.2s",
                transform: menuOpen ? "rotate(45deg) translate(5px, 5px)" : "none",
              }}
            ></span>
            <span
              style={{
                display: "block",
                width: "18px",
                height: "2px",
                backgroundColor: "#333",
                marginBottom: "4px",
                transition: "opacity 0.2s",
                opacity: menuOpen ? 0 : 1,
              }}
            ></span>
            <span
              style={{
                display: "block",
                width: "18px",
                height: "2px",
                backgroundColor: "#333",
                transition: "transform 0.2s",
                transform: menuOpen ? "rotate(-45deg) translate(5px, -5px)" : "none",
              }}
            ></span>
          </button>

          {/* Page Title */}
          <h1
            style={{
              margin: 0,
              fontSize: "18px",
              fontWeight: 600,
              color: "#333",
            }}
          >
            Analytics Dashboard
          </h1>

          {/* Spacer */}
          <div style={{ flex: 1 }}></div>

          {/* User Profile */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                backgroundColor: facultyside ? "#6366f1" : "#8b5cf6",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 600,
                fontSize: "14px",
              }}
            >
              {facultyside ? "FP" : "SA"}
            </div>
            <div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#333",
                }}
              >
                {facultyside ? "Faculty Portal" : "SCAD Admin"}
              </div>
              <span
                style={{
                  fontSize: "12px",
                  color: "#666",
                }}
              >
                {facultyside ? "Mariam" : "Administrator"}
              </span>
            </div>

            <button
              onClick={handleLogout}
              style={{
                marginLeft: "12px",
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
                height: "fit-content",
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = "rgba(255, 200, 200, 0.7)")}
              onMouseOut={(e) => (e.target.style.backgroundColor = "rgba(255, 200, 200, 0.5)")}
              disabled={loading}
              aria-label="Logout"
            >
              {loading ? "Please wait..." : "Logout"}
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main
          style={{
            flex: 1,
            overflow: "auto",
            padding: "24px",
            position: "relative",
          }}
        >
          {/* Loading State */}
          {loading && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(255,255,255,0.8)",
                zIndex: 5,
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    border: "3px solid #f3f3f3",
                    borderTop: "3px solid #6366f1",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                    marginBottom: "12px",
                  }}
                ></div>
                <div
                  style={{
                    color: "#666",
                    fontSize: "14px",
                    fontWeight: 500,
                  }}
                >
                  Loading analytics...
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          {!loading && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "24px",
                maxWidth: "1200px",
                margin: "0 auto",
              }}
            >
              {/* Page Header */}
              <div
                style={{
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  padding: "24px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              >
                <h2
                  style={{
                    margin: "0 0 8px 0",
                    fontSize: "20px",
                    fontWeight: 600,
                    color: "#111",
                  }}
                >
                  Internship Analytics Dashboard
                </h2>
                <p
                  style={{
                    margin: 0,
                    color: "#666",
                    fontSize: "14px",
                    lineHeight: 1.5,
                  }}
                >
                  View comprehensive analytics and statistics about internship reports, student performance, and company
                  ratings.
                </p>
              </div>

              {/* Stats Overview */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: "16px",
                }}
              >
                {/* Total Reports */}
                <div
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    padding: "20px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "#666",
                      marginBottom: "8px",
                    }}
                  >
                    Total Reports
                  </div>
                  <div
                    style={{
                      fontSize: "28px",
                      fontWeight: 600,
                      color: "#111",
                    }}
                  >
                    {dummyData.length}
                  </div>
                </div>

                {/* Accepted Reports */}
                <div
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    padding: "20px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "#666",
                      marginBottom: "8px",
                    }}
                  >
                    Accepted Reports
                  </div>
                  <div
                    style={{
                      fontSize: "28px",
                      fontWeight: 600,
                      color: "#10b981",
                    }}
                  >
                    {stats.statusData?.find((s) => s.status === "accepted")?.value || 0}
                  </div>
                </div>

                {/* Average Review Time */}
                <div
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    padding: "20px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "#666",
                      marginBottom: "8px",
                    }}
                  >
                    Avg. Review Time
                  </div>
                  <div
                    style={{
                      fontSize: "28px",
                      fontWeight: 600,
                      color: "#6366f1",
                    }}
                  >
                    {stats.avgReviewTime} hrs
                  </div>
                </div>
              </div>

              {/* Charts Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(500px, 1fr))",
                  gap: "24px",
                }}
              >
                {/* Report Status Chart */}
                <div
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    padding: "20px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 16px 0",
                      fontSize: "16px",
                      fontWeight: 600,
                      color: "#111",
                    }}
                  >
                    Report Status Distribution
                  </h3>
                  <div style={{ height: "300px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.statusData || []}>
                        <XAxis
                          dataKey="status"
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#fff",
                            border: "none",
                            borderRadius: "4px",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                          }}
                          formatter={(value, name) => [value, "Count"]}
                          labelFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {(stats.statusData || []).map((entry) => (
                            <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || "#6366f1"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Top Rated Companies */}
                <div
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    padding: "20px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 16px 0",
                      fontSize: "16px",
                      fontWeight: 600,
                      color: "#111",
                    }}
                  >
                    Company Ratings
                  </h3>
                  <div style={{ height: "300px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.companyRatingData || []}>
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#fff",
                            border: "none",
                            borderRadius: "4px",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                          }}
                          formatter={(value, name) => [value.toFixed(1), "Rating"]}
                        />
                        <Bar dataKey="avg" fill="#60a5fa" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Most Frequent Courses */}
                <div
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    padding: "20px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 16px 0",
                      fontSize: "16px",
                      fontWeight: 600,
                      color: "#111",
                    }}
                  >
                    Most Frequent Courses
                  </h3>
                  <div style={{ height: "300px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.courseData || []}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          labelLine={false}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        >
                          {(stats.courseData || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#fff",
                            border: "none",
                            borderRadius: "4px",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                          }}
                          formatter={(value, name, props) => [value, "Count"]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Internships by Company */}
                <div
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    padding: "20px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 16px 0",
                      fontSize: "16px",
                      fontWeight: 600,
                      color: "#111",
                    }}
                  >
                    Internships by Company
                  </h3>
                  <div style={{ height: "300px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={stats.companyCountData || []}>
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#fff",
                            border: "none",
                            borderRadius: "4px",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                          }}
                          formatter={(value, name) => [value, "Count"]}
                        />
                        <Line
                          type="monotone"
                          dataKey="count"
                          stroke="#8b5cf6"
                          strokeWidth={3}
                          dot={{ r: 6, fill: "#8b5cf6", strokeWidth: 0 }}
                          activeDot={{ r: 8, fill: "#8b5cf6", strokeWidth: 0 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: "16px",
                }}
              >
                <button
                  onClick={generateReport}
                  disabled={downloading}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: downloading ? "#a5a6f6" : "#6366f1",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontWeight: 500,
                    cursor: downloading ? "default" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 2px 4px rgba(99, 102, 241, 0.2)",
                    transition: "all 0.2s",
                  }}
                  onMouseOver={(e) => {
                    if (!downloading) {
                      e.target.style.backgroundColor = "#4f46e5"
                      e.target.style.boxShadow = "0 4px 6px rgba(99, 102, 241, 0.3)"
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!downloading) {
                      e.target.style.backgroundColor = "#6366f1"
                      e.target.style.boxShadow = "0 2px 4px rgba(99, 102, 241, 0.2)"
                    }
                  }}
                >
                  {downloading ? (
                    <>
                      <span
                        style={{
                          display: "inline-block",
                          width: "16px",
                          height: "16px",
                          border: "2px solid rgba(255,255,255,0.3)",
                          borderTop: "2px solid #fff",
                          borderRadius: "50%",
                          animation: "spin 1s linear infinite",
                        }}
                      ></span>
                      Downloading...
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: "16px" }}>📊</span>
                      Generate Full Report
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </main>
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
