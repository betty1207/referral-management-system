"use client"

import { useState, useEffect, useMemo } from "react"
import { useAuth } from "@/lib/auth-context"
import { apiClient } from "@/lib/api-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { 
  Users, 
  CheckCircle, 
  AlertCircle, 
  Search,
  Loader2,
  FileText,
  Calendar,
  Phone,
  User,
  MapPin,
  Hospital,
  Clock,
  Activity,
  Filter,
  RefreshCw,
  TrendingUp
} from "lucide-react"

interface PatientData {
  _id: string
  referralCode: string
  patient: {
    fullName: string
    dateOfBirth: string
    phone: string
    nationalId?: string
    address?: string
  }
  fromHospital: string
  doctorName: string
  urgency: "ROUTINE" | "URGENT" | "EMERGENCY"
  reasonForReferral: string
  clinicalNotes?: string
  requiredSpecialty?: string
  status: "ACCEPTED" | "CHECKED_IN" | "COMPLETED" | "CANCELLED"
  acceptedAt?: string
  checkedInAt?: string
  completedAt?: string
  createdAt: string
  updatedAt: string
}

interface QueueStats {
  total: number
  accepted: number
  checkedIn: number
  completed: number
  urgent: number
  emergency: number
}

export function CompleteTreatmentPage() {
  const { user } = useAuth()
  const [referrals, setReferrals] = useState<PatientData[]>([])
  const [allReferrals, setAllReferrals] = useState<PatientData[]>([]) // For statistics
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<PatientData | null>(null)
  const [filter, setFilter] = useState<"all" | "checked_in">("checked_in")
  const [refreshing, setRefreshing] = useState(false)

  // Fetch completed referrals separately
  const fetchCompletedReferrals = async () => {
    try {
      console.log("[CompleteTreatmentPage] Fetching completed referrals...")
      const completedResponse = await apiClient.get('/referrals/specialist/completed')
      const completedData = completedResponse.data || completedResponse
      const completedArray = Array.isArray(completedData) ? completedData : []
      
      // Map completed referrals
      const mappedCompleted = completedArray.map((referral: any): PatientData => ({
        _id: referral._id || referral.id,
        referralCode: referral.referralCode,
        patient: {
          fullName: referral.patient?.fullName || referral.patientName || "Unknown Patient",
          dateOfBirth: referral.patient?.dateOfBirth || referral.dateOfBirth || "",
          phone: referral.patient?.phone || referral.patientPhone || "",
          nationalId: referral.patient?.nationalId || referral.nationalId,
          address: referral.patient?.address || referral.address
        },
        fromHospital: typeof referral.fromHospital === 'string' 
          ? referral.fromHospital 
          : referral.fromHospital?.name || "Unknown Hospital",
        doctorName: referral.doctorName || "Unknown Doctor",
        urgency: referral.urgency || "ROUTINE",
        reasonForReferral: referral.reasonForReferral || "No reason provided",
        clinicalNotes: referral.clinicalNotes || referral.notes || "",
        requiredSpecialty: referral.requiredSpecialty || referral.specialty,
        status: "COMPLETED",
        acceptedAt: referral.acceptedAt,
        checkedInAt: referral.checkedInAt,
        completedAt: referral.completedAt,
        createdAt: referral.createdAt,
        updatedAt: referral.updatedAt
      }))
      
      return mappedCompleted
    } catch (error) {
      console.log("[CompleteTreatmentPage] Failed to fetch completed referrals:", error)
      return []
    }
  }

  // Fetch checked-in patients for treatment completion
  const fetchCheckedInPatients = async () => {
    try {
      setIsLoading(true)
      setError("")

      console.log("[CompleteTreatmentPage] Fetching patient data...")
      
      // Try to get real data first, fallback to mock
      try {
        // Fetch both active and completed referrals in parallel
        const [specialistResponse, completedReferrals] = await Promise.all([
          apiClient.get('/referrals/specialist/queue'),
          fetchCompletedReferrals()
        ])
        
        // Process active referrals
        const specialistQueueData = specialistResponse.data || specialistResponse
        const specialistReferralsArray = Array.isArray(specialistQueueData) ? specialistQueueData : []
        
        // Map active referrals
        const mappedActiveReferrals = specialistReferralsArray.map((referral: any): PatientData => ({
          _id: referral._id || referral.id,
          referralCode: referral.referralCode,
          patient: {
            fullName: referral.patient?.fullName || referral.patientName || "Unknown Patient",
            dateOfBirth: referral.patient?.dateOfBirth || referral.dateOfBirth || "",
            phone: referral.patient?.phone || referral.patientPhone || "",
            nationalId: referral.patient?.nationalId || referral.nationalId,
            address: referral.patient?.address || referral.address
          },
          fromHospital: typeof referral.fromHospital === 'string' 
            ? referral.fromHospital 
            : referral.fromHospital?.name || "Unknown Hospital",
          doctorName: referral.doctorName || "Unknown Doctor",
          urgency: referral.urgency || "ROUTINE",
          reasonForReferral: referral.reasonForReferral || "No reason provided",
          clinicalNotes: referral.clinicalNotes || referral.notes || "",
          requiredSpecialty: referral.requiredSpecialty || referral.specialty,
          status: referral.status || "CHECKED_IN",
          acceptedAt: referral.acceptedAt,
          checkedInAt: referral.checkedInAt,
          completedAt: referral.completedAt,
          createdAt: referral.createdAt,
          updatedAt: referral.updatedAt
        }))
        
        // Combine both for statistics
        const allCombined = [...mappedActiveReferrals, ...completedReferrals]
        
        // Set states
        setAllReferrals(allCombined)
        setReferrals(mappedActiveReferrals.filter(r => r.status === "CHECKED_IN"))
        
        console.log("[CompleteTreatmentPage] Data loaded:", {
          active: mappedActiveReferrals.length,
          completed: completedReferrals.length,
          total: allCombined.length
        })
        
      } catch (apiError) {
        console.log("[CompleteTreatmentPage] API failed, using mock data:", apiError)
        
        // Use mock data for testing
        const mockData: PatientData[] = [
          {
            _id: "REF001",
            referralCode: "REF001",
            patient: {
              fullName: "John Doe",
              dateOfBirth: "1980-01-01",
              phone: "+1234567890",
              nationalId: "ID123456",
              address: "123 Main St, City"
            },
            fromHospital: "Health Center A",
            doctorName: "Dr. Smith",
            urgency: "URGENT",
            reasonForReferral: "Patient requires specialist consultation for chest pain",
            clinicalNotes: "Patient presents with acute chest pain, ECG normal, cardiac enzymes pending",
            requiredSpecialty: "Cardiology",
            status: "CHECKED_IN",
            acceptedAt: "2024-01-26T08:00:00Z",
            checkedInAt: "2024-01-26T09:30:00Z",
            createdAt: "2024-01-26T07:30:00Z",
            updatedAt: "2024-01-26T09:30:00Z"
          },
          {
            _id: "REF002",
            referralCode: "REF002",
            patient: {
              fullName: "Jane Smith",
              dateOfBirth: "1975-05-15",
              phone: "+0987654321",
              nationalId: "ID789012",
              address: "456 Oak Ave, Town"
            },
            fromHospital: "Community Clinic B",
            doctorName: "Dr. Johnson",
            urgency: "ROUTINE",
            reasonForReferral: "Follow-up consultation for diabetes management",
            clinicalNotes: "Patient with type 2 diabetes, well-controlled on current medication",
            requiredSpecialty: "Endocrinology",
            status: "CHECKED_IN",
            acceptedAt: "2024-01-26T10:00:00Z",
            checkedInAt: "2024-01-26T11:15:00Z",
            createdAt: "2024-01-26T09:00:00Z",
            updatedAt: "2024-01-26T11:15:00Z"
          },
          {
            _id: "REF003",
            referralCode: "REF003",
            patient: {
              fullName: "Robert Johnson",
              dateOfBirth: "1992-03-22",
              phone: "+1122334455",
              nationalId: "ID345678",
              address: "789 Pine Rd, Village"
            },
            fromHospital: "Emergency Department C",
            doctorName: "Dr. Wilson",
            urgency: "EMERGENCY",
            reasonForReferral: "Emergency admission for severe abdominal pain",
            clinicalNotes: "Patient presents with acute abdominal pain, possible appendicitis",
            requiredSpecialty: "General Surgery",
            status: "CHECKED_IN",
            acceptedAt: "2024-01-26T12:30:00Z",
            checkedInAt: "2024-01-26T13:00:00Z",
            createdAt: "2024-01-26T12:00:00Z",
            updatedAt: "2024-01-26T13:00:00Z"
          }
        ]
        
        setAllReferrals(mockData)
        setReferrals(mockData)
        console.log("[CompleteTreatmentPage] Mock data loaded:", mockData.length)
      }
      
    } catch (err: any) {
      console.error("[CompleteTreatmentPage] Error:", err)
      setError(err.message || "Failed to load checked-in patients")
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate queue statistics - make it reactive to state changes
  const stats = useMemo((): QueueStats => {
    console.log("[CompleteTreatmentPage] Calculating stats from:", allReferrals.length, "referrals")
    
    const calculated = {
      total: allReferrals.length,
      accepted: allReferrals.filter(r => r.status === "ACCEPTED").length,
      checkedIn: allReferrals.filter(r => r.status === "CHECKED_IN").length,
      completed: allReferrals.filter(r => r.status === "COMPLETED").length,
      urgent: allReferrals.filter(r => r.urgency === "URGENT").length,
      emergency: allReferrals.filter(r => r.urgency === "EMERGENCY").length
    }
    
    console.log("[CompleteTreatmentPage] Stats calculated:", calculated)
    return calculated
  }, [allReferrals])

  // Calculate patient age
  const calculateAge = (dateOfBirth: string) => {
    const birthDate = new Date(dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  // Get urgency color
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "EMERGENCY":
        return "bg-red-100 text-red-800 border-red-200 shadow-sm"
      case "URGENT":
        return "bg-orange-100 text-orange-800 border-orange-200 shadow-sm"
      default:
        return "bg-blue-100 text-blue-800 border-blue-200 shadow-sm"
    }
  }

  // Get status info
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "CHECKED_IN":
        return {
          icon: CheckCircle,
          color: "bg-green-100 text-green-600",
          label: "Currently at Hospital",
          description: "Patient has arrived and is checked in"
        }
      case "COMPLETED":
        return {
          icon: CheckCircle,
          color: "bg-gray-100 text-gray-600",
          label: "Completed",
          description: "Referral has been completed"
        }
      default:
        return {
          icon: Clock,
          color: "bg-blue-100 text-blue-600",
          label: "Upcoming Arrival",
          description: "Patient accepted, expected to arrive"
        }
    }
  }

  // Filter patients based on status and search
  const getFilteredReferrals = () => {
    let filtered = referrals
    
    // Status filtering
    if (filter === "checked_in") {
      filtered = filtered.filter(r => r.status === "CHECKED_IN")
    }
    
    // Search filtering
    if (searchTerm) {
      filtered = filtered.filter(patient => 
        (patient.patient?.fullName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (patient.referralCode || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (patient.fromHospital || "").toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    return filtered
  }

  // Handle complete treatment
  const handleCompleteTreatment = (patient: PatientData) => {
    setSelectedPatient(patient)
    setShowCompleteModal(true)
  }

  // Refresh data
  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchCheckedInPatients()
    setRefreshing(false)
  }

  useEffect(() => {
    fetchCheckedInPatients()
  }, [])

  const filteredReferrals = getFilteredReferrals()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Complete Treatment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Loading checked-in patients...
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with User Info */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <CheckCircle className="w-6 h-6" />
            Complete Treatment
          </h2>
          <p className="text-muted-foreground">
            Patients currently checked in and ready for treatment completion
          </p>
          {user && (
            <div className="mt-2 text-sm text-gray-600">
              <strong>Logged in as:</strong> {user.name || user.email} | 
              <strong> Role:</strong> {user.role} | 
              <strong> Hospital:</strong> {user.hospitalId || 'Not assigned'}
            </div>
          )}
        </div>
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Queue Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Queue</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Currently at Hospital</p>
                <p className="text-2xl font-bold text-green-600">{stats.checkedIn}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Urgent Cases</p>
                <p className="text-2xl font-bold text-orange-600">{stats.urgent + stats.emergency}</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertCircle className="w-4 h-4 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed Today</p>
                <p className="text-2xl font-bold text-gray-600">{stats.completed}</p>
              </div>
              <div className="p-2 bg-gray-100 rounded-lg">
                <TrendingUp className="w-4 h-4 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Status Filters */}
            <div>
              <p className="text-sm font-medium mb-2">Status</p>
              <div className="flex gap-2">
                <Button
                  variant={filter === "checked_in" ? "default" : "outline"}
                  onClick={() => setFilter("checked_in")}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Current ({stats.checkedIn})
                </Button>
              </div>
            </div>
            
            {/* Search */}
            <div>
              <p className="text-sm font-medium mb-2">Search Patients</p>
              <Input
                placeholder="Search by patient name, referral code, or hospital..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patients List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Patient Queue ({filteredReferrals.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredReferrals.length > 0 ? (
            <div className="space-y-4">
              {filteredReferrals.map((patient) => {
                const statusInfo = getStatusInfo(patient.status)
                const StatusIcon = statusInfo.icon
                
                return (
                  <div
                    key={patient._id}
                    className={`p-4 border rounded-lg hover:shadow-md transition-shadow ${
                      patient.status === "CHECKED_IN" 
                        ? "border-green-200 bg-green-50" 
                        : patient.status === "COMPLETED"
                        ? "border-gray-200 bg-gray-50"
                        : "border-blue-200 bg-blue-50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      {/* Patient Information */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`p-2 rounded-lg ${statusInfo.color}`}>
                            <StatusIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{patient.patient?.fullName || "Unknown Patient"}</h3>
                            <p className="text-sm text-muted-foreground">
                              {patient.patient?.dateOfBirth 
                                ? `${calculateAge(patient.patient.dateOfBirth)} years old` 
                                : "Age unknown"
                              } • {patient.patient?.phone || "No phone"}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-gray-500" />
                              <span className="text-sm font-medium">Referral Code:</span>
                              <Badge variant="outline">{patient.referralCode || "Unknown"}</Badge>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Hospital className="w-4 h-4 text-gray-500" />
                              <span className="text-sm font-medium">From:</span>
                              <span className="text-sm">{patient.fromHospital || "Unknown Hospital"}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <span className="text-sm">
                                Checked In: {patient.checkedInAt 
                                  ? new Date(patient.checkedInAt).toLocaleString()
                                  : "Unknown"
                                }
                              </span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div>
                              <span className="text-sm font-medium">Urgency:</span>
                              <div className="mt-1">
                                <Badge className={getUrgencyColor(patient.urgency)}>
                                  {patient.urgency}
                                </Badge>
                              </div>
                            </div>

                            {patient.requiredSpecialty && (
                              <div>
                                <span className="text-sm font-medium">Specialty:</span>
                                <p className="text-sm">{patient.requiredSpecialty}</p>
                              </div>
                            )}

                            <div>
                              <span className="text-sm font-medium">Reason for Referral:</span>
                              <p className="text-sm text-gray-700 mt-1">{patient.reasonForReferral || "No reason provided"}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="ml-4 space-y-2">
                        <div className="text-xs text-gray-600 text-center mb-2">
                          {statusInfo.label}
                        </div>
                        
                        {patient.status === "CHECKED_IN" && (
                          <Button
                            className="bg-green-600 hover:bg-green-700 w-full"
                            onClick={() => handleCompleteTreatment(patient)}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Complete Treatment
                          </Button>
                        )}
                        
                        {patient.status === "COMPLETED" && (
                          <div className="text-xs text-green-600 bg-green-50 p-2 rounded border border-green-200 text-center">
                            <CheckCircle className="w-3 h-3 mx-auto mb-1" />
                            Completed
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">No patients found</h3>
              <p className="text-muted-foreground">
                {searchTerm 
                  ? "No patients found matching your search criteria."
                  : "There are no patients currently checked in and ready for treatment completion."
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Complete Treatment Modal */}
      {showCompleteModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Complete Treatment</h2>
                <button
                  onClick={() => {
                    setShowCompleteModal(false)
                    setSelectedPatient(null)
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <p className="font-medium">Patient: {selectedPatient.patient?.fullName}</p>
                <p className="text-sm text-gray-600">Referral: {selectedPatient.referralCode}</p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Treatment Summary</label>
                <textarea
                  className="w-full p-2 border rounded-md"
                  rows={4}
                  placeholder="Enter treatment summary..."
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowCompleteModal(false)
                    setSelectedPatient(null)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    try {
                      // Make actual API call to complete treatment
                      const response = await apiClient.patch(`/referrals/${selectedPatient._id}/complete`, {
                        feedbackNote: "Treatment completed via doctor dashboard"
                      })

                      console.log("Treatment completion response:", response)

                      // Update local state to reflect the change
                      setReferrals(prevReferrals => 
                        prevReferrals.map(referral => 
                          referral._id === selectedPatient._id 
                            ? { ...referral, status: "COMPLETED" as const, completedAt: new Date().toISOString() }
                            : referral
                        )
                      )
                      
                      // Also update allReferrals for statistics
                      setAllReferrals(prevAllReferrals => 
                        prevAllReferrals.map(referral => 
                          referral._id === selectedPatient._id 
                            ? { ...referral, status: "COMPLETED" as const, completedAt: new Date().toISOString() }
                            : referral
                        )
                      )
                      
                      alert('Treatment completed successfully! Patient status updated to COMPLETED')
                      setShowCompleteModal(false)
                      setSelectedPatient(null)
                    } catch (error: any) {
                      console.error("Complete treatment error:", error)
                      
                      let errorMessage = "Failed to complete treatment"
                      
                      if (error.response?.status === 403) {
                        errorMessage = "You do not have permission to complete treatments. Only specialists can complete patient treatment."
                      } else if (error.response?.status === 404) {
                        errorMessage = "Referral not found or has already been completed"
                      } else if (error.response?.status === 405) {
                        errorMessage = "Method not allowed. The complete endpoint may not be implemented yet."
                      } else if (error.message?.includes("Forbidden resource")) {
                        errorMessage = "Access denied: The complete treatment endpoint is not available or you don't have permission."
                      } else if (error.response?.data?.message) {
                        errorMessage = error.response.data.message
                      }
                      
                      alert(`Error: ${errorMessage}`)
                    }
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Complete Treatment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
