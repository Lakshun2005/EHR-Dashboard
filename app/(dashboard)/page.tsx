"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Users,
  BarChart3,
  AlertTriangle,
  ArrowRight,
  Heart,
  Calendar,
  FileText,
  Activity,
  Clock,
  Filter,
  Eye,
  MoreHorizontal,
  ChevronDown,
  UserPlus,
  Stethoscope,
  TrendingUp,
  TrendingDown,
  Brain,
  MessageSquare,
  Edit,
  Trash2,
  FileClock,
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { AddPatientDialog } from "@/components/add-patient-dialog"
import { EditPatientDialog } from "@/components/edit-patient-dialog"
import { toast } from "sonner"

const patientVitalsData = [
  { month: "Jul", patients: 1180, appointments: 890, alerts: 12 },
  { month: "Aug", patients: 1205, appointments: 920, alerts: 8 },
  { month: "Sep", patients: 1220, appointments: 945, alerts: 15 },
  { month: "Oct", patients: 1235, appointments: 980, alerts: 6 },
  { month: "Nov", patients: 1240, appointments: 1020, alerts: 9 },
  { month: "Dec", patients: 1247, appointments: 1050, alerts: 5 },
]

export default function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("Last 30 days")
  const [patients, setPatients] = useState([])
  const [providers, setProviders] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAddPatientDialogOpen, setAddPatientDialogOpen] = useState(false)
  const [isEditPatientDialogOpen, setEditPatientDialogOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [activeFilter, setActiveFilter] = useState("all")
  const [metrics, setMetrics] = useState({
    totalPatients: { value: 0, change: 0 },
    todaysAppointments: { value: 0, change: 0 },
    criticalAlerts: { value: 0, change: 0 },
    activeProviders: { value: 0, change: 0 },
  })

  const loadDashboardData = async () => {
    setLoading(true)
    const supabase = createClient()

    // Fetch recent patients
    let patientQuery = supabase
      .from("patients")
      .select("*, medical_history(*)")
      .order("created_at", { ascending: false })
      .limit(5)

    if (activeFilter !== "all") {
      // This is a simplified filter. A real implementation would be more complex.
      // We are filtering on a nested table, which Supabase handles well.
      patientQuery = patientQuery.eq("medical_history.status", activeFilter)
    }

    const { data: patientData, error: patientError } = await patientQuery

    if (patientError) {
      console.error("Error loading patients:", patientError)
      toast.error("Failed to load recent patients.")
    } else {
      const transformedPatients = patientData.map((p) => {
        const latestHistory = p.medical_history?.[0]
        return {
          id: p.id,
          mrn: p.medical_record_number,
          name: `${p.first_name} ${p.last_name}`,
          age: new Date().getFullYear() - new Date(p.date_of_birth).getFullYear(),
          lastVisit: new Date(p.created_at).toLocaleDateString(),
          condition: latestHistory?.diagnosis || "N/A",
          status: latestHistory?.status || "unknown",
          riskLevel: latestHistory?.severity || "low",
        }
      })
      setPatients(transformedPatients)
    }

    // Fetch providers
    const { data: providerData, error: providerError } = await supabase
      .from("profiles")
      .select("*")
      .limit(4)

    if (providerError) {
      console.error("Error loading providers:", providerError)
      toast.error("Failed to load healthcare team.")
    } else {
      setProviders(providerData)
    }

    // Fetch metrics
    const { data: patientCount } = await supabase.from("patients").select("*", { count: "exact", head: true })
    const { data: providerCount } = await supabase.from("profiles").select("*", { count: "exact", head: true })

    setMetrics((prev) => ({
      ...prev,
      totalPatients: { value: patientCount ?? 0, change: 23 }, // Mock change
      activeProviders: { value: providerCount ?? 0, change: 1 }, // Mock change
    }))

    setLoading(false)
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  const handlePatientAdded = (newPatient) => {
    // Optimistically update UI
    const transformedPatient = {
      id: newPatient.id,
      mrn: newPatient.medical_record_number,
      name: `${newPatient.first_name} ${newPatient.last_name}`,
      age: new Date().getFullYear() - new Date(newPatient.date_of_birth).getFullYear(),
      lastVisit: new Date(newPatient.created_at).toLocaleDateString(),
      condition: "General Care",
      status: "stable",
      riskLevel: "low",
    }
    setPatients([transformedPatient, ...patients.slice(0, 4)])
    toast.success("Patient added successfully!")
  }

  const handleEditPatient = (patient) => {
    setSelectedPatient(patient)
    setEditPatientDialogOpen(true)
  }

  const handlePatientUpdated = (updatedPatient) => {
    setPatients(patients.map((p) => (p.id === updatedPatient.id ? updatedPatient : p)))
  }

  const handleDeletePatient = async (patientId) => {
    if (!window.confirm("Are you sure? This action cannot be undone.")) return

    const supabase = createClient()
    const { error } = await supabase.from("patients").delete().eq("id", patientId)

    if (error) {
      toast.error("Failed to delete patient.", { description: error.message })
    } else {
      setPatients(patients.filter((p) => p.id !== patientId))
      toast.success("Patient deleted successfully.")
    }
  }

  const metricsData = [
    {
      label: "Total Patients",
      value: metrics.totalPatients.value,
      change: `+${metrics.totalPatients.change}`,
      trend: "up",
      icon: Users,
    },
    {
      label: "Today's Appointments",
      value: metrics.todaysAppointments.value,
      change: `+${metrics.todaysAppointments.change}`,
      trend: "up",
      icon: Calendar,
    },
    {
      label: "Critical Alerts",
      value: metrics.criticalAlerts.value,
      change: `-${metrics.criticalAlerts.change}`,
      trend: "down",
      icon: AlertTriangle,
    },
    {
      label: "Active Providers",
      value: metrics.activeProviders.value,
      change: `+${metrics.activeProviders.change}`,
      trend: "up",
      icon: Stethoscope,
    },
  ]

  const getRiskLevelBadge = (level) => {
    switch (level) {
      case "high":
        return "border-chart-4 text-chart-4"
      case "medium":
        return "border-chart-3 text-chart-3"
      default:
        return "border-chart-2 text-chart-2"
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "critical":
        return {
          variant: "destructive",
          icon: AlertTriangle,
          label: "Critical",
          className: "bg-chart-4/10 text-chart-4",
        }
      case "monitoring":
        return {
          variant: "secondary",
          icon: Clock,
          label: "Monitoring",
          className: "bg-chart-3/10 text-chart-3",
        }
      case "improving":
        return {
          variant: "secondary",
          icon: TrendingUp,
          label: "Improving",
          className: "bg-chart-2/10 text-chart-2",
        }
      default:
        return {
          variant: "secondary",
          icon: Activity,
          label: "Stable",
          className: "bg-chart-2/10 text-chart-2",
        }
    }
  }

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Monitor patient care and clinical workflows</p>
          </div>
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 bg-card">
                  {selectedPeriod} <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSelectedPeriod("Last 7 days")}>Last 7 days</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedPeriod("Last 30 days")}>
                  Last 30 days
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedPeriod("Last 90 days")}>
                  Last 90 days
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button className="bg-primary hover:bg-primary/90" onClick={() => setAddPatientDialogOpen(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Add Patient
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {metricsData.map((metric, index) => (
          <Card key={index} className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                  <metric.icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div
                  className={`flex items-center gap-1 text-sm ${
                    metric.trend === "up" ? "text-chart-2" : "text-chart-4"
                  }`}
                >
                  {metric.trend === "up" ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {metric.change}
                </div>
              </div>
              <div className="text-2xl font-semibold text-foreground mb-1">{metric.value}</div>
              <div className="text-sm text-muted-foreground">{metric.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="col-span-1 lg:col-span-2 space-y-8">
          {/* Charts Section */}
          <Card className="border-border">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">Patient Care Analytics</CardTitle>
                  <CardDescription>Patient volume, appointments, and alert trends</CardDescription>
                </div>
                <Tabs defaultValue="patients" className="w-auto">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="patients">Patients</TabsTrigger>
                    <TabsTrigger value="appointments">Appointments</TabsTrigger>
                    <TabsTrigger value="alerts">Alerts</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={patientVitalsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="patients"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="appointments"
                      stroke="hsl(var(--chart-2))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--chart-2))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Patient Table */}
          <Card className="border-border">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">Recent Patients</CardTitle>
                  <CardDescription>Monitor patient status and care progress</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setActiveFilter("all")}>All</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setActiveFilter("stable")}>Stable</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setActiveFilter("critical")}>Critical</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setActiveFilter("monitoring")}>Monitoring</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Link href="/patients">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View All
                    </Button>
                  </Link>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-medium text-foreground">Patient Name</TableHead>
                    <TableHead className="font-medium text-foreground hidden md:table-cell">
                      Condition
                    </TableHead>
                    <TableHead className="font-medium text-foreground">Status</TableHead>
                    <TableHead className="font-medium text-foreground hidden md:table-cell">
                      Risk Level
                    </TableHead>
                    <TableHead className="font-medium text-foreground w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        Loading patients...
                      </TableCell>
                    </TableRow>
                  ) : (
                    patients.map((patient) => {
                      const statusInfo = getStatusBadge(patient.status)
                      return (
                        <TableRow key={patient.id} className="hover:bg-muted/50">
                          <TableCell>
                            <div className="font-medium">{patient.name}</div>
                            <div className="text-sm text-muted-foreground md:hidden">{patient.mrn}</div>
                          </TableCell>
                          <TableCell className="text-muted-foreground hidden md:table-cell">
                            {patient.condition}
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusInfo.variant} className={statusInfo.className}>
                              <statusInfo.icon className="w-3 h-3 mr-1" />
                              {statusInfo.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Badge variant="outline" className={getRiskLevelBadge(patient.riskLevel)}>
                              {patient.riskLevel}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="w-8 h-8">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <FileText className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleEditPatient(patient)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Record
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <FileClock className="mr-2 h-4 w-4" />
                                  View History
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => handleDeletePatient(patient.id)}
                                  >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Patient
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="col-span-1 space-y-6">
          <Card className="border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">Department Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Bed Occupancy</span>
                  <span className="text-sm font-medium">85%</span>
                </div>
                <Progress value={85} className="h-2" />

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Staff Availability</span>
                  <span className="text-sm font-medium">92%</span>
                </div>
                <Progress value={92} className="h-2" />

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Equipment Status</span>
                  <span className="text-sm font-medium">98%</span>
                </div>
                <Progress value={98} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Healthcare Team Status */}
          <Card className="border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">Healthcare Team</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-0">
                {loading ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">Loading team...</div>
                ) : (
                  providers.map((member, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-4 hover:bg-muted/50 border-b border-border last:border-b-0"
                    >
                      <div className="relative">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={"/placeholder.svg"} />
                          <AvatarFallback>
                            {member.first_name?.[0]}
                            {member.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${
                            member.status === "online" ? "bg-chart-2" : "bg-muted-foreground"
                          }`}
                        ></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-foreground">
                          {member.first_name} {member.last_name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {member.role} • {member.availability}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {!loading && providers.length === 0 && (
                  <div className="p-4 text-center text-sm text-muted-foreground">No team members found.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <AddPatientDialog
        open={isAddPatientDialogOpen}
        onOpenChange={setAddPatientDialogOpen}
        onPatientAdded={handlePatientAdded}
      />
      {selectedPatient && (
        <EditPatientDialog
          patient={selectedPatient}
          open={isEditPatientDialogOpen}
          onOpenChange={setEditPatientDialogOpen}
          onPatientUpdated={handlePatientUpdated}
        />
      )}
    </>
  )
}