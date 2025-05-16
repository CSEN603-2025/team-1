"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import SidebarStudent from "./sidebarpro" // Import the sidebar component

// Define theme colors to match the student portal UI
const theme = {
  primary: {
    main: "#6a4c93", // Main purple
    light: "#9d8bb0", // Light purple
    dark: "#4a2c73", // Dark purple
    veryLight: "#f5f0fa", // Very light purple for backgrounds
    transparent: "rgba(106, 76, 147, 0.1)", // Transparent purple
  },
  text: {
    primary: "#333333",
    secondary: "#666666",
    light: "#ffffff",
  },
  error: "#d32f2f",
  success: "#28a745",
  warning: "#ffc107",
  info: "#17a2b8",
  background: {
    default: "#f8f9fa",
    paper: "#ffffff",
  },
  border: "#e0e0e0",
}

// --- DUMMY DATA ---
const DUMMY_WORKSHOPS = [
  {
    id: "ws101",
    title: "Resume Building Masterclass",
    date: new Date(new Date().getTime() + 1 * 60 * 1000).toISOString(), // 1 minute from now for testing
    type: "live",
    duration: "60 minutes",
    instructor: "Dr. Jane Doe",
    description:
      "Learn how to craft a compelling resume that gets noticed by recruiters. Covers formatting, content, and tailoring for specific jobs.",
    platformLink: "internal",
    videoUrl: null,
  },
  {
    id: "ws102",
    title: "Ace Your Job Interview",
    date: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    type: "live",
    duration: "90 minutes",
    instructor: "Mr. John Smith",
    description:
      "Master common interview questions, learn STAR method, and practice your delivery. Includes mock interview session.",
    platformLink: "internal",
    videoUrl: null,
  },
  {
    id: "ws103",
    title: "Networking for Success (Pre-recorded)",
    date: new Date(new Date().getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    type: "recorded",
    duration: "45 minutes",
    instructor: "Ms. Priya Sharma",
    description: "Discover effective strategies for building your professional network online and offline.",
    platformLink: null,
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
  },
  {
    id: "ws104",
    title: "LinkedIn Profile Optimization",
    date: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    type: "live",
    duration: "75 minutes",
    instructor: "Mr. Alex Chen",
    description:
      "Turn your LinkedIn profile into a powerful career tool. Learn about optimizing sections, making connections, and content strategy.",
    platformLink: "internal",
    videoUrl: null,
  },
]
// --- END DUMMY DATA ---

function StudentWorkshops() {
  const [workshops, setWorkshops] = useState([])
  const [selectedWorkshop, setSelectedWorkshop] = useState(null)
  const [registeredWorkshopIds, setRegisteredWorkshopIds] = useState(new Set())
  const [workshopNotes, setWorkshopNotes] = useState({})
  const [workshopRatings, setWorkshopRatings] = useState({})
  const [chatMessages, setChatMessages] = useState({})
  const [showCertificate, setShowCertificate] = useState(null)
  const [activeTab, setActiveTab] = useState("upcoming")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false) // State for sidebar toggle

  const location = useLocation()
  const navigate = useNavigate()
  const studentProfile = location.state?.student

  const videoRef = useRef(null)

  // Toggle sidebar function
  const toggleMenu = () => {
    setMenuOpen(!menuOpen)
  }

  const isRegistered = useCallback((workshopId) => registeredWorkshopIds.has(workshopId), [registeredWorkshopIds])

  const loadData = useCallback(() => {
    setIsLoading(true)
    try {
      const storedWorkshops = localStorage.getItem("studentWorkshopsAll")
      let initialWorkshops = storedWorkshops
        ? JSON.parse(storedWorkshops)
        : DUMMY_WORKSHOPS.map((ws) => ({
            ...ws,
            attendees: [],
            chatMessages: ws.type === "live" ? [] : undefined,
            attendedBy: [],
            workshopOverallRatings: {},
          }))

      const workshopMap = new Map(initialWorkshops.map((ws) => [ws.id, ws]))
      DUMMY_WORKSHOPS.forEach((dummyWs) => {
        const existing = workshopMap.get(dummyWs.id)
        workshopMap.set(dummyWs.id, {
          ...dummyWs,
          attendees: existing?.attendees || [],
          chatMessages: existing?.chatMessages || (dummyWs.type === "live" ? [] : undefined),
          attendedBy: existing?.attendedBy || [],
          workshopOverallRatings: existing?.workshopOverallRatings || {},
        })
      })
      initialWorkshops = Array.from(workshopMap.values())

      setWorkshops(initialWorkshops)

      if (studentProfile?.email) {
        const storedRegistrations = localStorage.getItem(`registrations_${studentProfile.email}`)
        setRegisteredWorkshopIds(storedRegistrations ? new Set(JSON.parse(storedRegistrations)) : new Set())
        const storedNotes = localStorage.getItem(`notes_${studentProfile.email}`)
        setWorkshopNotes(storedNotes ? JSON.parse(storedNotes) : {})
        const storedRatings = localStorage.getItem(`ratings_${studentProfile.email}`)
        setWorkshopRatings(storedRatings ? JSON.parse(storedRatings) : {})
      }
      setIsLoading(false)
    } catch (err) {
      console.error("Error loading workshop data:", err)
      setError("Failed to load workshop data. Please try again.")
      setIsLoading(false)
    }
  }, [studentProfile])

  useEffect(() => {
    loadData()
    // Persist workshops to localStorage initially if not already there
    if (!localStorage.getItem("studentWorkshopsAll")) {
      localStorage.setItem(
        "studentWorkshopsAll",
        JSON.stringify(
          DUMMY_WORKSHOPS.map((ws) => ({
            ...ws,
            attendees: [],
            chatMessages: ws.type === "live" ? [] : undefined,
            attendedBy: [],
            workshopOverallRatings: {},
          })),
        ),
      )
    }
  }, [loadData]) // loadData will only change if studentProfile changes, so this runs once on mount mostly

  useEffect(() => {
    if (studentProfile?.email && workshops.length > 0 && registeredWorkshopIds.size > 0) {
      workshops.forEach((ws) => {
        if (
          registeredWorkshopIds.has(ws.id) &&
          new Date(ws.date) > new Date() &&
          new Date(ws.date) < new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
        ) {
          console.log(`Simulated Notification: Workshop "${ws.title}" is upcoming.`)
        }
      })
    }
  }, [studentProfile, workshops, registeredWorkshopIds])

  const updateWorkshopData = useCallback((workshopId, updatedDataOrFn) => {
    setWorkshops((prevWorkshops) => {
      const updatedWorkshops = prevWorkshops.map((ws) => {
        if (ws.id === workshopId) {
          const dataToUpdate = typeof updatedDataOrFn === "function" ? updatedDataOrFn(ws) : updatedDataOrFn
          return { ...ws, ...dataToUpdate }
        }
        return ws
      })
      localStorage.setItem("studentWorkshopsAll", JSON.stringify(updatedWorkshops))
      return updatedWorkshops
    })
  }, [])

  const handleRegister = (workshopId) => {
    if (!studentProfile?.email) {
      showNotification("Please log in to register for workshops.", "error")
      return
    }

    try {
      setRegisteredWorkshopIds((prev) => {
        const newSet = new Set(prev)
        newSet.add(workshopId)
        localStorage.setItem(`registrations_${studentProfile.email}`, JSON.stringify([...newSet]))
        return newSet
      })

      updateWorkshopData(workshopId, (currentWs) => ({
        attendees: [...(currentWs.attendees || []), studentProfile.email],
      }))

      showNotification("Successfully registered for the workshop!", "success")
    } catch (err) {
      console.error("Error registering for workshop:", err)
      showNotification("Failed to register for the workshop. Please try again.", "error")
    }
  }

  const handleUnregister = (workshopId) => {
    if (!studentProfile?.email) return

    try {
      setRegisteredWorkshopIds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(workshopId)
        localStorage.setItem(`registrations_${studentProfile.email}`, JSON.stringify([...newSet]))
        return newSet
      })

      updateWorkshopData(workshopId, (currentWs) => ({
        attendees: (currentWs.attendees || []).filter((email) => email !== studentProfile.email),
      }))

      showNotification("Successfully unregistered from the workshop.", "success")
    } catch (err) {
      console.error("Error unregistering from workshop:", err)
      showNotification("Failed to unregister from the workshop. Please try again.", "error")
    }
  }

  const markAsAttendedAfterLive = useCallback(
    (workshopId) => {
      if (!studentProfile?.email) return

      const workshop = workshops.find((ws) => ws.id === workshopId)
      if (workshop && workshop.type === "live" && isRegistered(workshopId)) {
        const startTime = new Date(workshop.date)
        const durationString = workshop.duration || "60 minutes"
        const match = durationString.match(/\d+/)
        const durationMinutes = match ? Number.parseInt(match[0], 10) : 60
        const endTime = new Date(startTime.getTime() + durationMinutes * 60000)

        if (new Date() >= endTime) {
          if (!(workshop.attendedBy || []).includes(studentProfile.email)) {
            updateWorkshopData(workshopId, (currentWs) => ({
              attendedBy: [...(currentWs.attendedBy || []), studentProfile.email],
            }))
            console.log(`StudentWorkshops: Marked ${studentProfile.email} as attended for ${workshopId}`)
          }
        }
      }
    },
    [studentProfile, workshops, isRegistered, updateWorkshopData],
  )

  const handleSelectWorkshop = (workshop) => {
    setSelectedWorkshop(workshop)
    if (workshop.type === "live") {
      const storedWorkshopData = workshops.find((ws) => ws.id === workshop.id)
      setChatMessages((prev) => ({ ...prev, [workshop.id]: storedWorkshopData?.chatMessages || [] }))
    }
    if (
      studentProfile?.email &&
      new Date(workshop.date) < new Date() &&
      isRegistered(workshop.id) &&
      workshop.type === "live"
    ) {
      markAsAttendedAfterLive(workshop.id)
    }
  }

  const handleNoteChange = (workshopId, notes) => {
    if (!studentProfile?.email) return

    setWorkshopNotes((prev) => {
      const updated = { ...prev, [workshopId]: notes }
      localStorage.setItem(`notes_${studentProfile.email}`, JSON.stringify(updated))
      return updated
    })
  }

  const handleRatingSubmit = (workshopId, rating, feedback) => {
    if (!studentProfile?.email) return

    // Update user's personal ratings
    setWorkshopRatings((prev) => {
      const updated = { ...prev, [workshopId]: { rating, feedback } }
      localStorage.setItem(`ratings_${studentProfile.email}`, JSON.stringify(updated))
      return updated
    })

    // Update workshop's overall ratings
    updateWorkshopData(workshopId, (currentWs) => ({
      workshopOverallRatings: {
        ...(currentWs.workshopOverallRatings || {}),
        [studentProfile.email]: { rating, feedback },
      },
    }))

    showNotification("Thank you for your feedback!", "success")
  }

  const handleSendChatMessage = (workshopId, messageText) => {
    if (!messageText.trim() || !studentProfile?.email) return

    const newMessage = {
      sender: studentProfile.email,
      text: messageText,
      timestamp: new Date().toISOString(),
    }

    // Update local state
    setChatMessages((prev) => {
      const workshopMessages = [...(prev[workshopId] || []), newMessage]
      return { ...prev, [workshopId]: workshopMessages }
    })

    // Update workshop data
    updateWorkshopData(workshopId, (currentWs) => ({
      chatMessages: [...(currentWs.chatMessages || []), newMessage],
    }))
  }

  const canGetCertificate = (workshopId) => {
    const workshop = workshops.find((ws) => ws.id === workshopId)
    return (
      workshop &&
      studentProfile?.email &&
      isRegistered(workshopId) &&
      (workshop.attendedBy || []).includes(studentProfile.email)
    )
  }

  const handleViewCertificate = (workshopId) => setShowCertificate(workshopId)

  const playVideo = () => videoRef.current?.play()
  const pauseVideo = () => videoRef.current?.pause()
  const stopVideo = () => {
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }

  // Filter workshops based on active tab
  const getFilteredWorkshops = () => {
    const now = new Date()

    switch (activeTab) {
      case "upcoming":
        return workshops
          .filter((ws) => {
            const startTime = new Date(ws.date)
            return startTime > now
          })
          .sort((a, b) => new Date(a.date) - new Date(b.date))

      case "ongoing":
        return workshops.filter((ws) => {
          if (ws.type !== "live") return false
          const startTime = new Date(ws.date)
          const durationString = ws.duration || "60 minutes"
          const match = durationString.match(/\d+/)
          const durationMinutes = match ? Number.parseInt(match[0], 10) : 60
          const endTime = new Date(startTime.getTime() + durationMinutes * 60000)
          return now >= startTime && now < endTime
        })

      case "recorded":
        return workshops.filter((ws) => ws.type === "recorded")

      case "registered":
        return workshops.filter((ws) => isRegistered(ws.id))

      case "completed":
        return workshops.filter((ws) => {
          const startTime = new Date(ws.date)
          const durationString = ws.duration || "60 minutes"
          const match = durationString.match(/\d+/)
          const durationMinutes = match ? Number.parseInt(match[0], 10) : 60
          const endTime = new Date(startTime.getTime() + durationMinutes * 60000)
          return now > endTime && isRegistered(ws.id)
        })

      default:
        return workshops
    }
  }

  const [notification, setNotification] = useState({ show: false, message: "", type: "" })

  const showNotification = (message, type = "info") => {
    setNotification({ show: true, message, type })
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" })
    }, 3000)
  }

  if (!studentProfile) {
    return (
      <div style={styles.pageContainer}>
        <div style={styles.authContainer}>
          <h2 style={styles.authHeader}>Student Portal Access</h2>
          <p style={styles.authText}>Please log in to view career workshops.</p>
          <button onClick={() => navigate("/studentlogin")} style={styles.buttonPrimary}>
            Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {/* Sidebar Component */}
      <SidebarStudent menuOpen={menuOpen} toggleMenu={toggleMenu} />

      {/* Main Content */}
      <div
        style={{
          ...styles.mainContent,
          marginLeft: menuOpen ? "250px" : "0",
          width: menuOpen ? "calc(100% - 250px)" : "100%",
        }}
      >
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            {/* Hamburger Icon */}
            <div
              style={{
                ...styles.hamburgerIcon,
                backgroundColor: menuOpen ? theme.primary.transparent : "transparent",
              }}
              onClick={toggleMenu}
              aria-label="Toggle menu"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && toggleMenu()}
            >
              <div
                style={{
                  ...styles.hamburgerLine,
                  transform: menuOpen ? "rotate(45deg) translate(5px, 5px)" : "none",
                }}
              ></div>
              <div
                style={{
                  ...styles.hamburgerLine,
                  opacity: menuOpen ? 0 : 1,
                }}
              ></div>
              <div
                style={{
                  ...styles.hamburgerLine,
                  transform: menuOpen ? "rotate(-45deg) translate(5px, -5px)" : "none",
                }}
              ></div>
            </div>
            <h1 style={styles.headerTitle}>Student Portal</h1>
          </div>
          <div style={styles.headerRight}>
            <div style={styles.userInfo}>
              <div style={styles.userAvatar}>
                {studentProfile?.name ? studentProfile.name.charAt(0).toUpperCase() : "S"}
              </div>
              <div style={styles.userDetails}>
                <div style={styles.userName}>
                  {studentProfile?.name || "Student User"}
                  <span style={styles.proBadge}>PRO</span>
                </div>
                <div style={styles.userEmail}>{studentProfile?.email || "student@example.com"}</div>
              </div>
            </div>
            <button onClick={() => navigate("/studentlogin")} style={styles.logoutButton}>
              Logout
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div style={styles.navigation}>
          <div style={styles.breadcrumbs}>
            <span
              style={styles.breadcrumbLink}
              onClick={() => navigate("/studentpage", { state: { student: studentProfile } })}
            >
              Home
            </span>
            <span style={styles.breadcrumbSeparator}>/</span>
            <span style={styles.breadcrumbCurrent}>Career Workshops</span>
            {selectedWorkshop && (
              <>
                <span style={styles.breadcrumbSeparator}>/</span>
                <span style={styles.breadcrumbCurrent}>{selectedWorkshop.title}</span>
              </>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div style={styles.pageContainer}>
          <h1 style={styles.pageTitle}>Career Workshops</h1>

          {isLoading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner}></div>
              <p style={styles.loadingText}>Loading workshops...</p>
            </div>
          ) : error ? (
            <div style={styles.errorContainer}>
              <p style={styles.errorText}>{error}</p>
              <button onClick={loadData} style={styles.buttonPrimary}>
                Try Again
              </button>
            </div>
          ) : !selectedWorkshop ? (
            <>
              {/* Tab navigation */}
              <div style={styles.tabContainer}>
                <button
                  style={{ ...styles.tabButton, ...(activeTab === "upcoming" ? styles.activeTabButton : {}) }}
                  onClick={() => setActiveTab("upcoming")}
                >
                  Upcoming
                </button>
                <button
                  style={{ ...styles.tabButton, ...(activeTab === "ongoing" ? styles.activeTabButton : {}) }}
                  onClick={() => setActiveTab("ongoing")}
                >
                  Live Now
                </button>
                <button
                  style={{ ...styles.tabButton, ...(activeTab === "recorded" ? styles.activeTabButton : {}) }}
                  onClick={() => setActiveTab("recorded")}
                >
                  Recorded
                </button>
                <button
                  style={{ ...styles.tabButton, ...(activeTab === "registered" ? styles.activeTabButton : {}) }}
                  onClick={() => setActiveTab("registered")}
                >
                  My Workshops
                </button>
                <button
                  style={{ ...styles.tabButton, ...(activeTab === "completed" ? styles.activeTabButton : {}) }}
                  onClick={() => setActiveTab("completed")}
                >
                  Completed
                </button>
              </div>

              <h2 style={styles.sectionTitle}>
                {activeTab === "upcoming" && "Upcoming Workshops"}
                {activeTab === "ongoing" && "Live Now"}
                {activeTab === "recorded" && "Recorded Workshops"}
                {activeTab === "registered" && "My Registered Workshops"}
                {activeTab === "completed" && "Completed Workshops"}
              </h2>

              {getFilteredWorkshops().length > 0 ? (
                <div style={styles.workshopList}>
                  {getFilteredWorkshops().map((ws) => (
                    <WorkshopCard
                      key={ws.id}
                      workshop={ws}
                      onSelect={handleSelectWorkshop}
                      onRegister={handleRegister}
                      onUnregister={handleUnregister}
                      isRegistered={isRegistered(ws.id)}
                    />
                  ))}
                </div>
              ) : (
                <div style={styles.emptyState}>
                  <p style={styles.emptyStateText}>No workshops found in this category.</p>
                  {activeTab === "registered" && (
                    <button onClick={() => setActiveTab("upcoming")} style={styles.buttonPrimary}>
                      Browse Upcoming Workshops
                    </button>
                  )}
                </div>
              )}
            </>
          ) : (
            <WorkshopDetails
              workshop={selectedWorkshop}
              onClose={() => setSelectedWorkshop(null)}
              isRegistered={isRegistered(selectedWorkshop.id)}
              onRegister={handleRegister}
              onUnregister={handleUnregister}
              notes={workshopNotes[selectedWorkshop.id] || ""}
              onNoteChange={handleNoteChange}
              ratingData={workshopRatings[selectedWorkshop.id] || { rating: 0, feedback: "" }}
              onRatingSubmit={handleRatingSubmit}
              chatMessages={chatMessages[selectedWorkshop.id] || []}
              onSendChatMessage={handleSendChatMessage}
              videoRef={videoRef}
              playVideo={playVideo}
              pauseVideo={pauseVideo}
              stopVideo={stopVideo}
              showCertificateButton={canGetCertificate(selectedWorkshop.id)}
              onViewCertificate={handleViewCertificate}
              currentUserEmail={studentProfile.email}
              markAsAttended={markAsAttendedAfterLive}
              studentProfile={studentProfile}
            />
          )}

          {showCertificate && workshops.find((ws) => ws.id === showCertificate) && (
            <CertificateModal
              workshopName={workshops.find((ws) => ws.id === showCertificate)?.title || "Workshop"}
              studentName={studentProfile.name || studentProfile.email}
              completionDate={new Date(
                workshops.find((ws) => ws.id === showCertificate)?.date || Date.now(),
              ).toLocaleDateString()}
              onClose={() => setShowCertificate(null)}
            />
          )}
        </div>
      </div>

      {/* Notification Toast */}
      {notification.show && (
        <div
          style={{
            ...styles.notification,
            backgroundColor:
              notification.type === "success"
                ? theme.success
                : notification.type === "error"
                  ? theme.error
                  : notification.type === "warning"
                    ? theme.warning
                    : theme.primary.main,
          }}
        >
          {notification.message}
        </div>
      )}
    </div>
  )
}

