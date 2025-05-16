"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Modal from "react-modal"
import { useEffect } from "react"

// Make sure to bind modal to your appElement
Modal.setAppElement("#root")

const AssessmentPage = () => {
  const [activeTab, setActiveTab] = useState("list")
  const [selectedAssessment, setSelectedAssessment] = useState(null)
  const [answers, setAnswers] = useState({})
  //const [completedAssessments, setCompletedAssessments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedResultDetails, setSelectedResultDetails] = useState(null)

  // Color palette
  const colors = {
    purple: {
      light: "#f3f0ff",
      medium: "#d8bfff",
      primary: "#9b7ebd",
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
  }

  // Custom styles for Modal
  const customModalStyles = {
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.75)",
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    content: {
      position: "relative",
      top: "auto",
      left: "auto",
      right: "auto",
      bottom: "auto",
      maxWidth: "800px",
      width: "90%",
      maxHeight: "90vh",
      padding: "30px",
      borderRadius: "12px",
      backgroundColor: "white",
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
      border: `1px solid ${colors.gray.medium}`,
      overflow: "auto",
    },
  }

  // Styles
  const styles = {
    container: {
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "40px 20px",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      color: colors.gray.text,
      backgroundColor: colors.gray.lightest,
      minHeight: "100vh",
    },
    header: {
      marginBottom: "30px",
      textAlign: "center",
    },
    title: {
      fontSize: "32px",
      fontWeight: "700",
      color: colors.black,
      marginBottom: "10px",
    },
    subtitle: {
      fontSize: "16px",
      color: colors.gray.text,
      marginBottom: "30px",
    },
    tabContainer: {
      display: "flex",
      borderBottom: `2px solid ${colors.gray.medium}`,
      marginBottom: "30px",
    },
    tab: {
      padding: "12px 24px",
      fontSize: "16px",
      fontWeight: "500",
      cursor: "pointer",
      backgroundColor: "transparent",
      border: "none",
      borderBottom: "3px solid transparent",
      marginBottom: "-2px",
      transition: "all 0.3s ease",
      color: colors.gray.text,
    },
    activeTab: {
      borderBottom: `3px solid ${colors.purple.primary}`,
      color: colors.purple.dark,
    },
    contentContainer: {
      backgroundColor: "white",
      borderRadius: "12px",
      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
      padding: "30px",
      marginBottom: "30px",
    },
    assessmentGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
      gap: "20px",
      marginTop: "20px",
    },
    assessmentCard: {
      backgroundColor: "white",
      borderRadius: "12px",
      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
      overflow: "hidden",
      transition: "transform 0.3s ease, box-shadow 0.3s ease",
      border: `1px solid ${colors.gray.light}`,
      cursor: "pointer",
    },
    assessmentCardHover: {
      transform: "translateY(-5px)",
      boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
    },
    cardHeader: {
      padding: "20px",
      borderBottom: `1px solid ${colors.gray.light}`,
      backgroundColor: colors.purple.light,
    },
    cardTitle: {
      fontSize: "18px",
      fontWeight: "600",
      color: colors.purple.dark,
      marginBottom: "5px",
    },
    cardDescription: {
      fontSize: "14px",
      color: colors.gray.text,
      marginBottom: "10px",
    },
    cardBody: {
      padding: "20px",
    },
    button: {
      backgroundColor: colors.purple.primary,
      color: "white",
      border: "none",
      borderRadius: "8px",
      padding: "12px 20px",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.2s ease",
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    },
    buttonHover: {
      backgroundColor: colors.purple.dark,
    },
    secondaryButton: {
      backgroundColor: "white",
      color: colors.purple.primary,
      border: `1px solid ${colors.purple.primary}`,
      borderRadius: "8px",
      padding: "10px 20px",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.2s ease",
      marginRight: "10px",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
    },
    secondaryButtonHover: {
      backgroundColor: colors.purple.light,
      color: colors.purple.dark,
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      marginTop: "20px",
    },
    tableHeader: {
      backgroundColor: colors.purple.light,
      color: colors.purple.dark,
      padding: "12px 15px",
      textAlign: "left",
      fontSize: "14px",
      fontWeight: "600",
      borderBottom: `2px solid ${colors.purple.medium}`,
    },
    tableCell: {
      padding: "12px 15px",
      borderBottom: `1px solid ${colors.gray.light}`,
      fontSize: "14px",
    },
    scoreCell: (score) => ({
      padding: "12px 15px",
      borderBottom: `1px solid ${colors.gray.light}`,
      fontSize: "14px",
      fontWeight: "600",
      color: score >= 70 ? "#38a169" : score >= 50 ? "#dd6b20" : "#e53e3e",
    }),
    modalHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "20px",
      paddingBottom: "15px",
      borderBottom: `1px solid ${colors.gray.light}`,
    },
    modalTitle: {
      fontSize: "24px",
      fontWeight: "600",
      color: colors.purple.dark,
    },
    closeButton: {
      backgroundColor: "transparent",
      border: "none",
      fontSize: "24px",
      cursor: "pointer",
      color: colors.gray.dark,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "36px",
      height: "36px",
      borderRadius: "50%",
      transition: "background-color 0.3s ease",
    },
    closeButtonHover: {
      backgroundColor: colors.gray.light,
    },
    questionContainer: {
      marginBottom: "30px",
      backgroundColor: colors.gray.lightest,
      padding: "20px",
      borderRadius: "8px",
      border: `1px solid ${colors.gray.light}`,
    },
    questionHeader: {
      display: "flex",
      alignItems: "center",
      marginBottom: "15px",
    },
    questionNumber: {
      backgroundColor: colors.purple.primary,
      color: "white",
      width: "30px",
      height: "30px",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginRight: "10px",
      fontSize: "14px",
      fontWeight: "600",
    },
    questionText: {
      fontSize: "16px",
      fontWeight: "500",
      color: colors.gray.text,
    },
    optionsContainer: {
      marginTop: "15px",
    },
    optionLabel: {
      display: "flex",
      alignItems: "center",
      padding: "12px 15px",
      marginBottom: "10px",
      borderRadius: "6px",
      border: `1px solid ${colors.gray.medium}`,
      cursor: "pointer",
      transition: "all 0.3s ease",
      backgroundColor: "white",
    },
    optionLabelSelected: {
      backgroundColor: colors.purple.light,
      borderColor: colors.purple.medium,
    },
    optionLabelHover: {
      backgroundColor: colors.gray.lightest,
    },
    radio: {
      marginRight: "10px",
      accentColor: colors.purple.primary,
    },
    modalFooter: {
      display: "flex",
      justifyContent: "space-between",
      marginTop: "30px",
      paddingTop: "20px",
      borderTop: `1px solid ${colors.gray.light}`,
    },
    navigationContainer: {
      display: "flex",
      justifyContent: "space-between",
      marginTop: "20px",
    },
    progressBar: {
      width: "100%",
      height: "8px",
      backgroundColor: colors.gray.light,
      borderRadius: "4px",
      marginTop: "30px",
      overflow: "hidden",
    },
    progressFill: (progress) => ({
      height: "100%",
      width: `${progress}%`,
      backgroundColor: colors.purple.primary,
      borderRadius: "4px",
      transition: "width 0.3s ease",
    }),
    emptyState: {
      textAlign: "center",
      padding: "40px 20px",
    },
    emptyStateIcon: {
      fontSize: "48px",
      color: colors.gray.medium,
      marginBottom: "15px",
    },
  }

  // Dummy data for 5 assessments with 5 questions each
  const assessments = [
    {
      id: 1,
      title: "JavaScript Fundamentals",
      description: "Test your knowledge of basic JavaScript concepts",
      questions: [
        {
          id: 1,
          text: "What is the correct way to declare a variable in JavaScript?",
          options: [
            { id: 1, text: "var x = 5;" },
            { id: 2, text: "variable x = 5;" },
            { id: 3, text: "x = 5;" },
            { id: 4, text: "let x = 5;" },
          ],
          correctAnswer: 4,
        },
        {
          id: 2,
          text: "Which of these is not a JavaScript data type?",
          options: [
            { id: 1, text: "String" },
            { id: 2, text: "Boolean" },
            { id: 3, text: "Float" },
            { id: 4, text: "Object" },
          ],
          correctAnswer: 3,
        },
        {
          id: 3,
          text: 'What does the "===" operator do in JavaScript?',
          options: [
            { id: 1, text: "Compares values without type checking" },
            { id: 2, text: "Assigns a value to a variable" },
            { id: 3, text: "Compares both value and type" },
            { id: 4, text: "Checks if a variable exists" },
          ],
          correctAnswer: 3,
        },
        {
          id: 4,
          text: "Which method adds one or more elements to the end of an array?",
          options: [
            { id: 1, text: "push()" },
            { id: 2, text: "pop()" },
            { id: 3, text: "shift()" },
            { id: 4, text: "unshift()" },
          ],
          correctAnswer: 1,
        },
        {
          id: 5,
          text: "What will typeof null return?",
          options: [
            { id: 1, text: '"null"' },
            { id: 2, text: '"undefined"' },
            { id: 3, text: '"object"' },
            { id: 4, text: '"number"' },
          ],
          correctAnswer: 3,
        },
      ],
    },
    {
      id: 2,
      title: "React Basics",
      description: "Assess your understanding of React fundamentals",
      questions: [
        {
          id: 1,
          text: "What is used to pass data to a component from outside?",
          options: [
            { id: 1, text: "setState" },
            { id: 2, text: "render with arguments" },
            { id: 3, text: "props" },
            { id: 4, text: "PropTypes" },
          ],
          correctAnswer: 3,
        },
        {
          id: 2,
          text: "Which lifecycle method is called after a component renders?",
          options: [
            { id: 1, text: "componentDidMount" },
            { id: 2, text: "componentWillMount" },
            { id: 3, text: "componentDidUpdate" },
            { id: 4, text: "shouldComponentUpdate" },
          ],
          correctAnswer: 1,
        },
        {
          id: 3,
          text: "What is the purpose of keys in React lists?",
          options: [
            { id: 1, text: "To make the list look pretty" },
            { id: 2, text: "To help React identify which items have changed" },
            { id: 3, text: "To provide unique IDs for CSS styling" },
            { id: 4, text: "To enable list sorting" },
          ],
          correctAnswer: 2,
        },
        {
          id: 4,
          text: "What hook is used for side effects in function components?",
          options: [
            { id: 1, text: "useState" },
            { id: 2, text: "useEffect" },
            { id: 3, text: "useContext" },
            { id: 4, text: "useReducer" },
          ],
          correctAnswer: 2,
        },
        {
          id: 5,
          text: "How do you update state in a functional component?",
          options: [
            { id: 1, text: "this.setState()" },
            { id: 2, text: "setState()" },
            { id: 3, text: "The function returned from useState()" },
            { id: 4, text: "updateState()" },
          ],
          correctAnswer: 3,
        },
      ],
    },
    {
      id: 3,
      title: "HTML & CSS",
      description: "Test your HTML and CSS knowledge",
      questions: [
        {
          id: 1,
          text: "Which HTML5 element is used for sidebar content?",
          options: [
            { id: 1, text: "<sidebar>" },
            { id: 2, text: "<aside>" },
            { id: 3, text: "<nav>" },
            { id: 4, text: '<div class="sidebar">' },
          ],
          correctAnswer: 2,
        },
        {
          id: 2,
          text: "What does CSS stand for?",
          options: [
            { id: 1, text: "Computer Style Sheets" },
            { id: 2, text: "Creative Style System" },
            { id: 3, text: "Cascading Style Sheets" },
            { id: 4, text: "Colorful Style Sheets" },
          ],
          correctAnswer: 3,
        },
        {
          id: 3,
          text: "Which property changes the text color?",
          options: [
            { id: 1, text: "text-color" },
            { id: 2, text: "font-color" },
            { id: 3, text: "color" },
            { id: 4, text: "text-style" },
          ],
          correctAnswer: 3,
        },
        {
          id: 4,
          text: "What is the default display value for a <div> element?",
          options: [
            { id: 1, text: "inline" },
            { id: 2, text: "inline-block" },
            { id: 3, text: "block" },
            { id: 4, text: "flex" },
          ],
          correctAnswer: 3,
        },
        {
          id: 5,
          text: "Which selector has the highest specificity?",
          options: [
            { id: 1, text: "Class selector (.class)" },
            { id: 2, text: "ID selector (#id)" },
            { id: 3, text: "Element selector (div)" },
            { id: 4, text: "Inline styles" },
          ],
          correctAnswer: 4,
        },
      ],
    },
    {
      id: 4,
      title: "Node.js Basics",
      description: "Test your Node.js fundamentals",
      questions: [
        {
          id: 1,
          text: "What is Node.js primarily used for?",
          options: [
            { id: 1, text: "Front-end development" },
            { id: 2, text: "Server-side programming" },
            { id: 3, text: "Mobile app development" },
            { id: 4, text: "Desktop applications" },
          ],
          correctAnswer: 2,
        },
        {
          id: 2,
          text: "Which module is used to create a web server in Node.js?",
          options: [
            { id: 1, text: "http" },
            { id: 2, text: "web" },
            { id: 3, text: "server" },
            { id: 4, text: "express" },
          ],
          correctAnswer: 1,
        },
        {
          id: 3,
          text: "What is the default package manager for Node.js?",
          options: [
            { id: 1, text: "npm" },
            { id: 2, text: "yarn" },
            { id: 3, text: "pnpm" },
            { id: 4, text: "bower" },
          ],
          correctAnswer: 1,
        },
        {
          id: 4,
          text: "Which function is used to include external modules?",
          options: [
            { id: 1, text: "import" },
            { id: 2, text: "require" },
            { id: 3, text: "include" },
            { id: 4, text: "use" },
          ],
          correctAnswer: 2,
        },
        {
          id: 5,
          text: "What does the fs module stand for?",
          options: [
            { id: 1, text: "File System" },
            { id: 2, text: "Fast Stream" },
            { id: 3, text: "Function Set" },
            { id: 4, text: "Final Structure" },
          ],
          correctAnswer: 1,
        },
      ],
    },
    {
      id: 5,
      title: "Git Version Control",
      description: "Test your knowledge of Git commands and workflows",
      questions: [
        {
          id: 1,
          text: "What command initializes a new Git repository?",
          options: [
            { id: 1, text: "git init" },
            { id: 2, text: "git start" },
            { id: 3, text: "git new" },
            { id: 4, text: "git create" },
          ],
          correctAnswer: 1,
        },
        {
          id: 2,
          text: "Which command shows the status of your working directory?",
          options: [
            { id: 1, text: "git log" },
            { id: 2, text: "git status" },
            { id: 3, text: "git show" },
            { id: 4, text: "git diff" },
          ],
          correctAnswer: 2,
        },
        {
          id: 3,
          text: "How do you create a new branch and switch to it?",
          options: [
            { id: 1, text: "git branch <name>" },
            { id: 2, text: "git checkout -b <name>" },
            { id: 3, text: "git newbranch <name>" },
            { id: 4, text: "git switch <name>" },
          ],
          correctAnswer: 2,
        },
        {
          id: 4,
          text: 'What does "git pull" do?',
          options: [
            { id: 1, text: "Uploads changes to remote repository" },
            { id: 2, text: "Downloads changes from remote repository" },
            { id: 3, text: "Shows differences between branches" },
            { id: 4, text: "Creates a new tag" },
          ],
          correctAnswer: 2,
        },
        {
          id: 5,
          text: "Which command permanently removes a file from Git history?",
          options: [
            { id: 1, text: "git rm" },
            { id: 2, text: "git delete" },
            { id: 3, text: "git remove" },
            { id: 4, text: "git filter-branch" },
          ],
          correctAnswer: 4,
        },
      ],
    },
  ]
  const [completedAssessments, setCompletedAssessments] = useState(() => {
    // Load from localStorage if available
    const saved = localStorage.getItem("completedAssessments")
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem("completedAssessments", JSON.stringify(completedAssessments))
  }, [completedAssessments])

  const handleViewInProfile = (assessment) => {
    // You can navigate to a profile page with the assessment data
    // For now, we'll just show an alert with the details
    alert(`Assessment: ${assessment.title}\nScore: ${assessment.score}%\n is now posted in your profile`)

    // Alternatively, if you have a profile page:
    // navigate('/profile', { state: { assessment } });
  }

  const handleViewDetails = (assessment) => {
    setSelectedResultDetails(assessment)
    setIsDetailsModalOpen(true)
  }

  const handleSelectAssessment = (assessment) => {
    setSelectedAssessment(assessment)
    setAnswers({})
    setCurrentQuestionIndex(0)
    setIsModalOpen(true)
  }

  const handleAnswerSelect = (questionId, optionId) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }))
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < selectedAssessment.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    }
  }

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
    }
  }

  const handleSubmitAssessment = () => {
    // Calculate score
    let score = 0
    selectedAssessment.questions.forEach((question) => {
      if (answers[question.id] === question.correctAnswer) {
        score++
      }
    })

    const percentage = (score / selectedAssessment.questions.length) * 100

    // Save completed assessment with more details
    const completedAssessment = {
      assessmentId: selectedAssessment.id,
      title: selectedAssessment.title,
      description: selectedAssessment.description,
      score: percentage,
      date: new Date().toLocaleDateString(),
      answers: selectedAssessment.questions.map((q) => ({
        questionId: q.id,
        questionText: q.text,
        selectedAnswer: answers[q.id],
        correctAnswer: q.correctAnswer,
        options: q.options,
      })),
      totalQuestions: selectedAssessment.questions.length,
      correctAnswers: score,
    }

    setCompletedAssessments((prev) => [...prev, completedAssessment])

    setIsModalOpen(false)
    setActiveTab("scores")
  }

  const renderAssessmentList = () => (
    <div>
      <h2 style={{ fontSize: "24px", fontWeight: "600", color: colors.purple.dark, marginBottom: "20px" }}>
        Available Assessments
      </h2>
      <div style={styles.assessmentGrid}>
        {assessments.map((assessment) => (
          <div
            key={assessment.id}
            style={styles.assessmentCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-5px)"
              e.currentTarget.style.boxShadow = "0 10px 20px rgba(0, 0, 0, 0.1)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none"
              e.currentTarget.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.05)"
            }}
          >
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>{assessment.title}</h3>
              <p style={styles.cardDescription}>{assessment.description}</p>
              <div style={{ fontSize: "13px", color: colors.gray.text }}>
                <span>{assessment.questions.length} questions</span>
              </div>
            </div>
            <div style={styles.cardBody}>
              <button
                style={styles.button}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.purple.dark)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = colors.purple.primary)}
                onClick={() => handleSelectAssessment(assessment)}
              >
                Start Assessment
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderScores = () => (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ fontSize: "24px", fontWeight: "600", color: colors.purple.dark }}>Your Assessment Scores</h2>
        <button
          style={styles.secondaryButton}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.gray.medium)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = colors.gray.light)}
          onClick={() => setActiveTab("list")}
        >
          Back to List
        </button>
      </div>

      {completedAssessments.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyStateIcon}>📋</div>
          <h3 style={{ fontSize: "18px", fontWeight: "600", color: colors.gray.text, marginBottom: "10px" }}>
            No Assessments Completed
          </h3>
          <p style={{ color: colors.gray.text }}>You haven't completed any assessments yet. Start one from the list!</p>
        </div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.tableHeader}>Assessment</th>
              <th style={styles.tableHeader}>Score</th>
              <th style={styles.tableHeader}>Result</th>
              <th style={styles.tableHeader}>Date Completed</th>
              <th style={styles.tableHeader}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {completedAssessments.map((assessment, index) => (
              <tr key={index}>
                <td style={styles.tableCell}>{assessment.title}</td>
                <td style={styles.scoreCell(assessment.score)}>{assessment.score.toFixed(0)}%</td>
                <td style={styles.tableCell}>
                  <span
                    style={{
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      fontWeight: "500",
                      backgroundColor:
                        assessment.score >= 70 ? "#c6f6d5" : assessment.score >= 50 ? "#feebc8" : "#fed7d7",
                      color: assessment.score >= 70 ? "#2f855a" : assessment.score >= 50 ? "#c05621" : "#c53030",
                    }}
                  >
                    {assessment.score >= 70 ? "Passed" : assessment.score >= 50 ? "Needs Improvement" : "Failed"}
                  </span>
                </td>
                <td style={styles.tableCell}>{assessment.date}</td>
                <td style={styles.tableCell}>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      style={{
                        ...styles.secondaryButton,
                        padding: "8px 12px",
                        fontSize: "12px",
                        marginRight: "0",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = colors.purple.light
                        e.currentTarget.style.color = colors.purple.dark
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "white"
                        e.currentTarget.style.color = colors.purple.primary
                      }}
                      onClick={() => handleViewDetails(assessment)}
                    >
                      View Details
                    </button>
                    <button
                      style={{
                        ...styles.secondaryButton,
                        padding: "8px 12px",
                        fontSize: "12px",
                        marginRight: "0",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = colors.purple.light
                        e.currentTarget.style.color = colors.purple.dark
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "white"
                        e.currentTarget.style.color = colors.purple.primary
                      }}
                      onClick={() => handleViewInProfile(assessment)}
                    >
                      View in Profile
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
  const navigate = useNavigate()
  const handleGoBack = () => {
    navigate(-1)
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "10px",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <button
            style={{
              backgroundColor: colors.purple.light,
              color: colors.purple.dark,
              border: "none",
              borderRadius: "6px",
              padding: "8px 16px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "background-color 0.3s ease",
              position: "absolute",
              left: "0",
            }}
            onClick={handleGoBack}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.purple.medium)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = colors.purple.light)}
          >
            ← Back
          </button>
          <h1 style={styles.title}>Online Assessments</h1>
        </div>
        <p style={styles.subtitle}>Test your knowledge and skills with our interactive assessments</p>
      </div>

      <div style={styles.tabContainer}>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === "list" ? styles.activeTab : {}),
          }}
          onClick={() => setActiveTab("list")}
        >
          Available Assessments
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === "scores" ? styles.activeTab : {}),
          }}
          onClick={() => setActiveTab("scores")}
        >
          My Scores
        </button>
      </div>

      <div style={styles.contentContainer}>
        {activeTab === "list" && renderAssessmentList()}
        {activeTab === "scores" && renderScores()}
      </div>

      {/* Assessment Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="Assessment Modal"
        style={customModalStyles}
      >
        {selectedAssessment && (
          <div>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>{selectedAssessment.title}</h2>
              <button
                style={styles.closeButton}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.gray.light)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                onClick={() => setIsModalOpen(false)}
              >
                ×
              </button>
            </div>

            <div style={styles.questionContainer}>
              <div style={styles.questionHeader}>
                <div style={styles.questionNumber}>{currentQuestionIndex + 1}</div>
                <div style={styles.questionText}>{selectedAssessment.questions[currentQuestionIndex].text}</div>
              </div>

              <div style={styles.optionsContainer}>
                {selectedAssessment.questions[currentQuestionIndex].options.map((option) => (
                  <label
                    key={option.id}
                    style={{
                      ...styles.optionLabel,
                      ...(answers[selectedAssessment.questions[currentQuestionIndex].id] === option.id
                        ? styles.optionLabelSelected
                        : {}),
                    }}
                    onMouseEnter={(e) => {
                      if (answers[selectedAssessment.questions[currentQuestionIndex].id] !== option.id) {
                        e.currentTarget.style.backgroundColor = colors.gray.lightest
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (answers[selectedAssessment.questions[currentQuestionIndex].id] !== option.id) {
                        e.currentTarget.style.backgroundColor = "white"
                      }
                    }}
                  >
                    <input
                      style={styles.radio}
                      type="radio"
                      name={`question-${selectedAssessment.questions[currentQuestionIndex].id}`}
                      checked={answers[selectedAssessment.questions[currentQuestionIndex].id] === option.id}
                      onChange={() =>
                        handleAnswerSelect(selectedAssessment.questions[currentQuestionIndex].id, option.id)
                      }
                    />
                    {option.text}
                  </label>
                ))}
              </div>
            </div>

            <div style={styles.progressBar}>
              <div
                style={styles.progressFill(((currentQuestionIndex + 1) / selectedAssessment.questions.length) * 100)}
              ></div>
            </div>

            <div style={styles.modalFooter}>
              <div>
                {currentQuestionIndex > 0 && (
                  <button
                    style={styles.secondaryButton}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.gray.medium)}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = colors.gray.light)}
                    onClick={handlePrevQuestion}
                  >
                    Previous
                  </button>
                )}
              </div>
              <div>
                {currentQuestionIndex < selectedAssessment.questions.length - 1 ? (
                  <button
                    style={{
                      ...styles.button,
                      opacity: answers[selectedAssessment.questions[currentQuestionIndex].id] ? 1 : 0.7,
                      cursor: answers[selectedAssessment.questions[currentQuestionIndex].id]
                        ? "pointer"
                        : "not-allowed",
                    }}
                    onMouseEnter={(e) => {
                      if (answers[selectedAssessment.questions[currentQuestionIndex].id]) {
                        e.currentTarget.style.backgroundColor = colors.purple.dark
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (answers[selectedAssessment.questions[currentQuestionIndex].id]) {
                        e.currentTarget.style.backgroundColor = colors.purple.primary
                      }
                    }}
                    onClick={handleNextQuestion}
                    disabled={!answers[selectedAssessment.questions[currentQuestionIndex].id]}
                  >
                    Next Question
                  </button>
                ) : (
                  <button
                    style={{
                      ...styles.button,
                      backgroundColor: "#38a169",
                      opacity: Object.keys(answers).length === selectedAssessment.questions.length ? 1 : 0.7,
                      cursor:
                        Object.keys(answers).length === selectedAssessment.questions.length ? "pointer" : "not-allowed",
                    }}
                    onMouseEnter={(e) => {
                      if (Object.keys(answers).length === selectedAssessment.questions.length) {
                        e.currentTarget.style.backgroundColor = "#2f855a"
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (Object.keys(answers).length === selectedAssessment.questions.length) {
                        e.currentTarget.style.backgroundColor = "#38a169"
                      }
                    }}
                    onClick={handleSubmitAssessment}
                    disabled={Object.keys(answers).length !== selectedAssessment.questions.length}
                  >
                    Submit Assessment
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
      {/* Assessment Details Modal */}
      <Modal
        isOpen={isDetailsModalOpen}
        onRequestClose={() => setIsDetailsModalOpen(false)}
        contentLabel="Assessment Details Modal"
        style={customModalStyles}
      >
        {selectedResultDetails && (
          <div>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Assessment Details</h2>
              <button
                style={styles.closeButton}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.gray.light)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                onClick={() => setIsDetailsModalOpen(false)}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <h3 style={{ fontSize: "20px", color: colors.purple.dark, marginBottom: "10px" }}>
                {selectedResultDetails.title}
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "20px" }}>
                <div style={{ backgroundColor: colors.gray.lightest, padding: "15px", borderRadius: "8px" }}>
                  <p style={{ fontSize: "14px", color: colors.gray.text, marginBottom: "5px" }}>Score</p>
                  <p
                    style={{
                      fontSize: "24px",
                      fontWeight: "bold",
                      color:
                        selectedResultDetails.score >= 70
                          ? "#38a169"
                          : selectedResultDetails.score >= 50
                            ? "#dd6b20"
                            : "#e53e3e",
                    }}
                  >
                    {selectedResultDetails.score.toFixed(0)}%
                  </p>
                </div>
                <div style={{ backgroundColor: colors.gray.lightest, padding: "15px", borderRadius: "8px" }}>
                  <p style={{ fontSize: "14px", color: colors.gray.text, marginBottom: "5px" }}>Result</p>
                  <p
                    style={{
                      fontSize: "18px",
                      fontWeight: "bold",
                      color:
                        selectedResultDetails.score >= 70
                          ? "#38a169"
                          : selectedResultDetails.score >= 50
                            ? "#dd6b20"
                            : "#e53e3e",
                    }}
                  >
                    {selectedResultDetails.score >= 70
                      ? "Passed"
                      : selectedResultDetails.score >= 50
                        ? "Needs Improvement"
                        : "Failed"}
                  </p>
                </div>
              </div>
              <div
                style={{
                  backgroundColor: colors.gray.lightest,
                  padding: "15px",
                  borderRadius: "8px",
                  marginBottom: "20px",
                }}
              >
                <p style={{ fontSize: "14px", color: colors.gray.text, marginBottom: "5px" }}>Summary</p>
                <p style={{ fontSize: "16px" }}>
                  Correct Answers: <strong>{selectedResultDetails.correctAnswers}</strong> out of{" "}
                  <strong>{selectedResultDetails.totalQuestions}</strong>
                </p>
                <p style={{ fontSize: "14px", color: colors.gray.text }}>Completed on {selectedResultDetails.date}</p>
              </div>
            </div>

            <h3
              style={{
                fontSize: "18px",
                color: colors.purple.dark,
                marginBottom: "15px",
                borderBottom: `1px solid ${colors.gray.light}`,
                paddingBottom: "10px",
              }}
            >
              Question Details
            </h3>

            {selectedResultDetails.answers.map((answer, index) => (
              <div
                key={index}
                style={{
                  marginBottom: "15px",
                  padding: "15px",
                  backgroundColor: answer.selectedAnswer === answer.correctAnswer ? "#f0fff4" : "#fff5f5",
                  borderRadius: "8px",
                  border: `1px solid ${answer.selectedAnswer === answer.correctAnswer ? "#c6f6d5" : "#fed7d7"}`,
                }}
              >
                <p style={{ fontSize: "16px", fontWeight: "500", marginBottom: "10px" }}>
                  {index + 1}. {answer.questionText}
                </p>
                <div style={{ marginLeft: "20px" }}>
                  {answer.options.map((option) => (
                    <div
                      key={option.id}
                      style={{
                        padding: "8px 12px",
                        marginBottom: "5px",
                        backgroundColor:
                          option.id === answer.selectedAnswer
                            ? option.id === answer.correctAnswer
                              ? "#c6f6d5"
                              : "#fed7d7"
                            : option.id === answer.correctAnswer
                              ? "#c6f6d5"
                              : "white",
                        borderRadius: "4px",
                        fontSize: "14px",
                      }}
                    >
                      {option.text}
                      {option.id === answer.selectedAnswer && option.id === answer.correctAnswer && " ✓"}
                      {option.id === answer.selectedAnswer && option.id !== answer.correctAnswer && " ✗"}
                      {option.id !== answer.selectedAnswer && option.id === answer.correctAnswer && " (Correct)"}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "20px",
                paddingTop: "15px",
                borderTop: `1px solid ${colors.gray.light}`,
              }}
            >
              <button
                style={styles.secondaryButton}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.purple.light
                  e.currentTarget.style.color = colors.purple.dark
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "white"
                  e.currentTarget.style.color = colors.purple.primary
                }}
                onClick={() => setIsDetailsModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default AssessmentPage
