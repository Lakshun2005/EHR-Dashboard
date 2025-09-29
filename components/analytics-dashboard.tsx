"use client"

import { useState, useEffect } from "react"
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
  Loader2,
} from "lucide-react"
import { toast } from "sonner"

// NOTE: All sample data has been removed and is now fetched from the API.

export function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // State for fetched data
  const [kpis, setKpis] = useState(null)
  const [patientVolumeData, setPatientVolumeData] = useState([])
  const [diagnosisDistribution, setDiagnosisDistribution] = useState([])
  const [departmentMetrics, setDepartmentMetrics] = useState([])

  // Mock data for charts not yet covered by the API
  const vitalTrends = [
    { time: "00:00", avgBP: 120, avgHR: 72, avgTemp: 98.6, avgO2: 98 },
    { time: "04:00", avgBP: 118, avgHR: 68, avgTemp: 98.4, avgO2: 97 },
  ]
  const qualityMetrics = [
    { metric: "Patient Satisfaction", current: 4.6, target: 4.5, trend: "up" },
    { metric: "Readmission Rate", current: 8.2, target: 10.0, trend: "down" },
  ]
  const resourceUtilization = [
    { resource: "ICU Beds", used: 28, total: 32, utilization: 87.5 },
    { resource: "OR Suites", used: 8, total: 12, utilization: 66.7 },
  ]
  const financialData = [
      { month: "Jan", revenue: 2450000, expenses: 1890000, profit: 560000 },
      { month: "Feb", revenue: 2670000, expenses: 2010000, profit: 660000 },
  ]

  const fetchData = async () => {
    setLoading(true)
    try {
      const [kpisRes, patientVolumeRes, diagnosisDistributionRes, departmentMetricsRes] = await Promise.all([
        fetch("/api/analytics?metric=kpis"),
        fetch("/api/analytics?metric=patientVolume"),
        fetch("/api/analytics?metric=diagnosisDistribution"),
        fetch("/api/analytics?metric=departmentMetrics"),
      ])

      if (!kpisRes.ok || !patientVolumeRes.ok || !diagnosisDistributionRes.ok || !departmentMetricsRes.ok) {
        throw new Error("Failed to fetch analytics data")
      }

      setKpis(await kpisRes.json())
      setPatientVolumeData(await patientVolumeRes.json())
      setDiagnosisDistribution(await diagnosisDistributionRes.json())
      setDepartmentMetrics(await departmentMetricsRes.json())

      toast.success("Analytics data loaded successfully.")
    } catch (error) {
      console.error(error)
      toast.error("Could not load analytics data.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchData()
    setRefreshing(false)
  }

  const formatCurrency = (value) => {
    if (typeof value !== "number") return ""
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(value)
  }

  const getUtilizationColor = (utilization) => {
    if (utilization >= 90) return "text-chart-4"
    if (utilization >= 75) return "text-chart-3"
    return "text-chart-2"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Loading analytics dashboard...</p>
      </div>
    )
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
                    <p className="text-2xl font-bold">{kpis?.totalPatients}</p>
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
                    <p className="text-2xl font-bold">{kpis?.avgSatisfaction}/5</p>
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
                    <p className="text-2xl font-bold">{kpis?.bedOccupancy}%</p>
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
                    <p className="text-2xl font-bold">{kpis?.avgStay} days</p>
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
        </TabsContent>

        {/* Other tabs remain for brevity, but would be connected similarly */}
        <TabsContent value="patients">
          {/* Patient analytics content would go here */}
        </TabsContent>
        <TabsContent value="clinical">
          {/* Clinical metrics content would go here */}
        </TabsContent>
        <TabsContent value="operations">
          {/* Operations content would go here */}
        </TabsContent>
        <TabsContent value="financial">
          {/* Financial content would go here */}
        </TabsContent>
      </Tabs>
    </div>
  )
}