const WorkshopCard = ({ workshop, onSelect, onRegister, onUnregister, isRegistered }) => {
  // Calculate if live workshop is ongoing for card display
  let isOngoingLive = false
  if (workshop.type === "live") {
    const startTime = new Date(workshop.date)
    const now = new Date()
    const durationString = workshop.duration || "60 minutes"
    const match = durationString.match(/\d+/)
    const durationMinutes = match ? Number.parseInt(match[0], 10) : 60
    const endTime = new Date(startTime.getTime() + durationMinutes * 60000)
    isOngoingLive = now >= startTime && now < endTime
  }

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <h3 style={styles.cardTitle}>{workshop.title}</h3>
        <div style={styles.cardType}>
          {workshop.type === "live" ? (
            <div style={{ ...styles.badge, ...(isOngoingLive ? styles.badgeLive : styles.badgeUpcoming) }}>
              {isOngoingLive ? "LIVE NOW" : "Live"}
            </div>
          ) : (
            <div style={styles.badgeRecorded}>Recorded</div>
          )}
        </div>
      </div>
      <div style={styles.cardContent}>
        <p style={styles.cardDate}>
          <span style={styles.cardLabel}>Date:</span> {new Date(workshop.date).toLocaleString()}
        </p>
        <p style={styles.cardInstructor}>
          <span style={styles.cardLabel}>Instructor:</span> {workshop.instructor}
        </p>
        <p style={styles.cardDuration}>
          <span style={styles.cardLabel}>Duration:</span> {workshop.duration}
        </p>
        <p style={styles.cardDescription}>{workshop.description.substring(0, 120)}...</p>
      </div>
      <div style={styles.cardActions}>
        <button onClick={() => onSelect(workshop)} style={styles.buttonPrimary}>
          View Details
        </button>
        {workshop.type === "live" &&
          new Date(workshop.date) >= new Date() &&
          !isOngoingLive &&
          (isRegistered ? (
            <button onClick={() => onUnregister(workshop.id)} style={styles.buttonDanger}>
              Unregister
            </button>
          ) : (
            <button onClick={() => onRegister(workshop.id)} style={styles.buttonSecondary}>
              Register
            </button>
          ))}
        {workshop.type === "recorded" &&
          (isRegistered ? (
            <div style={styles.registeredBadge}>✓ In My List</div>
          ) : (
            <button onClick={() => onRegister(workshop.id)} style={styles.buttonSecondary}>
              Add to My List
            </button>
          ))}
      </div>
    </div>
  )
}

