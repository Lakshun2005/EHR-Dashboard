"use client"

import { useState, useEffect } from "react"
import { Calendar, Plus, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { ScheduleAppointmentDialog } from "@/components/schedule-appointment-dialog"

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [isScheduleAppointmentDialogOpen, setIsScheduleAppointmentDialogOpen] = useState(false)

  const loadAppointments = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from("appointments")
      .select(`
        id,
        appointment_date,
        duration_minutes,
        appointment_type,
        status,
        chief_complaint,
        patient:patients(first_name, last_name),
        provider:profiles(first_name, last_name)
      `)
      .order("appointment_date", { ascending: false })

    if (error) {
      console.error("Error loading appointments:", error)
    } else {
      setAppointments(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadAppointments()
  }, [])

  const formatDateTime = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  return (
    <>
      <main className="flex-1 p-8 bg-background">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Appointments</h1>
            <p className="text-muted-foreground mt-1">Manage all patient appointments</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90" onClick={() => setIsScheduleAppointmentDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Schedule Appointment
          </Button>
        </div>

        <Card className="border-border">
        <CardHeader>
          <CardTitle>Upcoming & Past Appointments</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-medium text-foreground">Date & Time</TableHead>
                <TableHead className="font-medium text-foreground">Patient</TableHead>
                <TableHead className="font-medium text-foreground">Provider</TableHead>
                <TableHead className="font-medium text-foreground">Type</TableHead>
                <TableHead className="font-medium text-foreground">Status</TableHead>
                <TableHead className="font-medium text-foreground w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading appointments...
                  </TableCell>
                </TableRow>
              ) : (
                appointments.map((appt) => (
                  <TableRow key={appt.id} className="hover:bg-muted/50">
                    <TableCell>{formatDateTime(appt.appointment_date)}</TableCell>
                    <TableCell>{`${appt.patient.first_name} ${appt.patient.last_name}`}</TableCell>
                    <TableCell>{`Dr. ${appt.provider.first_name} ${appt.provider.last_name}`}</TableCell>
                    <TableCell>{appt.appointment_type}</TableCell>
                    <TableCell>
                      <Badge variant={appt.status === 'completed' ? 'default' : 'secondary'}>
                        {appt.status}
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
                          <DropdownMenuItem>Reschedule</DropdownMenuItem>
                          <DropdownMenuItem>Cancel</DropdownMenuItem>
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
    <ScheduleAppointmentDialog
      open={isScheduleAppointmentDialogOpen}
      onOpenChange={setIsScheduleAppointmentDialogOpen}
      onAppointmentScheduled={loadAppointments}
    />
    </>
  )
}
