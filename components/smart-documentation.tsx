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
  const [isRecording, setIsRecording] = useState(false)
  const [generatedNote, setGeneratedNote] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState("")

  // Form states for SOAP note generation
  const [patientName, setPatientName] = useState("")
  const [patientAge, setPatientAge] = useState("")
  const [patientGender, setPatientGender] = useState("")
  const [mrn, setMrn] = useState("")
  const [chiefComplaint, setChiefComplaint] = useState("")
  const [symptoms, setSymptoms] = useState("")
  const [vitals, setVitals] = useState("")
  const [examination, setExamination] = useState("")
  const [diagnosis, setDiagnosis] = useState("")
  const [treatment, setTreatment] = useState("")

  // Voice transcription states
  const [voiceTranscript, setVoiceTranscript] = useState("")
  const [transcriptionContext, setTranscriptionContext] = useState("")

  // Document extraction states
  const [documentText, setDocumentText] = useState("")
  const [extractionType, setExtractionType] = useState("")

  const handleGenerateSOAP = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/documentation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "generate_soap_note",
          data: {
            patientInfo: {
              name: patientName,
              age: patientAge,
              gender: patientGender,
              mrn: mrn,
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

      const reader = response.body?.getReader()
      if (!reader) throw new Error("No response body")

      let result = ""
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        result += new TextDecoder().decode(value)
      }

      setGeneratedNote(result)
      toast.success("SOAP Note Generated", {
        description: "Clinical documentation has been created successfully.",
      })
    } catch (error) {
      console.error("Error:", error)
      toast.error("Failed to generate SOAP note", {
        description: "Please try again.",
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

  const handleCopyNote = () => {
    navigator.clipboard.writeText(generatedNote)
    toast.info("Copied to Clipboard", {
      description: "The generated note has been copied to your clipboard.",
    })
  }

  const handleSaveNote = () => {
    // In a real implementation, this would save to the database
    toast.info("Note Saved", {
      description: "The clinical note has been saved to the patient record.",
    })
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <FileText className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Smart Documentation System</h2>
          <p className="text-muted-foreground">AI-powered clinical documentation and note generation</p>
        </div>
      </div>

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
                <CardTitle>Patient Information</CardTitle>
                <CardDescription>Enter patient details for documentation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="patient-name">Patient Name</Label>
                    <Input
                      id="patient-name"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mrn">MRN</Label>
                    <Input id="mrn" value={mrn} onChange={(e) => setMrn(e.target.value)} placeholder="MRN001234" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      value={patientAge}
                      onChange={(e) => setPatientAge(e.target.value)}
                      placeholder="45"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={patientGender} onValueChange={setPatientGender}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="chief-complaint">Chief Complaint</Label>
                  <Input
                    id="chief-complaint"
                    value={chiefComplaint}
                    onChange={(e) => setChiefComplaint(e.target.value)}
                    placeholder="Patient's main concern"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Clinical Information</CardTitle>
                <CardDescription>Enter clinical findings and assessment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="symptoms">Symptoms</Label>
                  <Textarea
                    id="symptoms"
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="Patient reported symptoms..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vitals">Vital Signs (JSON)</Label>
                  <Textarea
                    id="vitals"
                    value={vitals}
                    onChange={(e) => setVitals(e.target.value)}
                    placeholder='{"bp": "120/80", "hr": 72, "temp": 98.6, "rr": 16}'
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="examination">Physical Examination</Label>
                  <Textarea
                    id="examination"
                    value={examination}
                    onChange={(e) => setExamination(e.target.value)}
                    placeholder="Physical exam findings..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Assessment & Plan</CardTitle>
              <CardDescription>Clinical assessment and treatment plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="diagnosis">Assessment/Diagnosis</Label>
                <Textarea
                  id="diagnosis"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="Clinical assessment and diagnosis..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="treatment">Treatment Plan</Label>
                <Textarea
                  id="treatment"
                  value={treatment}
                  onChange={(e) => setTreatment(e.target.value)}
                  placeholder="Treatment plan, medications, follow-up..."
                  rows={3}
                />
              </div>

              <Button onClick={handleGenerateSOAP} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating SOAP Note...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate SOAP Note
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="voice" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Voice to Text Documentation</CardTitle>
              <CardDescription>Convert voice recordings to structured clinical notes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center p-8 border-2 border-dashed border-border rounded-lg">
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
          <div className="grid grid-cols-2 gap-6">
            {documentationTemplates.map((template) => (
              <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Badge variant="outline">{template.type}</Badge>
                  </div>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Required Fields:</p>
                    <div className="flex flex-wrap gap-1">
                      {template.fields.map((field, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {field}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button
                    className="w-full mt-4 bg-transparent"
                    variant="outline"
                    onClick={() => setSelectedTemplate(template.id)}
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
                <Button variant="outline" size="sm" onClick={handleCopyNote}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <Button variant="outline" size="sm" onClick={handleSaveNote}>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
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