const WorkshopDetails = ({
  workshop,
  onClose,
  isRegistered,
  onRegister,
  onUnregister,
  notes,
  onNoteChange,
  ratingData,
  onRatingSubmit,
  chatMessages,
  onSendChatMessage,
  videoRef,
  playVideo,
  pauseVideo,
  stopVideo,
  showCertificateButton,
  onViewCertificate,
  currentUserEmail,
  markAsAttended,
  studentProfile,
}) => {
  const [currentRating, setCurrentRating] = useState(ratingData?.rating || 0)
  const [feedback, setFeedback] = useState(ratingData?.feedback || "")
  const [chatInput, setChatInput] = useState("")
  const chatBoxRef = useRef(null)
  const [isLiveSessionActive, setIsLiveSessionActive] = useState(false)
  const [isCurrentlyLiveTime, setIsCurrentlyLiveTime] = useState(false)
  const workshopEndTimeRef = useRef(null)
  const hasJoinedSessionRef = useRef(false)

  useEffect(() => {
    setCurrentRating(ratingData?.rating || 0)
    setFeedback(ratingData?.feedback || "")
  }, [ratingData])

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight
    }
  }, [chatMessages, isLiveSessionActive])

  useEffect(() => {
    if (workshop.type === "live") {
      const startTime = new Date(workshop.date)
      const durationString = workshop.duration || "60 minutes"

      const match = durationString.match(/\d+/)
      const durationMinutes = match ? Number.parseInt(match[0], 10) : 60

      workshopEndTimeRef.current = new Date(startTime.getTime() + durationMinutes * 60000)

      const checkLiveStatus = () => {
        const now = new Date()
        const live = now >= startTime && now < workshopEndTimeRef.current
        setIsCurrentlyLiveTime(live)

        if (isLiveSessionActive && !live && hasJoinedSessionRef.current) {
          handleLeaveLiveSession(true)
        }
      }

      checkLiveStatus()
      const interval = setInterval(checkLiveStatus, 30000)
      return () => clearInterval(interval)
    } else {
      setIsCurrentlyLiveTime(false)
    }
  }, [workshop.date, workshop.duration, workshop.type])

  useEffect(() => {
    return () => {
      if (isLiveSessionActive && hasJoinedSessionRef.current && workshop.type === "live") {
        if (workshopEndTimeRef.current && new Date() >= workshopEndTimeRef.current) {
          markAsAttended(workshop.id)
        }
      }
    }
  }, [isLiveSessionActive, workshop.id, workshop.type, markAsAttended])

  const handleLocalRatingSubmit = (e) => {
    e.preventDefault()
    onRatingSubmit(workshop.id, currentRating, feedback)
  }

  const handleLocalChatSubmit = (e) => {
    e.preventDefault()
    onSendChatMessage(workshop.id, chatInput)
    setChatInput("")
  }

  const isWorkshopPast =
    new Date(workshop.date) < new Date() && (!workshopEndTimeRef.current || new Date() > workshopEndTimeRef.current)

  const handleJoinLiveSession = () => {
    if (isCurrentlyLiveTime && isRegistered) {
      setIsLiveSessionActive(true)
      hasJoinedSessionRef.current = true
      console.log(`${studentProfile.email} joined live session for ${workshop.title}`)
    } else if (!isRegistered) {
      alert("Please register for the workshop to join the live session.")
    } else {
      alert("The workshop is not currently live or has ended.")
    }
  }

  const handleLeaveLiveSession = (sessionEndedNaturally = false) => {
    setIsLiveSessionActive(false)
    if (hasJoinedSessionRef.current && isRegistered) {
      if ((workshopEndTimeRef.current && new Date() >= workshopEndTimeRef.current) || sessionEndedNaturally) {
        markAsAttended(workshop.id)
      }
    }
    hasJoinedSessionRef.current = false
  }

  if (isLiveSessionActive) {
    return (
      <div style={styles.detailsContainer}>
        <div style={styles.detailsHeader}>
          <h2 style={styles.detailsTitle}>{workshop.title} - Live Session</h2>
          <button onClick={() => handleLeaveLiveSession(false)} style={styles.buttonDanger}>
            Leave Session
          </button>
        </div>
        <div style={styles.liveSessionLayout}>
          <div style={styles.liveVideoContainer}>
            <div style={styles.liveVideoPlaceholder}>
              <p style={{ fontSize: "2em", margin: "0 0 15px 0" }}>🎬</p>
              <p style={{ fontSize: "18px", fontWeight: "600", margin: "0 0 10px 0" }}>Live Video Stream</p>
              <p style={{ fontSize: "14px", color: "#aaa", margin: "0 0 20px 0" }}>(Simulated - No actual video)</p>
              <div
                style={{
                  backgroundColor: "rgba(255,255,255,0.1)",
                  padding: "10px 15px",
                  borderRadius: "4px",
                  marginTop: "20px",
                }}
              >
                <p style={{ margin: "0", fontSize: "14px" }}>
                  <strong>Instructor:</strong> {workshop.instructor}
                </p>
              </div>
            </div>
          </div>
          {isRegistered && (
            <div style={styles.chatContainer}>
              <div style={styles.chatHeader}>Live Chat</div>
              <div ref={chatBoxRef} style={styles.chatMessages}>
                {chatMessages.map((msg, index) => (
                  <div
                    key={index}
                    style={msg.sender === currentUserEmail ? styles.chatMessageSent : styles.chatMessageReceived}
                  >
                    <div style={styles.chatSender}>
                      {msg.sender === currentUserEmail ? "You" : msg.sender.split("@")[0]}
                    </div>
                    <div style={styles.chatText}>{msg.text}</div>
                    <div style={styles.chatTime}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                ))}
                {chatMessages.length === 0 && (
                  <div style={styles.chatEmpty}>Chat is live! Be the first to message.</div>
                )}
              </div>
              <form onSubmit={handleLocalChatSubmit} style={styles.chatForm}>
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type your message..."
                  style={styles.chatInput}
                />
                <button
                  type="submit"
                  style={{ ...styles.buttonPrimary, opacity: !chatInput.trim() ? 0.7 : 1 }}
                  disabled={!chatInput.trim()}
                >
                  Send
                </button>
              </form>
            </div>
          )}
        </div>
        <div style={styles.notesSection}>
          <h4 style={styles.sectionTitle}>My Notes (Live)</h4>
          <textarea
            value={notes}
            onChange={(e) => onNoteChange(workshop.id, e.target.value)}
            placeholder="Take notes during the live session..."
            rows={5}
            style={styles.textarea}
          />
        </div>
      </div>
    )
  }

  return (
    <div style={styles.detailsContainer}>
      <button onClick={onClose} style={styles.backButton}>
        ← Back to Workshops
      </button>
      <h2 style={styles.detailsTitle}>{workshop.title}</h2>

      <div style={styles.detailsGrid}>
        <div style={styles.detailsItem}>
          <span style={styles.detailsLabel}>Instructor:</span>
          <span style={styles.detailsValue}>{workshop.instructor}</span>
        </div>
        <div style={styles.detailsItem}>
          <span style={styles.detailsLabel}>Date:</span>
          <span style={styles.detailsValue}>{new Date(workshop.date).toLocaleString()}</span>
        </div>
        <div style={styles.detailsItem}>
          <span style={styles.detailsLabel}>Type:</span>
          <span style={styles.detailsValue}>{workshop.type === "live" ? "Live Session" : "Recorded"}</span>
        </div>
        <div style={styles.detailsItem}>
          <span style={styles.detailsLabel}>Duration:</span>
          <span style={styles.detailsValue}>{workshop.duration}</span>
        </div>
      </div>

      <div style={styles.detailsDescription}>
        <h4 style={styles.sectionTitle}>Description</h4>
        <p style={styles.descriptionText}>{workshop.description}</p>
      </div>

      <div style={styles.workshopActions}>
        {workshop.type === "live" &&
          (isRegistered ? (
            <>
              {isCurrentlyLiveTime ? (
                <button onClick={handleJoinLiveSession} style={styles.buttonSuccess}>
                  <span style={{ marginRight: "10px" }}>🔴</span>
                  Join Live Session Now
                </button>
              ) : isWorkshopPast ? (
                <div style={showCertificateButton ? styles.statusSuccess : styles.statusError}>
                  Status: {showCertificateButton ? "Attended ✓" : "Missed ✗"}
                </div>
              ) : (
                <div style={styles.statusInfo}>
                  Live session starts:{" "}
                  {new Date(workshop.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  <div style={styles.statusDate}>
                    {new Date(workshop.date).toLocaleDateString([], {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>
              )}
              {/* Unregister only for future or if not yet started and not past end time */}
              {new Date(workshop.date) >= new Date() &&
                (!workshopEndTimeRef.current || new Date() < workshopEndTimeRef.current) && (
                  <button onClick={() => onUnregister(workshop.id)} style={styles.buttonDanger}>
                    Unregister
                  </button>
                )}
            </>
          ) : (
            new Date(workshop.date) >= new Date() && (
              <button onClick={() => onRegister(workshop.id)} style={styles.buttonPrimary}>
                Register to Attend
              </button>
            )
          ))}

        {workshop.type === "live" && isWorkshopPast && !isCurrentlyLiveTime && !isRegistered && (
          <div style={styles.statusSecondary}>This live workshop has concluded. (Not registered)</div>
        )}

        {workshop.type === "recorded" && workshop.videoUrl && (
          <div style={styles.videoSection}>
            <h4 style={styles.sectionTitle}>Workshop Video</h4>
            <video ref={videoRef} width="100%" controls style={styles.video}>
              <source src={workshop.videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div style={styles.videoControls}>
              <button onClick={playVideo} style={styles.controlButton}>
                <span style={{ marginRight: "5px" }}>▶</span> Play
              </button>
              <button onClick={pauseVideo} style={styles.controlButton}>
                <span style={{ marginRight: "5px" }}>❚❚</span> Pause
              </button>
              <button onClick={stopVideo} style={styles.controlButton}>
                <span style={{ marginRight: "5px" }}>■</span> Stop
              </button>
            </div>
          </div>
        )}

        {(!isLiveSessionActive || workshop.type === "recorded") && (
          <div style={styles.notesSection}>
            <h4 style={styles.sectionTitle}>My Notes</h4>
            <textarea
              value={notes}
              onChange={(e) => onNoteChange(workshop.id, e.target.value)}
              placeholder="Take notes here..."
              rows={5}
              style={styles.textarea}
            />
          </div>
        )}

        {(isWorkshopPast || workshop.type === "recorded") && isRegistered && (
          <form onSubmit={handleLocalRatingSubmit} style={styles.ratingSection}>
            <h4 style={styles.sectionTitle}>Rate this Workshop</h4>
            <div style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onClick={() => setCurrentRating(star)}
                  style={{
                    ...styles.star,
                    color: star <= currentRating ? "#ffc107" : "#e0e0e0",
                  }}
                >
                  ★
                </span>
              ))}
              <span style={styles.ratingText}>
                {currentRating === 0
                  ? "Select a rating"
                  : currentRating === 1
                    ? "Poor"
                    : currentRating === 2
                      ? "Fair"
                      : currentRating === 3
                        ? "Good"
                        : currentRating === 4
                          ? "Very Good"
                          : "Excellent"}
              </span>
            </div>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Add your feedback (optional)"
              rows={3}
              style={styles.textarea}
            />
            <button type="submit" style={styles.buttonPrimary}>
              Submit Rating
            </button>
          </form>
        )}

        {showCertificateButton && (
          <div style={styles.certificateSection}>
            <p style={styles.certificateText}>Congratulations! You've successfully completed this workshop.</p>
            <button onClick={() => onViewCertificate(workshop.id)} style={styles.buttonSuccess}>
              <span style={{ marginRight: "8px" }}>🏆</span>
              View Certificate of Attendance
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const CertificateModal = ({ workshopName, studentName, completionDate, onClose }) => (
  <div style={styles.modalOverlay}>
    <div style={styles.certificateContainer}>
      <h2 style={styles.certificateTitle}>Certificate of Attendance</h2>
      <div style={styles.certificateContent}>
        <div style={styles.certificateIcon}>🏆</div>
        <p style={styles.certificatePresentation}>This certificate is proudly presented to</p>
        <p style={styles.certificateName}>{studentName}</p>
        <p style={styles.certificatePresentation}>for successfully attending the workshop</p>
        <p style={styles.certificateWorkshop}>{workshopName}</p>
        <div style={styles.certificateDateContainer}>
          <p style={styles.certificateDate}>Completed on: {completionDate}</p>
        </div>
        <div style={styles.certificateSignature}>
          <p style={styles.certificateSignatureText}>GUC SCAD System</p>
        </div>
      </div>
      <button onClick={onClose} style={styles.buttonPrimary}>
        Close
      </button>
    </div>
  </div>
)

const styles = {
  container: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: theme.background.default,
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  mainContent: {
    transition: "margin-left 0.3s ease, width 0.3s ease",
    maxWidth: "100%",
  },
  header: {
    backgroundColor: theme.background.paper,
    padding: "15px 25px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: `1px solid ${theme.border}`,
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
  },
  hamburgerIcon: {
    display: "flex",
    flexDirection: "column",
    cursor: "pointer",
    padding: "10px",
    borderRadius: "8px",
    transition: "background-color 0.2s",
    marginRight: "15px",
  },
  hamburgerLine: {
    width: "25px",
    height: "3px",
    backgroundColor: theme.primary.main,
    margin: "2px 0",
    transition: "transform 0.2s, opacity 0.2s",
  },
  headerTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "bold",
    color: theme.primary.main,
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    backgroundColor: theme.primary.veryLight,
    padding: "8px 15px",
    borderRadius: "20px",
  },
  userAvatar: {
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    backgroundColor: theme.primary.main,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: theme.text.light,
    fontWeight: "bold",
  },
  userDetails: {
    display: "flex",
    flexDirection: "column",
  },
  userName: {
    fontSize: "14px",
    fontWeight: "bold",
    color: theme.primary.main,
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  proBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffd700", // Gold color
    color: "#4a4a6a",
    fontSize: "10px",
    fontWeight: "bold",
    padding: "2px 6px",
    borderRadius: "10px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  userEmail: {
    fontSize: "12px",
    color: theme.text.secondary,
  },
  logoutButton: {
    backgroundColor: "#f8f9fa",
    color: theme.text.primary,
    border: `1px solid ${theme.border}`,
    padding: "8px 15px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s",
  },
  navigation: {
    backgroundColor: theme.background.paper,
    padding: "10px 25px",
    borderBottom: `1px solid ${theme.border}`,
  },
  breadcrumbs: {
    display: "flex",
    alignItems: "center",
    fontSize: "14px",
  },
  breadcrumbLink: {
    color: theme.primary.main,
    cursor: "pointer",
    textDecoration: "none",
  },
  breadcrumbSeparator: {
    margin: "0 10px",
    color: theme.text.secondary,
  },
  breadcrumbCurrent: {
    color: theme.text.primary,
    fontWeight: "500",
  },
  pageContainer: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "30px 20px",
    width: "100%",
  },
  pageTitle: {
    fontSize: "28px",
    fontWeight: "700",
    color: theme.primary.main,
    marginBottom: "30px",
    textAlign: "center",
  },
  tabContainer: {
    display: "flex",
    borderBottom: `2px solid ${theme.border}`,
    marginBottom: "25px",
  },
  tabButton: {
    backgroundColor: "transparent",
    border: "none",
    padding: "12px 20px",
    fontSize: "15px",
    cursor: "pointer",
    color: theme.text.secondary,
    transition: "all 0.2s",
    fontWeight: "500",
  },
  activeTabButton: {
    color: theme.primary.main,
    borderBottom: `3px solid ${theme.primary.main}`,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: theme.primary.main,
    marginBottom: "20px",
  },
  workshopList: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
    gap: "25px",
    marginTop: "20px",
  },
  card: {
    backgroundColor: theme.background.paper,
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    transition: "transform 0.2s, box-shadow 0.2s",
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  cardHeader: {
    padding: "15px 20px",
    backgroundColor: theme.primary.veryLight,
    borderBottom: `1px solid ${theme.border}`,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardTitle: {
    margin: "0 0 5px 0",
    fontSize: "18px",
    fontWeight: "600",
    color: theme.primary.main,
    flex: 1,
  },
  cardType: {
    marginLeft: "10px",
  },
  badge: {
    display: "inline-block",
    padding: "4px 8px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "bold",
  },
  cardContent: {
    padding: "15px 20px",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  cardDate: {
    fontSize: "14px",
    color: theme.text.secondary,
    marginBottom: "8px",
  },
  cardInstructor: {
    fontSize: "14px",
    color: theme.text.secondary,
    marginBottom: "8px",
  },
  cardDuration: {
    fontSize: "14px",
    color: theme.text.secondary,
    marginBottom: "8px",
  },
  cardDescription: {
    fontSize: "14px",
    color: theme.text.primary,
    lineHeight: "1.4",
    marginBottom: "15px",
  },
  cardLabel: {
    fontWeight: "bold",
    color: theme.text.primary,
    marginRight: "5px",
  },
  cardActions: {
    padding: "15px 20px",
    borderTop: `1px solid ${theme.border}`,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  buttonPrimary: {
    backgroundColor: theme.primary.main,
    color: theme.text.light,
    border: "none",
    padding: "10px 20px",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s",
  },
  buttonSecondary: {
    backgroundColor: theme.primary.light,
    color: theme.text.light,
    border: "none",
    padding: "10px 20px",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s",
  },
  buttonDanger: {
    backgroundColor: theme.error,
    color: theme.text.light,
    border: "none",
    padding: "10px 20px",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s",
  },
  buttonSuccess: {
    backgroundColor: theme.success,
    color: theme.text.light,
    border: "none",
    padding: "10px 20px",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s",
  },
  registeredBadge: {
    backgroundColor: theme.success,
    color: theme.text.light,
    padding: "10px 15px",
    borderRadius: "5px",
    fontSize: "14px",
    fontWeight: "500",
  },
  detailsContainer: {
    backgroundColor: theme.background.paper,
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    padding: "25px",
  },
  backButton: {
    backgroundColor: "transparent",
    border: "none",
    color: theme.primary.main,
    cursor: "pointer",
    fontSize: "16px",
    marginBottom: "20px",
    display: "block",
    transition: "color 0.2s",
  },
  detailsTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: theme.primary.main,
    marginBottom: "25px",
    textAlign: "center",
  },
  detailsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px",
    marginBottom: "25px",
  },
  detailsItem: {
    fontSize: "15px",
    color: theme.text.primary,
  },
  detailsLabel: {
    fontWeight: "bold",
    color: theme.primary.main,
    marginRight: "5px",
  },
  detailsValue: {
    color: theme.text.secondary,
  },
  detailsDescription: {
    marginBottom: "25px",
  },
  descriptionText: {
    fontSize: "15px",
    color: theme.text.primary,
    lineHeight: "1.5",
  },
  workshopActions: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  videoSection: {
    marginBottom: "25px",
  },
  video: {
    borderRadius: "5px",
  },
  videoControls: {
    display: "flex",
    gap: "10px",
    marginTop: "10px",
  },
  controlButton: {
    backgroundColor: theme.primary.light,
    color: theme.text.light,
    border: "none",
    padding: "8px 15px",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s",
  },
  notesSection: {
    marginBottom: "25px",
  },
  textarea: {
    width: "100%",
    padding: "10px",
    fontSize: "15px",
    borderRadius: "5px",
    border: `1px solid ${theme.border}`,
    color: theme.text.primary,
    backgroundColor: theme.background.paper,
    resize: "vertical",
    minHeight: "100px",
  },
  ratingSection: {
    marginBottom: "25px",
  },
  starsContainer: {
    display: "flex",
    alignItems: "center",
    marginBottom: "15px",
  },
  star: {
    fontSize: "24px",
    cursor: "pointer",
    transition: "color 0.2s",
  },
  ratingText: {
    fontSize: "16px",
    color: theme.text.secondary,
    marginLeft: "10px",
  },
  certificateSection: {
    textAlign: "center",
  },
  certificateText: {
    fontSize: "16px",
    color: theme.text.primary,
    marginBottom: "15px",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  certificateContainer: {
    backgroundColor: theme.background.paper,
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
    padding: "30px",
    maxWidth: "600px",
    width: "100%",
    textAlign: "center",
  },
  certificateTitle: {
    fontSize: "28px",
    fontWeight: "700",
    color: theme.primary.main,
    marginBottom: "20px",
  },
  certificateContent: {
    marginBottom: "30px",
  },
  certificateIcon: {
    fontSize: "48px",
    color: theme.primary.main,
    marginBottom: "15px",
  },
  certificatePresentation: {
    fontSize: "18px",
    color: theme.text.secondary,
    marginBottom: "8px",
  },
  certificateName: {
    fontSize: "24px",
    fontWeight: "600",
    color: theme.primary.main,
    marginBottom: "15px",
  },
  certificateWorkshop: {
    fontSize: "20px",
    fontWeight: "500",
    color: theme.text.primary,
    marginBottom: "20px",
  },
  certificateDateContainer: {
    borderTop: `2px solid ${theme.border}`,
    paddingTop: "20px",
  },
  certificateDate: {
    fontSize: "16px",
    color: theme.text.secondary,
  },
  certificateSignature: {
    marginTop: "30px",
  },
  certificateSignatureText: {
    fontSize: "16px",
    fontWeight: "bold",
    color: theme.primary.main,
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "200px",
  },
  spinner: {
    border: "5px solid #f3f3f3",
    borderTop: `5px solid ${theme.primary.main}`,
    borderRadius: "50%",
    width: "50px",
    height: "50px",
    animation: "spin 2s linear infinite",
    marginBottom: "15px",
  },
  loadingText: {
    fontSize: "16px",
    color: theme.text.secondary,
  },
  errorContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "200px",
    textAlign: "center",
  },
  errorText: {
    fontSize: "16px",
    color: theme.error,
    marginBottom: "20px",
  },
  emptyState: {
    textAlign: "center",
    padding: "30px",
    backgroundColor: theme.background.paper,
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  },
  emptyStateText: {
    fontSize: "16px",
    color: theme.text.secondary,
    marginBottom: "20px",
  },
  statusSuccess: {
    backgroundColor: theme.success,
    color: theme.text.light,
    padding: "10px 15px",
    borderRadius: "5px",
    fontSize: "14px",
    fontWeight: "500",
    textAlign: "center",
  },
  statusError: {
    backgroundColor: theme.error,
    color: theme.text.light,
    padding: "10px 15px",
    borderRadius: "5px",
    fontSize: "14px",
    fontWeight: "500",
    textAlign: "center",
  },
  statusInfo: {
    backgroundColor: theme.info,
    color: theme.text.light,
    padding: "10px 15px",
    borderRadius: "5px",
    fontSize: "14px",
    fontWeight: "500",
    textAlign: "center",
  },
  statusDate: {
    fontSize: "12px",
    opacity: 0.8,
    marginTop: "5px",
  },
  statusSecondary: {
    backgroundColor: theme.background.paper,
    color: theme.text.secondary,
    padding: "10px 15px",
    borderRadius: "5px",
    fontSize: "14px",
    fontWeight: "500",
    textAlign: "center",
    border: `1px solid ${theme.border}`,
  },
  authContainer: {
    maxWidth: "500px",
    margin: "50px auto",
    padding: "30px",
    backgroundColor: theme.background.paper,
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  authHeader: {
    fontSize: "24px",
    fontWeight: "700",
    color: theme.primary.main,
    marginBottom: "20px",
  },
  authText: {
    fontSize: "16px",
    color: theme.text.secondary,
    marginBottom: "30px",
  },
  notification: {
    position: "fixed",
    bottom: "20px",
    left: "20px",
    padding: "15px 25px",
    borderRadius: "8px",
    color: theme.text.light,
    fontSize: "16px",
    fontWeight: "500",
    zIndex: 1001,
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
  },
  liveSessionLayout: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: "20px",
  },
  liveVideoContainer: {
    backgroundColor: "#222",
    borderRadius: "8px",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "300px",
  },
  liveVideoPlaceholder: {
    color: "#fff",
    textAlign: "center",
    padding: "20px",
  },
  chatContainer: {
    backgroundColor: theme.background.paper,
    borderRadius: "8px",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  chatHeader: {
    backgroundColor: theme.primary.veryLight,
    color: theme.primary.main,
    padding: "12px 15px",
    fontWeight: "600",
    borderBottom: `1px solid ${theme.border}`,
  },
  chatMessages: {
    flex: 1,
    padding: "15px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  chatMessageSent: {
    backgroundColor: theme.primary.transparent,
    color: theme.text.primary,
    padding: "8px 12px",
    borderRadius: "20px",
    alignSelf: "flex-end",
    maxWidth: "80%",
  },
  chatMessageReceived: {
    backgroundColor: theme.background.default,
    color: theme.text.primary,
    padding: "8px 12px",
    borderRadius: "20px",
    alignSelf: "flex-start",
    maxWidth: "80%",
  },
  chatSender: {
    fontSize: "12px",
    color: theme.primary.main,
    fontWeight: "600",
    marginBottom: "3px",
  },
  chatText: {
    fontSize: "14px",
    lineHeight: "1.4",
  },
  chatTime: {
    fontSize: "11px",
    color: theme.text.secondary,
    alignSelf: "flex-end",
  },
  chatEmpty: {
    fontSize: "14px",
    color: theme.text.secondary,
    textAlign: "center",
    padding: "15px",
  },
  chatForm: {
    display: "flex",
    padding: "10px",
    borderTop: `1px solid ${theme.border}`,
  },
  chatInput: {
    flex: 1,
    padding: "10px",
    fontSize: "15px",
    borderRadius: "5px",
    border: `1px solid ${theme.border}`,
    color: theme.text.primary,
    backgroundColor: theme.background.paper,
    marginRight: "10px",
  },
}

export default StudentWorkshops
