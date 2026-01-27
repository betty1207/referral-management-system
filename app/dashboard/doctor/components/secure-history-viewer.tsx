"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  FileText,
  Unlock,
  Download,
  User,
  AlertCircle,
  Loader2,
  CheckCircle,
  Shield,
  Stethoscope,
  Phone,
  MapPin,
  Calendar,
  Hash,
  Building,
  MessageSquare,
  ClipboardCopy,
  Lock,
  Clock,
  Activity,
  Heart,
  Pill,
  Syringe,
  FileImage,
  File as FileIcon,
  Eye,
  ChevronRight,
  Info,
  UserCheck,
  Hospital,
  AlertTriangle,
  Check,
  Plus
} from "lucide-react"

interface PatientData {
  _id: string
  referralCode: string
  patient: {
    fullName: string
    sex: "Male" | "Female"
    dateOfBirth: string
    phone: string
    nationalId?: string
    address?: string
    email?: string
    bloodType?: string
    allergies?: string[]
    medications?: string[]
    medicalHistory?: string
  }
  fromHospital: string | { _id: string; name: string; region?: string; city?: string }
  doctorName: string
  urgency: "ROUTINE" | "URGENT" | "EMERGENCY"
  reasonForReferral: string
  clinicalNotes?: string
  requiredSpecialty?: string
  requiredBedType?: string
  status: string
  acceptedAt?: string
  checkedInAt?: string
  completedAt?: string
  createdAt: string
  updatedAt: string
  estimatedArrival?: string
  attachments?: string[]
  unlockedAt?: string
  unlockedBy?: string
}

