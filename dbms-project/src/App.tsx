import { useEffect, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Link, Routes, Route } from "react-router-dom"
import AddEmployee from "./AddEmployee"
import DetailsPage from "./DetailsPage"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { ChevronDown, ChevronRight } from "lucide-react"

function Dashboard() {
  const [tables, setTables] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [searchTable, setSearchTable] = useState("Employee")
  const [searchId, setSearchId] = useState("")
  const navigate = useNavigate()

  const fetchData = () => {
    setLoading(true)
    fetch("http://localhost:5000/api/all-tables")
      .then((res) => res.json())
      .then((data) => {
        setTables(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    fetchData()
  }, [])

  const primaryKeys: Record<string, string> = {
    Employee: "EmployeeID",
    Department: "DepartmentID",
    Project: "ProjectID",
    WorksOn: "EmployeeID",
    LeaveRecords: "ID",
    Benefits: "BenefitID",
    Dependent: "DependentID",
  }

  const handleDelete = useCallback((table: string, row: any) => {
    const pk = primaryKeys[table]
    if (!pk) return alert("Delete not supported for this table.")
    if (!window.confirm("Are you sure you want to delete this row?")) return

    let endpoint = `/api/${table.toLowerCase()}s`
    let id = row[pk]
    if (table === "WorksOn") {
      endpoint = `/api/works-on`
      id = `${row.EmployeeID},${row.ProjectID}`
    }

    fetch(`http://localhost:5000${endpoint}/${id}`, { method: "DELETE" })
      .then(res => res.json())
      .then(() => fetchData())
      .catch(() => alert("Failed to delete."))
  }, [fetchData])

  const toggleExpand = (tableName: string) => {
    setExpanded((prev) => ({
      ...prev,
      [tableName]: !prev[tableName],
    }))
  }

  return (
    <div className="min-h-svh bg-stone-100 dark:bg-stone-900 flex flex-col items-center justify-center px-4 py-8">
      <Card className="w-full max-w-5xl shadow-xl border-0 bg-white/90 dark:bg-stone-900/90">
        <CardHeader>
          <CardTitle className="text-3xl text-stone-800 dark:text-stone-100 text-center font-bold">
            Employee Management System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-stone-600 dark:text-stone-300 mb-6 text-center">
            All tables are displayed here. You can add, delete, and view records.
          </p>
          <div className="flex justify-end mb-4">
            <Link to="/add-employee">
              <Button className="bg-stone-800 text-white hover:bg-stone-700">Add Employee</Button>
            </Link>
          </div>
          <div className="flex flex-col md:flex-row gap-2 mb-6 items-center">
            <select
              value={searchTable}
              onChange={e => setSearchTable(e.target.value)}
              className="border rounded px-2 py-1"
            >
              {Object.keys(primaryKeys).map((table) => (
                <option key={table} value={table}>{table}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder={`Enter ${primaryKeys[searchTable]}`}
              value={searchId}
              onChange={e => setSearchId(e.target.value)}
              className="border rounded px-2 py-1"
            />
            <Button
              onClick={() => {
                if (searchId) navigate(`/details/${searchTable}/${searchId}`)
              }}
              className="bg-stone-800 text-white hover:bg-stone-700"
            >
              Search
            </Button>
          </div>
          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-full rounded-md" />
              ))}
            </div>
          ) : (
            Object.entries(tables).map(([tableName, rows]: any) => (
              <div key={tableName} className="mb-10">
                <button
                  className="flex items-center gap-2 text-xl font-semibold text-stone-700 dark:text-stone-200 mb-2 focus:outline-none"
                  onClick={() => toggleExpand(tableName)}
                  aria-expanded={!!expanded[tableName]}
                >
                  {expanded[tableName] ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  {tableName}
                </button>
                {expanded[tableName] && (
                  <div className="overflow-x-auto rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {rows && rows.length > 0
                            ? Object.keys(rows[0]).map((col) => (
                                <TableHead key={col} className="text-stone-700 dark:text-stone-200 px-4 py-2">{col}</TableHead>
                              ))
                            : <TableHead>No Columns</TableHead>
                          }
                          {/* Only show Actions column if there are rows */}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rows && rows.length > 0 ? (
                          rows.map((row: any, idx: number) => (
                            <ContextMenu key={idx}>
                              <ContextMenuTrigger asChild>
                                <TableRow className="hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer">
                                  {Object.entries(row).map(([key, val], i) => (
                                    <TableCell key={i} className="px-4 py-2 border-t border-stone-100 dark:border-stone-800">
                                      {key.toLowerCase().includes("date") || key.toLowerCase().includes("dob")
                                        ? new Date(val).toLocaleDateString()
                                        : String(val)}
                                    </TableCell>
                                  ))}
                                  <TableCell className="px-4 py-2 border-t border-stone-100 dark:border-stone-800">
                                    {/* Context menu actions */}
                                  </TableCell>
                                </TableRow>
                              </ContextMenuTrigger>
                              <ContextMenuContent>
                                <ContextMenuItem
                                  onClick={() => handleDelete(tableName, row)}
                                  className="text-red-600 focus:bg-red-100 dark:focus:bg-red-900"
                                >
                                  Delete
                                </ContextMenuItem>
                              </ContextMenuContent>
                            </ContextMenu>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={99} className="text-center text-stone-400 py-4">
                              No data found.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            ))
          )}
          <div className="mt-8 flex justify-center">
            <Button
              onClick={fetchData}
              variant="outline"
              className="bg-stone-800 text-white hover:bg-stone-700 transition"
            >
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/add-employee" element={<AddEmployee />} />
      <Route path="/details/:table/:id" element={<DetailsPage />} />
    </Routes>
  )
}
