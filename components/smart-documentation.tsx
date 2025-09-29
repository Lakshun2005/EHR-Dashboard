"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  FileText,
  Mic,
  MicOff,
  Download,
  Copy,
  Save,
  Loader2,
  Brain,
  ClipboardList,
  FileCheck,
  MessageSquare,
  Sparkles,
  Search,
  User,
} from "lucide-react"
import { toast } from "sonner"

// NOTE: Template data remains the same.

export function SmartDocumentation() {
  const [activeTab, setActiveTab] = useState("generate")
  const [loading, setLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [generatedNote, setGeneratedNote] = useState("")

  // Patient loading state
  const [patientMrn, setPatientMrn] = useState("")
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [isFetchingPatient, setIsFetchingPatient] = useState(false)

  // Form states - now populated from selectedPatient
  const [chiefComplaint, setChiefComplaint] = useState("")
  const [symptoms, setSymptoms] = useState("")
  const [vitals, setVitals] = useState("")
  const [examination, setExamination] = useState("")
  const [diagnosis, setDiagnosis] = useState("")
  const [treatment, setTreatment] = useState("")

  const handleFetchPatient = async () => {
    if (!patientMrn) {
      toast.info("Please enter a Patient MRN.")
      return
    }
    setIsFetchingPatient(true)
    try {
      const searchResponse = await fetch(`/api/patients?searchTerm=${patientMrn}`)
      if (!searchResponse.ok) throw new Error("Failed to search for patient.")
      const searchResults = await searchResponse.json()

      if (searchResults.length === 0) {
        toast.error("Patient not found", { description: `No patient found with MRN: ${patientMrn}` })
        return
      }

      const patientSummary = searchResults[0]
      const patientResponse = await fetch(`/api/patients/${patientSummary.id}`)
      if (!patientResponse.ok) throw new Error("Failed to fetch full patient details.")
      const patientData = await patientResponse.json()

      setSelectedPatient(patientData)
      toast.success(`Loaded data for ${patientData.firstName} ${patientData.lastName}`)

    } catch (error) {
      console.error(error)
      toast.error(error.message)
      setSelectedPatient(null)
    } finally {
      setIsFetchingPatient(false)
    }
  }

  const handleGenerateNote = async () => {
    if (!selectedPatient) {
        toast.error("Please load a patient before generating a note.")
        return
    }
    setLoading(true)
    try {
      const response = await fetch("/api/documentation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "generate_soap_note",
          data: {
            patientInfo: {
              name: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
              age: new Date().getFullYear() - new Date(selectedPatient.dateOfBirth).getFullYear(),
              gender: selectedPatient.gender,
              mrn: selectedPatient.medicalRecordNumber,
            },
            visitDetails: {
              date: new Date().toISOString().split("T")[0],
              type: "Office Visit",
              chiefComplaint: chiefComplaint,
            },
            symptoms,
            vitals: vitals ? JSON.parse(vitals) : {},
            examination,
            diagnosis,
            treatment,
          },
        }),
      })

      if (!response.ok) throw new Error("Failed to generate note")
      const result = await response.text()
      setGeneratedNote(result)
      toast.success("SOAP Note Generated")
    } catch (error) {
      console.error("Error:", error)
      toast.error("Failed to generate SOAP note")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveNote = async () => {
    if (!generatedNote || !selectedPatient) {
      toast.error("No note to save or no patient selected.")
      return
    }
    setIsSaving(true)
    try {
        const response = await fetch('/api/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: 'AI Generated SOAP Note',
                content: generatedNote,
                noteType: 'SOAP',
                patientId: selectedPatient.id,
                // authorId is now handled by the server
            })
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Failed to save note.')
        }

        toast.success("Clinical note saved successfully.")
        setGeneratedNote("") // Clear the note after saving
    } catch (error) {
        toast.error(error.message)
    } finally {
        setIsSaving(false)
    }
  }

  // ... (Other handlers like handleCopyNote, handleVoiceTranscription, etc. would be here)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        {/* Header */}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Load Patient Data</CardTitle>
          <CardDescription>Enter a patient's MRN to populate the documentation form.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-2">
          <Input
            id="patient-mrn-doc"
            value={patientMrn}
            onChange={(e) => setPatientMrn(e.target.value)}
            placeholder="Enter Patient MRN"
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
            </Alert>
          </CardContent>
        )}
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="generate">Generate Notes</TabsTrigger>
          {/* Other triggers */}
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Clinical Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="space-y-2">
                  <Label htmlFor="chief-complaint">Chief Complaint</Label>
                  <Input id="chief-complaint" value={chiefComplaint} onChange={(e) => setChiefComplaint(e.target.value)} placeholder="Patient's main concern" disabled={!selectedPatient} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="symptoms">Symptoms</Label>
                  <Textarea id="symptoms" value={symptoms} onChange={(e) => setSymptoms(e.target.value)} placeholder="Patient reported symptoms..." rows={3} disabled={!selectedPatient} />
                </div>
              </CardContent>
            </Card>
            {/* Other form cards */}
          </div>
          <Button onClick={handleGenerateNote} disabled={loading || !selectedPatient} className="w-full">
            {loading ? "Generating..." : "Generate SOAP Note"}
          </Button>
        </TabsContent>
        {/* Other TabsContent */}
      </Tabs>

      {generatedNote && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Generated Clinical Note</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(generatedNote)}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <Button variant="default" size="sm" onClick={handleSaveNote} disabled={isSaving}>
                  {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save to Record
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 p-4 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm font-mono">{generatedNote}</pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}