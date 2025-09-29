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
import { AddPatientDialog } from "@/components/add-patient-dialog"
import { EditPatientDialog } from "@/components/edit-patient-dialog"
import { toast } from "sonner"

import { Skeleton } from "@/components/ui/skeleton"
import { CardFooter } from "@/components/ui/card"

interface Patient {
  id: string;
  mrn: string;
  name: string;
  age: number;
  lastVisit: string;
  status: string;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

function PatientTableSkeleton() {
  return (
    <>
      {Array.from({ length: 10 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
          <TableCell><Skeleton className="h-4 w-10" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
          <TableCell><Skeleton className="h-8 w-8" /></TableCell>
        </TableRow>
      ))}
    </>
  )
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isAddPatientDialogOpen, setIsAddPatientDialogOpen] = useState(false)
  const [isEditPatientDialogOpen, setIsEditPatientDialogOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [totalPatients, setTotalPatients] = useState(0)
  const [limit] = useState(10)

  const loadPatients = async (page = 1) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/patients?searchTerm=${searchTerm}&page=${page}&limit=${limit}`)
      if (!response.ok) {
        throw new Error("Network response was not ok")
      }
      const { data, total } = await response.json()
      setPatients(data)
      setTotalPatients(total)
      setTotalPages(Math.ceil(total / limit))
      setCurrentPage(page)
    } catch (error) {
      console.error("Error loading patients:", error)
      toast.error("Failed to load patients.")
      setPatients([])
    } finally {
      setLoading(false)
    }
  }

  const handleEditPatient = (patient) => {
    fetch(`/api/patients/${patient.id}`)
      .then(res => res.json())
      .then(data => {
        setSelectedPatient(data)
        setIsEditPatientDialogOpen(true)
      })
      .catch(error => {
        console.error("Failed to fetch patient details:", error)
        toast.error("Failed to load patient details.")
      })
  }

  const handlePatientUpdated = () => {
    loadPatients(currentPage)
  }

  const handleDeletePatient = async (patientId) => {
    if (!window.confirm("Are you sure you want to delete this patient? This action cannot be undone.")) {
      return
    }
    try {
      const response = await fetch(`/api/patients/${patientId}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete patient.")
      toast.success("Patient deleted successfully.")
      loadPatients(currentPage)
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadPatients(1)
    }, 500)
    return () => clearTimeout(debounceTimer)
  }, [searchTerm])

  useEffect(() => {
    loadPatients(currentPage)
  }, [currentPage])

  return (
    <>
      <main className="flex-1 p-8 bg-background">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Patient Directory</h1>
            <p className="text-muted-foreground mt-1">Manage all {totalPatients} patients in the system</p>
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
                {loading ? <PatientTableSkeleton /> : (
                  patients.map((patient: Patient) => (
                    <TableRow key={patient.id} className="hover:bg-muted/50">
                      <TableCell className="font-mono text-sm">{patient.mrn}</TableCell>
                      <TableCell className="font-medium">{patient.name}</TableCell>
                      <TableCell className="text-muted-foreground">{patient.age}</TableCell>
                      <TableCell className="text-muted-foreground">{patient.lastVisit}</TableCell>
                      <TableCell>
                        <Badge variant={patient.status === 'stable' ? 'default' : patient.status === 'critical' ? 'destructive' : 'secondary'}>{patient.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={patient.riskLevel === 'high' ? 'destructive' : patient.riskLevel === 'medium' ? 'warning' : 'default'}>{patient.riskLevel}</Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="w-8 h-8"><MoreHorizontal className="w-4 h-4" /></Button>
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
          <CardFooter className="flex items-center justify-between py-4">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </CardFooter>
        </Card>
      </main>
      <AddPatientDialog
        open={isAddPatientDialogOpen}
        onOpenChange={setIsAddPatientDialogOpen}
        onPatientAdded={() => loadPatients(1)}
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
