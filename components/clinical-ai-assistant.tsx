"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Brain,
  AlertTriangle,
  Stethoscope,
  FileText,
  Pill,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react"

interface ClinicalAssessment {
  riskLevel: "low" | "medium" | "high" | "critical"
  primaryConcerns: string[]
  recommendations: Array<{
    category: string
    priority: string
    action: string
    rationale: string
  }>
  differentialDiagnosis: Array<{
    condition: string
    probability: string
    supportingFactors: string[]
    additionalTests?: string[]
  }>
  alerts: Array<{
    type: string
    severity: string
    message: string
    action: string
  }>
}

interface DrugInteraction {
  interactions: Array<{
    drug1: string
    drug2: string
    severity: string
    description: string
    clinicalEffect: string
    management: string
    alternatives?: string[]
  }>
  overallRisk: string
  recommendations: string[]
}

export function ClinicalAIAssistant() {
  const [activeTab, setActiveTab] = useState("assessment")
  const [loading, setLoading] = useState(false)
  const [assessment, setAssessment] = useState<ClinicalAssessment | null>(null)
  const [drugInteractions, setDrugInteractions] = useState<DrugInteraction | null>(null)
  const [diagnosticSuggestions, setDiagnosticSuggestions] = useState<string>("")

  // Form states
  const [patientAge, setPatientAge] = useState("")
  const [patientGender, setPatientGender] = useState("")
  const [symptoms, setSymptoms] = useState("")
  const [medicalHistory, setMedicalHistory] = useState("")
  const [currentMedications, setCurrentMedications] = useState("")
  const [newMedication, setNewMedication] = useState("")
  const [vitals, setVitals] = useState("")

  const handleClinicalAssessment = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/clinical-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "clinical_assessment",
          data: {
            patientData: {
              age: patientAge,
              gender: patientGender,
            },
            symptoms: symptoms.split(",").map((s) => s.trim()),
            vitals: vitals ? JSON.parse(vitals) : {},
            medicalHistory: medicalHistory.split(",").map((h) => h.trim()),
            currentMedications: currentMedications.split(",").map((m) => m.trim()),
          },
        }),
      })
      const result = await response.json()
      setAssessment(result.assessment)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDrugInteractionCheck = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/clinical-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "drug_interaction",
          data: {
            medications: currentMedications.split(",").map((m) => m.trim()),
            newMedication: newMedication.trim(),
          },
        }),
      })
      const result = await response.json()
      setDrugInteractions(result.interactions)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDiagnosticAssistance = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/clinical-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "diagnostic_assistance",
          data: {
            symptoms: symptoms.split(",").map((s) => s.trim()),
            patientHistory: medicalHistory,
            labResults: null,
            imaging: null,
          },
        }),
      })
      const result = await response.json()
      setDiagnosticSuggestions(result.diagnosticSuggestions)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case "low":
        return "bg-chart-2/10 text-chart-2"
      case "medium":
        return "bg-chart-3/10 text-chart-3"
      case "high":
        return "bg-chart-4/10 text-chart-4"
      case "critical":
        return "bg-destructive/10 text-destructive"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "low":
        return <CheckCircle className="w-4 h-4 text-chart-2" />
      case "medium":
        return <Clock className="w-4 h-4 text-chart-3" />
      case "high":
        return <AlertTriangle className="w-4 h-4 text-chart-4" />
      case "critical":
        return <XCircle className="w-4 h-4 text-destructive" />
      default:
        return <CheckCircle className="w-4 h-4 text-muted-foreground" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <Brain className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-foreground">AI Clinical Decision Support</h2>
          <p className="text-muted-foreground">Intelligent assistance for clinical decision making</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="assessment" className="flex items-center gap-2">
            <Stethoscope className="w-4 h-4" />
            Clinical Assessment
          </TabsTrigger>
          <TabsTrigger value="interactions" className="flex items-center gap-2">
            <Pill className="w-4 h-4" />
            Drug Interactions
          </TabsTrigger>
          <TabsTrigger value="diagnostics" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Diagnostic Assistance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assessment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Patient Information & Clinical Assessment</CardTitle>
              <CardDescription>
                Enter patient data to receive AI-powered clinical insights and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Patient Age</Label>
                  <Input
                    id="age"
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value)}
                    placeholder="e.g., 45"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Input
                    id="gender"
                    value={patientGender}
                    onChange={(e) => setPatientGender(e.target.value)}
                    placeholder="e.g., Male, Female"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="symptoms">Current Symptoms</Label>
                <Textarea
                  id="symptoms"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Enter symptoms separated by commas (e.g., chest pain, shortness of breath, fatigue)"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="history">Medical History</Label>
                <Textarea
                  id="history"
                  value={medicalHistory}
                  onChange={(e) => setMedicalHistory(e.target.value)}
                  placeholder="Enter medical conditions separated by commas (e.g., hypertension, diabetes, asthma)"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="medications">Current Medications</Label>
                <Textarea
                  id="medications"
                  value={currentMedications}
                  onChange={(e) => setCurrentMedications(e.target.value)}
                  placeholder="Enter medications separated by commas (e.g., lisinopril 10mg, metformin 500mg)"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vitals">Vital Signs (JSON format)</Label>
                <Textarea
                  id="vitals"
                  value={vitals}
                  onChange={(e) => setVitals(e.target.value)}
                  placeholder='{"bp_systolic": 140, "bp_diastolic": 90, "heart_rate": 85, "temperature": 98.6}'
                  rows={2}
                />
              </div>

              <Button onClick={handleClinicalAssessment} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Generate Clinical Assessment
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {assessment && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Risk Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className={getRiskLevelColor(assessment.riskLevel)}>
                    {assessment.riskLevel.toUpperCase()} RISK
                  </Badge>
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Primary Concerns:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {assessment.primaryConcerns.map((concern, index) => (
                        <li key={index} className="text-sm text-muted-foreground">
                          {concern}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {assessment.alerts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="w-5 h-5" />
                      Clinical Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {assessment.alerts.map((alert, index) => (
                      <Alert key={index} className="border-destructive/20">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle className="flex items-center gap-2">
                          {getSeverityIcon(alert.severity)}
                          {alert.type.replace("_", " ").toUpperCase()}
                        </AlertTitle>
                        <AlertDescription>
                          <p className="mb-2">{alert.message}</p>
                          <p className="text-sm font-medium">Action: {alert.action}</p>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Clinical Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {assessment.recommendations.map((rec, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className={getRiskLevelColor(rec.priority)}>
                          {rec.priority}
                        </Badge>
                        <Badge variant="secondary">{rec.category}</Badge>
                      </div>
                      <h4 className="font-medium mb-1">{rec.action}</h4>
                      <p className="text-sm text-muted-foreground">{rec.rationale}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Differential Diagnosis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {assessment.differentialDiagnosis.map((diagnosis, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{diagnosis.condition}</h4>
                        <Badge className={getRiskLevelColor(diagnosis.probability)}>
                          {diagnosis.probability} probability
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-medium">Supporting Factors:</p>
                          <ul className="list-disc list-inside text-sm text-muted-foreground">
                            {diagnosis.supportingFactors.map((factor, idx) => (
                              <li key={idx}>{factor}</li>
                            ))}
                          </ul>
                        </div>
                        {diagnosis.additionalTests && diagnosis.additionalTests.length > 0 && (
                          <div>
                            <p className="text-sm font-medium">Recommended Tests:</p>
                            <ul className="list-disc list-inside text-sm text-muted-foreground">
                              {diagnosis.additionalTests.map((test, idx) => (
                                <li key={idx}>{test}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="interactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Drug Interaction Checker</CardTitle>
              <CardDescription>Check for potential interactions between medications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-meds">Current Medications</Label>
                <Textarea
                  id="current-meds"
                  value={currentMedications}
                  onChange={(e) => setCurrentMedications(e.target.value)}
                  placeholder="Enter current medications separated by commas"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-med">New Medication to Check</Label>
                <Input
                  id="new-med"
                  value={newMedication}
                  onChange={(e) => setNewMedication(e.target.value)}
                  placeholder="Enter new medication name"
                />
              </div>

              <Button onClick={handleDrugInteractionCheck} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Checking Interactions...
                  </>
                ) : (
                  <>
                    <Pill className="w-4 h-4 mr-2" />
                    Check Drug Interactions
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {drugInteractions && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Overall Risk Level
                    <Badge className={getRiskLevelColor(drugInteractions.overallRisk)}>
                      {drugInteractions.overallRisk.toUpperCase()}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h4 className="font-medium">Recommendations:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {drugInteractions.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-muted-foreground">
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {drugInteractions.interactions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Detected Interactions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {drugInteractions.interactions.map((interaction, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getRiskLevelColor(interaction.severity)}>
                            {interaction.severity.toUpperCase()}
                          </Badge>
                          <span className="font-medium">
                            {interaction.drug1} + {interaction.drug2}
                          </span>
                        </div>
                        <p className="text-sm mb-2">{interaction.description}</p>
                        <div className="space-y-1">
                          <p className="text-sm">
                            <strong>Clinical Effect:</strong> {interaction.clinicalEffect}
                          </p>
                          <p className="text-sm">
                            <strong>Management:</strong> {interaction.management}
                          </p>
                          {interaction.alternatives && interaction.alternatives.length > 0 && (
                            <p className="text-sm">
                              <strong>Alternatives:</strong> {interaction.alternatives.join(", ")}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="diagnostics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Diagnostic Assistance</CardTitle>
              <CardDescription>Get AI-powered diagnostic suggestions based on patient presentation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="diagnostic-symptoms">Symptoms</Label>
                <Textarea
                  id="diagnostic-symptoms"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Describe patient symptoms in detail"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="diagnostic-history">Patient History</Label>
                <Textarea
                  id="diagnostic-history"
                  value={medicalHistory}
                  onChange={(e) => setMedicalHistory(e.target.value)}
                  placeholder="Relevant medical history, family history, social history"
                  rows={3}
                />
              </div>

              <Button onClick={handleDiagnosticAssistance} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Get Diagnostic Suggestions
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {diagnosticSuggestions && (
            <Card>
              <CardHeader>
                <CardTitle>Diagnostic Suggestions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap text-sm">{diagnosticSuggestions}</pre>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
