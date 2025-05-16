"use client"

import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import SidebarStudent from "./sidebarpro" // Import the sidebar component

const WhoViewedMyProfile = ({ user }) => {
  const [profileViews, setProfileViews] = useState([])
  const [filteredViews, setFilteredViews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedIndustry, setSelectedIndustry] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [industryOptions, setIndustryOptions] = useState([])
  const [menuOpen, setMenuOpen] = useState(false) // State for sidebar toggle
  const location = useLocation()
  const navigate = useNavigate()
  const studentProfile = location.state?.student || location.state?.studentj

  // Toggle sidebar function
  const toggleMenu = () => {
    setMenuOpen(!menuOpen)
  }

  // Define color palette for consistent styling
  const colors = {
    primary: {
      light: "#f3f0ff",
      medium: "#d5c5f7",
      main: "#6b46c1",
      dark: "#553c9a",
      darker: "#4a2c73",
    },
    gray: {
      lightest: "#f8f9fa",
      light: "#e9ecef",
      medium: "#dee2e6",
      dark: "#adb5bd",
      text: "#4a4a6a",
    },
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
  }

  useEffect(() => {
    const fetchProfileViews = async () => {
      try {
        setLoading(true)

        // Get stored profile views from localStorage
        const storedViews = JSON.parse(localStorage.getItem("storedviewprofile") || "[]")

        // Filter views to only show those for the current student
        const myProfileViews = storedViews.filter((view) => view.studentProfile === studentProfile?.email)

        // Extract unique industries for filter options
        const industries = [...new Set(myProfileViews.map((view) => view.companyIndustry).filter(Boolean))]
        setIndustryOptions(industries)

        // Sort by most recent first
        myProfileViews.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

        setProfileViews(myProfileViews)
        setFilteredViews(myProfileViews)
      } catch (err) {
        setError("Failed to load profile views")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfileViews()
  }, [studentProfile])

  // Filter views based on search query and selected industry
  useEffect(() => {
    let filtered = [...profileViews]

    // Apply search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (view) =>
          view.companyName?.toLowerCase().includes(query) ||
          view.companyEmail?.toLowerCase().includes(query) ||
          view.companyIndustry?.toLowerCase().includes(query),
      )
    }

    // Apply industry filter
    if (selectedIndustry) {
      filtered = filtered.filter((view) => view.companyIndustry === selectedIndustry)
    }

    // Apply tab filter
    if (activeTab === "recent") {
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      filtered = filtered.filter((view) => new Date(view.timestamp) >= oneWeekAgo)
    }

    setFilteredViews(filtered)
  }, [searchQuery, selectedIndustry, activeTab, profileViews])

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date"

    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }

    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const handleBack = () => {
    navigate(-1) // Navigate back to previous page
  }

  // Styles
  const styles = {
    container: {
      display: "flex",
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      color: colors.gray.text,
    },
    mainContent: {
      flex: 1,
      transition: "margin-left 0.3s ease, width 0.3s ease",
      marginLeft: menuOpen ? "250px" : "0",
      width: menuOpen ? "calc(100% - 250px)" : "100%",
    },
    header: {
      backgroundColor: colors.gray.lightest,
      padding: "15px 20px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottom: `1px solid ${colors.gray.light}`,
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
      backgroundColor: menuOpen ? "rgba(181, 199, 248, 0.2)" : "transparent",
    },
    hamburgerLine: {
      width: "25px",
      height: "3px",
      backgroundColor: "#4a4a6a",
      margin: "2px 0",
      transition: "transform 0.2s, opacity 0.2s",
    },
    headerTitle: {
      margin: 0,
      fontSize: "20px",
      fontWeight: "bold",
      color: "#4a4a6a",
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
      backgroundColor: colors.primary.light,
      padding: "8px 15px",
      borderRadius: "20px",
    },
    userAvatar: {
      width: "30px",
      height: "30px",
      borderRadius: "50%",
      backgroundColor: colors.primary.medium,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: colors.gray.text,
      fontWeight: "bold",
    },
    userDetails: {
      display: "flex",
      flexDirection: "column",
    },
    userName: {
      fontSize: "14px",
      fontWeight: "bold",
      color: colors.primary.main,
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    proBadge: {
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
    },
    userEmail: {
      fontSize: "12px",
      color: colors.gray.text,
    },
    logoutButton: {
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
    },
    contentWrapper: {
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "40px 20px",
    },
    backButton: {
      display: "flex",
      alignItems: "center",
      backgroundColor: colors.primary.light,
      color: colors.primary.main,
      border: "none",
      borderRadius: "8px",
      padding: "10px 16px",
      fontSize: "14px",
      fontWeight: "500",
      cursor: "pointer",
      marginBottom: "20px",
      transition: "background-color 0.2s",
    },
    pageHeader: {
      textAlign: "center",
      marginBottom: "40px",
      position: "relative",
    },
    title: {
      fontSize: "32px",
      fontWeight: "700",
      color: colors.primary.main,
      marginBottom: "10px",
    },
    subtitle: {
      fontSize: "16px",
      color: colors.gray.text,
      maxWidth: "600px",
      margin: "0 auto",
    },
    totalViewsCounter: {
      backgroundColor: colors.primary.light,
      color: colors.primary.dark,
      borderRadius: "30px",
      padding: "8px 16px",
      fontSize: "16px",
      fontWeight: "600",
      display: "inline-block",
      margin: "15px auto 0",
    },
    searchContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      marginBottom: "30px",
      gap: "15px",
    },
    searchInput: {
      width: "100%",
      maxWidth: "500px",
      padding: "12px 20px",
      fontSize: "16px",
      border: `1px solid ${colors.gray.medium}`,
      borderRadius: "30px",
      outline: "none",
      transition: "border-color 0.2s",
    },
    filterContainer: {
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: "10px",
      marginBottom: "20px",
    },
    filterButton: {
      padding: "8px 16px",
      backgroundColor: "transparent",
      border: `1px solid ${colors.gray.medium}`,
      borderRadius: "20px",
      fontSize: "14px",
      cursor: "pointer",
      transition: "all 0.2s",
    },
    filterButtonActive: {
      backgroundColor: colors.primary.light,
      borderColor: colors.primary.medium,
      color: colors.primary.main,
    },
    tabsContainer: {
      display: "flex",
      justifyContent: "center",
      borderBottom: `2px solid ${colors.gray.light}`,
      marginBottom: "30px",
    },
    tab: {
      padding: "12px 24px",
      backgroundColor: "transparent",
      border: "none",
      borderBottom: "3px solid transparent",
      fontSize: "16px",
      fontWeight: "500",
      color: colors.gray.text,
      cursor: "pointer",
      transition: "all 0.2s",
      marginBottom: "-2px",
    },
    tabActive: {
      borderBottomColor: colors.primary.main,
      color: colors.primary.main,
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
      gap: "20px",
      marginBottom: "40px",
    },
    card: {
      backgroundColor: "white",
      borderRadius: "8px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      border: "1px solid #e2e8f0",
      overflow: "hidden",
      transition: "transform 0.3s, box-shadow 0.3s",
    },
    cardHeader: {
      padding: "20px",
      borderBottom: `1px solid ${colors.gray.light}`,
      backgroundColor: colors.primary.light,
    },
    companyInfo: {
      display: "flex",
      alignItems: "center",
      gap: "15px",
    },
    avatar: {
      width: "50px",
      height: "50px",
      borderRadius: "50%",
      backgroundColor: "white",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "20px",
      fontWeight: "bold",
      color: colors.primary.dark,
      border: `2px solid ${colors.primary.medium}`,
    },
    companyName: {
      fontSize: "18px",
      fontWeight: "600",
      color: colors.primary.dark,
      marginBottom: "5px",
    },
    companyEmail: {
      fontSize: "14px",
      color: colors.gray.text,
    },
    badge: {
      display: "inline-block",
      padding: "4px 12px",
      backgroundColor: colors.primary.light,
      color: colors.primary.dark,
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "500",
      marginTop: "10px",
    },
    cardBody: {
      padding: "20px",
    },
    infoItem: {
      display: "flex",
      alignItems: "center",
      marginBottom: "10px",
      fontSize: "14px",
      color: colors.gray.text,
    },
    infoIcon: {
      marginRight: "10px",
      color: colors.primary.main,
      fontSize: "16px",
    },
    emptyState: {
      textAlign: "center",
      padding: "60px 20px",
      backgroundColor: "white",
      borderRadius: "10px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    },
    emptyIcon: {
      fontSize: "48px",
      marginBottom: "20px",
      color: colors.gray.medium,
    },
    emptyTitle: {
      fontSize: "20px",
      fontWeight: "600",
      color: colors.gray.text,
      marginBottom: "10px",
    },
    emptyText: {
      fontSize: "16px",
      color: colors.gray.text,
      maxWidth: "400px",
      margin: "0 auto",
    },
    proUpgradeCard: {
      backgroundColor: "white",
      borderRadius: "10px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      padding: "40px 20px",
      textAlign: "center",
      maxWidth: "600px",
      margin: "0 auto",
    },
    proTitle: {
      fontSize: "24px",
      fontWeight: "700",
      color: colors.primary.dark,
      marginBottom: "15px",
    },
    proDescription: {
      fontSize: "16px",
      color: colors.gray.text,
      marginBottom: "30px",
      maxWidth: "400px",
      margin: "0 auto 30px",
    },
    featureList: {
      display: "flex",
      flexDirection: "column",
      gap: "15px",
      marginBottom: "30px",
      maxWidth: "300px",
      margin: "0 auto 30px",
    },
    feature: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      fontSize: "16px",
      color: colors.gray.text,
    },
    featureIcon: {
      color: colors.primary.main,
      fontSize: "20px",
    },
    proButton: {
      backgroundColor: colors.primary.main,
      color: "white",
      border: "none",
      borderRadius: "30px",
      padding: "12px 30px",
      fontSize: "16px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "background-color 0.2s",
    },
    loadingContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "60px 20px",
    },
    spinner: {
      width: "40px",
      height: "40px",
      borderRadius: "50%",
      border: `3px solid ${colors.gray.light}`,
      borderTopColor: colors.primary.main,
      animation: "spin 1s linear infinite",
      marginBottom: "20px",
    },
    loadingText: {
      fontSize: "16px",
      color: colors.gray.text,
    },
    errorContainer: {
      backgroundColor: "#fee2e2",
      color: colors.error,
      padding: "20px",
      borderRadius: "10px",
      marginBottom: "20px",
      textAlign: "center",
    },
    navigation: {
      backgroundColor: colors.gray.lightest,
      padding: "10px 25px",
      borderBottom: `1px solid ${colors.gray.light}`,
    },
    breadcrumbs: {
      display: "flex",
      alignItems: "center",
      fontSize: "14px",
    },
    breadcrumbLink: {
      color: colors.primary.main,
      cursor: "pointer",
      textDecoration: "none",
    },
    breadcrumbSeparator: {
      margin: "0 10px",
      color: colors.gray.text,
    },
    breadcrumbCurrent: {
      color: colors.gray.text,
      fontWeight: "500",
    },
  }

  // Render loading state with sidebar
  if (loading) {
    return (
      <div style={styles.container}>
        {/* Sidebar Component */}
        <SidebarStudent menuOpen={menuOpen} toggleMenu={toggleMenu} />

        <div style={styles.mainContent}>
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.headerLeft}>
              {/* Hamburger Icon */}
              <div
                style={{
                  ...styles.hamburgerIcon,
                  backgroundColor: menuOpen ? colors.primary.light : "transparent",
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
              <span style={styles.breadcrumbCurrent}>Profile Visitors</span>
            </div>
          </div>

          <div style={styles.contentWrapper}>
            <div style={styles.loadingContainer}>
              <div style={styles.spinner}></div>
              <p style={styles.loadingText}>Loading profile views...</p>
            </div>
            <style>
              {`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}
            </style>
          </div>
        </div>
      </div>
    )
  }

  // Render error state with sidebar
  if (error) {
    return (
      <div style={styles.container}>
        {/* Sidebar Component */}
        <SidebarStudent menuOpen={menuOpen} toggleMenu={toggleMenu} />

        <div style={styles.mainContent}>
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.headerLeft}>
              {/* Hamburger Icon */}
              <div
                style={{
                  ...styles.hamburgerIcon,
                  backgroundColor: menuOpen ? colors.primary.light : "transparent",
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
              <span style={styles.breadcrumbCurrent}>Profile Visitors</span>
            </div>
          </div>

          <div style={styles.contentWrapper}>
            <div style={styles.errorContainer}>
              <p style={{ fontWeight: "500" }}>{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {/* Sidebar Component */}
      <SidebarStudent menuOpen={menuOpen} toggleMenu={toggleMenu} />

      <div style={styles.mainContent}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            {/* Hamburger Icon */}
            <div
              style={{
                ...styles.hamburgerIcon,
                backgroundColor: menuOpen ? colors.primary.light : "transparent",
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
            <span style={styles.breadcrumbCurrent}>Profile Visitors</span>
          </div>
        </div>

        <div style={styles.contentWrapper}>
          <div style={styles.pageHeader}>
            <h1 style={styles.title}>Profile Visitors</h1>
            <p style={styles.subtitle}>Companies that have viewed your professional profile</p>
            <div style={styles.totalViewsCounter}>Total Views: {profileViews.length}</div>
          </div>

          <div style={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />

            {industryOptions.length > 0 && (
              <div style={styles.filterContainer}>
                <button
                  onClick={() => setSelectedIndustry("")}
                  style={{
                    ...styles.filterButton,
                    ...(selectedIndustry === "" ? styles.filterButtonActive : {}),
                  }}
                >
                  All Industries
                </button>

                {industryOptions.map((industry, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedIndustry(industry)}
                    style={{
                      ...styles.filterButton,
                      ...(selectedIndustry === industry ? styles.filterButtonActive : {}),
                    }}
                  >
                    {industry}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={styles.tabsContainer}>
            <button
              onClick={() => setActiveTab("all")}
              style={{
                ...styles.tab,
                ...(activeTab === "all" ? styles.tabActive : {}),
              }}
            >
              All Visitors
            </button>
            <button
              onClick={() => setActiveTab("recent")}
              style={{
                ...styles.tab,
                ...(activeTab === "recent" ? styles.tabActive : {}),
              }}
            >
              Recent (7 days)
            </button>
          </div>

          {filteredViews.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>👁️</div>
              <h3 style={styles.emptyTitle}>No profile views found</h3>
              <p style={styles.emptyText}>
                {activeTab === "all"
                  ? "No companies have viewed your profile yet. Keep your profile updated to attract more views!"
                  : "No companies have viewed your profile in the last 7 days."}
              </p>
            </div>
          ) : (
            <div style={styles.grid}>
              {filteredViews.map((view, index) => (
                <div
                  key={index}
                  style={styles.card}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "translateY(-5px)"
                    e.currentTarget.style.boxShadow = "0 10px 20px rgba(0, 0, 0, 0.1)"
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "translateY(0)"
                    e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)"
                  }}
                >
                  <div style={styles.cardHeader}>
                    <div style={styles.companyInfo}>
                      <div style={styles.avatar}>{view.companyName?.charAt(0) || "C"}</div>
                      <div>
                        <h3 style={styles.companyName}>{view.companyName || "Unknown Company"}</h3>
                        <p style={styles.companyEmail}>{view.companyEmail}</p>
                        {view.companyIndustry && <span style={styles.badge}>{view.companyIndustry}</span>}
                      </div>
                    </div>
                  </div>
                  <div style={styles.cardBody}>
                    {view.companysize && (
                      <div style={styles.infoItem}>
                        <span style={styles.infoIcon}>👥</span>
                        <span>Company Size: {view.companysize}</span>
                      </div>
                    )}
                    {view.companyIndustry && (
                      <div style={styles.infoItem}>
                        <span style={styles.infoIcon}>🏢</span>
                        <span>Industry: {view.companyIndustry}</span>
                      </div>
                    )}
                    <div style={styles.infoItem}>
                      <span style={styles.infoIcon}>📅</span>
                      <span>Viewed on {formatDate(view.timestamp)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  )
}

export default WhoViewedMyProfile
