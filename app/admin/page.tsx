"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { Users, Target, FileText, Calendar, Plus, Search } from "lucide-react"

interface Volunteer {
  _id: string
  name: string
  email: string
  phone: string
  city: string
  area: string
  domains: string[]
  role: string
  createdAt: string
}

interface Task {
  _id: string
  title: string
  description: string
  domain: string
  assignedTo: string[]
  dueDate: string
  status: string
}

const CAMPAIGN_DOMAINS = [
  "Gaza Awareness",
  "Boycott",
  "Social Media Warfare",
  "Relief / Child Adoption",
  "Building Teams for Gaza",
  "Masajid for Gaza",
  "University Teams",
  "Intellectual Capital Building",
]

export default function AdminPage() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [filteredVolunteers, setFilteredVolunteers] = useState<Volunteer[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDomain, setSelectedDomain] = useState("all")
  const [selectedCity, setSelectedCity] = useState("all")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Task creation form
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    domain: "",
    assignTo: "all",
    dueDate: "",
  })

  useEffect(() => {
    fetchVolunteers()
    fetchTasks()
  }, [])

  useEffect(() => {
    filterVolunteers()
  }, [volunteers, searchTerm, selectedDomain, selectedCity])

  const fetchVolunteers = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/volunteers", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setVolunteers(data)
      }
    } catch (error) {
      console.error("Error fetching volunteers:", error)
    }
  }

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/tasks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setTasks(data)
      }
    } catch (error) {
      console.error("Error fetching tasks:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterVolunteers = () => {
    let filtered = volunteers

    if (searchTerm) {
      filtered = filtered.filter(
        (volunteer) =>
          volunteer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          volunteer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          volunteer.city.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedDomain !== "all") {
      filtered = filtered.filter((volunteer) => volunteer.domains.includes(selectedDomain))
    }

    if (selectedCity !== "all") {
      filtered = filtered.filter((volunteer) => volunteer.city.toLowerCase() === selectedCity.toLowerCase())
    }

    setFilteredVolunteers(filtered)
  }

  const createTask = async () => {
    if (!taskForm.title || !taskForm.description || !taskForm.domain || !taskForm.dueDate) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(taskForm),
      })

      if (response.ok) {
        toast({
          title: "Task Created!",
          description: "Task has been assigned successfully.",
        })
        setTaskForm({
          title: "",
          description: "",
          domain: "",
          assignTo: "all",
          dueDate: "",
        })
        fetchTasks()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      })
    }
  }

  const uniqueCities = [...new Set(volunteers.map((v) => v.city))]
  const stats = {
    totalVolunteers: volunteers.length,
    totalTasks: tasks.length,
    pendingTasks: tasks.filter((t) => t.status === "pending").length,
    completedTasks: tasks.filter((t) => t.status === "completed").length,
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-lg">
          <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
          <p className="opacity-90">Manage volunteers, tasks, and campaign progress</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Volunteers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.totalVolunteers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.totalTasks}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pendingTasks}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completedTasks}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="volunteers" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="volunteers">Volunteers</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="create-task">Create Task</TabsTrigger>
          </TabsList>

          <TabsContent value="volunteers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Volunteer Management</CardTitle>
                <CardDescription>View and filter volunteers by domain, city, and other criteria</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search volunteers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={selectedDomain} onValueChange={setSelectedDomain}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Filter by domain" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Domains</SelectItem>
                      {CAMPAIGN_DOMAINS.map((domain) => (
                        <SelectItem key={domain} value={domain}>
                          {domain}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedCity} onValueChange={setSelectedCity}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Filter by city" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Cities</SelectItem>
                      {uniqueCities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Volunteers List */}
                <div className="space-y-4">
                  {filteredVolunteers.map((volunteer) => (
                    <Card key={volunteer._id}>
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{volunteer.name}</h3>
                            <p className="text-gray-600">{volunteer.email}</p>
                            <p className="text-sm text-gray-500">
                              {volunteer.city}, {volunteer.area}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {volunteer.domains.map((domain, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {domain}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="mt-4 md:mt-0">
                            <Badge variant="outline">{volunteer.role}</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Task Management</CardTitle>
                <CardDescription>View all assigned tasks and their completion status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <Card key={task._id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{task.title}</h3>
                            <p className="text-gray-600 mb-2">{task.description}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>Domain: {task.domain}</span>
                              <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                              <span>Assigned to: {task.assignedTo.length} volunteers</span>
                            </div>
                          </div>
                          <Badge
                            variant={task.status === "completed" ? "default" : "secondary"}
                            className={task.status === "completed" ? "bg-green-100 text-green-800" : ""}
                          >
                            {task.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create-task" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Create New Task</CardTitle>
                <CardDescription>Assign tasks to volunteers individually or by domain</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Task Title *</label>
                  <Input
                    value={taskForm.title}
                    onChange={(e) => setTaskForm((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter task title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Task Description *</label>
                  <Textarea
                    value={taskForm.description}
                    onChange={(e) => setTaskForm((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the task in detail"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Campaign Domain *</label>
                    <Select
                      value={taskForm.domain}
                      onValueChange={(value) => setTaskForm((prev) => ({ ...prev, domain: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select domain" />
                      </SelectTrigger>
                      <SelectContent>
                        {CAMPAIGN_DOMAINS.map((domain) => (
                          <SelectItem key={domain} value={domain}>
                            {domain}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Assign To</label>
                    <Select
                      value={taskForm.assignTo}
                      onValueChange={(value) => setTaskForm((prev) => ({ ...prev, assignTo: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select assignment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All volunteers in domain</SelectItem>
                        <SelectItem value="specific">Specific volunteers</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Due Date *</label>
                  <Input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm((prev) => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>

                <Button onClick={createTask} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Task
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
