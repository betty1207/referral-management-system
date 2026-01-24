"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Eye, Loader2, Send } from "lucide-react"
import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Referral {
  _id: string
  referralCode: string
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

export function OutgoingReferrals() {
  const { user } = useAuth()
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  const fetchOutgoingReferrals = async () => {
    if (!user?.token) {
      setError("Authentication token missing")
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError("")
      const response = await apiClient.getLiaisonOutbox()
      const referralData = response.data || response
      const outgoingReferrals = Array.isArray(referralData) ? referralData : []
      setReferrals(outgoingReferrals)
    } catch (err: any) {
      console.error("Error fetching outgoing referrals:", err)
      setError(err.message || "Failed to load outgoing referrals")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchOutgoingReferrals()
  }, [user?.token])

  const getPriorityColor = (priority: string) => {
    const upperPriority = priority.toUpperCase()
    if (upperPriority === "EMERGENCY") return "bg-red-100 text-red-800"
    if (upperPriority === "URGENT") return "bg-orange-100 text-orange-800"
    return "bg-blue-100 text-blue-800"
  }

  const getStatusColor = (status: string) => {
    const upperStatus = status.toUpperCase()
    if (upperStatus === "DRAFT") return "bg-gray-100 text-gray-800"
    if (upperStatus === "PENDING") return "bg-yellow-100 text-yellow-800"
    if (upperStatus === "SENT") return "bg-blue-100 text-blue-800"
    return "bg-gray-100 text-gray-800"
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return dateString
    }
  }

  const getHospitalName = (hospital: { name: string } | string | undefined) => {
    if (!hospital) return "Not assigned"
    if (typeof hospital === "string") return hospital
    return hospital.name || "Not assigned"
  }

  const handleSendReferral = async (referralId: string) => {
    console.log("Send referral:", referralId)
  }

  const filteredReferrals = referrals.filter((referral) => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      referral.patientName?.toLowerCase().includes(searchLower) ||
      referral.referralCode?.toLowerCase().includes(searchLower) ||
      getHospitalName(referral.toHospital).toLowerCase().includes(searchLower)
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
        <h2 className="text-xl font-semibold">Outgoing Referrals</h2>
        <p className="text-sm text-muted-foreground">Draft referrals ready to be sent to other facilities</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Draft Referrals</CardTitle>
          <CardDescription>Review and send draft referrals to target hospitals</CardDescription>
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by patient name or referral code"
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
              {searchTerm ? "No referrals found matching your search" : "No draft referrals at this time"}
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
                        Ref: <span className="font-mono">{referral.referralCode || referral._id.substring(0, 8)}</span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {referral.status === "DRAFT" && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleSendReferral(referral._id)}
                          className="bg-green-600 hover:bg-green-700 gap-2"
                          title="Send Referral"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">To Hospital</p>
                      <p className="font-medium">{getHospitalName(referral.toHospital)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Reason</p>
                      <p className="font-medium">{referral.reasonForReferral || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Created By</p>
                      <p className="font-medium">
                        {typeof referral.createdBy === 'object' 
                          ? referral.createdBy.fullName 
                          : "Doctor"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Created Date</p>
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