"use client"

import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Hospital, 
  Calendar,
  Phone,
  User,
  MapPin,
  Filter,
  RefreshCw,
  Loader2,
  Eye,
  FileText,
  TrendingUp,
  Activity
} from "lucide-react"

interface SpecialistReferral {
  _id: string
  referralCode: string
  patient: {
    fullName: string
    dateOfBirth: string
    phone: string
    nationalId?: string
    address?: string
  }
  fromHospital: {
    name: string
    region?: string
    city?: string
    phone?: string
  }
  toHospital: {
    name: string
    region?: string
    city?: string
  }
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
  doctorName?: string
  estimatedArrival?: string
  clinicalData?: {
    unlocked: boolean
    unlockedAt?: string
    unlockedBy?: string
    data?: any
  }
}

interface QueueStats {
  total: number
  accepted: number
  checkedIn: number
  urgent: number
  emergency: number
  todayArrivals: number
}

export function SpecialistQueue() {
  const { user } = useAuth()
  const [referrals, setReferrals] = useState<SpecialistReferral[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState<"all" | "accepted" | "checked_in">("all")
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month">("all")
  const [selectedReferral, setSelectedReferral] = useState<SpecialistReferral | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [unlockingReferral, setUnlockingReferral] = useState<string | null>(null)
  const [unlockSuccess, setUnlockSuccess] = useState<string | null>(null)
  const [unlockError, setUnlockError] = useState<string | null>(null)

  // Fetch specialist queue
  const fetchSpecialistQueue = async () => {
    try {
      setIsLoading(true)
      setError("")

      console.log("[Specialist Queue] Fetching from /referrals/specialist/queue")
      const response = await apiClient.get('/referrals/specialist/queue')
      const queueData = response.data || response
      
      console.log("[Specialist Queue] Response:", queueData)
      console.log("[Specialist Queue] Sample referral structure:", queueData[0])
      
      const referralsArray = Array.isArray(queueData) ? queueData : []
      setReferrals(referralsArray)
      
    } catch (err: any) {
      console.error("[Specialist Queue] Error:", err)
      setError(err.message || "Failed to load specialist queue")
    } finally {
      setIsLoading(false)
    }
  }

  // Refresh queue
  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchSpecialistQueue()
    setRefreshing(false)
  }

  // Unlock clinical data
  const handleUnlockClinicalData = async (referralCode: string, referralId: string) => {
    setUnlockingReferral(referralId)
    setUnlockSuccess(null)
    setUnlockError(null)

    try {
      console.log(`[Unlock Clinical Data] Unlocking referral: ${referralCode}`)
      const response = await apiClient.post('/referrals/unlock', {
        referralCode: referralCode
      })

      console.log("[Unlock Clinical Data] Response:", response)

      // Update local state
      setReferrals(prev => prev.map(referral => 
        referral._id === referralId 
          ? {
              ...referral,
              clinicalData: {
                unlocked: true,
                unlockedAt: new Date().toISOString(),
                unlockedBy: user?.name || user?.email || "Unknown Doctor",
                data: response.data || response
              }
            }
          : referral
      ))

      setUnlockSuccess(`Clinical data unlocked successfully for referral ${referralCode}`)
      
      // Clear success message after 5 seconds
      setTimeout(() => setUnlockSuccess(null), 5000)

    } catch (err: any) {
      console.error("[Unlock Clinical Data] Error:", err)
      setUnlockError(err.message || "Failed to unlock clinical data")
      
      // Clear error message after 5 seconds
      setTimeout(() => setUnlockError(null), 5000)
    } finally {
      setUnlockingReferral(null)
    }
  }

  // View referral details
  const handleViewDetails = (referral: SpecialistReferral) => {
    setSelectedReferral(referral)
    setShowDetails(true)
  }

  // Close details modal
  const handleCloseDetails = () => {
    setShowDetails(false)
    setSelectedReferral(null)
  }

  // Calculate queue statistics
  const getQueueStats = (): QueueStats => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    return {
      total: referrals.length,
      accepted: referrals.filter(r => r.status === "ACCEPTED").length,
      checkedIn: referrals.filter(r => r.status === "CHECKED_IN").length,
      urgent: referrals.filter(r => r.urgency === "URGENT").length,
      emergency: referrals.filter(r => r.urgency === "EMERGENCY").length,
      todayArrivals: referrals.filter(r => {
        const acceptedDate = r.acceptedAt ? new Date(r.acceptedAt) : new Date(r.createdAt)
        return acceptedDate >= today
      }).length
    }
  }

  // Filter referrals based on status and date
  const getFilteredReferrals = () => {
    let filtered = referrals
    
    // Status filtering
    switch (filter) {
      case "accepted":
        filtered = filtered.filter(r => r.status === "ACCEPTED")
        break
      case "checked_in":
        filtered = filtered.filter(r => r.status === "CHECKED_IN")
        break
    }
    
    // Date filtering
    const now = new Date()
    switch (dateFilter) {
      case "today":
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        filtered = filtered.filter(r => {
          const date = new Date(r.acceptedAt || r.createdAt)
          return date >= today
        })
        break
      case "week":
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        filtered = filtered.filter(r => {
          const date = new Date(r.acceptedAt || r.createdAt)
          return date >= weekAgo
        })
        break
      case "month":
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        filtered = filtered.filter(r => {
          const date = new Date(r.acceptedAt || r.createdAt)
          return date >= monthAgo
        })
        break
    }
    
    return filtered
  }

  // Sort referrals by date (most recent first)
  const getSortedReferrals = () => {
    const filtered = getFilteredReferrals()
    return filtered.sort((a, b) => {
      const dateA = new Date(a.acceptedAt || a.createdAt)
      const dateB = new Date(b.acceptedAt || b.createdAt)
      return dateB.getTime() - dateA.getTime()
    })
  }

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
        return "bg-red-100 text-red-800 border-red-200"
      case "URGENT":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-blue-100 text-blue-800 border-blue-200"
    }
  }

  // Get status icon and color
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return {
          icon: Clock,
          color: "bg-blue-100 text-blue-600",
          label: "Upcoming Arrival",
          description: "Patient accepted, expected to arrive"
        }
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
          icon: AlertCircle,
          color: "bg-red-100 text-red-600",
          label: "Cancelled",
          description: "Referral was cancelled"
        }
    }
  }

  useEffect(() => {
    fetchSpecialistQueue()
  }, [])

  const stats = getQueueStats()
  const sortedReferrals = getSortedReferrals()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Specialist Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Loading specialist queue...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6" />
            Specialist Queue
          </h2>
          <p className="text-muted-foreground">
            Incoming referrals requiring your attention
          </p>
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

      {unlockSuccess && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{unlockSuccess}</AlertDescription>
        </Alert>
      )}

      {unlockError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{unlockError}</AlertDescription>
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
                <p className="text-sm font-medium text-muted-foreground">Upcoming Arrivals</p>
                <p className="text-2xl font-bold text-blue-600">{stats.accepted}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="w-4 h-4 text-blue-600" />
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
                  variant={filter === "all" ? "default" : "outline"}
                  onClick={() => setFilter("all")}
                  className="flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  All ({stats.total})
                </Button>
                <Button
                  variant={filter === "accepted" ? "default" : "outline"}
                  onClick={() => setFilter("accepted")}
                  className="flex items-center gap-2"
                >
                  <Clock className="w-4 h-4" />
                  Upcoming ({stats.accepted})
                </Button>
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
            
            {/* Date Filters */}
            <div>
              <p className="text-sm font-medium mb-2">Date Range</p>
              <div className="flex gap-2">
                <Button
                  variant={dateFilter === "all" ? "default" : "outline"}
                  onClick={() => setDateFilter("all")}
                  className="flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  All Time
                </Button>
                <Button
                  variant={dateFilter === "today" ? "default" : "outline"}
                  onClick={() => setDateFilter("today")}
                  className="flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Today
                </Button>
                <Button
                  variant={dateFilter === "week" ? "default" : "outline"}
                  onClick={() => setDateFilter("week")}
                  className="flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  This Week
                </Button>
                <Button
                  variant={dateFilter === "month" ? "default" : "outline"}
                  onClick={() => setDateFilter("month")}
                  className="flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  This Month
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referrals Queue */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Patient Queue
          </CardTitle>
          <CardDescription>
            Chronologically sorted with recently arrived patients first
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedReferrals.length > 0 ? (
            <div className="space-y-4">
              {sortedReferrals.map((referral) => {
                const statusInfo = getStatusInfo(referral.status)
                const StatusIcon = statusInfo.icon
                const age = referral.patient ? calculateAge(referral.patient.dateOfBirth) : "Unknown"
                
                return (
                  <div
                    key={referral._id}
                    className={`p-4 border rounded-lg ${
                      referral.status === "CHECKED_IN" 
                        ? "border-green-200 bg-green-50" 
                        : referral.status === "ACCEPTED"
                        ? "border-blue-200 bg-blue-50"
                        : "border-gray-200"
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
                            <h3 className="font-semibold text-lg">
                              {referral.patient?.fullName || "Unknown Patient"}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {age} years old • {referral.patient?.phone || "No phone"}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          {/* Referral Details */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-gray-500" />
                              <span className="text-sm font-medium">Referral Code:</span>
                              <Badge variant="outline">{referral.referralCode}</Badge>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Hospital className="w-4 h-4 text-gray-500" />
                              <span className="text-sm font-medium">From:</span>
                              <span className="text-sm">
                                {referral.fromHospital?.name || "Unknown Hospital"}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-gray-500" />
                              <span className="text-sm">
                                {referral.fromHospital?.city && referral.fromHospital?.region
                                  ? `${referral.fromHospital.city}, ${referral.fromHospital.region}`
                                  : "Location unknown"
                                }
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <span className="text-sm">
                                Accepted: {referral.acceptedAt 
                                  ? new Date(referral.acceptedAt).toLocaleString()
                                  : new Date(referral.createdAt).toLocaleString()
                                }
                              </span>
                            </div>
                          </div>

                          {/* Status and Urgency */}
                          <div className="space-y-2">
                            <div>
                              <span className="text-sm font-medium">Status:</span>
                              <div className="mt-1">
                                <Badge 
                                  variant={referral.status === "CHECKED_IN" ? "default" : "secondary"}
                                  className="flex items-center gap-1 w-fit"
                                >
                                  <StatusIcon className="w-3 h-3" />
                                  {statusInfo.label}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {statusInfo.description}
                              </p>
                            </div>

                            <div>
                              <span className="text-sm font-medium">Urgency:</span>
                              <div className="mt-1">
                                <Badge className={getUrgencyColor(referral.urgency)}>
                                  {referral.urgency}
                                </Badge>
                              </div>
                            </div>

                            {referral.estimatedArrival && (
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-500" />
                                <span className="text-sm">
                                  Est. Arrival: {new Date(referral.estimatedArrival).toLocaleString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Reason for Referral */}
                        <div className="bg-white p-3 rounded border">
                          <p className="text-sm font-medium mb-1">Reason for Referral:</p>
                          <p className="text-sm text-gray-700">
                            {referral.reasonForReferral || "No reason provided"}
                          </p>
                        </div>

                        {/* Clinical Notes */}
                        {referral.clinicalNotes && (
                          <div className="mt-3 bg-gray-50 p-3 rounded border">
                            <p className="text-sm font-medium mb-1">Clinical Notes:</p>
                            <p className="text-sm text-gray-600">{referral.clinicalNotes}</p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="ml-4 space-y-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-2 w-full"
                          onClick={() => handleViewDetails(referral)}
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </Button>
                        
                        {/* Unlock Clinical Data Button */}
                        {referral.status === "CHECKED_IN" && (
                          <Button
                            size="sm"
                            variant={referral.clinicalData?.unlocked ? "secondary" : "default"}
                            className="flex items-center gap-2 w-full"
                            onClick={() => handleUnlockClinicalData(referral.referralCode, referral._id)}
                            disabled={unlockingReferral === referral._id || referral.clinicalData?.unlocked}
                          >
                            {unlockingReferral === referral._id ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Unlocking...
                              </>
                            ) : referral.clinicalData?.unlocked ? (
                              <>
                                <CheckCircle className="w-4 h-4" />
                                Data Unlocked
                              </>
                            ) : (
                              <>
                                <FileText className="w-4 h-4" />
                                Unlock Clinical Data
                              </>
                            )}
                          </Button>
                        )}
                        
                        {/* Clinical Data Status */}
                        {referral.clinicalData?.unlocked && (
                          <div className="text-xs text-green-600 bg-green-50 p-2 rounded border border-green-200">
                            <div className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              <span className="font-medium">Data Unlocked</span>
                            </div>
                            <div className="text-xs mt-1">
                              By: {referral.clinicalData.unlockedBy}
                            </div>
                            <div className="text-xs">
                              At: {referral.clinicalData.unlockedAt 
                                ? new Date(referral.clinicalData.unlockedAt).toLocaleString()
                                : "Unknown"
                              }
                            </div>
                          </div>
                        )}
                        
                        {/* Lock Status for Non-Checked-In Patients */}
                        {referral.status !== "CHECKED_IN" && (
                          <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                            <div className="flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              <span className="font-medium">Data Locked</span>
                            </div>
                            <div className="text-xs mt-1">
                              Available after patient check-in
                            </div>
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
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">No referrals in queue</h3>
              <p className="text-muted-foreground">
                {filter === "all" 
                  ? "There are no referrals in your specialist queue at the moment."
                  : `No ${filter === "accepted" ? "upcoming arrivals" : "current patients"} found.`
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Referral View Modal */}
      {showDetails && selectedReferral && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Referral Details</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCloseDetails}
                >
                  Close
                </Button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Patient Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Patient Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                    <p className="font-semibold">
                      {selectedReferral.patient?.fullName || "Unknown Patient"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Age</p>
                    <p className="font-semibold">
                      {selectedReferral.patient?.dateOfBirth 
                        ? calculateAge(selectedReferral.patient.dateOfBirth) 
                        : "Unknown"
                      } years
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                    <p className="font-semibold">
                      {selectedReferral.patient?.dateOfBirth 
                        ? new Date(selectedReferral.patient.dateOfBirth).toLocaleDateString()
                        : "Unknown"
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Phone</p>
                    <p className="font-semibold">
                      {selectedReferral.patient?.phone || "No phone"}
                    </p>
                  </div>
                  {selectedReferral.patient?.nationalId && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">National ID</p>
                      <p className="font-semibold">{selectedReferral.patient.nationalId}</p>
                    </div>
                  )}
                  {selectedReferral.patient?.address && (
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium text-muted-foreground">Address</p>
                      <p className="font-semibold">{selectedReferral.patient.address}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Referral Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Referral Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Referral Code</p>
                    <p className="font-semibold">{selectedReferral.referralCode}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <Badge variant={selectedReferral.status === "CHECKED_IN" ? "default" : "secondary"}>
                      {selectedReferral.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Urgency</p>
                    <Badge className={getUrgencyColor(selectedReferral.urgency)}>
                      {selectedReferral.urgency}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Required Specialty</p>
                    <p className="font-semibold">{selectedReferral.requiredSpecialty || "Not specified"}</p>
                  </div>
                </div>
              </div>

              {/* Hospital Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Hospital className="w-5 h-5" />
                  Hospital Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">From Hospital</p>
                    <div className="space-y-1">
                      <p className="font-semibold">
                        {selectedReferral.fromHospital?.name || "Unknown Hospital"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedReferral.fromHospital?.city && selectedReferral.fromHospital?.region
                          ? `${selectedReferral.fromHospital.city}, ${selectedReferral.fromHospital.region}`
                          : "Location unknown"
                        }
                      </p>
                      {selectedReferral.fromHospital?.phone && (
                        <p className="text-sm text-muted-foreground">
                          {selectedReferral.fromHospital.phone}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">To Hospital</p>
                    <div className="space-y-1">
                      <p className="font-semibold">
                        {selectedReferral.toHospital?.name || "Unknown Hospital"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedReferral.toHospital?.city && selectedReferral.toHospital?.region
                          ? `${selectedReferral.toHospital.city}, ${selectedReferral.toHospital.region}`
                          : "Location unknown"
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Medical Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Reason for Referral</p>
                    <p className="font-semibold bg-gray-50 p-3 rounded border">{selectedReferral.reasonForReferral}</p>
                  </div>
                  {selectedReferral.clinicalNotes && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Clinical Notes</p>
                      <p className="font-semibold bg-gray-50 p-3 rounded border">{selectedReferral.clinicalNotes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Clinical Data Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Clinical Data
                </h3>
                
                {selectedReferral.clinicalData?.unlocked ? (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-green-800">Clinical Data Unlocked</span>
                      </div>
                      <div className="text-sm text-green-700">
                        <p>Unlocked by: {selectedReferral.clinicalData.unlockedBy}</p>
                        <p>Unlocked at: {selectedReferral.clinicalData.unlockedAt 
                          ? new Date(selectedReferral.clinicalData.unlockedAt).toLocaleString()
                          : "Unknown"
                        }</p>
                      </div>
                    </div>
                    
                    {/* Clinical Data Content */}
                    {selectedReferral.clinicalData.data && (
                      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                        <p className="text-sm font-medium text-blue-800 mb-2">Unlocked Clinical Data:</p>
                        <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-40">
                          {JSON.stringify(selectedReferral.clinicalData.data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                      <span className="font-semibold text-amber-800">Clinical Data Locked</span>
                    </div>
                    <div className="text-sm text-amber-700">
                      {selectedReferral.status === "CHECKED_IN" ? (
                        <div>
                          <p>Clinical data is available but needs to be unlocked.</p>
                          <Button
                            className="mt-2"
                            onClick={() => handleUnlockClinicalData(selectedReferral.referralCode, selectedReferral._id)}
                            disabled={unlockingReferral === selectedReferral._id}
                          >
                            {unlockingReferral === selectedReferral._id ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                Unlocking...
                              </>
                            ) : (
                              <>
                                <FileText className="w-4 h-4 mr-2" />
                                Unlock Clinical Data
                              </>
                            )}
                          </Button>
                        </div>
                      ) : (
                        <p>Clinical data will be available after patient check-in.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Timeline */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Timeline
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">Referral Created</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(selectedReferral.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {selectedReferral.acceptedAt && (
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="font-medium">Referral Accepted</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(selectedReferral.acceptedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedReferral.checkedInAt && (
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <div>
                        <p className="font-medium">Patient Checked In</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(selectedReferral.checkedInAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedReferral.clinicalData?.unlockedAt && (
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <div>
                        <p className="font-medium">Clinical Data Unlocked</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(selectedReferral.clinicalData.unlockedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
