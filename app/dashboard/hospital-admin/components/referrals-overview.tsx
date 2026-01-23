"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"

interface Referral {
  _id: string
  patientName: string
  fromHospital?: { name: string } | string
  toHospital?: { name: string } | string
  urgency: string
  status: string
  createdAt: string
}

export function ReferralsOverview() {
  const { user } = useAuth()
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  const fetchReferrals = async () => {
    if (!user?.token || !user?.hospitalId) {
      setError("Authentication token or hospital ID missing")
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError("")
      const response = await apiClient.getAllReferrals({ hospitalId: user.hospitalId })
      const referralData = response.data || response
      setReferrals(Array.isArray(referralData) ? referralData : [])
    } catch (err: any) {
      console.error("Error fetching referrals:", err)
      setError(err.message || "Failed to load referrals")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchReferrals()
  }, [user?.token, user?.hospitalId])

  const getPriorityColor = (priority: string) => {
    const upperPriority = priority.toUpperCase()
    if (upperPriority === "EMERGENCY") return "bg-red-100 text-red-800"
    if (upperPriority === "URGENT") return "bg-orange-100 text-orange-800"
    return "bg-blue-100 text-blue-800"
  }

  const getStatusColor = (status: string) => {
    const upperStatus = status.toUpperCase()
    if (upperStatus === "APPROVED" || upperStatus === "COMPLETED") return "bg-green-100 text-green-800"
    if (upperStatus === "PENDING" || upperStatus === "DRAFT") return "bg-yellow-100 text-yellow-800"
    if (upperStatus === "REJECTED") return "bg-red-100 text-red-800"
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
    if (!hospital) return "N/A"
    if (typeof hospital === "string") return hospital
    return hospital.name || "N/A"
  }

  const filteredReferrals = referrals.filter((referral) => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      referral.patientName?.toLowerCase().includes(searchLower) ||
      referral._id?.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>
      )}

      <div>
        <h2 className="text-xl font-semibold">Referrals Overview</h2>
        <p className="text-sm text-muted-foreground">Monitor all incoming and outgoing referrals</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Referrals</CardTitle>
          <CardDescription>All referrals involving your hospital</CardDescription>
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
              {searchTerm ? "No referrals found matching your search" : "No referrals found"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Referral ID</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Patient</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">From</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">To</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Priority</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReferrals.map((referral) => (
                    <tr key={referral._id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4 text-sm font-medium font-mono">{referral._id.substring(0, 8)}...</td>
                      <td className="py-3 px-4 text-sm">{referral.patientName || "N/A"}</td>
                      <td className="py-3 px-4 text-sm">{getHospitalName(referral.fromHospital)}</td>
                      <td className="py-3 px-4 text-sm">{getHospitalName(referral.toHospital)}</td>
                      <td className="py-3 px-4">
                        <Badge className={`${getPriorityColor(referral.urgency)} text-xs`}>
                          {referral.urgency || "N/A"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={`${getStatusColor(referral.status)} text-xs`}>
                          {referral.status || "N/A"}
                        </Badge>
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
