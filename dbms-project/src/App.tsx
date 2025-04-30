import { useEffect, useState, useCallback, useMemo } from "react"
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
} from "@/components/ui/context-menu";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ChevronDown, ChevronRight } from "lucide-react"

function Dashboard() {
  const [tables, setTables] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [searchTable, setSearchTable] = useState("Employee")
  const [searchId, setSearchId] = useState("")
  const navigate = useNavigate()
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const intervalId = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(intervalId);
  }, []);

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

  const formattedTime = useMemo(() => {
    return currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, [currentTime]);

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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-800 flex">
      {/* Sidebar */}
      <aside className="bg-blue-900 text-white w-64 min-h-screen p-4">
        <div className="text-2xl font-bold mb-6">Menu</div>
        <nav>
          <ul className="space-y-2">
            <li>
              <Link to="/" className="block px-4 py-2 rounded hover:bg-blue-800">
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/add-employee" className="block px-4 py-2 rounded hover:bg-blue-800">
                Add Employee
              </Link>
            </li>
            {/* Add more menu items as needed */}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-gray-200 dark:bg-gray-700 p-4 flex items-center justify-between shadow-md">
          <div className="flex items-center">
            <img src="/vite.svg" alt="Company Logo" className="h-8 w-8 mr-2" /> {/* Add company logo */}
            <span className="font-bold text-lg text-gray-800 dark:text-gray-100">Employee Management System</span>
          </div>
          <div className="flex items-center">
            <span className="mr-4 text-gray-800 dark:text-gray-100">{formattedTime}</span>
            <span className="text-gray-800 dark:text-gray-100">User Name</span> {/* Add user name */}
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 flex-1 overflow-auto">
          <Card className="mb-6 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-800 dark:text-gray-100 font-bold">
                Dashboard Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                Welcome to the Employee Management System dashboard.
              </p>
            </CardContent>
          </Card>

          {/* Data Display Area */}
          <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
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
          <Card className="mb-6 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-md">
              <CardHeader>
                <CardTitle className="text-2xl text-gray-800 dark:text-gray-100 font-bold">
                  Data
                </CardTitle>
              </CardHeader>
              <CardContent>
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
                        className="flex items-center gap-2 text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2 focus:outline-none"
                        onClick={() => toggleExpand(tableName)}
                        aria-expanded={!!expanded[tableName]}
                      >
                        {expanded[tableName] ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                        {tableName}
                      </button>
                      {expanded[tableName] && (
                        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                {rows && rows.length > 0
                                  ? Object.keys(rows[0]).map((col) => (
                                      <TableHead key={col} className="text-gray-700 dark:text-gray-200 px-4 py-2">{col}</TableHead>
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
                                      <TableRow className="hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer">
                                        {Object.entries(row).map(([key, val], i) => (
                                          <TableCell key={i} className="px-4 py-2 border-t border-gray-100 dark:border-gray-800">
                                            {key.toLowerCase().includes("date") || key.toLowerCase().includes("dob")
                                              ? new Date(val).toLocaleDateString()
                                              : String(val)}
                                          </TableCell>
                                        ))}
                                        <TableCell className="px-4 py-2 border-t border-gray-100 dark:border-gray-800">
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
                                  <TableCell colSpan={99} className="text-center text-gray-400 py-4">
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
                    className="bg-blue-900 text-white hover:bg-blue-700 transition"
                  >
                    Refresh
                  </Button>
                </div>
              </CardContent>
            </Card>
        </div>
      </main>
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
