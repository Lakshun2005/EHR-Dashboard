"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, CheckSquare, Bell, Users, Clock, AlertTriangle, Send, Plus, Filter, Search } from "lucide-react"

interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "DEFERRED" | "FAILED";
  dueDate: string;
  assignee: {
    id: string;
    firstName: string;
    lastName: string;
  };
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
    medicalRecordNumber: string;
  };
}

export default function CommunicationHub() {
  const [messages, setMessages] = useState<Message[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    status: "PENDING" as const,
    assigneeId: "",
    dueDate: "",
  })
  const [users, setUsers] = useState<{ id: string; firstName: string; lastName: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("messages")

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      await Promise.all([fetchMessages(), fetchTasks(), fetchUsers()])
      setLoading(false)
    }
    fetchData()
  }, [])

  const fetchMessages = async () => {
    try {
      const response = await fetch("/api/messages")
      const data = await response.json()
      setMessages(data.messages || [])
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/tasks")
      const data = await response.json()
      setTasks(data.tasks || [])
    } catch (error) {
      console.error("Error fetching tasks:", error)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users") // Assuming a /api/users endpoint exists
      const data = await response.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim()) return

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id: "general", // Default conversation
          content: newMessage,
        }),
      })

      if (response.ok) {
        setNewMessage("")
        fetchMessages()
      }
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  const createTask = async () => {
    if (!newTask.title.trim() || !newTask.assigneeId) {
      alert("Please provide a title and assignee for the task.")
      return
    }

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newTask,
          status: "PENDING",
        }),
      })

      if (response.ok) {
        setNewTask({
          title: "",
          description: "",
          status: "PENDING",
          assigneeId: "",
          dueDate: "",
        })
        fetchTasks()
      } else {
        const errorData = await response.json()
        console.error("Failed to create task:", errorData)
      }
    } catch (error) {
      console.error("Error creating task:", error)
    }
  }

  const updateTaskStatus = async (taskId: string, status: "PENDING" | "IN_PROGRESS" | "COMPLETED") => {
    try {
      const response = await fetch(`/api/tasks`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, status }),
      });
      if (response.ok) {
        fetchTasks();
      } else {
        console.error("Failed to update task status");
      }
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "pending":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Communication Hub</h1>
          <p className="text-gray-600">Team collaboration and workflow management</p>
        </div>
        <div className="flex gap-2"></div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Messages
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team
          </TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Team Messages</CardTitle>
                <CardDescription>Real-time communication with your healthcare team</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96 mb-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div key={message.id} className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {message.sender.firstName?.[0]}
                            {message.sender.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">
                              {message.sender.firstName} {message.sender.lastName}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {message.sender.role}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {new Date(message.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{message.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  />
                  <Button onClick={sendMessage}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Start New Conversation
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Create Team Channel
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Bell className="h-4 w-4 mr-2" />
                  Send Announcement
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Task Management</CardTitle>
                <CardDescription>Track and manage care coordination tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div key={task.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{task.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                          {task.patient && (
                            <p className="text-xs text-gray-500 mt-1">
                              Patient: {task.patient.firstName} {task.patient.lastName} (
                              {task.patient.medicalRecordNumber})
                            </p>
                          )}
                        </div>
                        <Badge className={getStatusColor(task.status.toLowerCase())}>
                          {task.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>
                          Assigned to:{" "}
                          {task.assignee
                            ? `${task.assignee.firstName} ${task.assignee.lastName}`
                            : "Unassigned"}
                        </span>
                        <span>
                          Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "N/A"}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateTaskStatus(task.id, "IN_PROGRESS")}
                          disabled={task.status === "IN_PROGRESS" || task.status === "COMPLETED"}
                        >
                          Start
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateTaskStatus(task.id, "COMPLETED")}
                          disabled={task.status === "COMPLETED"}
                        >
                          Complete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Create New Task</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Task title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                />
                <Textarea
                  placeholder="Task description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                />
                <Select
                  value={newTask.assigneeId}
                  onValueChange={(value) => setNewTask({ ...newTask, assigneeId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Assign to" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.firstName} {user.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                />
                <Button onClick={createTask} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Task
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Task Notifications</CardTitle>
              <CardDescription>A list of tasks requiring attention.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks
                  .filter((task) => task.status !== "COMPLETED")
                  .map((task) => {
                    const Icon = task.status === 'PENDING' ? Clock : Activity;
                    const color = task.status === 'PENDING' ? "text-yellow-500" : "text-blue-500";
                    return (
                      <div key={task.id} className="flex items-start gap-3 p-3 border rounded-lg">
                        <Icon className={`h-5 w-5 ${color} mt-0.5`} />
                        <div className="flex-1">
                          <h4 className="font-medium">{task.title}</h4>
                          <p className="text-sm text-gray-600">{task.description}</p>
                          <span className="text-xs text-gray-500">
                            Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "N/A"}
                          </span>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Status</CardTitle>
              <CardDescription>Current availability and status of healthcare team members</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map((member) => (
                  <div key={member.id} className="border rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar>
                        <AvatarFallback>
                          {member.firstName?.[0]}
                          {member.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">
                          {member.firstName} {member.lastName}
                        </h4>
                        <p className="text-sm text-gray-600">{member.role}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Status:</span>
                        <Badge variant={"default"}>Available</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Tasks:</span>
                        <span className="text-sm font-medium">
                          {tasks.filter((t) => t.assignee?.id === member.id).length}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
