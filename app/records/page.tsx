"use client"

import { useState, useEffect } from "react"
import { Search, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"

export default function MedicalRecordsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [patient, setPatient] = useState(null)
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const handleSearch = async () => {
      if (!searchTerm) {
        setPatient(null)
        setRecords([])
        setError(null)
        return
      }

      setLoading(true)
    setError(null)
    setPatient(null)
    setRecords([])

    const supabase = createClient()
    const { data: patientData, error: patientError } = await supabase
      .from("patients")
      .select()
      .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,medical_record_number.ilike.%${searchTerm}%`)
      .single()

    if (patientError || !patientData) {
      setError("Patient not found.")
      setLoading(false)
      return
    }

    setPatient(patientData)

    const { data: recordsData, error: recordsError } = await supabase
      .from("medical_history")
      .select()
      .eq("patient_id", patientData.id)
      .order("diagnosis_date", { ascending: false })

    if (recordsError) {
      setError("Could not fetch medical records.")
    } else {
      setRecords(recordsData)
    }

    setLoading(false)
    }

    const debounceTimer = setTimeout(() => {
      handleSearch()
    }, 500)

    return () => clearTimeout(debounceTimer)
  }, [searchTerm])

  return (
    <main className="flex-1 p-8 bg-background">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Medical Records</h1>
          <p className="text-muted-foreground mt-1">Search for a patient to view their records</p>
        </div>
      </div>

      <Card className="mb-8 border-border">
        <CardHeader>
          <CardTitle>Patient Search</CardTitle>
          <CardDescription>Enter a patient's name or Medical Record Number (MRN).</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Input
              placeholder="e.g., John Smith or MRN001234"
              className="max-w-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {loading && <p>Loading...</p>}
      {error && <p className="text-destructive">{error}</p>}

      {patient && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Showing Records for: {patient.first_name} {patient.last_name}</CardTitle>
            <CardDescription>MRN: {patient.medical_record_number}</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Condition</TableHead>
                  <TableHead>Diagnosis Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Severity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.length > 0 ? (
                  records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.condition_name}</TableCell>
                      <TableCell>{new Date(record.diagnosis_date).toLocaleDateString()}</TableCell>
                      <TableCell><Badge variant="secondary">{record.status}</Badge></TableCell>
                      <TableCell><Badge variant="outline">{record.severity}</Badge></TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">No medical history found for this patient.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </main>
  )
}
