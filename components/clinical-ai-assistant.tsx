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

// NOTE: The interfaces for AI responses remain the same.

import { useEffect } from "react"

type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED"

function useAITask(taskId: string | null) {
  const [status, setStatus] = useState<TaskStatus | null>(null)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!taskId) return

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
        }
      } catch (e) {
        clearInterval(intervalId)
        setError((e as Error).message)
        setStatus("FAILED")
        toast.error("Error polling for task status.")
      }
    }, 3000) // Poll every 3 seconds

    const timeoutId = setTimeout(() => {
        clearInterval(intervalId);
        if (status !== 'COMPLETED' && status !== 'FAILED') {
            setStatus('FAILED');
            setError('Task timed out.');
            toast.error('Task timed out after 2 minutes.');
        }
    }, 120000); // 2 minute timeout

    return () => {
        clearInterval(intervalId)
        clearTimeout(timeoutId)
    }
  }, [taskId])

  return { status, result, error, setStatus }
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
  const [bp, setBp] = useState("")
  const [hr, setHr] = useState("")
  const [temp, setTemp] = useState("")
  const [rr, setRr] = useState("")
  const [newMedication, setNewMedication] = useState("")

  const [assessmentTaskId, setAssessmentTaskId] = useState<string | null>(null)
  const { status: assessmentStatus, result: assessmentResult, error: assessmentError, setStatus: setAssessmentStatus } = useAITask(assessmentTaskId)

  const [drugInteractionTaskId, setDrugInteractionTaskId] = useState<string | null>(null)
  const { status: drugInteractionStatus, result: drugInteractionResult, error: drugInteractionError, setStatus: setDrugInteractionStatus } = useAITask(drugInteractionTaskId)

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
            vitals: { bp, hr, temp, rr },
            medicalHistory: medicalHistory.split(",").map((h) => h.trim()),
            currentMedications: currentMedications.split(",").map((m) => m.trim()),
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "An unknown error occurred." }))
        throw new Error(errorData.error || "Failed to generate assessment.")
      }
      const result = await response.json()
      setAssessment(result.assessment)
      toast.success("AI Assessment generated successfully.")
    } catch (error) {
      console.error("Error:", error)
      toast.error(error.message || "An error occurred while generating the assessment.")
    } finally {
      setLoading(false)
    }
  }

  const handleDiagnosticAssistance = async () => {
    if (!selectedPatient) {
      toast.error("Please load a patient before getting diagnostic assistance.")
      return
    }
    setLoading(true)
    setDiagnosticSuggestions("")
    try {
      const response = await fetch("/api/clinical-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "diagnostic_assistance",
          data: {
            symptoms: symptoms.split(",").map(s => s.trim()),
            patientHistory: medicalHistory,
          },
        }),
      })
      if (!response.ok) throw new Error("Failed to get diagnostic assistance.")

      const reader = response.body?.getReader()
      if (!reader) throw new Error("No response body")

      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        setDiagnosticSuggestions((prev) => prev + chunk)
      }
      toast.success("Diagnostic suggestions generated.")
    } catch (error) {
      console.error("Error:", error)
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDrugInteractionCheck = async () => {
    if (!selectedPatient || !newMedication) {
      toast.error("Please load a patient and enter a new medication to check.")
      return
    }
    setLoading(true)
    setDrugInteractions(null)
    try {
      const response = await fetch("/api/clinical-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "drug_interaction",
          data: {
            medications: currentMedications.split(",").map(m => m.trim()),
            newMedication: newMedication,
          },
        }),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "An unknown error occurred." }))
        throw new Error(errorData.error || "Failed to check drug interactions.")
      }
      const result = await response.json()
      setDrugInteractions(result.interactions)
      toast.success("Drug interaction check complete.")
    } catch (error) {
      console.error("Error:", error)
      toast.error(error.message || "An error occurred while checking interactions.")
    } finally {
      setLoading(false)
    }
  }

  const handleExportAssessment = () => {
    if (!assessment) {
      toast.error("No assessment to export.")
      return
    }
    const assessmentString = JSON.stringify(assessment, null, 2)
    const blob = new Blob([assessmentString], { type: "application/json;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `Clinical-Assessment-${selectedPatient?.medicalRecordNumber || 'patient'}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success("Assessment exported as a JSON file.")
  }

  // Other handlers (handleDrugInteractionCheck, handleDiagnosticAssistance) would be refactored similarly

  const isDrugInteractionRunning = drugInteractionStatus === 'PENDING' || drugInteractionStatus === 'IN_PROGRESS'

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
                <Label>Vital Signs</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Input value={bp} onChange={(e) => setBp(e.target.value)} placeholder="BP (e.g., 120/80)" disabled={!selectedPatient} />
                  <Input value={hr} onChange={(e) => setHr(e.target.value)} placeholder="HR (e.g., 72 bpm)" disabled={!selectedPatient} />
                  <Input value={temp} onChange={(e) => setTemp(e.target.value)} placeholder="Temp (e.g., 98.6°F)" disabled={!selectedPatient} />
                  <Input value={rr} onChange={(e) => setRr(e.target.value)} placeholder="RR (e.g., 16)" disabled={!selectedPatient} />
                </div>
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
          {assessment && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>AI Assessment Results</CardTitle>
                  <Button variant="outline" size="sm" onClick={handleExportAssessment}>
                    Export as JSON
                  </Button>
                </div>
                <CardDescription>
                  Based on the provided data, the AI suggests the following:
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert variant={
                    assessment.riskLevel === 'critical' ? 'destructive' :
                    assessment.riskLevel === 'high' ? 'destructive' :
                    assessment.riskLevel === 'medium' ? 'default' :
                    'default'
                }>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Risk Level: {assessment.riskLevel.toUpperCase()}</AlertTitle>
                </Alert>

                <div>
                  <h4 className="font-semibold">Primary Concerns:</h4>
                  <ul className="list-disc list-inside">
                    {assessment.primaryConcerns.map((concern, i) => <li key={i}>{concern}</li>)}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold">Recommendations:</h4>
                  {assessment.recommendations.map((rec, i) => (
                    <div key={i} className="p-2 mt-2 border rounded-lg">
                      <p><strong>Action:</strong> {rec.action} <Badge variant="secondary">{rec.priority}</Badge></p>
                      <p className="text-sm text-muted-foreground">{rec.rationale}</p>
                    </div>
                  ))}
                </div>

                <div>
                  <h4 className="font-semibold">Differential Diagnosis:</h4>
                  {assessment.differentialDiagnosis.map((diag, i) => (
                     <div key={i} className="p-2 mt-2 border rounded-lg">
                      <p><strong>Condition:</strong> {diag.condition} <Badge variant="outline">{diag.probability}</Badge></p>
                      <p className="text-sm">Supporting Factors: {diag.supportingFactors.join(', ')}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="interactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Drug Interaction Checker</CardTitle>
              <CardDescription>Check for interactions between the patient's current medications and a new one.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Current Medications (Loaded)</Label>
                <Textarea value={currentMedications} readOnly className="bg-muted/50" rows={2} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-medication">New Medication to Check</Label>
                <Input
                  id="new-medication"
                  value={newMedication}
                  onChange={(e) => setNewMedication(e.target.value)}
                  placeholder="e.g., Lisinopril"
                  disabled={!selectedPatient}
                />
              </div>
              <Button onClick={handleDrugInteractionCheck} disabled={loading || !selectedPatient} className="w-full">
                {loading ? "Checking..." : "Check for Interactions"}
              </Button>
            </CardContent>
          </Card>
          {drugInteractions && (
            <Card>
              <CardHeader>
                <CardTitle>Interaction Results</CardTitle>
              </CardHeader>
              <CardContent>
                {drugInteractions.interactions.length === 0 ? (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>No significant interactions found.</AlertTitle>
                  </Alert>
                ) : (
                  <div className="space-y-4">
                    {drugInteractions.interactions.map((interaction, i) => (
                      <div key={i} className="p-3 border rounded-lg">
                        <h4 className="font-semibold flex items-center">
                          <AlertTriangle className="w-5 h-5 mr-2 text-destructive" />
                          Interaction: {interaction.drug1} & {interaction.drug2}
                          <Badge variant="destructive" className="ml-auto">{interaction.severity}</Badge>
                        </h4>
                        <p className="mt-2"><strong>Description:</strong> {interaction.description}</p>
                        <p><strong>Management:</strong> {interaction.management}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="diagnostics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Diagnostic Assistance</CardTitle>
              <CardDescription>Use patient data to generate diagnostic suggestions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This tool uses the patient's loaded medical history and current symptoms to suggest potential diagnoses.
              </p>
              <Button onClick={handleDiagnosticAssistance} disabled={loading || !selectedPatient} className="w-full">
                {loading ? "Getting Suggestions..." : "Get Diagnostic Assistance"}
              </Button>
            </CardContent>
          </Card>

          {diagnosticSuggestions && (
            <Card>
              <CardHeader>
                <CardTitle>Diagnostic Suggestions</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap text-sm font-mono bg-muted/50 p-4 rounded-lg">
                  {diagnosticSuggestions}
                </pre>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}