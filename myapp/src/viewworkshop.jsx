"use client"

import { useEffect, useState } from "react"
import Sidebar from "./sidebarscad"
import { Calendar, Clock, User, FileText, ChevronDown, ChevronUp } from "lucide-react"

const ViewWorkshopsPage = () => {
  const [menuOpen, setMenuOpen] = useState(true)
  const [workshops, setWorkshops] = useState([])
  const [selectedWorkshop, setSelectedWorkshop] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    setLoading(true)
    setTimeout(() => {
      const stored = JSON.parse(localStorage.getItem("workshops")) || []
      setWorkshops(stored)
      setLoading(false)
    }, 800)
  }, [])

  const upcomingWorkshops = workshops.filter((ws) => new Date(ws.startDate) > new Date())

  const handleWorkshopClick = (index) => {
    setSelectedWorkshop((prevIndex) => (prevIndex === index ? null : index))
  }

  const formatDate = (dateString) => {
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const toggleMenu = () => setMenuOpen(!menuOpen)

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
        {/* Header */}
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
            Career Workshops
          </h1>

          <div style={{ display: "flex", alignItems: "center", marginLeft: "20px" }}>
            <span style={{ color: "#6a6a8a", fontSize: "14px", cursor: "pointer" }}>Home</span>
            <span style={{ margin: "0 8px", color: "#6a6a8a" }}>/</span>
            <span style={{ color: "#4a4a6a", fontSize: "14px", fontWeight: "bold" }}>Workshops</span>
          </div>
        </div>

        {/* Main Content */}
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
                  border: "4px solid rgba(107, 70, 193, 0.3)",
                  borderRadius: "50%",
                  borderTop: "4px solid #6b46c1",
                  animation: "spin 1s linear infinite",
                }}
              ></div>
              <div style={{ color: "#4a4a6a" }}>Loading workshops...</div>
            </div>
          ) : (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "24px",
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#1e293b",
                  }}
                >
                  Upcoming Career Workshops
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
                  {`Total: ${upcomingWorkshops.length} workshops`}
                </div>
              </div>

              {upcomingWorkshops.length === 0 ? (
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
                    <Calendar size={30} color="#6b46c1" />
                  </div>
                  <h3 style={{ color: "#4a4a6a", margin: "0 0 10px 0", fontSize: "18px" }}>No Upcoming Workshops</h3>
                  <p style={{ color: "#6a6a8a", margin: "0 0 20px 0", fontSize: "14px" }}>
                    There are no upcoming workshops scheduled at this time.
                  </p>
                </div>
              ) : (
                <div
                  style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "20px" }}
                >
                  {upcomingWorkshops.map((ws, index) => (
                    <div
                      key={index}
                      style={{
                        backgroundColor: "white",
                        borderRadius: "8px",
                        padding: "20px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                        border: "1px solid #e2e8f0",
                        transition: "transform 0.2s, box-shadow 0.2s",
                        cursor: "pointer",
                        transform: selectedWorkshop === index ? "translateY(-2px)" : "none",
                        boxShadow:
                          selectedWorkshop === index ? "0 4px 6px rgba(0,0,0,0.1)" : "0 1px 3px rgba(0,0,0,0.1)",
                      }}
                      onClick={() => handleWorkshopClick(index)}
                      onMouseOver={(e) => {
                        if (selectedWorkshop !== index) {
                          e.currentTarget.style.transform = "translateY(-2px)"
                          e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)"
                        }
                      }}
                      onMouseOut={(e) => {
                        if (selectedWorkshop !== index) {
                          e.currentTarget.style.transform = "translateY(0)"
                          e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)"
                        }
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "10px",
                        }}
                      >
                        <h3
                          style={{
                            margin: 0,
                            color: "#6b46c1",
                            fontSize: "18px",
                            fontWeight: "600",
                          }}
                        >
                          {ws.name}
                        </h3>
                        {selectedWorkshop === index ? (
                          <ChevronUp size={20} color="#6b46c1" />
                        ) : (
                          <ChevronDown size={20} color="#6b46c1" />
                        )}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: "10px",
                          color: "#64748b",
                          fontSize: "14px",
                        }}
                      >
                        <Calendar size={16} style={{ marginRight: "6px" }} />
                        {formatDate(ws.startDate)}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          color: "#64748b",
                          fontSize: "14px",
                        }}
                      >
                        <Clock size={16} style={{ marginRight: "6px" }} />
                        {ws.startTime} – {ws.endTime}
                      </div>

                      {/* Show details only if the workshop is selected */}
                      {selectedWorkshop === index && (
                        <div
                          style={{
                            marginTop: "15px",
                            paddingTop: "15px",
                            borderTop: "1px solid #e2e8f0",
                          }}
                        >
                          <div style={{ marginBottom: "12px" }}>
                            <div
                              style={{
                                fontSize: "14px",
                                fontWeight: "600",
                                color: "#4a4a6a",
                                marginBottom: "4px",
                              }}
                            >
                              Description
                            </div>
                            <div
                              style={{
                                fontSize: "14px",
                                color: "#64748b",
                                lineHeight: "1.5",
                              }}
                            >
                              {ws.description}
                            </div>
                          </div>

                          <div style={{ marginBottom: "12px" }}>
                            <div
                              style={{
                                fontSize: "14px",
                                fontWeight: "600",
                                color: "#4a4a6a",
                                marginBottom: "4px",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <User size={16} style={{ marginRight: "6px" }} />
                              Speaker
                            </div>
                            <div
                              style={{
                                fontSize: "14px",
                                color: "#64748b",
                                lineHeight: "1.5",
                              }}
                            >
                              {ws.speaker}
                            </div>
                          </div>

                          <div>
                            <div
                              style={{
                                fontSize: "14px",
                                fontWeight: "600",
                                color: "#4a4a6a",
                                marginBottom: "4px",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <FileText size={16} style={{ marginRight: "6px" }} />
                              Agenda
                            </div>
                            <div
                              style={{
                                fontSize: "14px",
                                color: "#64748b",
                                lineHeight: "1.5",
                                whiteSpace: "pre-line",
                              }}
                            >
                              {ws.agenda}
                            </div>
                          </div>

                          {/* <button
                            style={{
                              marginTop: "15px",
                              padding: "8px 16px",
                              backgroundColor: "#6b46c1",
                              color: "white",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "14px",
                              fontWeight: "500",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: "100%",
                              transition: "background-color 0.2s",
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#553c9a")}
                            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#6b46c1")}
                          >
                            Register for Workshop
                          </button> */}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default ViewWorkshopsPage
