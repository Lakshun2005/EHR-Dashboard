"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Filter,
  Eye,
  MoreHorizontal,
  UserPlus,
  Activity,
  Clock,
  AlertTriangle,
  TrendingUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { AddPatientDialog } from "@/components/add-patient-dialog"
import { EditPatientDialog } from "@/components/edit-patient-dialog"
import { toast } from "sonner"

// Sample data structure - align with your actual data
const recentPatients = [
  {
    id: "1",
    mrn: "MRN001234",
    name: "John Smith",
    age: 38,
    lastVisit: "2025-01-20",
    condition: "Hypertension",
    status: "stable",
    riskLevel: "medium",
  },
  // Add more sample patients if needed
]

export default function PatientsPage() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddPatientDialogOpen, setIsAddPatientDialogOpen] = useState(false)
  const [isEditPatientDialogOpen, setIsEditPatientDialogOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState(null)

  const handleEditPatient = (patient) => {
    setSelectedPatient(patient)
    setIsEditPatientDialogOpen(true)
  }

  const handlePatientUpdated = (updatedPatient) => {
    setPatients(patients.map((p) => (p.id === updatedPatient.id ? updatedPatient : p)))
    loadPatients() // Refresh the list
  }

  const handleDeletePatient = async (patientId) => {
    if (!window.confirm("Are you sure you want to delete this patient? This action cannot be undone.")) {
      return
    }

    const supabase = createClient()
    const { error } = await supabase.from("patients").delete().eq("id", patientId)

    if (error) {
      toast.error("Failed to delete patient.", { description: error.message })
    } else {
      toast.success("Patient deleted successfully.")
      loadPatients()
    }
  }

  const loadPatients = async () => {
    setLoading(true)
    const supabase = createClient()
    let query = supabase
      .from("patients")
      .select(`
        id,
        medical_record_number,
        first_name,
        last_name,
        date_of_birth,
        phone,
        email,
        created_at
      `)
      .order("created_at", { ascending: false })

    if (searchTerm) {
      query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,medical_record_number.ilike.%${searchTerm}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error loading patients:", error);
      setPatients(recentPatients); // Fallback to sample data
      setLoading(false);
      return;
    }

    const patientIds = data.map((p) => p.id);
    const { data: histories, error: historyError } = await supabase
      .from("medical_history")
      .select("*")
      .in("patient_id", patientIds);

    if (historyError) {
      console.error("Error loading medical histories:", historyError);
    }

    const latestHistories = histories
      ? histories.reduce((acc, history) => {
          if (
            !acc[history.patient_id] ||
            new Date(history.diagnosis_date) > new Date(acc[history.patient_id].diagnosis_date)
          ) {
            acc[history.patient_id] = history;
          }
          return acc;
        }, {})
      : {};

    const transformedPatients = data.map((patient) => {
      const latestHistory = latestHistories[patient.id];
      return {
        id: patient.id,
        mrn: patient.medical_record_number,
        name: `${patient.first_name} ${patient.last_name}`,
        age: new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear(),
        lastVisit: new Date(patient.created_at).toISOString().split("T")[0],
        status: latestHistory?.status || "unknown",
        riskLevel: latestHistory?.severity || "unknown",
      };
    });

    setPatients(transformedPatients);
    setLoading(false);
  };


  useEffect(() => {
    const debounceTimer = setTimeout(() => {
        loadPatients()
    }, 500) // Debounce search input

    return () => clearTimeout(debounceTimer)
  }, [searchTerm])

  return (
    <>
      <main className="flex-1 p-8 bg-background">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Patient Directory</h1>
            <p className="text-muted-foreground mt-1">Manage all patients in the system</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90" onClick={() => setIsAddPatientDialogOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Add New Patient
          </Button>
        </div>

        <Card className="border-border">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <Input
              placeholder="Search by name or MRN..."
              className="max-w-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-medium text-foreground">MRN</TableHead>
                <TableHead className="font-medium text-foreground">Patient Name</TableHead>
                <TableHead className="font-medium text-foreground">Age</TableHead>
                <TableHead className="font-medium text-foreground">Last Visit</TableHead>
                <TableHead className="font-medium text-foreground">Status</TableHead>
                <TableHead className="font-medium text-foreground">Risk Level</TableHead>
                <TableHead className="font-medium text-foreground w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Loading patients...
                  </TableCell>
                </TableRow>
              ) : (
                patients.map((patient) => (
                  <TableRow key={patient.id} className="hover:bg-muted/50">
                    <TableCell className="font-mono text-sm">{patient.mrn}</TableCell>
                    <TableCell className="font-medium">{patient.name}</TableCell>
                    <TableCell className="text-muted-foreground">{patient.age}</TableCell>
                    <TableCell className="text-muted-foreground">{patient.lastVisit}</TableCell>
                    <TableCell>
                      <Badge variant={
                        patient.status === 'stable' ? 'default'
                        : patient.status === 'critical' ? 'destructive'
                        : 'secondary'
                      }>
                        {patient.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        patient.riskLevel === 'high' ? 'destructive'
                        : patient.riskLevel === 'medium' ? 'warning'
                        : 'default'
                      }>
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
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditPatient(patient)}>Edit Record</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDeletePatient(patient.id)}>Delete Patient</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
    <AddPatientDialog
      open={isAddPatientDialogOpen}
      onOpenChange={setIsAddPatientDialogOpen}
      onPatientAdded={loadPatients}
    />
    {selectedPatient && (
      <EditPatientDialog
        patient={selectedPatient}
        open={isEditPatientDialogOpen}
        onOpenChange={setIsEditPatientDialogOpen}
        onPatientUpdated={handlePatientUpdated}
      />
    )}
  </>
  )
}
