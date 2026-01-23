"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Search, UserPlus, Save, Send, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Patient {
  _id: string
  fullName: string
  phone: string
  sex: "Male" | "Female"
  dateOfBirth: string
  nationalId?: string
  address?: string
}

export function CreateReferral() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchType, setSearchType] = useState<"phone" | "nationalId" | "fullName">("phone")
  const [searching, setSearching] = useState(false)
  const [foundPatient, setFoundPatient] = useState<Patient | null>(null)
  const [searchResults, setSearchResults] = useState<Patient[]>([])
  const [showPatientForm, setShowPatientForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Patient form data
  const [patientData, setPatientData] = useState({
    fullName: "",
    sex: "Male" as "Male" | "Female",
    dateOfBirth: "",
    phone: "",
    nationalId: "",
    address: "",
  })

  // Referral form data
  const [referralData, setReferralData] = useState({
    toHospital: "",
    urgency: "ROUTINE" as "ROUTINE" | "URGENT" | "EMERGENCY",
    reasonForReferral: "",
    clinicalNotes: "",
    requiredSpecialty: "",
    requiredBedType: "",
    attachments: [] as string[], // Add attachments field
  })

  const [hospitals, setHospitals] = useState<Array<{ _id: string; name: string }>>([])

  const ensurePatientId = async (): Promise<string | null> => {
    // If we already found an existing patient, use it.
    if (foundPatient?._id) return foundPatient._id

    // Otherwise we must create/find a patient first (backend expects patientId OR a full patient object).
    if (!patientData.fullName || !patientData.phone || !patientData.dateOfBirth || !patientData.sex) {
      setError("Please register the patient first (Name, Phone, Gender, Date of Birth) or search for an existing patient.")
      return null
    }

    try {
      const created = await apiClient.findOrCreatePatient({
        fullName: patientData.fullName,
        sex: patientData.sex,
        dateOfBirth: patientData.dateOfBirth,
        phone: patientData.phone,
        nationalId: patientData.nationalId || undefined,
        address: patientData.address || undefined,
      })
      const createdPatient = created?.data || created
      const patientId = createdPatient?._id
      if (!patientId) throw new Error("Failed to register patient. No patient ID returned.")
      setFoundPatient(createdPatient)
      return patientId
    } catch (err: any) {
      console.error("Error creating patient:", err)
      setError(err.message || "Failed to register patient. Please try again.")
      return null
    }
  }

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const response = await apiClient.getHospitals()
        const hospitalData = response.data || response
        const hospitalsList = Array.isArray(hospitalData) ? hospitalData : []
        setHospitals(hospitalsList)
      } catch (err) {
        console.error("Error fetching hospitals:", err)
      }
    }
    fetchHospitals()
  }, [])

  const handleSearchPatient = async () => {
    if (!searchQuery.trim()) {
      setError("Please enter a search query")
      return
    }

    setSearching(true)
    setError("")
    setFoundPatient(null)
    setSearchResults([])

    try {
      const searchParams: any = {}
      if (searchType === "phone") {
        searchParams.phone = searchQuery.trim()
      } else if (searchType === "nationalId") {
        searchParams.nationalId = searchQuery.trim()
      } else {
        searchParams.fullName = searchQuery.trim()
      }

      const response = await apiClient.searchPatients(searchParams)
      const patients = response.data || response

      if (Array.isArray(patients) && patients.length > 0) {
        setSearchResults(patients)
        if (patients.length === 1) {
          const patient = patients[0]
          setFoundPatient(patient)
          setPatientData({
            fullName: patient.fullName,
            sex: patient.sex,
            dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().split("T")[0] : "",
            phone: patient.phone,
            nationalId: patient.nationalId || "",
            address: patient.address || "",
          })
          setSearchResults([])
          setShowPatientForm(false)
        } else {
          // multiple matches; let user pick
          setShowPatientForm(false)
        }
      } else {
        setFoundPatient(null)
        setShowPatientForm(true)
        // Pre-fill with search query if searching by phone
        if (searchType === "phone") {
          setPatientData((prev) => ({ ...prev, phone: searchQuery }))
        }
      }
    } catch (err: any) {
      console.error("Error searching patient:", err)
      setError("Failed to search patient. You can register a new patient below.")
      setShowPatientForm(true)
    } finally {
      setSearching(false)
    }
  }

  const handleRegisterPatient = async () => {
    if (!patientData.fullName || !patientData.phone || !patientData.dateOfBirth) {
      setError("Please fill in all required patient fields (Name, Phone, Date of Birth)")
      return
    }

    try {
      setError("")
      const newPatient = await apiClient.findOrCreatePatient({
        fullName: patientData.fullName,
        sex: patientData.sex,
        dateOfBirth: patientData.dateOfBirth,
        phone: patientData.phone,
        nationalId: patientData.nationalId || undefined,
        address: patientData.address || undefined,
      })

      const patient = newPatient.data || newPatient
      setFoundPatient(patient)
      setShowPatientForm(false)
      setSuccess("Patient registered successfully")
    } catch (err: any) {
      setError(err.message || "Failed to register patient")
    }
  }

  const handleSaveDraft = async () => {
    if (!user?.hospitalId) {
      setError("Hospital ID not found. Please log in again.")
      return
    }

    if (!patientData.fullName || !patientData.phone || !referralData.reasonForReferral) {
      setError("Please fill in all required fields")
      return
    }

    setIsSavingDraft(true)
    setError("")
    setSuccess("")

    try {
      // Based on your Postman test, the backend expects a patient object, not patientId
      // Create a proper patient object as shown in the successful Postman request
      const referralPayload: any = {
        fromHospital: user.hospitalId,
        doctorName: user.name || user.email || "Doctor",
        // Send patient as an object (required by backend)
        patient: {
          fullName: patientData.fullName,
          sex: patientData.sex,
          dateOfBirth: patientData.dateOfBirth,
          phone: patientData.phone,
          nationalId: patientData.nationalId || "",
          address: patientData.address || "",
        },
        patientName: patientData.fullName,
        patientPhone: patientData.phone,
        urgency: referralData.urgency,
        reasonForReferral: referralData.reasonForReferral,
        clinicalNotes: referralData.clinicalNotes || undefined,
        requiredSpecialty: referralData.requiredSpecialty || undefined,
        requiredBedType: referralData.requiredBedType || undefined,
        attachments: referralData.attachments || [],
        // Add status for draft if needed
        status: "DRAFT",
      }

      // Add toHospital only if selected
      if (referralData.toHospital) {
        referralPayload.toHospital = referralData.toHospital
      }

      // Debug log to see what we're sending
      console.log("[Save Draft] Sending payload:", JSON.stringify(referralPayload, null, 2))

      // Use the regular create endpoint - backend automatically creates as DRAFT
      const response = await apiClient.createReferral(referralPayload)
      
      console.log("[Save Draft] Response:", response)
      
      setSuccess("Referral saved as draft successfully!")
      
      // Reset form after successful save
      setTimeout(() => {
        setFoundPatient(null)
        setShowPatientForm(false)
        setPatientData({
          fullName: "",
          sex: "Male",
          dateOfBirth: "",
          phone: "",
          nationalId: "",
          address: "",
        })
        setReferralData({
          toHospital: "",
          urgency: "ROUTINE",
          reasonForReferral: "",
          clinicalNotes: "",
          requiredSpecialty: "",
          requiredBedType: "",
          attachments: [],
        })
        setSearchQuery("")
        setSuccess("")
      }, 2000)
    } catch (err: any) {
      console.error("[Save Draft] Error:", err)
      // Handle specific error messages
      if (err.message?.includes("patient must be an object")) {
        setError("Patient data format error. Please ensure all patient fields are filled correctly.")
      } else {
        setError(err.message || "Failed to save draft. Please check the console for details.")
      }
    } finally {
      setIsSavingDraft(false)
    }
  }

  const handleSubmitReferral = async () => {
    if (!user?.hospitalId) {
      setError("Hospital ID not found. Please log in again.")
      return
    }

    if (!patientData.fullName || !patientData.phone || !referralData.reasonForReferral) {
      setError("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)
    setError("")
    setSuccess("")

    try {
      // Create a proper patient object as shown in the successful Postman request
      const referralPayload: any = {
        fromHospital: user.hospitalId,
        doctorName: user.name || user.email || "Doctor",
        // Send patient as an object (required by backend)
        patient: {
          fullName: patientData.fullName,
          sex: patientData.sex,
          dateOfBirth: patientData.dateOfBirth,
          phone: patientData.phone,
          nationalId: patientData.nationalId || "",
          address: patientData.address || "",
        },
        patientName: patientData.fullName,
        patientPhone: patientData.phone,
        urgency: referralData.urgency,
        reasonForReferral: referralData.reasonForReferral,
        clinicalNotes: referralData.clinicalNotes || undefined,
        requiredSpecialty: referralData.requiredSpecialty || undefined,
        requiredBedType: referralData.requiredBedType || undefined,
        attachments: referralData.attachments || [],
      }

      // Add toHospital only if selected
      if (referralData.toHospital) {
        referralPayload.toHospital = referralData.toHospital
      }

      console.log("[Submit Referral] Sending payload:", JSON.stringify(referralPayload, null, 2))

      // Call the regular create endpoint
      const referral = await apiClient.createReferral(referralPayload)
      const referralId = referral._id || referral.data?._id

      if (!referralId) {
        console.error("[Submit Referral] Referral response:", referral)
        throw new Error("Failed to create referral. No referral ID returned.")
      }

      console.log("[Submit Referral] Referral created with ID:", referralId)

      setSuccess("Referral created successfully!")
      
      // Reset form
      setTimeout(() => {
        setFoundPatient(null)
        setShowPatientForm(false)
        setPatientData({
          fullName: "",
          sex: "Male",
          dateOfBirth: "",
          phone: "",
          nationalId: "",
          address: "",
        })
        setReferralData({
          toHospital: "",
          urgency: "ROUTINE",
          reasonForReferral: "",
          clinicalNotes: "",
          requiredSpecialty: "",
          requiredBedType: "",
          attachments: [],
        })
        setSearchQuery("")
        setSuccess("")
      }, 2000)
    } catch (err: any) {
      console.error("Error submitting referral:", err)
      // Handle specific error messages
      if (err.message?.includes("patient must be an object")) {
        setError("Patient data format error. Please ensure all patient fields are filled correctly.")
      } else {
        setError(err.message || "Failed to submit referral")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Function to handle file attachments (optional - you can implement this later)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Implement file upload logic here
    const files = e.target.files
    if (files) {
      // For now, just store filenames
      const fileNames = Array.from(files).map(file => file.name)
      setReferralData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...fileNames]
      }))
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Create Referral</h2>
        <p className="text-muted-foreground">Register a patient and create a referral</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 border-green-200 text-green-800">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Patient Search Section */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Information</CardTitle>
          <CardDescription>Search for existing patient or register a new one</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Select value={searchType} onValueChange={(value: any) => setSearchType(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="nationalId">National ID</SelectItem>
                <SelectItem value="fullName">Name</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder={`Search by ${searchType === "phone" ? "phone number" : searchType === "nationalId" ? "national ID" : "name"}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearchPatient()}
            />
            <Button onClick={handleSearchPatient} disabled={searching}>
              <Search className="w-4 h-4 mr-2" />
              {searching ? "Searching..." : "Search"}
            </Button>
          </div>

          {foundPatient && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-green-800">
                ✓ Patient found: {foundPatient.fullName} ({foundPatient.phone})
              </p>
            </div>
          )}

          {!foundPatient && searchResults.length > 1 && (
            <div className="p-4 border rounded-lg space-y-3">
              <p className="text-sm font-medium">Multiple patients found — select the correct one:</p>
              <div className="space-y-2">
                {searchResults.slice(0, 10).map((p) => (
                  <button
                    key={p._id}
                    type="button"
                    className="w-full text-left p-3 rounded border hover:bg-muted"
                    onClick={() => {
                      setFoundPatient(p)
                      setPatientData({
                        fullName: p.fullName,
                        sex: p.sex,
                        dateOfBirth: p.dateOfBirth ? new Date(p.dateOfBirth).toISOString().split("T")[0] : "",
                        phone: p.phone,
                        nationalId: p.nationalId || "",
                        address: p.address || "",
                      })
                      setSearchResults([])
                      setShowPatientForm(false)
                    }}
                  >
                    <div className="font-medium">{p.fullName}</div>
                    <div className="text-sm text-muted-foreground">
                      {p.phone} {p.nationalId ? `• ${p.nationalId}` : ""}
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Not seeing the right one? Try searching by phone or national ID.
              </p>
            </div>
          )}

          {/* Patient Registration Form */}
          {showPatientForm && (
            <div className="p-4 border rounded-lg space-y-4">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold">Register New Patient</h3>
              </div>
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
                    onValueChange={(value: "Male" | "Female") => setPatientData({ ...patientData, sex: value })}
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
              <Button onClick={handleRegisterPatient} variant="outline">
                <UserPlus className="w-4 h-4 mr-2" />
                Register Patient
              </Button>
            </div>
          )}

          {/* Manual Patient Entry (if not found and not showing form) */}
          {!foundPatient && !showPatientForm && (
            <Button
              variant="outline"
              onClick={() => setShowPatientForm(true)}
              className="w-full"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Register New Patient
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Referral Details Section */}
      <Card>
        <CardHeader>
          <CardTitle>Referral Details</CardTitle>
          <CardDescription>Provide referral information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="toHospital">Target Hospital (optional for draft)</Label>
              <Select
                value={referralData.toHospital}
                onValueChange={(value) => setReferralData({ ...referralData, toHospital: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select target hospital" />
                </SelectTrigger>
                <SelectContent>
                  {hospitals.map((hospital) => (
                    <SelectItem key={hospital._id} value={hospital._id}>
                      {hospital.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="urgency">Urgency Level *</Label>
              <Select
                value={referralData.urgency}
                onValueChange={(value: any) => setReferralData({ ...referralData, urgency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ROUTINE">Routine</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                  <SelectItem value="EMERGENCY">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reasonForReferral">Reason for Referral *</Label>
            <Textarea
              id="reasonForReferral"
              placeholder="Describe the reason for referral..."
              value={referralData.reasonForReferral}
              onChange={(e) => setReferralData({ ...referralData, reasonForReferral: e.target.value })}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clinicalNotes">Clinical Notes (Optional)</Label>
            <Textarea
              id="clinicalNotes"
              placeholder="Add any additional clinical notes..."
              value={referralData.clinicalNotes}
              onChange={(e) => setReferralData({ ...referralData, clinicalNotes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="requiredSpecialty">Required Specialty (Optional)</Label>
              <Input
                id="requiredSpecialty"
                placeholder="e.g., Cardiology, Neurology"
                value={referralData.requiredSpecialty}
                onChange={(e) => setReferralData({ ...referralData, requiredSpecialty: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="requiredBedType">Required Bed Type (Optional)</Label>
              <Input
                id="requiredBedType"
                placeholder="e.g., ICU, General Ward"
                value={referralData.requiredBedType}
                onChange={(e) => setReferralData({ ...referralData, requiredBedType: e.target.value })}
              />
            </div>
          </div>

          {/* File Attachments (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="attachments">Attachments (Optional)</Label>
            <Input
              id="attachments"
              type="file"
              multiple
              onChange={handleFileUpload}
            />
            {referralData.attachments.length > 0 && (
              <div className="text-sm text-muted-foreground">
                Files: {referralData.attachments.join(", ")}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          onClick={handleSaveDraft}
          disabled={isSavingDraft || isSubmitting}
          variant="outline"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSavingDraft ? "Saving..." : "Save as Draft"}
        </Button>
        <Button
          onClick={handleSubmitReferral}
          disabled={isSubmitting || isSavingDraft}
        >
          <Send className="w-4 h-4 mr-2" />
          {isSubmitting ? "Creating..." : "Create Referral"}
        </Button>
      </div>
    </div>
  )
}