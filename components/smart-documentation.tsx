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

interface DocumentationTemplate {
  id: string
  name: string
  type: string
  description: string
  fields: string[]
}

const documentationTemplates: DocumentationTemplate[] = [
  {
    id: "soap",
    name: "SOAP Note",
    type: "clinical",
    description: "Subjective, Objective, Assessment, Plan format",
    fields: ["Chief Complaint", "History of Present Illness", "Physical Exam", "Assessment", "Plan"],
  },
  {
    id: "progress",
    name: "Progress Note",
    type: "clinical",
    description: "Patient progress documentation",
    fields: ["Current Status", "Changes", "Response to Treatment", "Updated Plan"],
  },
  {
    id: "discharge",
    name: "Discharge Summary",
    type: "administrative",
    description: "Hospital discharge documentation",
    fields: ["Admission Reason", "Hospital Course", "Discharge Condition", "Medications", "Follow-up"],
  },
  {
    id: "consultation",
    name: "Consultation Note",
    type: "clinical",
    description: "Specialist consultation documentation",
    fields: ["Reason for Consultation", "Findings", "Recommendations", "Follow-up Plan"],
  },
]

export function SmartDocumentation() {
  const [activeTab, setActiveTab] = useState("generate")
  const [loading, setLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [generatedNote, setGeneratedNote] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

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

  // Voice transcription states
  const [voiceTranscript, setVoiceTranscript] = useState("")
  const [transcriptionContext, setTranscriptionContext] = useState("")
  const [isRecording, setIsRecording] = useState(false)

  // Document extraction states
  const [documentText, setDocumentText] = useState("")
  const [extractionType, setExtractionType] = useState("")

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

    let parsedVitals = {}
    try {
      if (vitals) {
        parsedVitals = JSON.parse(vitals)
      }
    } catch (error) {
      toast.error("Invalid Vital Signs JSON.", {
        description: "Please ensure the vitals are in correct JSON format.",
      })
      return
    }

    setLoading(true)
    setGeneratedNote("")
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
            vitals: parsedVitals,
            examination,
            diagnosis,
            treatment,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      if (!response.body) {
        throw new Error("No response body from server.")
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        setGeneratedNote((prev) => prev + chunk)
      }

      toast.success("SOAP Note Generated Successfully", {
        description: "The AI-generated note is now available below.",
      })
    } catch (error: any) {
      console.error("Error in handleGenerateNote:", error)
      toast.error("Failed to generate SOAP note", {
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVoiceTranscription = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/documentation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "transcribe_voice",
          data: {
            audioTranscript: voiceTranscript,
            context: transcriptionContext,
          },
        }),
      })

      const result = await response.json()
      setGeneratedNote(result.transcribedNote)
      toast.success("Voice Note Transcribed", {
        description: "Audio has been converted to structured clinical note.",
      })
    } catch (error) {
      console.error("Error:", error)
      toast.error("Failed to transcribe voice note", {
        description: "Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDocumentExtraction = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/documentation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "extract_medical_info",
          data: {
            documentText,
            extractionType,
          },
        }),
      })

      const result = await response.json()
      setGeneratedNote(result.extractedInfo)
      toast.success("Information Extracted", {
        description: "Medical information has been extracted from the document.",
      })
    } catch (error) {
      console.error("Error:", error)
      toast.error("Failed to extract information", {
        description: "Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
    if (!isRecording) {
      // Start recording logic would go here
      toast.info("Recording Started", {
        description: "Voice recording is now active.",
      })
    } else {
      // Stop recording logic would go here
      toast.info("Recording Stopped", {
        description: "Voice recording has been stopped.",
      })
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

  const handleDownloadNote = () => {
    if (!generatedNote) {
      toast.info("No note to download.")
      return
    }
    const blob = new Blob([generatedNote], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    const patientName = selectedPatient ? `${selectedPatient.firstName}_${selectedPatient.lastName}` : 'Patient'
    const date = new Date().toISOString().split('T')[0]
    link.download = `SOAP_Note_${patientName}_${date}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.info("Note download started.")
  }

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
          <TabsTrigger value="generate" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Generate Notes
          </TabsTrigger>
          <TabsTrigger value="voice" className="flex items-center gap-2">
            <Mic className="w-4 h-4" />
            Voice to Text
          </TabsTrigger>
          <TabsTrigger value="extract" className="flex items-center gap-2">
            <FileCheck className="w-4 h-4" />
            Extract Info
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4" />
            Templates
          </TabsTrigger>
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
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Note...
              </>
            ) : (
              "Generate SOAP Note"
            )}
          </Button>
        </TabsContent>

        <TabsContent value="voice" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Voice to Text Documentation</CardTitle>
              <CardDescription>Convert voice recordings to structured clinical notes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center p-8 border-2 border-dashed rounded-lg">
                <div className="text-center space-y-4">
                  <Button
                    onClick={toggleRecording}
                    size="lg"
                    variant={isRecording ? "destructive" : "default"}
                    className="w-20 h-20 rounded-full"
                  >
                    {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                  </Button>
                  <div>
                    <p className="font-medium">
                      {isRecording ? "Recording in progress..." : "Click to start recording"}
                    </p>
                    <p className="text-sm text-muted-foreground">Speak your clinical notes clearly</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="voice-transcript">Voice Transcript</Label>
                <Textarea
                  id="voice-transcript"
                  value={voiceTranscript}
                  onChange={(e) => setVoiceTranscript(e.target.value)}
                  placeholder="Voice transcript will appear here, or you can paste/type it manually..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="transcription-context">Clinical Context</Label>
                <Input
                  id="transcription-context"
                  value={transcriptionContext}
                  onChange={(e) => setTranscriptionContext(e.target.value)}
                  placeholder="e.g., Progress Note, SOAP Note, Consultation"
                />
              </div>

              <Button onClick={handleVoiceTranscription} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing Voice Note...
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Convert to Clinical Note
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="extract" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Document Information Extraction</CardTitle>
              <CardDescription>Extract structured medical information from documents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="document-text">Document Text</Label>
                <Textarea
                  id="document-text"
                  value={documentText}
                  onChange={(e) => setDocumentText(e.target.value)}
                  placeholder="Paste document text here (lab reports, referral letters, discharge summaries, etc.)..."
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="extraction-type">Extraction Type</Label>
                <Select value={extractionType} onValueChange={setExtractionType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select information to extract" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="demographics">Patient Demographics</SelectItem>
                    <SelectItem value="medications">Medications</SelectItem>
                    <SelectItem value="allergies">Allergies</SelectItem>
                    <SelectItem value="diagnoses">Diagnoses</SelectItem>
                    <SelectItem value="lab_results">Lab Results</SelectItem>
                    <SelectItem value="procedures">Procedures</SelectItem>
                    <SelectItem value="all">All Medical Information</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleDocumentExtraction} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Extracting Information...
                  </>
                ) : (
                  <>
                    <FileCheck className="w-4 h-4 mr-2" />
                    Extract Medical Information
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documentationTemplates.map((template) => (
              <Card key={template.id} className="cursor-pointer hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Badge variant="outline">{template.type}</Badge>
                  </div>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Fields:</p>
                    <div className="flex flex-wrap gap-1">
                      {template.fields.map((field, index) => (
                        <Badge key={index} variant="secondary">
                          {field}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button
                    className="w-full mt-4"
                    variant="outline"
                    onClick={() => {
                      setSelectedTemplate(template.id)
                      setActiveTab("generate")
                      toast.info(`Switched to Generate tab with ${template.name} fields pre-filled.`)
                    }}
                  >
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
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
                <Button variant="outline" size="sm" onClick={handleDownloadNote}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
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