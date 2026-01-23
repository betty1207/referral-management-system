"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Loader2 } from "lucide-react"
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
  createdAt: string
  updatedAt?: string
}

export function OutgoingReferrals() {
  const { user } = useAuth()
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  const fetchOutgoingReferrals = async () => {
    if (!user?.token || !user?.hospitalId) {
      setError("Authentication token or hospital ID missing")
      setIsLoading(false)
      return
    }

      try {
      setIsLoading(true)
      setError("")
      // Fetch all referrals and filter for outgoing (where this hospital is the source)
      const response = await apiClient.getAllReferrals()
      const referralData = response.data || response
      const allReferrals = Array.isArray(referralData) ? referralData : []
      
      // Filter to only show referrals from this hospital
      const filteredReferrals = allReferrals.filter((r: any) => {
        const fromHospitalId = typeof r.fromHospital === 'object' ? r.fromHospital?._id : r.fromHospital
        return fromHospitalId === user.hospitalId
      })
      
      setReferrals(filteredReferrals)
    } catch (err: any) {
      console.error("Error fetching outgoing referrals:", err)
      setError(err.message || "Failed to load outgoing referrals")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchOutgoingReferrals()
  }, [user?.token, user?.hospitalId])

  const getStatusColor = (status: string) => {
    const upperStatus = status.toUpperCase()
    if (upperStatus === "COMPLETED") return "bg-green-100 text-green-800"
    if (upperStatus === "APPROVED" || upperStatus === "PENDING") return "bg-blue-100 text-blue-800"
    if (upperStatus === "REJECTED") return "bg-red-100 text-red-800"
    if (upperStatus === "DRAFT") return "bg-gray-100 text-gray-800"
    return "bg-yellow-100 text-yellow-800"
  }

  const getPriorityColor = (priority: string) => {
    const upperPriority = priority.toUpperCase()
    if (upperPriority === "EMERGENCY") return "bg-red-100 text-red-800"
    if (upperPriority === "URGENT") return "bg-orange-100 text-orange-800"
    return "bg-blue-100 text-blue-800"
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString()
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
        <p className="text-sm text-muted-foreground">Track referrals sent to other facilities</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sent Referrals</CardTitle>
          <CardDescription>Referrals initiated from your facility</CardDescription>
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search referrals"
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
              {searchTerm ? "No referrals found matching your search" : "No outgoing referrals at this time"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Ref ID</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Patient</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">To Facility</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Priority</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Sent Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReferrals.map((referral) => (
                    <tr key={referral._id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4 text-sm font-mono text-muted-foreground">
                        {referral._id.substring(0, 8)}...
                      </td>
                      <td className="py-3 px-4 text-sm">{referral.patientName || "N/A"}</td>
                      <td className="py-3 px-4 text-sm">{getHospitalName(referral.toHospital)}</td>
                      <td className="py-3 px-4 text-sm">
                        <Badge className={getPriorityColor(referral.urgency)}>{referral.urgency}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(referral.status)}>{referral.status}</Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {formatDate(referral.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
