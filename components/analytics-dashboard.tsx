"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadialBarChart,
  RadialBar,
  ScatterChart,
  Scatter,
} from "recharts"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Heart,
  Activity,
  Clock,
  AlertTriangle,
  Stethoscope,
  Download,
  Filter,
  RefreshCw,
} from "lucide-react"

// Sample data for various charts
const patientVolumeData = [
  { month: "Jan", inpatient: 245, outpatient: 890, emergency: 156, total: 1291 },
  { month: "Feb", inpatient: 267, outpatient: 923, emergency: 142, total: 1332 },
  { month: "Mar", inpatient: 289, outpatient: 1045, emergency: 178, total: 1512 },
  { month: "Apr", inpatient: 234, outpatient: 987, emergency: 165, total: 1386 },
  { month: "May", inpatient: 298, outpatient: 1123, emergency: 189, total: 1610 },
  { month: "Jun", inpatient: 312, outpatient: 1089, emergency: 201, total: 1602 },
]

const departmentMetrics = [
  { department: "Cardiology", patients: 234, satisfaction: 4.8, avgStay: 3.2, revenue: 450000 },
  { department: "Emergency", patients: 567, satisfaction: 4.2, avgStay: 0.8, revenue: 320000 },
  { department: "Orthopedics", patients: 189, satisfaction: 4.6, avgStay: 4.1, revenue: 380000 },
  { department: "Pediatrics", patients: 298, satisfaction: 4.9, avgStay: 2.1, revenue: 280000 },
  { department: "Internal Med", patients: 445, satisfaction: 4.5, avgStay: 2.8, revenue: 520000 },
  { department: "Surgery", patients: 156, satisfaction: 4.7, avgStay: 5.2, revenue: 680000 },
]

const diagnosisDistribution = [
  { name: "Cardiovascular", value: 28, count: 342, color: "#8b5cf6" },
  { name: "Respiratory", value: 22, count: 268, color: "#3b82f6" },
  { name: "Musculoskeletal", value: 18, count: 219, color: "#10b981" },
  { name: "Neurological", value: 15, count: 183, color: "#f59e0b" },
  { name: "Gastrointestinal", value: 12, count: 146, color: "#ef4444" },
  { name: "Other", value: 5, count: 61, color: "#6b7280" },
]

const vitalTrends = [
  { time: "00:00", avgBP: 120, avgHR: 72, avgTemp: 98.6, avgO2: 98 },
  { time: "04:00", avgBP: 118, avgHR: 68, avgTemp: 98.4, avgO2: 97 },
  { time: "08:00", avgBP: 125, avgHR: 78, avgTemp: 98.8, avgO2: 98 },
  { time: "12:00", avgBP: 128, avgHR: 82, avgTemp: 99.1, avgO2: 97 },
  { time: "16:00", avgBP: 132, avgHR: 85, avgTemp: 99.2, avgO2: 96 },
  { time: "20:00", avgBP: 126, avgHR: 79, avgTemp: 98.9, avgO2: 97 },
]

const qualityMetrics = [
  { metric: "Patient Satisfaction", current: 4.6, target: 4.5, trend: "up" },
  { metric: "Readmission Rate", current: 8.2, target: 10.0, trend: "down" },
  { metric: "Average Length of Stay", current: 3.4, target: 3.8, trend: "down" },
  { metric: "Medication Errors", current: 0.3, target: 0.5, trend: "down" },
  { metric: "Infection Rate", current: 1.2, target: 2.0, trend: "down" },
  { metric: "Staff Turnover", current: 12.5, target: 15.0, trend: "down" },
]

const resourceUtilization = [
  { resource: "ICU Beds", used: 28, total: 32, utilization: 87.5 },
  { resource: "OR Suites", used: 8, total: 12, utilization: 66.7 },
  { resource: "MRI Machines", used: 3, total: 4, utilization: 75.0 },
  { resource: "CT Scanners", used: 5, total: 6, utilization: 83.3 },
  { resource: "Ventilators", used: 15, total: 20, utilization: 75.0 },
  { resource: "Dialysis Units", used: 12, total: 16, utilization: 75.0 },
]

const financialData = [
  { month: "Jan", revenue: 2450000, expenses: 1890000, profit: 560000 },
  { month: "Feb", revenue: 2670000, expenses: 2010000, profit: 660000 },
  { month: "Mar", revenue: 2890000, expenses: 2150000, profit: 740000 },
  { month: "Apr", revenue: 2340000, expenses: 1980000, profit: 360000 },
  { month: "May", revenue: 2980000, expenses: 2200000, profit: 780000 },
  { month: "Jun", revenue: 3120000, expenses: 2280000, profit: 840000 },
]

