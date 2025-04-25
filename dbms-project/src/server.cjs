const express = require("express")
const cors = require("cors")
const mysql = require("mysql2")

const app = express()
app.use(cors())
app.use(express.json())

// Update with your MySQL credentials
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1001",
  database: "employee_management_system"
})

// Example: Get all employees
app.get("/api/employees", (req, res) => {
  db.query("SELECT * FROM Employee", (err, results) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json(results)
  })
})

// Get an employee by EmployeeID
app.get("/api/employees/:id", (req, res) => {
  db.query("SELECT * FROM Employee WHERE EmployeeID = ?", [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message })
    if (!rows.length) return res.status(404).json({ error: "Not found" })
    res.json(rows[0])
  })
})

// Example: Use your view
app.get("/api/employee-project-details", (req, res) => {
  db.query("SELECT * FROM EmployeeProjectDetails", (err, results) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json(results)
  })
})

// Get all tables data
app.get("/api/all-tables", async (req, res) => {
  const tables = [
    "Employee",
    "Department",
    "Project",
    "WorksOn",
    "LeaveRecords",
    "Benefits",
    "Dependent"
  ]
  const results = {}
  let completed = 0

  tables.forEach((table) => {
    db.query(`SELECT * FROM ${table}`, (err, rows) => {
      if (err) results[table] = { error: err.message }
      else results[table] = rows
      completed++
      if (completed === tables.length) {
        res.json(results)
      }
    })
  })
})

// Add a new employee
app.post("/api/employees", (req, res) => {
  const {
    EmployeeID,
    FirstName,
    LastName,
    DateOfBirth,
    Gender,
    Email,
    PhoneNo,
    SupervisorID
  } = req.body

  db.query(
    "INSERT INTO Employee (EmployeeID, FirstName, LastName, DateOfBirth, Gender, Email, PhoneNo, SupervisorID) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [EmployeeID, FirstName, LastName, DateOfBirth, Gender, Email, PhoneNo, SupervisorID === "" ? null : SupervisorID],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json({ success: true, insertedId: result.insertId })
    }
  )
})

// Delete an employee by EmployeeID
app.delete("/api/employees/:id", (req, res) => {
  const id = req.params.id
  db.query("DELETE FROM Employee WHERE EmployeeID = ?", [id], (err, result) => {
    if (err) {
      // Send a user-friendly error
      if (err.code === "ER_ROW_IS_REFERENCED_2") {
        return res.status(400).json({ error: "Cannot delete: this employee is referenced in another table." })
      }
      return res.status(500).json({ error: err.message })
    }
    res.json({ success: true })
  })
})

// Delete a WorksOn record by EmployeeID and ProjectID
app.delete("/api/works-on/:ids", (req, res) => {
  const [EmployeeID, ProjectID] = req.params.ids.split(",")
  db.query(
    "DELETE FROM WorksOn WHERE EmployeeID = ? AND ProjectID = ?",
    [EmployeeID, ProjectID],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json({ success: true })
    }
  )
})

// Add more endpoints as needed...

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000")
})