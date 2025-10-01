"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export function ScheduleAppointmentDialog({ open, onOpenChange, onAppointmentScheduled }) {
  const [patients, setPatients] = useState([])
  const [providers, setProviders] = useState([])
  const [departments, setDepartments] = useState([])
  const [formData, setFormData] = useState({
    patientId: "",
    providerId: "",
    departmentId: "",
    startTime: "",
    type: "OUTPATIENT",
    reason: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient()
      const { data: patientsData, error: patientsError } = await supabase.from("Patient").select("id, firstName, lastName")
      if (patientsError) console.error("Error loading patients", patientsError)
      else setPatients(patientsData)

      const { data: providersData, error: providersError } = await supabase.from("User").select("id, firstName, lastName").in("role", ["PHYSICIAN", "NURSE", "SPECIALIST"])
      if (providersError) console.error("Error loading providers", providersError)
      else setProviders(providersData)

      const { data: departmentsData, error: departmentsError } = await supabase.from("Department").select("id, name")
      if (departmentsError) console.error("Error loading departments", departmentsError)
      else setDepartments(departmentsData)
    }
    if (open) {
      loadData()
    }
  }, [open])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    const supabase = createClient()
    const { data, error } = await supabase.from("Encounter").insert([
      {
        ...formData,
        status: "PLANNED",
      },
    ])

    setIsSubmitting(false)

    if (error) {
      toast.error("Could not schedule appointment", {
        description: error.message,
      })
    } else {
      toast.success("Appointment scheduled successfully.")
      onAppointmentScheduled()
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule New Appointment</DialogTitle>
          <DialogDescription>
            Fill in the details to schedule a new appointment.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="patientId">Patient</Label>
              <select id="patientId" name="patientId" value={formData.patientId} onChange={handleChange} className="w-full" required>
                <option value="" disabled>Select a patient</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="providerId">Provider</Label>
              <select id="providerId" name="providerId" value={formData.providerId} onChange={handleChange} className="w-full" required>
                <option value="" disabled>Select a provider</option>
                {providers.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="departmentId">Department</Label>
              <select id="departmentId" name="departmentId" value={formData.departmentId} onChange={handleChange} className="w-full" required>
                <option value="" disabled>Select a department</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime">Date & Time</Label>
              <Input id="startTime" name="startTime" type="datetime-local" value={formData.startTime} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <select id="type" name="type" value={formData.type} onChange={handleChange} className="w-full" required>
                <option value="INPATIENT">Inpatient</option>
                <option value="OUTPATIENT">Outpatient</option>
                <option value="EMERGENCY">Emergency</option>
                <option value="VIRTUAL">Virtual</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Visit</Label>
              <Input id="reason" name="reason" value={formData.reason} onChange={handleChange} />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Scheduling..." : "Schedule Appointment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