export function SecureHistoryViewer() {
  const { user } = useAuth()
  const [referralCode, setReferralCode] = useState("")
  const [isUnlocking, setIsUnlocking] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [patientData, setPatientData] = useState<PatientData | null>(null)
  const [showData, setShowData] = useState(false)
  const [availableReferrals, setAvailableReferrals] = useState<any[]>([])
  const [isCreatingTest, setIsCreatingTest] = useState(false)
  const [testReferralCode, setTestReferralCode] = useState("")

  // Fetch referrals from specialist queue
  const fetchAvailableReferrals = async () => {
    try {
      const response = await apiClient.get('/referrals/specialist/queue')
      console.log("[Secure History] Available referrals:", response)
      console.log("[Secure History] User hospital ID:", user?.hospitalId)
      
      // Log hospital details for each referral
      const referralsWithHospitalInfo = (response || []).map((referral: any) => {
        console.log(`[Secure History] Referral ${referral.referralCode}:`, {
          referralCode: referral.referralCode,
          fromHospital: referral.fromHospital,
          toHospital: referral.toHospital,
          userHospitalId: user?.hospitalId,
          hospitalMatch: referral.fromHospital === user?.hospitalId || referral.toHospital === user?.hospitalId
        })
        return referral
      })
      
      setAvailableReferrals(referralsWithHospitalInfo)
    } catch (error) {
      console.error("[Secure History] Failed to fetch referrals:", error)
    }
  }

  // Fetch referrals on component mount
  useEffect(() => {
    fetchAvailableReferrals()
    
    // Check for referral parameter in URL
    const urlParams = new URLSearchParams(window.location.search)
    const referralParam = urlParams.get('referral')
    if (referralParam) {
      setReferralCode(referralParam)
      console.log("[Secure History] Found referral in URL:", referralParam)
    }
  }, [])

  // Create test referral for your hospital
  const createTestReferral = async () => {
    setIsCreatingTest(true)
    try {
      const testCode = `TEST-${Date.now()}`
      console.log("[Secure History] Creating test referral:", testCode)
      
      const response = await apiClient.post('/referrals', {
        fromHospital: user?.hospitalId,
        doctorName: user?.name || user?.email || "Test Doctor",
        patient: {
          fullName: "Test Patient",
          sex: "Male" as const,
          dateOfBirth: "1990-01-01",
          phone: "+1234567890",
          nationalId: "TEST-ID-123",
          address: "Test Address"
        },
        toHospital: user?.hospitalId, // Same hospital for testing
        patientName: "Test Patient",
        patientPhone: "+1234567890",
        urgency: "ROUTINE" as const,
        reasonForReferral: "Test referral for unlock functionality",
        clinicalNotes: "Test clinical notes for verification",
        requiredSpecialty: "General Practice"
      })

      console.log("[Secure History] Test referral created:", response)
      setTestReferralCode(testCode)
      setSuccess(`Test referral created successfully: ${testCode}`)
      
      // Refresh the referrals list
      setTimeout(() => {
        fetchAvailableReferrals()
      }, 1000)
      
    } catch (error: any) {
      console.error("[Secure History] Failed to create test referral:", error)
      setError(`Failed to create test referral: ${error.message}`)
    } finally {
      setIsCreatingTest(false)
    }
  }

  // Handle unlock process
  const handleUnlock = async () => {
    if (!referralCode.trim()) {
      setError("Please enter a referral code")
      return
    }

    setIsUnlocking(true)
    setError("")
    setSuccess("")

    // Debug: Log user information
    console.log("[Secure History] Current user:", user)
    console.log("[Secure History] User hospitalId:", user?.hospitalId)
    console.log("[Secure History] User role:", user?.role)
    console.log("[Secure History] User backendRole:", user?.backendRole || 'DOCTOR')
    console.log("[Secure History] Making API call to /referrals/unlock with:", {
      referralCode: referralCode.trim(),
      userRole: user?.backendRole || 'DOCTOR',
      userHospitalId: user?.hospitalId
    })

    try {
      console.log(`[Secure History] Unlocking referral: ${referralCode}`)
      
      // Call unlock endpoint with debugging info
      const response = await apiClient.post('/referrals/unlock', {
        referralCode: referralCode.trim(),
        _debugRole: user?.backendRole || 'DOCTOR',
        _debugHospitalId: user?.hospitalId
      })

      console.log("[Secure History] Unlock response:", response)
      
      // Map response data to our interface
      const data = response.data || response
      const mappedData: PatientData = {
        _id: data._id || '',
        referralCode: referralCode,
        patient: {
          fullName: data.patient?.fullName || data.patientName || "Unknown Patient",
          sex: data.patient?.sex || data.patient?.gender || "Unknown",
          dateOfBirth: data.patient?.dateOfBirth || data.dateOfBirth || "",
          phone: data.patient?.phone || data.patientPhone || "No phone",
          nationalId: data.patient?.nationalId || data.nationalId,
          address: data.patient?.address || data.address,
          email: data.patient?.email || data.patientEmail || data.email,
          bloodType: data.patient?.bloodType || data.bloodType,
          allergies: data.patient?.allergies || data.allergies || [],
          medications: data.patient?.medications || data.medications || [],
          medicalHistory: data.patient?.medicalHistory || data.medicalHistory || ""
        },
        fromHospital: data.fromHospital || "Unknown Hospital",
        doctorName: data.doctorName || "Unknown Doctor",
        urgency: data.urgency || "ROUTINE",
        reasonForReferral: data.reasonForReferral || "No reason provided",
        clinicalNotes: data.clinicalNotes || data.notes || "",
        requiredSpecialty: data.requiredSpecialty || data.specialty,
        requiredBedType: data.requiredBedType,
        status: data.status || "UNKNOWN",
        acceptedAt: data.acceptedAt,
        checkedInAt: data.checkedInAt,
        completedAt: data.completedAt,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
        estimatedArrival: data.estimatedArrival,
        attachments: data.attachments || data.files || [],
        unlockedAt: new Date().toISOString(),
        unlockedBy: user?.name || user?.email || "Unknown Doctor"
      }

      setPatientData(mappedData)
      setSuccess("Patient records unlocked successfully!")
      setShowData(true)
      
    } catch (err: any) {
      console.error("[Secure History] Unlock error:", err)
      
      let errorMessage = err.response?.data?.message || err.message || "Failed to unlock patient records"
      
      if (err.response?.status === 403) {
        const errorDetail = err.response?.data?.message || err.message || "Access denied"
        
        console.log("[Secure History] 403 Error detail:", errorDetail)
        console.log("[Secure History] User hospitalId:", user?.hospitalId)
        
        if (errorDetail.includes("not authorized to unlock referrals for this hospital")) {
          errorMessage = `Hospital Access Denied: You are not authorized to unlock referrals for this hospital. 
          
Current Hospital: ${user?.hospitalId || 'Not assigned'}
Required: The referral belongs to a different hospital.

Please contact your system administrator to:
1. Verify your hospital assignment
2. Ensure you have the correct hospital permissions
3. Check if you should have access to this referral's hospital`
        } else {
          errorMessage = "Access denied: You don't have permission to unlock clinical data. Please contact your system administrator."
        }
      } else if (err.response?.status === 401) {
        errorMessage = "Authentication required: Please log in again to unlock clinical data."
      } else if (err.response?.status === 404) {
        errorMessage = "Referral not found: The referral code may be invalid."
      } else if (err.message === "Forbidden resource") {
        errorMessage = "Access denied: You don't have permission to unlock clinical data. This feature requires special authorization."
      } else if (err.message?.includes("already unlocked") || err.response?.data?.message?.includes("already unlocked")) {
        // Handle "already unlocked" as success
        const responseData = err.response?.data || err.response?.data?.data || {}
        
        const mappedData: PatientData = {
          _id: responseData._id || '',
          referralCode: referralCode,
          patient: {
            fullName: responseData.patient?.fullName || responseData.patientName || "Unknown Patient",
            sex: responseData.patient?.sex || responseData.patient?.gender || "Unknown",
            dateOfBirth: responseData.patient?.dateOfBirth || responseData.dateOfBirth || "",
            phone: responseData.patient?.phone || responseData.patientPhone || "No phone",
            nationalId: responseData.patient?.nationalId || responseData.nationalId,
            address: responseData.patient?.address || responseData.address,
            email: responseData.patient?.email || responseData.patientEmail || responseData.email,
            bloodType: responseData.patient?.bloodType || responseData.bloodType,
            allergies: responseData.patient?.allergies || responseData.allergies || [],
            medications: responseData.patient?.medications || responseData.medications || [],
            medicalHistory: responseData.patient?.medicalHistory || responseData.medicalHistory || ""
          },
          fromHospital: responseData.fromHospital || "Unknown Hospital",
          doctorName: responseData.doctorName || "Unknown Doctor",
          urgency: responseData.urgency || "ROUTINE",
          reasonForReferral: responseData.reasonForReferral || "No reason provided",
          clinicalNotes: responseData.clinicalNotes || responseData.notes || "",
          requiredSpecialty: responseData.requiredSpecialty || responseData.specialty,
          requiredBedType: responseData.requiredBedType,
          status: responseData.status || "UNKNOWN",
          acceptedAt: responseData.acceptedAt,
          checkedInAt: responseData.checkedInAt,
          completedAt: responseData.completedAt,
          createdAt: responseData.createdAt || new Date().toISOString(),
          updatedAt: responseData.updatedAt || new Date().toISOString(),
          estimatedArrival: responseData.estimatedArrival,
          attachments: responseData.attachments || responseData.files || [],
          unlockedAt: new Date().toISOString(),
          unlockedBy: user?.name || user?.email || "Unknown Doctor"
        }
        
        setPatientData(mappedData)
        setSuccess("Patient records already unlocked - displaying clinical data")
        setShowData(true)
        return
      }
      
      setError(errorMessage)
    } finally {
      setIsUnlocking(false)
    }
  }

  // Helper functions
  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return 'Unknown'
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
      return 'Unknown'
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  const getUrgencyColor = (urgency: string) => {
    const upperUrgency = urgency?.toUpperCase() || "ROUTINE"
    if (upperUrgency === "EMERGENCY") return "bg-red-100 text-red-800 border-red-200 shadow-sm"
    if (upperUrgency === "URGENT") return "bg-orange-100 text-orange-800 border-orange-200 shadow-sm"
    return "bg-blue-100 text-blue-800 border-blue-200 shadow-sm"
  }

  const getStatusColor = (status: string) => {
    const upperStatus = status?.toUpperCase() || "UNKNOWN"
    switch (upperStatus) {
      case "CHECKED_IN":
        return "bg-green-100 text-green-800 border-green-200"
      case "ACCEPTED":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "COMPLETED":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getFileIcon = (fileName: string) => {
    if (fileName.match(/\.(jpg|jpeg|png|gif)$/i)) return FileImage
    if (fileName.match(/\.pdf$/i)) return FileText
    return FileIcon
  }

  const getFileColor = (fileName: string) => {
    if (fileName.match(/\.(jpg|jpeg|png|gif)$/i)) return "text-blue-500"
    if (fileName.match(/\.pdf$/i)) return "text-red-500"
    return "text-gray-500"
  }

  const downloadFile = (fileUrl: string, fileName: string) => {
    const link = document.createElement('a')
    link.href = fileUrl
    link.download = fileName
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const copyToClipboard = () => {
    if (!patientData) return
    navigator.clipboard.writeText(JSON.stringify(patientData, null, 2))
    setSuccess("Patient data copied to clipboard!")
    setTimeout(() => setSuccess(""), 2000)
  }

  const resetForm = () => {
    setReferralCode("")
    setPatientData(null)
    setShowData(false)
    setError("")
    setSuccess("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg mb-4">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Secure Patient Records Access</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Professional medical records system for authorized healthcare providers
          </p>
          
          {/* User Info Display */}
          {user && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg inline-block">
              <p className="text-sm text-blue-800">
                <strong>Logged in as:</strong> {user.name || user.email} | 
                <strong> Role:</strong> {user.role} | 
                <strong> Hospital:</strong> {user.hospitalId || 'Not assigned'}
              </p>
            </div>
          )}
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {!showData ? (
          /* Initial Unlock Interface */
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Unlock Form */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur">
              <CardHeader className="text-center pb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mb-4">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                  Unlock Patient Records
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Enter the referral code to access secure patient medical data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="referralCode" className="text-sm font-medium text-gray-700">
                    Referral Code
                  </Label>
                  <Input
                    id="referralCode"
                    type="text"
                    placeholder="Enter referral code (e.g., REF-12345)"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    className="h-12 text-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    disabled={isUnlocking}
                  />
                </div>
                
                <Button
                  onClick={handleUnlock}
                  disabled={isUnlocking || !referralCode.trim()}
                  className="w-full h-12 text-lg font-medium bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg transition-all duration-200"
                >
                  {isUnlocking ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Accessing Patient Records...
                    </>
                  ) : (
                    <>
                      <Unlock className="w-5 h-5 mr-2" />
                      Unlock Patient Data
                    </>
                  )}
                </Button>

                {/* Test Referral Button */}
                <Button
                  variant="outline"
                  onClick={() => setReferralCode("REF-001")}
                  className="w-full text-sm"
                  disabled={isUnlocking}
                >
                  Use Test Referral: REF-001
                </Button>

                {/* Show Available Referrals from Queue */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-700 mb-2">
                    Available Referrals in Your Queue ({availableReferrals.length}):
                  </p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {availableReferrals.length > 0 ? (
                      availableReferrals.map((referral, index) => {
                        const hospitalMatch = referral.fromHospital === user?.hospitalId || referral.toHospital === user?.hospitalId
                        return (
                          <Button
                            key={index}
                            variant="ghost"
                            size="sm"
                            onClick={() => setReferralCode(referral.referralCode)}
                            className={`w-full justify-start text-xs h-6 ${!hospitalMatch ? 'opacity-50' : ''}`}
                            disabled={isUnlocking}
                            title={hospitalMatch ? 'This referral matches your hospital' : 'This referral belongs to a different hospital'}
                          >
                            📋 {referral.referralCode} 
                            {referral.status && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                {referral.status}
                              </Badge>
                            )}
                            {!hospitalMatch && (
                              <Badge variant="destructive" className="ml-2 text-xs">
                                ⚠️ Different Hospital
                              </Badge>
                            )}
                          </Button>
                        )
                      })
                    ) : (
                      <p className="text-xs text-gray-500">No referrals found in your queue</p>
                    )}
                  </div>
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                    <p className="text-yellow-800">
                      <strong>⚠️ Hospital Matching:</strong> Only referrals belonging to your hospital 
                      ({user?.hospitalId}) can be unlocked. Referrals with "Different Hospital" badge 
                      will cause authorization errors.
                    </p>
                  </div>
                </div>

                {/* Create Test Referral */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs font-medium text-blue-700 mb-2">
                    🆕 Create Test Referral for Your Hospital:
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={createTestReferral}
                    disabled={isCreatingTest}
                    className="w-full text-xs"
                  >
                    {isCreatingTest ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Creating Test Referral...
                      </>
                    ) : (
                      <>
                        <Plus className="w-3 h-3 mr-1" />
                        Create Test Referral (Your Hospital)
                      </>
                    )}
                  </Button>
                  {testReferralCode && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                      <p className="text-xs text-green-800">
                        ✅ Test referral created: <strong>{testReferralCode}</strong>
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReferralCode(testReferralCode)}
                        className="mt-1 text-xs h-6"
                      >
                        Use This Referral
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Info className="w-5 h-5 text-blue-600" />
                  How to Access Patient Records
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {/* Step 1 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Get Referral Code</h3>
                      <p className="text-sm text-gray-600">
                        Obtain the referral code from the patient's referral document or from the hospital referral system
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Enter Referral Code</h3>
                      <p className="text-sm text-gray-600">
                        Type the referral code in the input field above. The system will validate the code format automatically
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Access Medical Records</h3>
                      <p className="text-sm text-gray-600">
                        Click "Unlock Patient Data" to securely access comprehensive patient medical information
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-1">Security Notice</h4>
                      <p className="text-sm text-blue-800">
                        This system is for authorized healthcare providers only. All access is logged and monitored for patient privacy protection.
                      </p>
                      <div className="mt-2 p-2 bg-blue-100 rounded text-xs text-blue-700">
                        <strong>Your Hospital ID:</strong> {user?.hospitalId}<br/>
                        <strong>Tip:</strong> You can only unlock referrals from your assigned hospital.
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Patient Data Display */
          <div className="space-y-6">
            {/* Security Header */}
            <Card className="shadow-lg border-0 bg-gradient-to-r from-green-50 to-blue-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Patient Records Unlocked</h2>
                      <p className="text-gray-600">
                        Accessed by {patientData?.unlockedBy} on {formatDate(patientData?.unlockedAt || "")}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyToClipboard}
                      className="flex items-center gap-2"
                    >
                      <ClipboardCopy className="w-4 h-4" />
                      Copy Data
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetForm}
                      className="flex items-center gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      Lock & Exit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {patientData && (
              <>
                {/* Patient Profile Section */}
                <Card className="shadow-xl border-0 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <User className="w-10 h-10 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h1 className="text-3xl font-bold text-white mb-2">
                          {patientData.patient.fullName}
                        </h1>
                        <div className="flex flex-wrap items-center gap-4 text-blue-100">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {calculateAge(patientData.patient.dateOfBirth)} years old
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {patientData.patient.sex}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            DOB: {new Date(patientData.patient.dateOfBirth).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={`${getStatusColor(patientData.status)} text-sm font-medium px-3 py-1`}>
                          {patientData.status.replace('_', ' ')}
                        </Badge>
                        <div className="mt-2">
                          <Badge className={`${getUrgencyColor(patientData.urgency)} text-sm font-medium px-3 py-1`}>
                            {patientData.urgency}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          Phone Number
                        </Label>
                        <p className="font-semibold text-gray-900">{patientData.patient.phone}</p>
                      </div>
                      
                      {patientData.patient.nationalId && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                            <UserCheck className="w-4 h-4" />
                            National ID
                          </Label>
                          <p className="font-semibold text-gray-900">{patientData.patient.nationalId}</p>
                        </div>
                      )}
                      
                      {patientData.patient.email && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-600">Email Address</Label>
                          <p className="font-semibold text-gray-900">{patientData.patient.email}</p>
                        </div>
                      )}
                      
                      {patientData.patient.bloodType && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                            <Heart className="w-4 h-4" />
                            Blood Type
                          </Label>
                          <p className="font-semibold text-gray-900">{patientData.patient.bloodType}</p>
                        </div>
                      )}
                      
                      {patientData.patient.address && (
                        <div className="space-y-2 md:col-span-2 lg:col-span-3">
                          <Label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Address
                          </Label>
                          <p className="font-semibold text-gray-900">{patientData.patient.address}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Medical Information */}
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Referral Information */}
                  <Card className="shadow-lg border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <Hospital className="w-5 h-5 text-blue-600" />
                        Referral Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Referral Code</Label>
                          <p className="font-mono font-semibold text-gray-900">{patientData.referralCode}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">From Hospital</Label>
                          <p className="font-semibold text-gray-900">
                            {typeof patientData.fromHospital === 'string' 
                              ? patientData.fromHospital 
                              : patientData.fromHospital.name || 'Unknown Hospital'
                            }
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Referring Doctor</Label>
                          <p className="font-semibold text-gray-900">{patientData.doctorName}</p>
                        </div>
                        {patientData.requiredSpecialty && (
                          <div>
                            <Label className="text-sm font-medium text-gray-600">Required Specialty</Label>
                            <p className="font-semibold text-gray-900">{patientData.requiredSpecialty}</p>
                          </div>
                        )}
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Reason for Referral</Label>
                        <div className="mt-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-gray-800 leading-relaxed">{patientData.reasonForReferral}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Clinical Information */}
                  <Card className="shadow-lg border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <Stethoscope className="w-5 h-5 text-blue-600" />
                        Clinical Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {patientData.clinicalNotes && (
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Clinical Notes</Label>
                          <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                              {patientData.clinicalNotes}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {patientData.patient.allergies && patientData.patient.allergies.length > 0 && (
                        <div>
                          <Label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            Allergies
                          </Label>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {patientData.patient.allergies.map((allergy, index) => (
                              <Badge key={index} variant="outline" className="bg-red-50 text-red-800 border-red-200">
                                {allergy}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {patientData.patient.medications && patientData.patient.medications.length > 0 && (
                        <div>
                          <Label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                            <Pill className="w-4 h-4 text-blue-500" />
                            Current Medications
                          </Label>
                          <div className="mt-2 space-y-1">
                            {patientData.patient.medications.map((medication, index) => (
                              <div key={index} className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                                <Pill className="w-4 h-4 text-blue-600" />
                                <span className="text-sm text-gray-800">{medication}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {patientData.patient.medicalHistory && (
                        <div>
                          <Label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-purple-500" />
                            Medical History
                          </Label>
                          <div className="mt-2 p-4 bg-purple-50 rounded-lg border border-purple-200">
                            <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                              {patientData.patient.medicalHistory}
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Medical Files */}
                {patientData.attachments && patientData.attachments.length > 0 && (
                  <Card className="shadow-lg border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <FileText className="w-5 h-5 text-blue-600" />
                        Medical Files & Documents
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {patientData.attachments.map((file, index) => {
                          const FileIcon = getFileIcon(file)
                          const fileColor = getFileColor(file)
                          
                          return (
                            <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                              <div className="flex items-start gap-3">
                                <FileIcon className={`w-8 h-8 ${fileColor} flex-shrink-0`} />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">{file}</p>
                                  <p className="text-xs text-gray-500 mt-1">Medical document</p>
                                </div>
                              </div>
                              <div className="flex gap-2 mt-3">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => downloadFile(file, file)}
                                  className="flex-1"
                                >
                                  <Eye className="w-3 h-3 mr-1" />
                                  View
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => downloadFile(file, file)}
                                  className="flex-1"
                                >
                                  <Download className="w-3 h-3 mr-1" />
                                  Download
                                </Button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Activity Timeline */}
                <Card className="shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Clock className="w-5 h-5 text-blue-600" />
                      Referral Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Referral Created */}
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-4 h-4 bg-blue-500 rounded-full" />
                          <div className="w-0.5 h-16 bg-blue-200" />
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">Referral Created</h3>
                            <Badge variant="outline" className="text-xs">Initial</Badge>
                          </div>
                          <p className="text-sm text-gray-600">{formatDate(patientData.createdAt)}</p>
                        </div>
                      </div>

                      {/* Referral Accepted */}
                      {patientData.acceptedAt && (
                        <div className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-4 h-4 bg-green-500 rounded-full" />
                            <div className="w-0.5 h-16 bg-green-200" />
                          </div>
                          <div className="flex-1 pb-4">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900">Referral Accepted</h3>
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-800">Processed</Badge>
                            </div>
                            <p className="text-sm text-gray-600">{formatDate(patientData.acceptedAt)}</p>
                          </div>
                        </div>
                      )}

                      {/* Patient Checked In */}
                      {patientData.checkedInAt && (
                        <div className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-4 h-4 bg-orange-500 rounded-full" />
                            <div className="w-0.5 h-16 bg-orange-200" />
                          </div>
                          <div className="flex-1 pb-4">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900">Patient Checked In</h3>
                              <Badge variant="outline" className="text-xs bg-orange-50 text-orange-800">Arrived</Badge>
                            </div>
                            <p className="text-sm text-gray-600">{formatDate(patientData.checkedInAt)}</p>
                          </div>
                        </div>
                      )}

                      {/* Records Unlocked */}
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-4 h-4 bg-purple-500 rounded-full" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">Medical Records Accessed</h3>
                            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-800">Security</Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            {formatDate(patientData.unlockedAt || "")} by {patientData.unlockedBy}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
