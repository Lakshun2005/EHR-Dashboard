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
  const [selectedPatient, setSelectedPatient] = useState("")
  const [selectedProvider, setSelectedProvider] = useState("")
  const [appointmentDate, setAppointmentDate] = useState("")
  const [appointmentType, setAppointmentType] = useState("routine_checkup")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient()
      const { data: patientsData, error: patientsError } = await supabase.from("patients").select("id, first_name, last_name")
      if (patientsError) console.error("Error loading patients", patientsError)
      else setPatients(patientsData)

      const { data: providersData, error: providersError } = await supabase.from("profiles").select("id, first_name, last_name")
      if (providersError) console.error("Error loading providers", providersError)
      else setProviders(providersData)
    }
    if (open) {
      loadData()
    }
  }, [open])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    const supabase = createClient()
    const { data, error } = await supabase
      .from("appointments")
      .insert([
        {
          patient_id: selectedPatient,
          provider_id: selectedProvider,
          appointment_date: appointmentDate,
          appointment_type: appointmentType,
        },
      ])
      .select()

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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="patient" className="text-right">Patient</Label>
              <select id="patient" value={selectedPatient} onChange={(e) => setSelectedPatient(e.target.value)} className="col-span-3" required>
                <option value="" disabled>Select a patient</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="provider" className="text-right">Provider</Label>
              <select id="provider" value={selectedProvider} onChange={(e) => setSelectedProvider(e.target.value)} className="col-span-3" required>
                <option value="" disabled>Select a provider</option>
                {providers.map(p => <option key={p.id} value={p.id}>Dr. {p.first_name} {p.last_name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">Date & Time</Label>
              <Input id="date" type="datetime-local" value={appointmentDate} onChange={(e) => setAppointmentDate(e.target.value)} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">Type</Label>
              <select id="type" value={appointmentType} onChange={(e) => setAppointmentType(e.target.value)} className="col-span-3" required>
                <option value="routine_checkup">Routine Check-up</option>
                <option value="follow_up">Follow-up</option>
                <option value="consultation">Consultation</option>
                <option value="procedure">Procedure</option>
              </select>
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
