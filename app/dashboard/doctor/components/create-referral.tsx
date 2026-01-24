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
import { Search, Save, Send, AlertCircle, Phone, User, Calendar, MapPin, Hash, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

interface Patient {
  _id: string
  fullName: string
  phone: string
  sex: "Male" | "Female"
  dateOfBirth: string
  nationalId?: string
  address?: string
}

// Helper function to format and validate Ethiopian phone numbers
const formatAndValidateEthiopianPhone = (phone: string): { 
  formatted: string; 
  isValid: boolean; 
  error?: string 
} => {
  if (!phone || phone.trim() === "") {
    return { formatted: "", isValid: false, error: "Phone number is required" }
  }
  
  const digits = phone.replace(/\D/g, '')
  
  if (digits.length === 0) {
    return { formatted: phone, isValid: false, error: "Please enter a valid phone number" }
  }
  
  let formatted = phone
  
  if (digits.startsWith('0') && digits.length >= 10) {
    formatted = `+251${digits.substring(1)}`
  } else if (digits.length === 9) {
    formatted = `+251${digits}`
  } else if (digits.startsWith('251') && digits.length >= 12) {
    formatted = `+${digits}`
  } else if (phone.startsWith('+251') && phone.length >= 13) {
    formatted = phone
  } else if (phone.startsWith('+') && !phone.startsWith('+251')) {
    return { 
      formatted: phone, 
      isValid: false, 
      error: "Please use Ethiopian phone number format (+251XXXXXXXXX)" 
    }
  }
  
  const ethiopianMobileRegex = /^\+2519\d{8}$/
  const isValid = ethiopianMobileRegex.test(formatted)
  
  if (!isValid) {
    return { 
      formatted, 
      isValid: false, 
      error: "Invalid Ethiopian mobile number. Format: +251911234567 or 0911234567" 
    }
  }
  
  return { formatted, isValid: true }
}

interface ReferralPayload {
  fromHospital: string
  doctorName: string
  patient: {
    fullName: string
    sex: "Male" | "Female"
    dateOfBirth: string
    phone: string
    nationalId: string
    address: string
  }
  patientName: string
  patientPhone: string
  urgency: "ROUTINE" | "URGENT" | "EMERGENCY"
  reasonForReferral: string
  clinicalNotes?: string
  requiredSpecialty?: string
  requiredBedType?: string
  attachments: string[]
  toHospital?: string  // Make toHospital optional
}

export function CreateReferral() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchType, setSearchType] = useState<"phone" | "nationalId" | "fullName">("phone")
  const [searching, setSearching] = useState(false)
  const [foundPatient, setFoundPatient] = useState<Patient | null>(null)
  const [searchResults, setSearchResults] = useState<Patient[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Referral form data
  const [referralData, setReferralData] = useState({
    urgency: "ROUTINE" as "ROUTINE" | "URGENT" | "EMERGENCY",
    reasonForReferral: "",
    clinicalNotes: "",
    requiredSpecialty: "",
    requiredBedType: "",
    attachments: [] as string[],
  })

  const [hospitals, setHospitals] = useState<Array<{ _id: string; name: string }>>([])

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
        // Format phone for search
        const validation = formatAndValidateEthiopianPhone(searchQuery.trim())
        searchParams.phone = validation.formatted || searchQuery.trim()
      } else if (searchType === "nationalId") {
        searchParams.nationalId = searchQuery.trim()
      } else {
        searchParams.fullName = searchQuery.trim()
      }

      console.log("[Referral Search] Searching with params:", searchParams)
      const response = await apiClient.searchPatients(searchParams)
      const patients = response.data || response

      if (Array.isArray(patients)) {
        // Filter patients client-side if API returns all patients
        const filteredPatients = filterPatientsBySearchQuery(patients, searchQuery, searchType)
        
        if (filteredPatients.length > 0) {
          setSearchResults(filteredPatients)
          if (filteredPatients.length === 1) {
            // Auto-select if only one result
            handleSelectPatient(filteredPatients[0])
          }
        } else {
          setError(`No patient found with "${searchQuery}". Please check the details or use the Patient Management page to register new patients.`)
        }
      } else {
        setError(`No patient found with "${searchQuery}". Please check the details or use the Patient Management page to register new patients.`)
      }
    } catch (err: any) {
      console.error("Error searching patient:", err)
      setError(err.message || "Failed to search patient")
    } finally {
      setSearching(false)
    }
  }

  // Helper function to filter patients client-side
  const filterPatientsBySearchQuery = (patients: Patient[], query: string, type: "phone" | "nationalId" | "fullName"): Patient[] => {
    const normalizedQuery = query.toLowerCase().trim()
    
    return patients.filter(patient => {
      if (type === "phone") {
        // For phone search, compare both original and formatted phone
        const validation = formatAndValidateEthiopianPhone(normalizedQuery)
        const formattedQuery = validation.formatted.toLowerCase()
        
        return (
          patient.phone.toLowerCase().includes(normalizedQuery) ||
          patient.phone.toLowerCase().includes(formattedQuery) ||
          (formattedQuery && patient.phone.toLowerCase().includes(formattedQuery.replace('+251', '0'))) ||
          patient.phone.toLowerCase().includes(normalizedQuery.replace(/\D/g, ''))
        )
      } else if (type === "nationalId") {
        // For national ID, exact match or partial
        return patient.nationalId?.toLowerCase().includes(normalizedQuery) || false
      } else {
        // For name search, check if query is included in full name
        return patient.fullName.toLowerCase().includes(normalizedQuery)
      }
    })
  }

  const handleSelectPatient = (patient: Patient) => {
    setFoundPatient(patient)
    setSearchResults([])
  }

  const handleSaveDraft = async () => {
    if (!user?.hospitalId) {
      setError("Hospital ID not found. Please log in again.")
      return
    }

    if (!foundPatient) {
      setError("Please select a patient first")
      return
    }

    if (!referralData.reasonForReferral) {
      setError("Please enter reason for referral")
      return
    }

    setIsSavingDraft(true)
    setError("")
    setSuccess("")

    try {
      // Validate phone number
      const phoneValidation = formatAndValidateEthiopianPhone(foundPatient.phone)
      if (!phoneValidation.isValid) {
        setError(`Invalid phone number for patient: ${phoneValidation.error}`)
        setIsSavingDraft(false)
        return
      }

      // Create base payload
      const referralPayload: ReferralPayload = {
        fromHospital: user.hospitalId,
        doctorName: user.name || user.email || "Doctor",
        // Send patient as an object (required by backend)
        patient: {
          fullName: foundPatient.fullName,
          sex: foundPatient.sex,
          dateOfBirth: foundPatient.dateOfBirth,
          phone: phoneValidation.formatted,
          nationalId: foundPatient.nationalId || "",
          address: foundPatient.address || "",
        },
        patientName: foundPatient.fullName,
        patientPhone: phoneValidation.formatted,
        urgency: referralData.urgency,
        reasonForReferral: referralData.reasonForReferral,
        clinicalNotes: referralData.clinicalNotes || undefined,
        requiredSpecialty: referralData.requiredSpecialty || undefined,
        requiredBedType: referralData.requiredBedType || undefined,
        attachments: referralData.attachments || [],
      }

      // Add toHospital only if selected - use type assertion
      if (referralData.toHospital) {
        (referralPayload as any).toHospital = referralData.toHospital
      }

      console.log("[Save Draft] Sending payload:", JSON.stringify(referralPayload, null, 2))

      // Use the regular create endpoint - backend automatically creates as DRAFT
      const response = await apiClient.createReferral(referralPayload as any)
      
      console.log("[Save Draft] Response:", response)
      
      setSuccess("Referral saved as draft successfully! The liaison officer will review and send it.")
      
      // Reset form after successful save
      setTimeout(() => {
        setFoundPatient(null)
        setReferralData({
          urgency: "ROUTINE",
          reasonForReferral: "",
          clinicalNotes: "",
          requiredSpecialty: "",
          requiredBedType: "",
          attachments: [],
        })
        setSearchQuery("")
        setSearchResults([])
        setSuccess("")
      }, 3000)
    } catch (err: any) {
      console.error("[Save Draft] Error details:", err)
      
      let errorMessage = err.message || "Failed to save draft"
      if (err.message?.includes("patientPhone must be a valid phone number")) {
        errorMessage = `Phone validation failed. Patient phone: ${foundPatient.phone}. Please update patient details.`
      } else if (err.message?.includes("400")) {
        errorMessage = "Bad request. Please check all fields are filled correctly."
      } else if (err.message?.includes("patient must be an object")) {
        errorMessage = "Patient data format error. Please ensure all patient fields are filled correctly."
      }
      
      setError(errorMessage)
    } finally {
      setIsSavingDraft(false)
    }
  }

  const handleSubmitReferral = async () => {
    if (!user?.hospitalId) {
      setError("Hospital ID not found. Please log in again.")
      return
    }

    if (!foundPatient) {
      setError("Please select a patient first")
      return
    }

    if (!referralData.reasonForReferral) {
      setError("Please enter reason for referral")
      return
    }

    setIsSubmitting(true)
    setError("")
    setSuccess("")

    try {
      // Validate phone number
      const phoneValidation = formatAndValidateEthiopianPhone(foundPatient.phone)
      if (!phoneValidation.isValid) {
        setError(`Invalid phone number for patient: ${phoneValidation.error}`)
        setIsSubmitting(false)
        return
      }

      // Create base payload
      const referralPayload: ReferralPayload = {
        fromHospital: user.hospitalId,
        doctorName: user.name || user.email || "Doctor",
        // Send patient as an object (required by backend)
        patient: {
          fullName: foundPatient.fullName,
          sex: foundPatient.sex,
          dateOfBirth: foundPatient.dateOfBirth,
          phone: phoneValidation.formatted,
          nationalId: foundPatient.nationalId || "",
          address: foundPatient.address || "",
        },
        patientName: foundPatient.fullName,
        patientPhone: phoneValidation.formatted,
        urgency: referralData.urgency,
        reasonForReferral: referralData.reasonForReferral,
        clinicalNotes: referralData.clinicalNotes || undefined,
        requiredSpecialty: referralData.requiredSpecialty || undefined,
        requiredBedType: referralData.requiredBedType || undefined,
        attachments: referralData.attachments || [],
      }

      // Add toHospital only if selected - use type assertion
      if (referralData.toHospital) {
        (referralPayload as any).toHospital = referralData.toHospital
      }

      console.log("[Submit Referral] Full payload:", JSON.stringify(referralPayload, null, 2))

      // Call the regular create endpoint
      const referral = await apiClient.createReferral(referralPayload as any)
      console.log("[Submit Referral] Response:", referral)
      
      const referralId = referral._id || referral.data?._id

      if (!referralId) {
        console.error("[Submit Referral] Referral response:", referral)
        throw new Error("Failed to create referral. No referral ID returned.")
      }

      console.log("[Submit Referral] Referral created with ID:", referralId)

      setSuccess("Referral created successfully! The liaison officer will review and send it.")
      
      // Reset form
      setTimeout(() => {
        setFoundPatient(null)
        setReferralData({
          urgency: "ROUTINE",
          reasonForReferral: "",
          clinicalNotes: "",
          requiredSpecialty: "",
          requiredBedType: "",
          attachments: [],
        })
        setSearchQuery("")
        setSearchResults([])
        setSuccess("")
      }, 3000)
    } catch (err: any) {
      console.error("[Submit Referral] Full error:", err)
      
      let errorMessage = err.message || "Failed to submit referral"
      if (err.message?.includes("patientPhone must be a valid phone number")) {
        errorMessage = `Phone validation failed. Patient phone: ${foundPatient.phone}. Please update patient details.`
      } else if (err.message?.includes("400")) {
        errorMessage = "Bad request (400). Please check all fields and try again."
      } else if (err.message?.includes("patient must be an object")) {
        errorMessage = "Patient data format error. Please ensure all patient fields are filled correctly."
      }
      
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const fileNames = Array.from(files).map(file => file.name)
      setReferralData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...fileNames]
      }))
    }
  }

  const clearSearch = () => {
    setSearchQuery("")
    setSearchResults([])
    setFoundPatient(null)
    setError("")
  }

  const calculateAge = (dateOfBirth: string) => {
    try {
      const today = new Date()
      const birthDate = new Date(dateOfBirth)
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      return age
    } catch {
      return 0
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Create Referral</h2>
        <p className="text-muted-foreground">Search for existing patient and create a referral</p>
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
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Find Patient
          </CardTitle>
          <CardDescription>
            Search for existing patient by phone, national ID, or name. Register new patients from the Patient Management page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search Section */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <Select value={searchType} onValueChange={(value: any) => {
                setSearchType(value)
                setSearchQuery("")
                setSearchResults([])
                setFoundPatient(null)
              }}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="phone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone
                  </SelectItem>
                  <SelectItem value="nationalId" className="flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    National ID
                  </SelectItem>
                  <SelectItem value="fullName" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Name
                  </SelectItem>
                </SelectContent>
              </Select>
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={`Search by ${searchType === "phone" ? "phone number (0911234567)" : searchType === "nationalId" ? "national ID" : "full name"}`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearchPatient()}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearchPatient} disabled={searching || !searchQuery.trim()}>
                {searching ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
              {searchQuery && (
                <Button variant="outline" onClick={clearSearch}>
                  Clear
                </Button>
              )}
            </div>

            {searchType === "phone" && (
              <div className="text-xs text-muted-foreground bg-blue-50 p-3 rounded-md">
                <p className="font-medium mb-1">📱 Phone Number Format Examples:</p>
                <ul className="space-y-1">
                  <li>• <span className="font-mono">0911234567</span> → Will convert to <span className="font-mono">+251911234567</span></li>
                  <li>• <span className="font-mono">+251911234567</span> → Accepted as is</li>
                  <li>• <span className="font-mono">911234567</span> → Will convert to <span className="font-mono">+251911234567</span></li>
                </ul>
              </div>
            )}
          </div>

          {/* Selected Patient Display */}
          {foundPatient && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800 flex items-center gap-2 mb-3">
                    <User className="w-4 h-4" />
                    ✓ Patient selected for referral
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium ml-2">{foundPatient.fullName}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Phone:</span>
                      <span className="font-medium ml-2">{foundPatient.phone}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Gender:</span>
                      <Badge variant="outline" className="ml-2 capitalize">{foundPatient.sex}</Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Age:</span>
                      <span className="font-medium ml-2">
                        {foundPatient.dateOfBirth ? `${calculateAge(foundPatient.dateOfBirth)} years` : "N/A"}
                      </span>
                    </div>
                    {foundPatient.nationalId && (
                      <div>
                        <span className="text-muted-foreground">National ID:</span>
                        <span className="font-medium ml-2">{foundPatient.nationalId}</span>
                      </div>
                    )}
                    {foundPatient.address && (
                      <div className="md:col-span-2">
                        <span className="text-muted-foreground">Address:</span>
                        <span className="font-medium ml-2">{foundPatient.address}</span>
                      </div>
                    )}
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setFoundPatient(null)
                    setSearchResults([])
                  }}
                >
                  Change Patient
                </Button>
              </div>
            </div>
          )}

          {/* Search Results */}
          {!foundPatient && searchResults.length > 0 && (
            <div className="border rounded-lg">
              <div className="p-4 border-b bg-muted/50">
                <p className="font-medium">Select a patient:</p>
                <p className="text-sm text-muted-foreground mt-1">{searchResults.length} patient(s) found</p>
              </div>
              <div className="divide-y max-h-[400px] overflow-y-auto">
                {searchResults.map((patient) => (
                  <button
                    key={patient._id}
                    type="button"
                    className="w-full text-left p-4 hover:bg-muted/50 transition-colors"
                    onClick={() => handleSelectPatient(patient)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{patient.fullName}</div>
                        <div className="text-sm text-muted-foreground mt-2 space-y-1">
                          <div className="flex items-center gap-2">
                            <Phone className="w-3 h-3" />
                            {patient.phone}
                          </div>
                          {patient.nationalId && (
                            <div className="flex items-center gap-2">
                              <Hash className="w-3 h-3" />
                              {patient.nationalId}
                            </div>
                          )}
                          {patient.dateOfBirth && (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3 h-3" />
                              {formatDate(patient.dateOfBirth)}
                              {calculateAge(patient.dateOfBirth) > 0 && (
                                <span className="text-xs bg-muted px-2 py-0.5 rounded">
                                  {calculateAge(patient.dateOfBirth)} years
                                </span>
                              )}
                            </div>
                          )}
                          {patient.address && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate max-w-[200px]">{patient.address}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-sm">
                        <Badge variant="outline" className="capitalize">
                          {patient.sex}
                        </Badge>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Initial State - No search yet */}
          {!foundPatient && searchResults.length === 0 && !searchQuery && (
            <div className="text-center p-8 border-2 border-dashed rounded-lg">
              <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">Search for an existing patient to create a referral</p>
              <p className="text-sm text-muted-foreground">
                Use the search bar above to find patients by phone, national ID, or name
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Referral Details Section - Only show if patient is selected */}
      {foundPatient && (
        <Card>
          <CardHeader>
            <CardTitle>Referral Details</CardTitle>
            <CardDescription>
              Create referral for {foundPatient.fullName}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                required
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <p className="font-medium mb-1">Files to be attached:</p>
                  <ul className="space-y-1">
                    {referralData.attachments.map((file, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <span className="bg-muted px-2 py-1 rounded text-xs">{file}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons - Only show if patient is selected */}
      {foundPatient && (
        <div className="flex gap-4 pt-4">
          <Button
            onClick={handleSaveDraft}
            disabled={isSavingDraft || isSubmitting || !referralData.reasonForReferral}
            variant="outline"
            className="flex-1"
          >
            {isSavingDraft ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save as Draft
              </>
            )}
          </Button>
          <Button
            onClick={handleSubmitReferral}
            disabled={isSubmitting || isSavingDraft || !referralData.reasonForReferral}
            className="flex-1"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Create Referral
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}