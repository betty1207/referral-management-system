"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Eye, UserPlus, Phone, User, Calendar, MapPin, Hash, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

export function PatientsList() {
  const [allPatients, setAllPatients] = useState<Patient[]>([])
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false)
  const [registering, setRegistering] = useState(false)
  const [activeTab, setActiveTab] = useState("search")
  const [phoneValidation, setPhoneValidation] = useState<{ 
    formatted: string; 
    isValid: boolean; 
    error?: string 
  }>({ formatted: "", isValid: false })

  const [patientData, setPatientData] = useState({
    fullName: "",
    sex: "Male" as "Male" | "Female",
    dateOfBirth: "",
    phone: "",
    nationalId: "",
    address: "",
  })

  // Validate phone when it changes
  useEffect(() => {
    if (patientData.phone) {
      const validation = formatAndValidateEthiopianPhone(patientData.phone)
      setPhoneValidation(validation)
    } else {
      setPhoneValidation({ 
        formatted: "", 
        isValid: false, 
        error: "Phone number is required" 
      })
    }
  }, [patientData.phone])

  // Fetch all patients on initial load (if you have an endpoint for this)
  useEffect(() => {
    const fetchAllPatients = async () => {
      try {
        // If you have an endpoint to get all patients, use it here
        // For now, we'll start with empty array
        setAllPatients([])
        setFilteredPatients([])
      } catch (err) {
        console.error("Error fetching patients:", err)
      }
    }
    fetchAllPatients()
  }, [])

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError("Please enter a search query")
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const q = searchQuery.trim()
      let searchParams: any = {}
      
      // Determine search type based on input
      const digitsOnly = q.replace(/\D/g, '')
      
      if (digitsOnly.length >= 9 && digitsOnly.length <= 15) {
        // Looks like a phone number
        const validation = formatAndValidateEthiopianPhone(q)
        searchParams.phone = validation.formatted || q
      } else if (q.match(/^\d+$/)) {
        // If it's all digits, could be national ID
        searchParams.nationalId = q
      } else {
        // Otherwise search by name
        searchParams.fullName = q
      }

      console.log("[Patient Search] Searching with params:", searchParams)
      const response = await apiClient.searchPatients(searchParams)
      const patientsData = response.data || response
      const patientsList = Array.isArray(patientsData) ? patientsData : []
      
      console.log("[Patient Search] Found:", patientsList.length, "patients")
      setAllPatients(patientsList)
      setFilteredPatients(patientsList) // Initially show all results
      
      if (patientsList.length === 0) {
        setSuccess(`No patients found for "${searchQuery}". Try registering a new patient.`)
      } else {
        setSuccess(`Found ${patientsList.length} patient(s)`)
      }
    } catch (err: any) {
      console.error("Error searching patients:", err)
      setError(err.message || "Failed to search patients")
      setAllPatients([])
      setFilteredPatients([])
    } finally {
      setIsLoading(false)
    }
  }

  // Filter patients based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPatients(allPatients)
      return
    }

    const query = searchQuery.toLowerCase().trim()
    const filtered = allPatients.filter((patient) => {
      return (
        patient.fullName?.toLowerCase().includes(query) ||
        patient.phone?.toLowerCase().includes(query) ||
        (patient.nationalId && patient.nationalId.toLowerCase().includes(query)) ||
        (patient.address && patient.address.toLowerCase().includes(query))
      )
    })
    setFilteredPatients(filtered)
  }, [searchQuery, allPatients])

  const handleRegisterPatient = async () => {
    if (!patientData.fullName || !patientData.phone || !patientData.dateOfBirth) {
      setError("Please fill in all required fields (Name, Phone, Date of Birth)")
      return
    }

    // Validate phone number
    if (!phoneValidation.isValid) {
      setError(phoneValidation.error || "Please enter a valid phone number")
      return
    }

    setRegistering(true)
    setError("")

    try {
      console.log("[Register Patient] Creating patient with phone:", phoneValidation.formatted)
      
      const response = await apiClient.findOrCreatePatient({
        fullName: patientData.fullName,
        sex: patientData.sex,
        dateOfBirth: patientData.dateOfBirth,
        phone: phoneValidation.formatted,
        nationalId: patientData.nationalId || undefined,
        address: patientData.address || undefined,
      })

      console.log("[Register Patient] Response:", response)
      
      // Reset form
      setPatientData({
        fullName: "",
        sex: "Male",
        dateOfBirth: "",
        phone: "",
        nationalId: "",
        address: "",
      })
      
      setSuccess("Patient registered successfully!")
      setIsRegisterDialogOpen(false)
      
      // Add the new patient to the list if search is active
      const newPatient = response.data || response
      if (newPatient && newPatient._id) {
        setAllPatients(prev => [newPatient, ...prev])
        setFilteredPatients(prev => [newPatient, ...prev])
      }
    } catch (err: any) {
      console.error("[Register Patient] Error:", err)
      setError(err.message || "Failed to register patient")
    } finally {
      setRegistering(false)
    }
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

  const clearSearch = () => {
    setSearchQuery("")
    setAllPatients([])
    setFilteredPatients([])
    setError("")
    setSuccess("")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Patient Management</h2>
          <p className="text-sm text-muted-foreground">Search and manage patient records</p>
        </div>
        
        <Dialog open={isRegisterDialogOpen} onOpenChange={setIsRegisterDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-cyan-600 hover:bg-cyan-700 gap-2">
              <UserPlus className="w-4 h-4" />
              Register New Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Register New Patient
              </DialogTitle>
              <DialogDescription>
                Enter patient information to register them in the system
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Full Name *
                  </Label>
                  <Input
                    id="fullName"
                    value={patientData.fullName}
                    onChange={(e) => setPatientData({ ...patientData, fullName: e.target.value })}
                    placeholder="Enter full name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={patientData.phone}
                    onChange={(e) => setPatientData({ ...patientData, phone: e.target.value })}
                    placeholder="0911234567 or +251911234567"
                    className={phoneValidation.isValid ? "border-green-500" : patientData.phone ? "border-red-500" : ""}
                  />
                  {patientData.phone && (
                    <div className="text-xs">
                      <p className={phoneValidation.isValid ? "text-green-600 font-medium" : "text-red-500"}>
                        {phoneValidation.isValid 
                          ? `✓ Will be saved as: ${phoneValidation.formatted}`
                          : `✗ ${phoneValidation.error || "Invalid format"}`}
                      </p>
                    </div>
                  )}
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
                  <Label htmlFor="dateOfBirth" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date of Birth *
                  </Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={patientData.dateOfBirth}
                    onChange={(e) => setPatientData({ ...patientData, dateOfBirth: e.target.value })}
                    max={new Date().toISOString().split("T")[0]}
                  />
                  {patientData.dateOfBirth && (
                    <p className="text-xs text-muted-foreground">
                      Age: {calculateAge(patientData.dateOfBirth)} years
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="nationalId" className="flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    National ID (Optional)
                  </Label>
                  <Input
                    id="nationalId"
                    value={patientData.nationalId}
                    onChange={(e) => setPatientData({ ...patientData, nationalId: e.target.value })}
                    placeholder="Enter national ID"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Address (Optional)
                  </Label>
                  <Input
                    id="address"
                    value={patientData.address}
                    onChange={(e) => setPatientData({ ...patientData, address: e.target.value })}
                    placeholder="Enter address"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setIsRegisterDialogOpen(false)}
                  disabled={registering}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleRegisterPatient} 
                  disabled={registering || !phoneValidation.isValid || !patientData.fullName || !patientData.dateOfBirth}
                >
                  {registering ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    "Register Patient"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 border-green-200 text-green-800">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Patient Search</CardTitle>
                <CardDescription>Search patients by phone, name, or national ID</CardDescription>
              </div>
              
              <TabsList>
                <TabsTrigger value="search">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </TabsTrigger>
                <TabsTrigger value="recent">
                  <User className="w-4 h-4 mr-2" />
                  Recent
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="mt-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by phone, name, or national ID..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <Button 
                  onClick={handleSearch} 
                  disabled={isLoading || !searchQuery.trim()}
                  className="min-w-[100px]"
                >
                  {isLoading ? (
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
              
              <div className="mt-2 text-xs text-muted-foreground">
                <p>💡 Search tips:</p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Phone numbers: <span className="font-mono">0911234567</span> or <span className="font-mono">+251911234567</span></li>
                  <li>National ID: Enter the complete ID number</li>
                  <li>Name: Full or partial name</li>
                </ul>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <TabsContent value="search" className="mt-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mr-3" />
                  <span className="text-muted-foreground">Searching patients...</span>
                </div>
              ) : filteredPatients.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Patient</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Contact</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Details</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPatients.map((patient) => (
                        <tr key={patient._id} className="border-b border-border hover:bg-muted/50">
                          <td className="py-3 px-4">
                            <div className="font-medium">{patient.fullName}</div>
                            <div className="text-sm text-muted-foreground mt-1">
                              <Badge variant="outline" className="capitalize">
                                {patient.sex}
                              </Badge>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              <div className="text-sm flex items-center gap-2">
                                <Phone className="w-3 h-3" />
                                {patient.phone}
                              </div>
                              {patient.nationalId && (
                                <div className="text-xs text-muted-foreground flex items-center gap-2">
                                  <Hash className="w-3 h-3" />
                                  {patient.nationalId}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm space-y-1">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-3 h-3" />
                                {formatDate(patient.dateOfBirth)}
                                {calculateAge(patient.dateOfBirth) > 0 && (
                                  <Badge variant="secondary" className="text-xs">
                                    {calculateAge(patient.dateOfBirth)}y
                                  </Badge>
                                )}
                              </div>
                              {patient.address && (
                                <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                  <MapPin className="w-3 h-3 inline mr-1" />
                                  {patient.address}
                                </div>
                              )}
                            </div>
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
                  <div className="mt-4 text-sm text-muted-foreground text-center">
                    Showing {filteredPatients.length} of {allPatients.length} patients
                    {searchQuery && ` matching "${searchQuery}"`}
                  </div>
                </div>
              ) : searchQuery ? (
                <div className="text-center py-12 text-muted-foreground">
                  <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No patients found for "{searchQuery}"</p>
                  <p className="text-sm mt-2">Try a different search or register as a new patient</p>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Search for patients to view their information</p>
                  <p className="text-sm mt-2">Enter a phone number, name, or national ID above</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="recent" className="mt-0">
              <div className="text-center py-12 text-muted-foreground">
                <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Recent patients feature coming soon</p>
                <p className="text-sm mt-2">Search for patients using the search tab</p>
              </div>
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>

      {/* Patient Details Dialog */}
      {selectedPatient && (
        <Dialog open={!!selectedPatient} onOpenChange={() => setSelectedPatient(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Patient Details
              </DialogTitle>
              <DialogDescription>Complete patient information</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                    <p className="text-lg font-semibold">{selectedPatient.fullName}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Gender</Label>
                    <div className="mt-1">
                      <Badge className="capitalize">{selectedPatient.sex}</Badge>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Date of Birth</Label>
                    <p className="text-sm mt-1">
                      {formatDate(selectedPatient.dateOfBirth)}
                      {calculateAge(selectedPatient.dateOfBirth) > 0 && (
                        <span className="ml-2 text-muted-foreground">
                          ({calculateAge(selectedPatient.dateOfBirth)} years old)
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone Number
                    </Label>
                    <p className="text-sm font-mono mt-1">{selectedPatient.phone}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Hash className="w-4 h-4" />
                      National ID
                    </Label>
                    <p className="text-sm mt-1">{selectedPatient.nationalId || "Not provided"}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Address
                    </Label>
                    <p className="text-sm mt-1">{selectedPatient.address || "Not provided"}</p>
                  </div>
                </div>
              </div>
              
              {selectedPatient.createdAt && (
                <div className="pt-4 border-t">
                  <Label className="text-sm font-medium text-muted-foreground">Record Created</Label>
                  <p className="text-sm mt-1">
                    {new Date(selectedPatient.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setSelectedPatient(null)}>
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    // You could add "Create Referral for this patient" functionality here
                    setSelectedPatient(null)
                  }}
                >
                  Create Referral
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}