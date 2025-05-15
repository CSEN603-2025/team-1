// This file contains functions for handling appointment requests and storage

const APPOINTMENTS_STORAGE_KEY = "appointments"

const generateAppointmentId = (from, to, timestamp) => `${from}-${to}-${timestamp}`

export const getAppointmentsByEmail = (email) => {
  try {
    const data = localStorage.getItem(APPOINTMENTS_STORAGE_KEY)
    if (!data) return []

    const allAppointments = JSON.parse(data)
    const normalizedEmail = email.toLowerCase()

    // Return appointments where the user is either sender or receiver
    return allAppointments
      .filter(
        (appointment) =>
          appointment.to.toLowerCase() === normalizedEmail || appointment.from.toLowerCase() === normalizedEmail,
      )
      .map((app) => ({
        ...app,
        id: app.id || generateAppointmentId(app.from, app.to, app.timestamp),
      }))
  } catch (error) {
    console.error("Error getting appointments:", error)
    return []
  }
}

export const sendAppointmentRequest = (appointmentData) => {
  try {
    const timestamp = appointmentData.timestamp || Date.now()
    const id = appointmentData.id || generateAppointmentId(appointmentData.from, appointmentData.to, timestamp)
    const status = appointmentData.status || "pending"

    const newAppointment = {
      ...appointmentData,
      id,
      status,
      timestamp,
    }

    const existingData = localStorage.getItem(APPOINTMENTS_STORAGE_KEY)
    const appointments = existingData ? JSON.parse(existingData) : []
    appointments.push(newAppointment)
    localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(appointments))
    return true
  } catch (error) {
    console.error("Error sending appointment request:", error)
    return false
  }
}

export const updateAppointmentById = (appointmentId, updatedFields) => {
  try {
    const stored = localStorage.getItem(APPOINTMENTS_STORAGE_KEY)
    if (!stored) return false

    let found = false
    const appointments = JSON.parse(stored).map((app) => {
      if (app.id === appointmentId) {
        found = true
        return { ...app, ...updatedFields }
      }
      return app
    })

    if (!found) return false

    localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(appointments))
    return true
  } catch (error) {
    console.error("Error updating appointment:", error)
    return false
  }
}

export const clearAppointments = (email = null) => {
  try {
    const data = localStorage.getItem(APPOINTMENTS_STORAGE_KEY)
    if (!data) return true

    if (!email) {
      localStorage.removeItem(APPOINTMENTS_STORAGE_KEY)
    } else {
      const all = JSON.parse(data)
      const normalizedEmail = email.toLowerCase()
      const filtered = all.filter(
        (a) => a.to.toLowerCase() !== normalizedEmail && a.from.toLowerCase() !== normalizedEmail,
      )
      localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(filtered))
    }
    return true
  } catch (error) {
    console.error("Error clearing appointments:", error)
    return false
  }
}
