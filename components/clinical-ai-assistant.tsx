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
  Search,
  User,
} from "lucide-react"
import { toast } from "sonner"

import { Download } from "lucide-react"

// NOTE: The interfaces for AI responses remain the same.

import { useEffect } from "react"

type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED"

function useAITask(taskId: string | null) {
  const [status, setStatus] = useState<TaskStatus | null>(null)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!taskId) {
      setStatus(null)
      return
    }

    setStatus("PENDING")
    setResult(null)
    setError(null)

    const intervalId = setInterval(async () => {
      try {
        const response = await fetch(`/api/tasks/${taskId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch task status.")
        }
        const task = await response.json()

        if (task.status === "COMPLETED" || task.status === "FAILED") {
          clearInterval(intervalId)
          setStatus(task.status)
          if (task.status === "COMPLETED") {
            setResult(task.output)
            toast.success("AI task completed successfully.")
          } else {
            setError(task.error)
            toast.error("AI task failed.", { description: task.error })
          }
        } else {
          setStatus(task.status) // Keep updating status for IN_PROGRESS
        }
      } catch (e) {
        clearInterval(intervalId)
        setError((e as Error).message)
        setStatus("FAILED")
        toast.error("Error polling for task status.")
      }
    }, 3000) // Poll every 3 seconds

    // Timeout to prevent infinite polling
    const timeoutId = setTimeout(() => {
      clearInterval(intervalId)
      setStatus(currentStatus => {
        if (currentStatus !== "COMPLETED" && currentStatus !== "FAILED") {
          setError("Task timed out after 2 minutes.")
          toast.error("Task timed out.")
          return "FAILED"
        }
        return currentStatus
      })
    }, 120000)

    return () => {
      clearInterval(intervalId)
      clearTimeout(timeoutId)
    }
  }, [taskId])

  return { status, result, error, setStatus }
}

function TaskStatusDisplay({ status, error, result, taskName, ResultComponent, patient }) {
  if (!status) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>{taskName} Status</CardTitle>
      </CardHeader>
      <CardContent>
        {status === "PENDING" && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Task is pending...</span>
          </div>
        )}
        {status === "IN_PROGRESS" && (
          <div className="flex items-center gap-2 text-blue-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Task is in progress...</span>
          </div>
        )}
        {status === "COMPLETED" && result && (
          <div>
            <div className="flex items-center gap-2 text-green-600 mb-4">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">Task completed successfully.</span>
            </div>
            <ResultComponent result={result} patient={patient} />
          </div>
        )}
        {status === "FAILED" && (
          <div className="flex items-center gap-2 text-red-600">
            <XCircle className="w-5 h-5" />
            <span>
              Task failed: {error || "An unknown error occurred."}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function AssessmentResultDisplay({ result, patient }) {
  const handleDownload = () => {
    if (!result) {
      toast.error("No assessment data to download.");
      return;
    }
    const content = JSON.stringify(result, null, 2);
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const patientIdentifier = patient?.medicalRecordNumber || patient?.id || "assessment";
    link.download = `clinical-assessment-${patientIdentifier}-${new Date().toISOString()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Assessment download started.");
  }

  const riskColor = {
    low: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-orange-100 text-orange-800",
    critical: "bg-red-100 text-red-800",
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-foreground">Clinical Assessment</h3>
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="w-4 h-4 mr-2" />
          Download JSON
        </Button>
      </div>
      <Alert variant={result.riskLevel}>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Overall Risk Level: {result.riskLevel.toUpperCase()}</AlertTitle>
        <AlertDescription>
          The patient is assessed to be at a {result.riskLevel} risk level based on the provided data.
        </AlertDescription>
      </Alert>
      {/* ... more UI for assessment results */}
    </div>
  )
}

function DrugInteractionResultDisplay({ result }) {
  const severityColor = {
    low: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800",
  }
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-foreground">Drug Interaction Analysis</h3>
      <Alert variant={result.overallRisk === 'high' ? 'destructive' : 'default'}>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Overall Interaction Risk: {result.overallRisk.toUpperCase()}</AlertTitle>
      </Alert>
      {/* ... more UI for drug interaction results */}
    </div>
  )
}


export function ClinicalAIAssistant() {
  const [activeTab, setActiveTab] = useState("assessment")
  const [assessment, setAssessment] = useState(null)
  const [drugInteractions, setDrugInteractions] = useState(null)

  const [patientMrn, setPatientMrn] = useState("")
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [isFetchingPatient, setIsFetchingPatient] = useState(false)

  const [symptoms, setSymptoms] = useState("")
  const [medicalHistory, setMedicalHistory] = useState("")
  const [currentMedications, setCurrentMedications] = useState("")
  const [vitals, setVitals] = useState("")
  const [newMedication, setNewMedication] = useState("")

  const [assessmentTaskId, setAssessmentTaskId] = useState<string | null>(null)
  const { status: assessmentStatus, result: assessmentResult, error: assessmentError, setStatus: setAssessmentStatus } = useAITask(assessmentTaskId)

  const [drugInteractionTaskId, setDrugInteractionTaskId] = useState<string | null>(null)
  const { status: drugInteractionStatus, result: drugInteractionResult, error: drugInteractionError, setStatus: setDrugInteractionStatus } = useAITask(drugInteractionTaskId)

  const [diagnosticPrompt, setDiagnosticPrompt] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [diagnosticStream, setDiagnosticStream] = useState("")

  useEffect(() => {
    if (assessmentResult) {
      setAssessment(assessmentResult)
    }
  }, [assessmentResult])

  useEffect(() => {
    if (drugInteractionResult) {
      setDrugInteractions(drugInteractionResult)
    }
  }, [drugInteractionResult])

  const handleFetchPatient = async () => {
    if (!patientMrn) {
      toast.info("Please enter a Patient MRN.")
      return
    }
    setIsFetchingPatient(true)
    try {
      const searchResponse = await fetch(`/api/patients?searchTerm=${patientMrn}&limit=1`)
      if (!searchResponse.ok) throw new Error("Failed to search for patient.")
      const { data } = await searchResponse.json()

      if (data.length === 0) {
        toast.error("Patient not found", { description: `No patient found with MRN: ${patientMrn}` })
        return
      }

      const patientSummary = data[0]
      const patientResponse = await fetch(`/api/patients/${patientSummary.id}`)
      if (!patientResponse.ok) throw new Error("Failed to fetch full patient details.")
      const patientData = await patientResponse.json()

      setSelectedPatient(patientData)
      toast.success(`Loaded data for ${patientData.firstName} ${patientData.lastName}`)

      setMedicalHistory(patientData.medicalHistory?.map((h: any) => h.diagnosis).join(', ') || "")
      setCurrentMedications(patientData.medications?.map((m: any) => `${m.name} ${m.dosage}`).join(', ') || "")
      setVitals(patientData.vitalSigns?.slice(-1).map((v: any) => JSON.stringify({ bp: v.bloodPressure, hr: v.heartRate, temp: v.temperature }))[0] || '{"bp": "N/A", "hr": "N/A"}')
      setSymptoms("Fever, cough")

    } catch (error) {
      console.error(error)
      toast.error((error as Error).message)
      setSelectedPatient(null)
    } finally {
      setIsFetchingPatient(false)
    }
  }

  const handleAIAssessment = async () => {
    if (!selectedPatient) {
      toast.error("Please load a patient before running an assessment.")
      return
    }
    setAssessment(null)
    setAssessmentTaskId(null)
    setAssessmentStatus('PENDING')

    try {
      const response = await fetch("/api/clinical-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "clinical_assessment",
          data: {
            patientData: {
              age: new Date().getFullYear() - new Date(selectedPatient.dateOfBirth).getFullYear(),
              gender: selectedPatient.gender,
            },
            symptoms: symptoms.split(",").map((s) => s.trim()),
            vitals: vitals ? JSON.parse(vitals) : {},
            medicalHistory: medicalHistory.split(",").map((h) => h.trim()),
            currentMedications: currentMedications.split(",").map((m) => m.trim()),
          },
        }),
      })
      if (response.status !== 202) {
        throw new Error("Failed to start AI assessment task.")
      }
      const { taskId } = await response.json()
      setAssessmentTaskId(taskId)
      toast.info("AI assessment started.", { description: "You will be notified upon completion." })
    } catch (error) {
      console.error("Error:", error)
      toast.error((error as Error).message)
      setAssessmentStatus('FAILED')
    }
  }

  const isAssessmentRunning = assessmentStatus === 'PENDING' || assessmentStatus === 'IN_PROGRESS'

  const handleDrugInteractionCheck = async () => {
    if (!selectedPatient) {
      toast.error("Please load a patient first.")
      return
    }
    if (!newMedication) {
      toast.error("Please enter a new medication to check.")
      return
    }
    setDrugInteractions(null)
    setDrugInteractionTaskId(null)
    setDrugInteractionStatus('PENDING')

    try {
      const response = await fetch("/api/clinical-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "drug_interaction",
          data: {
            medications: currentMedications.split(",").map(m => m.trim()),
            newMedication,
          },
        }),
      })
      if (response.status !== 202) {
        throw new Error("Failed to start drug interaction task.")
      }
      const { taskId } = await response.json()
      setDrugInteractionTaskId(taskId)
      toast.info("Drug interaction check started.")
    } catch (error) {
      console.error("Error:", error)
      toast.error((error as Error).message)
      setDrugInteractionStatus('FAILED')
    }
  }

  const isDrugInteractionRunning = drugInteractionStatus === 'PENDING' || drugInteractionStatus === 'IN_PROGRESS'

  const handleDiagnosticAnalysis = async () => {
    setIsStreaming(true)
    setDiagnosticStream("")
    try {
      const response = await fetch("/api/clinical-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "diagnostic_assistance",
          data: {
            patientHistory: medicalHistory,
            symptoms: diagnosticPrompt,
          },
        }),
      })

      if (!response.body) {
        throw new Error("No response body")
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        setDiagnosticStream((prev) => prev + decoder.decode(value))
      }
    } catch (error) {
      toast.error("Failed to get diagnostic analysis.")
    } finally {
      setIsStreaming(false)
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

      <Card>
        <CardHeader>
          <CardTitle>Load Patient Data</CardTitle>
          <CardDescription>Enter a patient's MRN to load their data for AI analysis.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-2">
          <Input
            id="patient-mrn"
            value={patientMrn}
            onChange={(e) => setPatientMrn(e.target.value)}
            placeholder="Enter Patient MRN (e.g., MRN...)"
          />
          <Button onClick={handleFetchPatient} disabled={isFetchingPatient}>
            {isFetchingPatient ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </Button>
        </CardContent>
        {selectedPatient && (
          <CardContent>
            <Alert>
              <User className="h-4 w-4" />
              <AlertTitle>Patient Loaded: {selectedPatient.firstName} {selectedPatient.lastName}</AlertTitle>
              <AlertDescription>
                You can now proceed with the AI assistance tools below.
              </AlertDescription>
            </Alert>
          </CardContent>
        )}
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="assessment">Clinical Assessment</TabsTrigger>
          <TabsTrigger value="interactions">Drug Interactions</TabsTrigger>
          <TabsTrigger value="diagnostics">Diagnostic Assistance</TabsTrigger>
        </TabsList>

        <TabsContent value="assessment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Clinical Assessment</CardTitle>
              <CardDescription>
                Patient data is pre-filled. Add current symptoms and vitals for an up-to-date assessment.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="symptoms">Current Symptoms</Label>
                <Textarea
                  id="symptoms"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Enter symptoms separated by commas"
                  rows={3}
                  disabled={!selectedPatient}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="history">Medical History (Loaded)</Label>
                <Textarea
                  id="history"
                  value={medicalHistory}
                  readOnly
                  className="bg-muted/50"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="medications">Current Medications (Loaded)</Label>
                <Textarea
                  id="medications"
                  value={currentMedications}
                  readOnly
                  className="bg-muted/50"
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
                  disabled={!selectedPatient}
                />
              </div>
              <Button onClick={handleAIAssessment} disabled={isAssessmentRunning || !selectedPatient} className="w-full">
                {isAssessmentRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Generate Clinical Assessment"
                )}
              </Button>
            </CardContent>
          </Card>
          <TaskStatusDisplay
            status={assessmentStatus}
            error={assessmentError}
            result={assessmentResult}
            patient={selectedPatient}
            taskName="Clinical Assessment"
            ResultComponent={AssessmentResultDisplay}
          />
        </TabsContent>

        <TabsContent value="interactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Drug Interaction Check</CardTitle>
              <CardDescription>
                Check for potential interactions between the patient's current medications and a new one.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Current Medications (Loaded)</Label>
                <Textarea value={currentMedications} readOnly className="bg-muted/50" rows={3} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-medication">New Medication</Label>
                <Input
                  id="new-medication"
                  value={newMedication}
                  onChange={(e) => setNewMedication(e.target.value)}
                  placeholder="Enter new drug name"
                  disabled={!selectedPatient}
                />
              </div>
              <Button onClick={handleDrugInteractionCheck} disabled={isDrugInteractionRunning || !selectedPatient} className="w-full">
                {isDrugInteractionRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  "Check for Interactions"
                )}
              </Button>
            </CardContent>
          </Card>
           <TaskStatusDisplay
            status={drugInteractionStatus}
            error={drugInteractionError}
            result={drugInteractionResult}
            patient={selectedPatient}
            taskName="Drug Interaction Check"
            ResultComponent={DrugInteractionResultDisplay}
          />
        </TabsContent>
        <TabsContent value="diagnostics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Diagnostic Assistance</CardTitle>
              <CardDescription>
                Describe the patient's case for AI-powered diagnostic suggestions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="diagnostic-prompt">Case Description</Label>
                <Textarea
                  id="diagnostic-prompt"
                  value={diagnosticPrompt}
                  onChange={(e) => setDiagnosticPrompt(e.target.value)}
                  placeholder="Provide a summary of the patient's symptoms, history, and findings..."
                  rows={6}
                  disabled={isStreaming}
                />
              </div>
              <Button onClick={handleDiagnosticAnalysis} disabled={isStreaming || !diagnosticPrompt} className="w-full">
                {isStreaming ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Get Diagnostic Ideas"
                )}
              </Button>
            </CardContent>
          </Card>
          {diagnosticStream && (
            <Card>
              <CardHeader>
                <CardTitle>Diagnostic Stream</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap text-sm font-mono p-4 bg-muted rounded-lg">
                  {diagnosticStream}
                </pre>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}