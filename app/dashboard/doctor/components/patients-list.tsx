"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Eye, UserPlus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Patient {
  _id: string
  fullName: string
  sex: "Male" | "Female"
  dateOfBirth: string
  phone: string
  nationalId?: string
  address?: string
  createdAt: string
}

export function PatientsList() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [showRegisterDialog, setShowRegisterDialog] = useState(false)
  const [registering, setRegistering] = useState(false)

  const [patientData, setPatientData] = useState({
    fullName: "",
    sex: "Male" as "Male" | "Female",
    dateOfBirth: "",
    phone: "",
    nationalId: "",
    address: "",
  })

  useEffect(() => {
    // Note: There's no endpoint to get all patients for a doctor
    // This would need to be implemented in the backend
    // For now, we'll show a message
    setIsLoading(false)
  }, [])

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError("Please enter a search query")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const q = searchQuery.trim()
      // Search broadly (backend should OR-match whatever it supports)
      const response = await apiClient.searchPatients({ phone: q, nationalId: q, fullName: q })
      const patientsData = response.data || response
      const patientsList = Array.isArray(patientsData) ? patientsData : []
      setPatients(patientsList)
    } catch (err: any) {
      console.error("Error searching patients:", err)
      setError(err.message || "Failed to search patients")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegisterPatient = async () => {
    if (!patientData.fullName || !patientData.phone || !patientData.dateOfBirth) {
      setError("Please fill in all required fields (Name, Phone, Date of Birth)")
      return
    }

    setRegistering(true)
    setError("")

    try {
      await apiClient.findOrCreatePatient({
        fullName: patientData.fullName,
        sex: patientData.sex,
        dateOfBirth: patientData.dateOfBirth,
        phone: patientData.phone,
        nationalId: patientData.nationalId || undefined,
        address: patientData.address || undefined,
      })

      setShowRegisterDialog(false)
      setPatientData({
        fullName: "",
        sex: "Male",
        dateOfBirth: "",
        phone: "",
        nationalId: "",
        address: "",
      })
      // Refresh search if there's a query
      if (searchQuery) {
        handleSearch()
      }
    } catch (err: any) {
      setError(err.message || "Failed to register patient")
    } finally {
      setRegistering(false)
    }
  }

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const filteredPatients = patients.filter((patient) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      patient.fullName.toLowerCase().includes(query) ||
      patient.phone.includes(query) ||
      (patient.nationalId && patient.nationalId.includes(query))
    )
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Patient Management</h2>
          <p className="text-sm text-muted-foreground">Search and manage your patients</p>
        </div>
        <Button
          className="bg-cyan-600 hover:bg-cyan-700 gap-2"
          onClick={() => setShowRegisterDialog(true)}
        >
          <UserPlus className="w-4 h-4" />
          Register Patient
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">{error}</div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Patients</CardTitle>
          <CardDescription>Search for existing patients by phone number</CardDescription>
          <div className="mt-4 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by phone number"
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? "Searching..." : "Search"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Searching patients...</div>
          ) : filteredPatients.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Age / Gender</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Phone</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">National ID</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((patient) => (
                    <tr key={patient._id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4 text-sm font-medium">{patient.fullName}</td>
                      <td className="py-3 px-4 text-sm">
                        {patient.dateOfBirth ? `${calculateAge(patient.dateOfBirth)} / ${patient.sex}` : "N/A"}
                      </td>
                      <td className="py-3 px-4 text-sm">{patient.phone}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {patient.nationalId || "N/A"}
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedPatient(patient)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery
                ? "No patients found. Try registering a new patient."
                : "Search for patients by phone number to view their information"}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Register Patient Dialog */}
      <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Register New Patient</DialogTitle>
            <DialogDescription>Enter patient information to register them in the system</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={patientData.fullName}
                  onChange={(e) => setPatientData({ ...patientData, fullName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={patientData.phone}
                  onChange={(e) => setPatientData({ ...patientData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sex">Gender *</Label>
                <Select
                  value={patientData.sex}
                  onValueChange={(value: "Male" | "Female") =>
                    setPatientData({ ...patientData, sex: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={patientData.dateOfBirth}
                  onChange={(e) => setPatientData({ ...patientData, dateOfBirth: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nationalId">National ID (Optional)</Label>
                <Input
                  id="nationalId"
                  value={patientData.nationalId}
                  onChange={(e) => setPatientData({ ...patientData, nationalId: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address (Optional)</Label>
                <Input
                  id="address"
                  value={patientData.address}
                  onChange={(e) => setPatientData({ ...patientData, address: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowRegisterDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleRegisterPatient} disabled={registering}>
                {registering ? "Registering..." : "Register Patient"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Patient Details Dialog */}
      {selectedPatient && (
        <Dialog open={!!selectedPatient} onOpenChange={() => setSelectedPatient(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Patient Details</DialogTitle>
              <DialogDescription>View patient information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                  <p className="text-sm">{selectedPatient.fullName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Gender</Label>
                  <p className="text-sm">{selectedPatient.sex}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Date of Birth</Label>
                  <p className="text-sm">
                    {selectedPatient.dateOfBirth
                      ? new Date(selectedPatient.dateOfBirth).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Age</Label>
                  <p className="text-sm">
                    {selectedPatient.dateOfBirth
                      ? `${calculateAge(selectedPatient.dateOfBirth)} years`
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                  <p className="text-sm">{selectedPatient.phone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">National ID</Label>
                  <p className="text-sm">{selectedPatient.nationalId || "N/A"}</p>
                </div>
                {selectedPatient.address && (
                  <div className="col-span-2">
                    <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                    <p className="text-sm">{selectedPatient.address}</p>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