export function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    // Simulate data refresh
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setRefreshing(false)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(value)
  }

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return "text-chart-4"
    if (utilization >= 75) return "text-chart-3"
    return "text-chart-2"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Analytics Dashboard</h2>
            <p className="text-muted-foreground">Comprehensive healthcare data visualization and insights</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="patients">Patient Analytics</TabsTrigger>
          <TabsTrigger value="clinical">Clinical Metrics</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Performance Indicators */}
          <div className="grid grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Patients</p>
                    <p className="text-2xl font-bold">1,247</p>
                    <p className="text-xs text-chart-2 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      +12% from last month
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Patient Satisfaction</p>
                    <p className="text-2xl font-bold">4.6/5</p>
                    <p className="text-xs text-chart-2 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      +0.2 from last month
                    </p>
                  </div>
                  <Heart className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Bed Occupancy</p>
                    <p className="text-2xl font-bold">85%</p>
                    <p className="text-xs text-chart-3 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      +3% from last week
                    </p>
                  </div>
                  <Activity className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Length of Stay</p>
                    <p className="text-2xl font-bold">3.4 days</p>
                    <p className="text-xs text-chart-2 flex items-center gap-1">
                      <TrendingDown className="w-3 h-3" />
                      -0.4 from last month
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Patient Volume Trends */}
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Patient Volume Trends</CardTitle>
                <CardDescription>Monthly patient admissions by type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={patientVolumeData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="inpatient"
                        stackId="1"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.6}
                      />
                      <Area
                        type="monotone"
                        dataKey="outpatient"
                        stackId="1"
                        stroke="hsl(var(--chart-2))"
                        fill="hsl(var(--chart-2))"
                        fillOpacity={0.6}
                      />
                      <Area
                        type="monotone"
                        dataKey="emergency"
                        stackId="1"
                        stroke="hsl(var(--chart-4))"
                        fill="hsl(var(--chart-4))"
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Diagnosis Distribution</CardTitle>
                <CardDescription>Most common diagnosis categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={diagnosisDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {diagnosisDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name, props) => [
                          `${value}% (${props.payload.count} patients)`,
                          props.payload.name,
                        ]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quality Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Quality Metrics</CardTitle>
              <CardDescription>Key performance indicators vs targets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6">
                {qualityMetrics.map((metric, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{metric.metric}</span>
                      <div className="flex items-center gap-1">
                        {metric.trend === "up" ? (
                          <TrendingUp className="w-3 h-3 text-chart-2" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-chart-2" />
                        )}
                        <span className="text-sm font-bold">{metric.current}</span>
                      </div>
                    </div>
                    <Progress value={(metric.current / metric.target) * 100} className="h-2" />
                    <div className="text-xs text-muted-foreground">Target: {metric.target}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patients" className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Department Performance</CardTitle>
                <CardDescription>Patient volume and satisfaction by department</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={departmentMetrics}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="department" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="patients" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Patient Satisfaction vs Volume</CardTitle>
                <CardDescription>Correlation between patient volume and satisfaction</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart data={departmentMetrics}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="patients" stroke="hsl(var(--muted-foreground))" name="Patient Volume" />
                      <YAxis
                        dataKey="satisfaction"
                        stroke="hsl(var(--muted-foreground))"
                        name="Satisfaction"
                        domain={[4.0, 5.0]}
                      />
                      <Tooltip
                        formatter={(value, name) => [value, name]}
                        labelFormatter={(label) => `Department: ${label}`}
                      />
                      <Scatter dataKey="satisfaction" fill="hsl(var(--chart-2))" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Department Metrics Summary</CardTitle>
              <CardDescription>Detailed performance metrics by department</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {departmentMetrics.map((dept, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <h4 className="font-medium">{dept.department}</h4>
                        <p className="text-sm text-muted-foreground">{dept.patients} patients</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-sm font-medium">{dept.satisfaction}/5</p>
                        <p className="text-xs text-muted-foreground">Satisfaction</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">{dept.avgStay} days</p>
                        <p className="text-xs text-muted-foreground">Avg Stay</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">{formatCurrency(dept.revenue)}</p>
                        <p className="text-xs text-muted-foreground">Revenue</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clinical" className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Vital Signs Trends</CardTitle>
                <CardDescription>Average vital signs throughout the day</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={vitalTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="avgBP"
                        stroke="hsl(var(--chart-4))"
                        strokeWidth={2}
                        name="Blood Pressure"
                      />
                      <Line
                        type="monotone"
                        dataKey="avgHR"
                        stroke="hsl(var(--chart-2))"
                        strokeWidth={2}
                        name="Heart Rate"
                      />
                      <Line
                        type="monotone"
                        dataKey="avgO2"
                        stroke="hsl(var(--chart-5))"
                        strokeWidth={2}
                        name="Oxygen Saturation"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Clinical Alerts</CardTitle>
                <CardDescription>Distribution of clinical alerts by severity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      cx="50%"
                      cy="50%"
                      innerRadius="20%"
                      outerRadius="80%"
                      data={[
                        { name: "Critical", value: 5, fill: "hsl(var(--chart-4))" },
                        { name: "High", value: 12, fill: "hsl(var(--chart-3))" },
                        { name: "Medium", value: 28, fill: "hsl(var(--chart-2))" },
                        { name: "Low", value: 45, fill: "hsl(var(--chart-1))" },
                      ]}
                    >
                      <RadialBar dataKey="value" cornerRadius={10} fill="#8884d8" />
                      <Tooltip />
                      <Legend />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Clinical Quality Indicators</CardTitle>
              <CardDescription>Key clinical performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Medication Adherence</span>
                    <span className="text-sm font-bold text-chart-2">94.2%</span>
                  </div>
                  <Progress value={94.2} className="h-2" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Hand Hygiene Compliance</span>
                    <span className="text-sm font-bold text-chart-2">87.5%</span>
                  </div>
                  <Progress value={87.5} className="h-2" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Fall Prevention</span>
                    <span className="text-sm font-bold text-chart-2">96.8%</span>
                  </div>
                  <Progress value={96.8} className="h-2" />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Infection Control</span>
                    <span className="text-sm font-bold text-chart-2">98.1%</span>
                  </div>
                  <Progress value={98.1} className="h-2" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Documentation Quality</span>
                    <span className="text-sm font-bold text-chart-2">91.3%</span>
                  </div>
                  <Progress value={91.3} className="h-2" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Care Plan Adherence</span>
                    <span className="text-sm font-bold text-chart-2">89.7%</span>
                  </div>
                  <Progress value={89.7} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resource Utilization</CardTitle>
              <CardDescription>Current utilization of critical hospital resources</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                {resourceUtilization.map((resource, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{resource.resource}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${getUtilizationColor(resource.utilization)}`}>
                          {resource.utilization}%
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {resource.used}/{resource.total}
                        </Badge>
                      </div>
                    </div>
                    <Progress value={resource.utilization} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Staff Scheduling</CardTitle>
                <CardDescription>Current shift coverage and availability</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <Stethoscope className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Physicians</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">24/28</span>
                      <Badge className="bg-chart-2/10 text-chart-2">85.7%</Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <Heart className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Nurses</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">67/72</span>
                      <Badge className="bg-chart-2/10 text-chart-2">93.1%</Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <Activity className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Technicians</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">18/20</span>
                      <Badge className="bg-chart-2/10 text-chart-2">90.0%</Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Support Staff</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">45/52</span>
                      <Badge className="bg-chart-3/10 text-chart-3">86.5%</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Equipment Status</CardTitle>
                <CardDescription>Medical equipment availability and maintenance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span className="text-sm font-medium">Operational</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">156/160</span>
                      <Badge className="bg-chart-2/10 text-chart-2">97.5%</Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded">
                    <span className="text-sm font-medium">Under Maintenance</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">3/160</span>
                      <Badge className="bg-chart-3/10 text-chart-3">1.9%</Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded">
                    <span className="text-sm font-medium">Out of Service</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">1/160</span>
                      <Badge className="bg-chart-4/10 text-chart-4">0.6%</Badge>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-muted/50 rounded">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-chart-3" />
                      <span className="text-sm font-medium">Maintenance Due</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      7 devices require scheduled maintenance within 48 hours
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-3 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                    <p className="text-2xl font-bold">{formatCurrency(3120000)}</p>
                    <p className="text-xs text-chart-2 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      +4.7% from last month
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Operating Expenses</p>
                    <p className="text-2xl font-bold">{formatCurrency(2280000)}</p>
                    <p className="text-xs text-chart-3 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      +3.5% from last month
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Net Profit</p>
                    <p className="text-2xl font-bold">{formatCurrency(840000)}</p>
                    <p className="text-xs text-chart-2 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      +7.7% from last month
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Financial Performance</CardTitle>
              <CardDescription>Revenue, expenses, and profit trends over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={financialData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value) => formatCurrency(value)}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(var(--chart-2))"
                      fill="hsl(var(--chart-2))"
                      fillOpacity={0.3}
                    />
                    <Area
                      type="monotone"
                      dataKey="expenses"
                      stroke="hsl(var(--chart-4))"
                      fill="hsl(var(--chart-4))"
                      fillOpacity={0.3}
                    />
                    <Area
                      type="monotone"
                      dataKey="profit"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Department</CardTitle>
                <CardDescription>Monthly revenue breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={departmentMetrics}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="department" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Bar dataKey="revenue" fill="hsl(var(--chart-2))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Analysis</CardTitle>
                <CardDescription>Operating expense breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Personnel (65%)</span>
                    <span className="text-sm font-bold">{formatCurrency(1482000)}</span>
                  </div>
                  <Progress value={65} className="h-2" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Medical Supplies (20%)</span>
                    <span className="text-sm font-bold">{formatCurrency(456000)}</span>
                  </div>
                  <Progress value={20} className="h-2" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Equipment (10%)</span>
                    <span className="text-sm font-bold">{formatCurrency(228000)}</span>
                  </div>
                  <Progress value={10} className="h-2" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Other (5%)</span>
                    <span className="text-sm font-bold">{formatCurrency(114000)}</span>
                  </div>
                  <Progress value={5} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
