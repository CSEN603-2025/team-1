"use client"

import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"

const WhoViewedMyProfile = ({ user }) => {
  const [profileViews, setProfileViews] = useState([])
  const [filteredViews, setFilteredViews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedIndustry, setSelectedIndustry] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [industryOptions, setIndustryOptions] = useState([])
  const location = useLocation()
  const navigate = useNavigate()
  const studentProfile = location.state?.student || location.state?.studentj

  // Define color palette for consistent styling
  const colors = {
    primary: {
      light: "#f3f0ff",
      medium: "#d8bfff",
      main: "#9b7ebd",
      dark: "#6b46c1",
      darker: "#553c9a",
    },
    gray: {
      lightest: "#f8f9fa",
      light: "#e9ecef",
      medium: "#dee2e6",
      dark: "#adb5bd",
      text: "#495057",
    },
    success: "#38a169",
    warning: "#dd6b20",
    error: "#e53e3e",
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
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "40px 20px",
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      color: colors.gray.text,
    },
    backButton: {
      display: "flex",
      alignItems: "center",
      backgroundColor: colors.primary.light,
      color: colors.primary.dark,
      border: "none",
      borderRadius: "8px",
      padding: "10px 16px",
      fontSize: "14px",
      fontWeight: "500",
      cursor: "pointer",
      marginBottom: "20px",
      transition: "background-color 0.2s",
    },
    header: {
      textAlign: "center",
      marginBottom: "40px",
      position: "relative",
    },
    title: {
      fontSize: "32px",
      fontWeight: "700",
      color: colors.primary.dark,
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
      color: colors.primary.dark,
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
      color: colors.primary.dark,
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
      gap: "20px",
      marginBottom: "40px",
    },
    card: {
      backgroundColor: "white",
      borderRadius: "10px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
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
  }

  // Render loading state
  if (loading) {
    return (
      <div style={styles.container}>
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
    )
  }

  // Render error state
  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <p style={{ fontWeight: "500" }}>{error}</p>
        </div>
      </div>
    )
  }

  // Render pro upgrade message if not a pro user
  // if (studentProfile?.role !== "pro") {
  //   return (
  //     <div style={styles.container}>
  //       <button style={styles.backButton} onClick={handleBack}>
  //         ← Back
  //       </button>
  //       <div style={styles.proUpgradeCard}>
  //         <h2 style={styles.proTitle}>Pro Feature</h2>
  //         <p style={styles.proDescription}>
  //           You need to be a pro user to see who viewed your profile. Upgrade your account to access this feature.
  //         </p>

  //         <div style={styles.featureList}>
  //           <div style={styles.feature}>
  //             <span style={styles.featureIcon}>👁️</span>
  //             <span>See who's interested in your profile</span>
  //           </div>
  //           <div style={styles.feature}>
  //             <span style={styles.featureIcon}>🏢</span>
  //             <span>Get company insights</span>
  //           </div>
  //           <div style={styles.feature}>
  //             <span style={styles.featureIcon}>📊</span>
  //             <span>Track view history</span>
  //           </div>
  //         </div>

  //         <button
  //           style={styles.proButton}
  //           onMouseOver={(e) => (e.target.style.backgroundColor = colors.primary.dark)}
  //           onMouseOut={(e) => (e.target.style.backgroundColor = colors.primary.main)}
  //         >
  //           Upgrade to Pro
  //         </button>
  //       </div>
  //     </div>
  //   )
  // }
  

  return (
    <div style={styles.container}>
      <button
        style={styles.backButton}
        onClick={handleBack}
        onMouseOver={(e) => (e.target.style.backgroundColor = colors.primary.medium)}
        onMouseOut={(e) => (e.target.style.backgroundColor = colors.primary.light)}
      >
        ← Back
      </button>

      <div style={styles.header}>
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
  )
}

export default WhoViewedMyProfile
