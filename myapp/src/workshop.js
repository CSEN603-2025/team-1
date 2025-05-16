"use client"

import { useEffect, useState } from "react"
import Sidebar from "./sidebarscad"

const WorkshopPage = () => {
  const [menuOpen, setMenuOpen] = useState(true)
  const [workshops, setWorkshops] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editIndex, setEditIndex] = useState(null)
  const [errors, setErrors] = useState({})
  const [notificationContent, setNotificationContent] = useState({ show: false, message: "", type: "" })
  const [newWorkshop, setNewWorkshop] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    speaker: "",
    agenda: "",
  })

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("workshops")) || []
    setWorkshops(stored)
  }, [])

  const saveToLocalStorage = (updated) => {
    localStorage.setItem("workshops", JSON.stringify(updated))
    setWorkshops(updated)
    showNotification("Workshop saved successfully", "success")
  }

  const showNotification = (message, type = "info") => {
    setNotificationContent({ show: true, message, type })
    setTimeout(() => setNotificationContent({ show: false, message: "", type: "" }), 3000)
  }

  const handleOpenModal = (index = null) => {
    if (index !== null) {
      setEditIndex(index)
      setNewWorkshop(workshops[index])
    } else {
      setEditIndex(null)
      setNewWorkshop({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        startTime: "",
        endTime: "",
        speaker: "",
        agenda: "",
      })
    }
    setErrors({})
    setModalOpen(true)
  }

  const validateForm = () => {
    const newErrors = {}
    if (!newWorkshop.name.trim()) newErrors.name = "Workshop name is required."
    if (!newWorkshop.description.trim()) newErrors.description = "Description is required."
    if (!newWorkshop.startDate) newErrors.startDate = "Start date is required."
    if (!newWorkshop.endDate) newErrors.endDate = "End date is required."
    if (!newWorkshop.startTime) newErrors.startTime = "Start time is required."
    if (!newWorkshop.endTime) newErrors.endTime = "End time is required."
    if (!newWorkshop.speaker.trim()) newErrors.speaker = "Speaker bio is required."
    if (!newWorkshop.agenda.trim()) newErrors.agenda = "Agenda is required."
    return newErrors
  }

  const handleSave = () => {
    const formErrors = validateForm()
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors)
      return
    }

    let updated
    if (editIndex !== null) {
      updated = [...workshops]
      updated[editIndex] = newWorkshop
    } else {
      updated = [...workshops, newWorkshop]
    }

    saveToLocalStorage(updated)
    setModalOpen(false)
    setErrors({})
  }

  const handleDelete = (index) => {
    if (window.confirm("Are you sure you want to delete this workshop?")) {
      const updated = workshops.filter((_, i) => i !== index)
      saveToLocalStorage(updated)
      showNotification("Workshop deleted successfully", "success")
    }
  }

  const inputStyle = (error) => ({
    marginBottom: "10px",
    padding: "12px",
    width: "100%",
    borderRadius: "6px",
    border: `1px solid ${error ? "#ef4444" : "#e2e8f0"}`,
    fontSize: "14px",
    color: "#334155",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxSizing: "border-box",
    ":focus": {
      borderColor: "#6b46c1",
      boxShadow: "0 0 0 2px rgba(107, 70, 193, 0.2)",
    },
  })

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
      <Sidebar menuOpen={menuOpen} toggleMenu={() => setMenuOpen(!menuOpen)} />

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
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            role="button"
            tabIndex={0}
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
            Manage Workshops
          </h1>
          <div style={{ display: "flex", alignItems: "center", marginLeft: "20px" }}>
            <span style={{ color: "#6a6a8a", fontSize: "14px", cursor: "pointer" }}>Home</span>
            <span style={{ margin: "0 8px", color: "#6a6a8a" }}>/</span>
            <span style={{ color: "#4a4a6a", fontSize: "14px", fontWeight: "bold" }}>Workshops</span>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "#1e293b" }}>All Workshops</h2>
            <button
              onClick={() => handleOpenModal()}
              style={{
                padding: "10px 16px",
                backgroundColor: "#6b46c1",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: "6px",
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
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add Workshop
            </button>
          </div>

          {workshops.length === 0 ? (
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
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <h3 style={{ color: "#4a4a6a", margin: "0 0 10px 0", fontSize: "18px" }}>No Workshops Available</h3>
              <p style={{ color: "#6a6a8a", margin: "0 0 20px 0", fontSize: "14px" }}>
                No workshops have been created yet. Click the button below to add your first workshop.
              </p>
              <button
                onClick={() => handleOpenModal()}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#6b46c1",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                  display: "inline-flex",
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
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Add Workshop
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "20px" }}>
              {workshops.map((ws, index) => (
                <div
                  key={index}
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
                  <h4 style={{ margin: "0 0 10px 0", color: "#6b46c1", fontSize: "18px", fontWeight: "600" }}>
                    {ws.name}
                  </h4>
                  <p style={{ fontSize: "14px", color: "#475569", marginBottom: "15px" }}>{ws.description}</p>

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
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      <span style={{ marginLeft: "8px", color: "#334155", fontWeight: "500" }}>
                        {new Date(ws.startDate).toDateString()} to {new Date(ws.endDate).toDateString()}
                      </span>
                    </div>
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
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                      <span style={{ marginLeft: "8px", color: "#334155", fontWeight: "500" }}>
                        {ws.startTime} – {ws.endTime}
                      </span>
                    </div>
                  </div>

                  <div style={{ marginBottom: "15px" }}>
                    <h5 style={{ margin: "0 0 5px 0", fontSize: "15px", fontWeight: "600", color: "#334155" }}>
                      Speaker
                    </h5>
                    <p style={{ margin: "0", fontSize: "14px", color: "#475569" }}>{ws.speaker}</p>
                  </div>

                  <div style={{ marginBottom: "15px" }}>
                    <h5 style={{ margin: "0 0 5px 0", fontSize: "15px", fontWeight: "600", color: "#334155" }}>
                      Agenda
                    </h5>
                    <p style={{ margin: "0", fontSize: "14px", color: "#475569", whiteSpace: "pre-wrap" }}>
                      {ws.agenda}
                    </p>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "15px" }}>
                    <button
                      onClick={() => handleOpenModal(index)}
                      style={{
                        padding: "8px 12px",
                        backgroundColor: "#eef2ff",
                        color: "#4338ca",
                        border: "1px solid #c7d2fe",
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
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(index)}
                      style={{
                        padding: "8px 12px",
                        backgroundColor: "#fee2e2",
                        color: "#dc2626",
                        border: "1px solid #fecaca",
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
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
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
                borderBottom: "1px solid #e2e8f0",
                paddingBottom: "15px",
              }}
            >
              {editIndex !== null ? "Edit" : "Add"} Workshop
            </h3>

            <div style={{ marginBottom: "15px" }}>
              <label
                htmlFor="workshopName"
                style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500", color: "#334155" }}
              >
                Workshop Name
              </label>
              <input
                id="workshopName"
                type="text"
                placeholder="Enter workshop name"
                value={newWorkshop.name}
                onChange={(e) => setNewWorkshop({ ...newWorkshop, name: e.target.value })}
                style={inputStyle(errors.name)}
              />
              {errors.name && (
                <div style={{ color: "#ef4444", margin: "4px 0 0 0", fontSize: "13px" }}>{errors.name}</div>
              )}
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label
                htmlFor="workshopDescription"
                style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500", color: "#334155" }}
              >
                Description
              </label>
              <textarea
                id="workshopDescription"
                placeholder="Enter workshop description"
                value={newWorkshop.description}
                onChange={(e) => setNewWorkshop({ ...newWorkshop, description: e.target.value })}
                style={{ ...inputStyle(errors.description), height: "80px", resize: "vertical" }}
              />
              {errors.description && (
                <div style={{ color: "#ef4444", margin: "4px 0 0 0", fontSize: "13px" }}>{errors.description}</div>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
              <div style={{ marginBottom: "15px" }}>
                <label
                  htmlFor="startDate"
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#334155",
                  }}
                >
                  Start Date
                </label>
                <input
                  id="startDate"
                  type="date"
                  value={newWorkshop.startDate}
                  onChange={(e) => setNewWorkshop({ ...newWorkshop, startDate: e.target.value })}
                  style={inputStyle(errors.startDate)}
                />
                {errors.startDate && (
                  <div style={{ color: "#ef4444", margin: "4px 0 0 0", fontSize: "13px" }}>{errors.startDate}</div>
                )}
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label
                  htmlFor="endDate"
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#334155",
                  }}
                >
                  End Date
                </label>
                <input
                  id="endDate"
                  type="date"
                  value={newWorkshop.endDate}
                  onChange={(e) => setNewWorkshop({ ...newWorkshop, endDate: e.target.value })}
                  style={inputStyle(errors.endDate)}
                />
                {errors.endDate && (
                  <div style={{ color: "#ef4444", margin: "4px 0 0 0", fontSize: "13px" }}>{errors.endDate}</div>
                )}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
              <div style={{ marginBottom: "15px" }}>
                <label
                  htmlFor="startTime"
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#334155",
                  }}
                >
                  Start Time
                </label>
                <input
                  id="startTime"
                  type="time"
                  value={newWorkshop.startTime}
                  onChange={(e) => setNewWorkshop({ ...newWorkshop, startTime: e.target.value })}
                  style={inputStyle(errors.startTime)}
                />
                {errors.startTime && (
                  <div style={{ color: "#ef4444", margin: "4px 0 0 0", fontSize: "13px" }}>{errors.startTime}</div>
                )}
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label
                  htmlFor="endTime"
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#334155",
                  }}
                >
                  End Time
                </label>
                <input
                  id="endTime"
                  type="time"
                  value={newWorkshop.endTime}
                  onChange={(e) => setNewWorkshop({ ...newWorkshop, endTime: e.target.value })}
                  style={inputStyle(errors.endTime)}
                />
                {errors.endTime && (
                  <div style={{ color: "#ef4444", margin: "4px 0 0 0", fontSize: "13px" }}>{errors.endTime}</div>
                )}
              </div>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label
                htmlFor="speaker"
                style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500", color: "#334155" }}
              >
                Speaker Bio
              </label>
              <input
                id="speaker"
                type="text"
                placeholder="Enter speaker information"
                value={newWorkshop.speaker}
                onChange={(e) => setNewWorkshop({ ...newWorkshop, speaker: e.target.value })}
                style={inputStyle(errors.speaker)}
              />
              {errors.speaker && (
                <div style={{ color: "#ef4444", margin: "4px 0 0 0", fontSize: "13px" }}>{errors.speaker}</div>
              )}
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label
                htmlFor="agenda"
                style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500", color: "#334155" }}
              >
                Workshop Agenda
              </label>
              <textarea
                id="agenda"
                placeholder="Enter workshop agenda"
                value={newWorkshop.agenda}
                onChange={(e) => setNewWorkshop({ ...newWorkshop, agenda: e.target.value })}
                style={{ ...inputStyle(errors.agenda), height: "100px", resize: "vertical" }}
              />
              {errors.agenda && (
                <div style={{ color: "#ef4444", margin: "4px 0 0 0", fontSize: "13px" }}>{errors.agenda}</div>
              )}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "15px",
                marginTop: "25px",
                borderTop: "1px solid #e2e8f0",
                paddingTop: "20px",
              }}
            >
              <button
                onClick={() => setModalOpen(false)}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#f1f5f9",
                  color: "#64748b",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                  transition: "background-color 0.2s",
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#e2e8f0")}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#f1f5f9")}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#6b46c1",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                  transition: "background-color 0.2s",
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#553c9a")}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#6b46c1")}
              >
                {editIndex !== null ? "Update" : "Save"} Workshop
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
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

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

export default WorkshopPage
