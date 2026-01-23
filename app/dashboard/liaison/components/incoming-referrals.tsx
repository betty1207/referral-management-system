"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Eye, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Referral {
  _id: string
  patientName: string
  patientPhone: string
  fromHospital?: { name: string; _id: string } | string
  toHospital?: { name: string; _id: string } | string
  urgency: string
  status: string
  reasonForReferral: string
  clinicalNotes?: string
  createdAt: string
  createdBy?: { fullName: string } | string
}

interface IncomingReferralsProps {
  onSelectReferral: (id: string) => void
}

export function IncomingReferrals({ onSelectReferral }: IncomingReferralsProps) {
  const { user } = useAuth()
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  const fetchIncomingReferrals = async () => {
    if (!user?.token || !user?.hospitalId) {
      setError("Authentication token or hospital ID missing")
      setIsLoading(false)
      return
    }

      try {
      setIsLoading(true)
      setError("")
      // Fetch all referrals and filter for incoming (where this hospital is the target)
      const response = await apiClient.getAllReferrals()
      const referralData = response.data || response
      const allReferrals = Array.isArray(referralData) ? referralData : []
      
      // Filter to only show incoming referrals (toHospital matches) that need review
      const filteredReferrals = allReferrals.filter((r: any) => {
        const toHospitalId = typeof r.toHospital === 'object' ? r.toHospital?._id : r.toHospital
        return (
          toHospitalId === user.hospitalId &&
          (r.status === "PENDING" || r.status === "APPROVED" || r.status === "DRAFT")
        )
      })
      
      setReferrals(filteredReferrals)
    } catch (err: any) {
      console.error("Error fetching incoming referrals:", err)
      setError(err.message || "Failed to load incoming referrals")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchIncomingReferrals()
  }, [user?.token, user?.hospitalId])

  const getPriorityColor = (priority: string) => {
    const upperPriority = priority.toUpperCase()
    if (upperPriority === "EMERGENCY") return "bg-red-100 text-red-800"
    if (upperPriority === "URGENT") return "bg-orange-100 text-orange-800"
    return "bg-blue-100 text-blue-800"
  }

  const getStatusColor = (status: string) => {
    const upperStatus = status.toUpperCase()
    if (upperStatus === "APPROVED") return "bg-green-100 text-green-800"
    if (upperStatus === "PENDING" || upperStatus === "DRAFT") return "bg-yellow-100 text-yellow-800"
    if (upperStatus === "REJECTED") return "bg-red-100 text-red-800"
    return "bg-gray-100 text-gray-800"
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString()
    } catch {
      return dateString
    }
  }

  const getHospitalName = (hospital: { name: string } | string | undefined) => {
    if (!hospital) return "N/A"
    if (typeof hospital === "string") return hospital
    return hospital.name || "N/A"
  }

  const filteredReferrals = referrals.filter((referral) => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      referral.patientName?.toLowerCase().includes(searchLower) ||
      referral._id?.toLowerCase().includes(searchLower) ||
      getHospitalName(referral.fromHospital).toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div>
        <h2 className="text-xl font-semibold">Incoming Referrals</h2>
        <p className="text-sm text-muted-foreground">Review and approve referral requests from other facilities</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Referral Queue</CardTitle>
          <CardDescription>Referrals awaiting your review and approval</CardDescription>
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by patient name or referral ID"
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredReferrals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? "No referrals found matching your search" : "No incoming referrals at this time"}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReferrals.map((referral) => (
                <div
                  key={referral._id}
                  className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{referral.patientName || "Unknown Patient"}</h3>
                        <Badge className={getPriorityColor(referral.urgency)}>{referral.urgency}</Badge>
                        <Badge className={getStatusColor(referral.status)}>{referral.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Ref ID: <span className="font-mono">{referral._id.substring(0, 8)}...</span>
                      </p>
                    </div>
                    <Button
                      onClick={() => onSelectReferral(referral._id)}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Review
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">From Facility</p>
                      <p className="font-medium">{getHospitalName(referral.fromHospital)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Reason</p>
                      <p className="font-medium">{referral.reasonForReferral || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Patient Phone</p>
                      <p className="font-medium">{referral.patientPhone || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Received</p>
                      <p className="font-medium text-xs">{formatDate(referral.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
