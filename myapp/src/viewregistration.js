"use client"

import { useState, useEffect, useMemo } from "react"
import Sidebar from "./sidebarscad"
import { X, Building, Users, Mail, Phone, Globe, MapPin, FileText, Calendar, Briefcase } from "lucide-react"
import { setNotification as systemSetNotification } from './notification.js';

function ViewRegistration() {
  const [companyDetails, setCompanyDetails] = useState(null)
  const [companies, setCompanies] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedIndustry, setSelectedIndustry] = useState("")
  const [industryOptions, setIndustryOptions] = useState([])
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmLogout, setConfirmLogout] = useState(false)
  const [loading, setLoading] = useState(false)

  // Set static industry options when component mounts
  useEffect(() => {
    setIndustryOptions([
      "Technology",
      "Finance",
      "Healthcare",
      "Education",
      "Manufacturing",
      "Retail",
      "Hospitality",
      "Construction",
      "Transportation",
      "Energy",
      "Media",
      "Telecommunications",
    ])
  }, [])

  const toggleMenu = () => setMenuOpen((prev) => !prev)

  const loadPendingCompanies = () => {
    try {
      const all = JSON.parse(localStorage.getItem("companies")) || []
      const pending = all.filter((company) => !company.isAccepted)
      console.log("Loaded companies:", pending)
      setCompanies(pending)
    } catch (error) {
      console.error("Error loading companies from localStorage:", error)
    }
  }

  useEffect(() => {
    console.log("Component mounted")
    loadPendingCompanies()

    const onStorage = (e) => {
      if (e.key === "companies" || e.key === "companiesUpdated") {
        console.log("Storage event detected")
        loadPendingCompanies()
      }
    }

    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  const handleAccept = () => {
    console.log("Accepting company:", companyDetails)
    if (!companyDetails) return
    const all = JSON.parse(localStorage.getItem("companies")) || []
    const updated = all.map((c) =>
      c.companyEmail === companyDetails.companyEmail ? { ...c, isAccepted: true, hasNotification: true } : c,
    )
    localStorage.setItem("companies", JSON.stringify(updated))
    localStorage.setItem("companiesUpdated", Date.now())

    // Updated notification lo

    const acceptancemessage = `Your Registration for ${companyDetails.companyName} accepted.`;
    systemSetNotification(
        acceptancemessage, 
        companyDetails.companyEmail,
        true // Make it false so it persists until the company views it in their login notification popup.
              // The CompanyLogin's togglePopup will then handle clearing it.
    );

    setCompanies((prev) => prev.filter((c) => c.companyEmail !== companyDetails.companyEmail))
    setCompanyDetails(null)
  }

  const handleReject = () => {
    console.log("Rejecting company:", companyDetails)
    if (!companyDetails) return
    const all = JSON.parse(localStorage.getItem("companies")) || []
    const updated = all.filter((c) => c.companyEmail !== companyDetails.companyEmail )
    localStorage.setItem("companies", JSON.stringify(updated))
    localStorage.setItem("companiesUpdated", Date.now())

    const rejectionMessage = `Your registration for ${companyDetails.companyName} has been rejected.`;
    systemSetNotification(
        rejectionMessage, 
        companyDetails.companyEmail,
        false // Make it false so it persists until the company views it in their login notification popup.
              // The CompanyLogin's togglePopup will then handle clearing it.
    );

    setCompanies((prev) => prev.filter((c) => c.companyEmail !== companyDetails.companyEmail))
    setCompanyDetails(null)
  }

  const handleDownloadDocument = (doc) => {
    const link = document.createElement("a")
    link.href = doc.dataUrl
    link.download = doc.name
    link.click()
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

  const filtered = useMemo(
    () =>
      companies.filter(
        (c) =>
          c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) &&
          (selectedIndustry ? c.industry === selectedIndustry : true),
      ),
    [companies, searchQuery, selectedIndustry],
  )

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "Not specified"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
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
              Company Registration Management
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
                textAlign: "center",
              }}
            >
              Pending Company Registrations
            </h2>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "15px" }}>
              <input
                type="text"
                placeholder="Search by company name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: "12px 16px",
                  width: "100%",
                  maxWidth: "400px",
                  borderRadius: "6px",
                  border: "1px solid #e2e8f0",
                  fontSize: "14px",
                  color: "#4a4a6a",
                  boxSizing: "border-box",
                }}
              />

              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                <button
                  onClick={() => setSelectedIndustry("")}
                  style={{
                    backgroundColor: selectedIndustry === "" ? "#4a4a6a" : "#f7fafc",
                    color: selectedIndustry === "" ? "white" : "#4a4a6a",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    padding: "8px 16px",
                    cursor: "pointer",
                    fontSize: "14px",
                    transition: "all 0.2s",
                  }}
                >
                  All Industries
                </button>
                <select
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "6px",
                    border: "1px solid #e2e8f0",
                    fontSize: "14px",
                    color: "#4a4a6a",
                  }}
                >
                  <option value="">Select Industry</option>
                  {industryOptions.map((i, idx) => (
                    <option key={idx} value={i}>
                      {i}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Company List */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "8px",
              padding: "24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {filtered.length ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: "20px",
                  width: "100%",
                }}
              >
                {filtered.map((company) => (
                  <div
                    key={company.companyEmail}
                    onClick={() => setCompanyDetails(company)}
                    style={{
                      backgroundColor: "#f8f9fa",
                      borderRadius: "12px",
                      padding: "20px",
                      boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                      cursor: "pointer",
                      transition: "transform 0.2s, box-shadow 0.2s",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = "translateY(-5px)"
                      e.currentTarget.style.boxShadow = "0 5px 15px rgba(0,0,0,0.1)"
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = "translateY(0)"
                      e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.05)"
                    }}
                  >
                    {company.companyLogo && (
                      <img
                        src={company.companyLogo || "/placeholder.svg"}
                        alt={`${company.companyName} logo`}
                        style={{
                          width: "80px",
                          height: "80px",
                          borderRadius: "50%",
                          objectFit: "cover",
                          marginBottom: "15px",
                          border: "2px solid #e2e8f0",
                        }}
                      />
                    )}
                    <h3
                      style={{
                        margin: "0",
                        fontSize: "18px",
                        fontWeight: "600",
                        color: "#4a4a6a",
                        textAlign: "center",
                      }}
                    >
                      {company.companyName}
                    </h3>
                    <p style={{ margin: "5px 0 0 0", fontSize: "14px", color: "#6a6a8a", textAlign: "center" }}>
                      {company.industry}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  padding: "40px 20px",
                  textAlign: "center",
                  color: "#6a6a8a",
                  fontSize: "16px",
                }}
              >
                No pending company registrations found.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Company Details Sidebar */}
      {companyDetails && (
        <div
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            width: "400px",
            height: "100vh",
            backgroundColor: "#ffffff",
            boxShadow: "-2px 0 10px rgba(0,0,0,0.1)",
            overflowY: "auto",
            zIndex: 30,
          }}
        >
          {/* Header with sticky positioning */}
          <div
            style={{
              position: "sticky",
              top: 0,
              backgroundColor: "#ffffff",
              padding: "20px 24px",
              borderBottom: "1px solid #e2e8f0",
              zIndex: 2,
            }}
          >
            <button
              onClick={() => setCompanyDetails(null)}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "#6a6a8a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "5px",
                zIndex: 3,
              }}
            >
              <X size={24} />
            </button>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "10px 0 15px 0",
              }}
            >
              {companyDetails.companyLogo ? (
                <img
                  src={companyDetails.companyLogo || "/placeholder.svg"}
                  alt={`${companyDetails.companyName} logo`}
                  style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    marginBottom: "15px",
                    border: "3px solid #e2e8f0",
                    backgroundColor: "#ffffff",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "50%",
                    backgroundColor: "#f1f5f9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "15px",
                    border: "3px solid #e2e8f0",
                    color: "#6a6a8a",
                    fontSize: "16px",
                  }}
                >
                  <Building size={40} />
                </div>
              )}
              <h2
                style={{
                  margin: "0 0 5px 0",
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "#4a4a6a",
                  textAlign: "center",
                }}
              >
                {companyDetails.companyName}
              </h2>
              <div
                style={{
                  display: "inline-block",
                  padding: "4px 10px",
                  backgroundColor: "#f0f9ff",
                  color: "#3182ce",
                  borderRadius: "20px",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                {companyDetails.industry || "Industry not specified"}
              </div>
            </div>
          </div>

          {/* Content area */}
          <div style={{ padding: "20px 24px" }}>
            {/* Company Information Section */}
            <div
              style={{
                marginBottom: "24px",
              }}
            >
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#4a4a6a",
                  marginBottom: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Building size={18} />
                Company Information
              </h3>

              <div
                style={{
                  backgroundColor: "#f8f9fa",
                  borderRadius: "8px",
                  padding: "16px",
                }}
              >
                <div style={{ marginBottom: "16px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "6px",
                    }}
                  >
                    <Users size={16} color="#6a6a8a" />
                    <span style={{ fontSize: "14px", color: "#6a6a8a", fontWeight: "500" }}>Company Size</span>
                  </div>
                  <p
                    style={{
                      margin: "0 0 0 24px",
                      fontSize: "16px",
                      fontWeight: "500",
                      color: "#4a4a6a",
                    }}
                  >
                    {companyDetails.companySize || "Not specified"}
                  </p>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "6px",
                    }}
                  >
                    <Mail size={16} color="#6a6a8a" />
                    <span style={{ fontSize: "14px", color: "#6a6a8a", fontWeight: "500" }}>Email</span>
                  </div>
                  <p
                    style={{
                      margin: "0 0 0 24px",
                      fontSize: "16px",
                      fontWeight: "500",
                      color: "#4a4a6a",
                    }}
                  >
                    {companyDetails.companyEmail}
                  </p>
                </div>

                {companyDetails.phone && (
                  <div style={{ marginBottom: "16px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "6px",
                      }}
                    >
                      <Phone size={16} color="#6a6a8a" />
                      <span style={{ fontSize: "14px", color: "#6a6a8a", fontWeight: "500" }}>Phone</span>
                    </div>
                    <p
                      style={{
                        margin: "0 0 0 24px",
                        fontSize: "16px",
                        fontWeight: "500",
                        color: "#4a4a6a",
                      }}
                    >
                      {companyDetails.phone}
                    </p>
                  </div>
                )}

                {companyDetails.website && (
                  <div style={{ marginBottom: "16px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "6px",
                      }}
                    >
                      <Globe size={16} color="#6a6a8a" />
                      <span style={{ fontSize: "14px", color: "#6a6a8a", fontWeight: "500" }}>Website</span>
                    </div>
                    <p
                      style={{
                        margin: "0 0 0 24px",
                        fontSize: "16px",
                        fontWeight: "500",
                        color: "#4a4a6a",
                      }}
                    >
                      <a
                        href={companyDetails.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#3182ce", textDecoration: "none" }}
                      >
                        {companyDetails.website}
                      </a>
                    </p>
                  </div>
                )}

                {companyDetails.address && (
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "6px",
                      }}
                    >
                      <MapPin size={16} color="#6a6a8a" />
                      <span style={{ fontSize: "14px", color: "#6a6a8a", fontWeight: "500" }}>Address</span>
                    </div>
                    <p
                      style={{
                        margin: "0 0 0 24px",
                        fontSize: "16px",
                        fontWeight: "500",
                        color: "#4a4a6a",
                      }}
                    >
                      {companyDetails.address}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Registration Details Section */}
            <div style={{ marginBottom: "24px" }}>
              {/* <h3
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#4a4a6a",
                  marginBottom: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Calendar size={18} />
                Registration Details
              </h3> */}

              <div
                style={{
                  backgroundColor: "#f8f9fa",
                  borderRadius: "8px",
                  padding: "16px",
                }}
              >
                {companyDetails.registrationDate && (
                  <div style={{ marginBottom: "16px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "6px",
                      }}
                    >
                      <Calendar size={16} color="#6a6a8a" />
                      <span style={{ fontSize: "14px", color: "#6a6a8a", fontWeight: "500" }}>Registration Date</span>
                    </div>
                    <p
                      style={{
                        margin: "0 0 0 24px",
                        fontSize: "16px",
                        fontWeight: "500",
                        color: "#4a4a6a",
                      }}
                    >
                      {formatDate(companyDetails.registrationDate)}
                    </p>
                  </div>
                )}

                {companyDetails.contactPerson && (
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "6px",
                      }}
                    >
                      <Users size={16} color="#6a6a8a" />
                      <span style={{ fontSize: "14px", color: "#6a6a8a", fontWeight: "500" }}>Contact Person</span>
                    </div>
                    <p
                      style={{
                        margin: "0 0 0 24px",
                        fontSize: "16px",
                        fontWeight: "500",
                        color: "#4a4a6a",
                      }}
                    >
                      {companyDetails.contactPerson}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Information Section */}
            {companyDetails.description && (
              <div style={{ marginBottom: "24px" }}>
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#4a4a6a",
                    marginBottom: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Briefcase size={18} />
                  About Company
                </h3>

                <div
                  style={{
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px",
                    padding: "16px",
                  }}
                >
                  <p
                    style={{
                      margin: "0",
                      fontSize: "15px",
                      lineHeight: "1.6",
                      color: "#4a4a6a",
                    }}
                  >
                    {companyDetails.description}
                  </p>
                </div>
              </div>
            )}

            {/* Document Section */}
            {companyDetails.document && (
              <div style={{ marginBottom: "24px" }}>
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#4a4a6a",
                    marginBottom: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <FileText size={18} />
                  Documents
                </h3>

                <div
                  style={{
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px",
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "12px",
                      backgroundColor: "#ffffff",
                      borderRadius: "6px",
                      border: "1px solid #e2e8f0",
                      width: "100%",
                      marginBottom: "16px",
                    }}
                  >
                    <FileText size={24} color="#3182ce" />
                    <div style={{ flex: 1 }}>
                      <p
                        style={{
                          margin: "0 0 4px 0",
                          fontSize: "15px",
                          fontWeight: "500",
                          color: "#4a4a6a",
                        }}
                      >
                        {companyDetails.document.name || "Company Document"}
                      </p>
                      <p
                        style={{
                          margin: "0",
                          fontSize: "13px",
                          color: "#6a6a8a",
                        }}
                      >
                        Click the button below to download
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDownloadDocument(companyDetails.document)}
                    style={{
                      padding: "10px 16px",
                      backgroundColor: "#4a4a6a",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "500",
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      transition: "background-color 0.2s",
                      width: "100%",
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#3a3a5a")}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#4a4a6a")}
                  >
                    <FileText size={16} />
                    Download Document
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div
              style={{
                position: "sticky",
                bottom: 0,
                backgroundColor: "#ffffff",
                padding: "16px 0 20px 0",
                borderTop: "1px solid #e2e8f0",
                display: "flex",
                gap: "10px",
                zIndex: 2,
              }}
            >
              <button
                onClick={handleReject}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  backgroundColor: "rgba(255, 200, 200, 0.5)",
                  color: "#9a4a4a",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "500",
                  fontSize: "14px",
                  transition: "background-color 0.2s",
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 200, 200, 0.7)")}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 200, 200, 0.5)")}
              >
                Reject
              </button>
              <button
                onClick={handleAccept}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  backgroundColor: "rgba(200, 255, 200, 0.5)",
                  color: "#4a9a4a",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "500",
                  fontSize: "14px",
                  transition: "background-color 0.2s",
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "rgba(200, 255, 200, 0.7)")}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "rgba(200, 255, 200, 0.5)")}
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}

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

export default ViewRegistration
