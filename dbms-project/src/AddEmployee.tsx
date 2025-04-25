import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useNavigate } from "react-router-dom"

export default function AddEmployee() {
  const [form, setForm] = useState({
    EmployeeID: "",
    FirstName: "",
    LastName: "",
    DateOfBirth: "",
    Gender: "",
    Email: "",
    PhoneNo: "",
    SupervisorID: ""
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")
    fetch("http://localhost:5000/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    })
      .then(res => res.json())
      .then((data) => {
        setSubmitting(false)
        if (data.error) setError(data.error)
        else navigate("/")
      })
      .catch(() => {
        setSubmitting(false)
        setError("Failed to add employee.")
      })
  }

  return (
    <div className="min-h-svh bg-stone-100 dark:bg-stone-900 flex flex-col items-center justify-center px-4 py-8">
      <Card className="w-full max-w-xl shadow-xl border-0 bg-white/90 dark:bg-stone-900/90">
        <CardHeader>
          <CardTitle className="text-2xl text-stone-800 dark:text-stone-100 text-center font-bold">
            Add Employee
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input name="EmployeeID" value={form.EmployeeID} onChange={handleChange} placeholder="Employee ID" required />
              <Input name="FirstName" value={form.FirstName} onChange={handleChange} placeholder="First Name" required />
              <Input name="LastName" value={form.LastName} onChange={handleChange} placeholder="Last Name" required />
              <Input name="DateOfBirth" value={form.DateOfBirth} onChange={handleChange} placeholder="YYYY-MM-DD" required />
              <Input name="Gender" value={form.Gender} onChange={handleChange} placeholder="Gender" required />
              <Input name="Email" value={form.Email} onChange={handleChange} placeholder="Email" required />
              <Input name="PhoneNo" value={form.PhoneNo} onChange={handleChange} placeholder="Phone No" required />
              <Input name="SupervisorID" value={form.SupervisorID} onChange={handleChange} placeholder="Supervisor ID" />
            </div>
            {error && <div className="text-red-500">{error}</div>}
            <div className="flex gap-2 justify-end">
              <Button type="submit" className="bg-stone-800 text-white hover:bg-stone-700" disabled={submitting}>
                {submitting ? "Adding..." : "Add Employee"}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/")}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}