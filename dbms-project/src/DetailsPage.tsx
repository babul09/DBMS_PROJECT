import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const tablePrimaryKeys: Record<string, string> = {
  Employee: "EmployeeID",
  Department: "DepartmentID",
  Project: "ProjectID",
  WorksOn: "EmployeeID",
  LeaveRecords: "ID",
  Benefits: "BenefitID",
  Dependent: "DependentID",
}

export default function DetailsPage() {
  const { table, id } = useParams()
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    if (!table || !id) return
    fetch(`http://localhost:5000/api/${table.toLowerCase()}s/${id}`)
      .then(res => res.json())
      .then(res => {
        if (res.error) setError(res.error)
        else setData(res)
      })
      .catch(() => setError("Failed to fetch details"))
  }, [table, id])

  if (error) {
    return (
      <Card className="max-w-xl mx-auto mt-10">
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">{error}</div>
          <Button onClick={() => navigate(-1)} className="mt-4">Back</Button>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return <div className="text-center mt-10">Loading...</div>
  }

  return (
    <Card className="max-w-xl mx-auto mt-10">
      <CardHeader>
        <CardTitle>{table} Details</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {Object.entries(data).map(([key, value]) => (
            <li key={key}>
              <span className="font-semibold">{key}:</span> {String(value)}
            </li>
          ))}
        </ul>
        <Button onClick={() => navigate(-1)} className="mt-4">Back</Button>
      </CardContent>
    </Card>
  )
}