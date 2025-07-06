"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { CheckCircle, Clock, FileText, Users, Calendar } from "lucide-react"

interface Task {
  _id: string
  title: string
  description: string
  domain: string
  dueDate: string
  status: "pending" | "submitted" | "completed"
  submission?: string
}

interface User {
  _id: string
  name: string
  email: string
  role: string
  domains: string[]
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [submissionText, setSubmissionText] = useState("")
  const [submittingTask, setSubmittingTask] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
      fetchTasks()
    }
  }, [])

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/tasks/my-tasks", {
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

  const submitTask = async (taskId: string) => {
    if (!submissionText.trim()) {
      toast({
        title: "Error",
        description: "Please enter your task report",
        variant: "destructive",
      })
      return
    }

    setSubmittingTask(taskId)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/tasks/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          taskId,
          submission: submissionText,
        }),
      })

      if (response.ok) {
        toast({
          title: "Task Submitted!",
          description: "Your task report has been submitted successfully.",
        })
        setSubmissionText("")
        fetchTasks()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit task",
        variant: "destructive",
      })
    } finally {
      setSubmittingTask(null)
    }
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

  const pendingTasks = tasks.filter((task) => task.status === "pending")
  const submittedTasks = tasks.filter((task) => task.status === "submitted")
  const completedTasks = tasks.filter((task) => task.status === "completed")

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
          <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.name}!</h1>
          <p className="opacity-90">Ready to make a difference for Gaza today?</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{pendingTasks.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Submitted</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{submittedTasks.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedTasks.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Domains</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{user?.domains?.length || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* My Domains */}
        <Card>
          <CardHeader>
            <CardTitle>My Campaign Domains</CardTitle>
            <CardDescription>You are assigned to the following campaign domains</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {user?.domains?.map((domain, index) => (
                <Badge key={index} variant="secondary">
                  {domain}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tasks Section */}
        <Card>
          <CardHeader>
            <CardTitle>My Tasks</CardTitle>
            <CardDescription>Manage your assigned tasks and submit reports</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="pending">Pending ({pendingTasks.length})</TabsTrigger>
                <TabsTrigger value="submitted">Submitted ({submittedTasks.length})</TabsTrigger>
                <TabsTrigger value="completed">Completed ({completedTasks.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="space-y-4">
                {pendingTasks.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No pending tasks</p>
                ) : (
                  pendingTasks.map((task) => (
                    <Card key={task._id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{task.title}</CardTitle>
                            <CardDescription>{task.description}</CardDescription>
                          </div>
                          <Badge variant="outline">{task.domain}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Submit Task Report:</label>
                          <Textarea
                            placeholder="Describe what you accomplished for this task..."
                            value={submissionText}
                            onChange={(e) => setSubmissionText(e.target.value)}
                            className="mb-2"
                          />
                          <Button onClick={() => submitTask(task._id)} disabled={submittingTask === task._id}>
                            {submittingTask === task._id ? "Submitting..." : "Submit Report"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="submitted" className="space-y-4">
                {submittedTasks.map((task) => (
                  <Card key={task._id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{task.title}</CardTitle>
                          <CardDescription>{task.description}</CardDescription>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">Submitted</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-sm font-medium mb-1">Your Submission:</p>
                        <p className="text-sm">{task.submission}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="completed" className="space-y-4">
                {completedTasks.map((task) => (
                  <Card key={task._id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{task.title}</CardTitle>
                          <CardDescription>{task.description}</CardDescription>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Completed</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-sm font-medium mb-1">Your Submission:</p>
                        <p className="text-sm">{task.submission}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
