"use client"

import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Eye, Edit, Send } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Referral {
  _id: string
  referralCode: string
  patientName: string
  patientPhone: string
  fromHospital: any
  toHospital: any
  urgency: "ROUTINE" | "URGENT" | "EMERGENCY"
  status: "DRAFT" | "PENDING" | "ACCEPTED" | "REJECTED" | "SCHEDULED" | "CHECKED_IN" | "COMPLETED" | "EXPIRED"
  reasonForReferral: string
  clinicalNotes?: string
  createdAt: string
  updatedAt: string
}

export function MyReferrals() {
  const { user } = useAuth()
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null)
  const [hospitals, setHospitals] = useState<Array<{ _id: string; name: string }>>([])

  useEffect(() => {
    fetchReferrals()
    fetchHospitals()
  }, [])

  const fetchHospitals = async () => {
    try {
      const response = await apiClient.getHospitals()
      const hospitalData = response.data || response
      setHospitals(Array.isArray(hospitalData) ? hospitalData : [])
    } catch (err) {
      console.error("Error fetching hospitals:", err)
    }
  }

  const fetchReferrals = async () => {
    try {
      setIsLoading(true)
      setError("")
      const response = await apiClient.getMyReferrals()
      const referralsData = response.data || response
      const referralsList = Array.isArray(referralsData) ? referralsData : []
      setReferrals(referralsList)
    } catch (err: any) {
      console.error("Error fetching referrals:", err)
      setError(err.message || "Failed to load referrals")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendReferral = async (referralId: string, targetHospitalId: string) => {
    if (!targetHospitalId) {
      setError("Please select a target hospital")
      return
    }

    try {
      setError("")
      await apiClient.sendReferral(referralId, targetHospitalId)
      await fetchReferrals()
      setSelectedReferral(null)
    } catch (err: any) {
      setError(err.message || "Failed to send referral")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACCEPTED":
      case "SCHEDULED":
      case "CHECKED_IN":
      case "COMPLETED":
        return "bg-green-100 text-green-800"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "REJECTED":
      case "EXPIRED":
        return "bg-red-100 text-red-800"
      case "DRAFT":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "Draft"
      case "PENDING":
        return "Pending"
      case "ACCEPTED":
        return "Accepted"
      case "REJECTED":
        return "Rejected"
      case "SCHEDULED":
        return "Scheduled"
      case "CHECKED_IN":
        return "Checked In"
      case "COMPLETED":
        return "Completed"
      case "EXPIRED":
        return "Expired"
      default:
        return status
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "EMERGENCY":
        return "bg-red-100 text-red-800"
      case "URGENT":
        return "bg-orange-100 text-orange-800"
      case "ROUTINE":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityDisplayName = (priority: string) => {
    switch (priority) {
      case "ROUTINE":
        return "Routine"
      case "URGENT":
        return "Urgent"
      case "EMERGENCY":
        return "Emergency"
      default:
        return priority
    }
  }

  const filteredReferrals = referrals.filter((referral) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      referral.patientName.toLowerCase().includes(query) ||
      referral.referralCode.toLowerCase().includes(query) ||
      referral.patientPhone.includes(query)
    )
  })

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">My Referrals</h2>
        <p className="text-sm text-muted-foreground">Track all your referral submissions</p>
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">{error}</div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Referral History</CardTitle>
          <CardDescription>All referrals created by you</CardDescription>
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by patient name, referral code, or phone"
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading referrals...</div>
          ) : filteredReferrals.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Ref Code</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Patient</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">To Hospital</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Priority</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Created</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReferrals.map((referral) => (
                    <tr key={referral._id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4 text-sm font-mono text-muted-foreground">
                        {referral.referralCode}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <div>
                          <div className="font-medium">{referral.patientName}</div>
                          <div className="text-xs text-muted-foreground">{referral.patientPhone}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {referral.toHospital?.name || "Not specified"}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getPriorityColor(referral.urgency)}>
                          {getPriorityDisplayName(referral.urgency)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(referral.status)}>
                          {getStatusDisplayName(referral.status)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {new Date(referral.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedReferral(referral)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {referral.status === "DRAFT" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedReferral(referral)
                              }}
                            >
                              <Send className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? "No referrals found matching your search" : "No referrals found"}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Referral Details Dialog */}
      {selectedReferral && (
        <Dialog open={!!selectedReferral} onOpenChange={() => setSelectedReferral(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Referral Details</DialogTitle>
              <DialogDescription>View and manage referral information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Referral Code</Label>
                  <p className="font-mono text-sm">{selectedReferral.referralCode}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <Badge className={getStatusColor(selectedReferral.status)}>
                    {getStatusDisplayName(selectedReferral.status)}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Patient Name</Label>
                  <p className="text-sm">{selectedReferral.patientName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Patient Phone</Label>
                  <p className="text-sm">{selectedReferral.patientPhone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">From Hospital</Label>
                  <p className="text-sm">{selectedReferral.fromHospital?.name || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">To Hospital</Label>
                  <p className="text-sm">{selectedReferral.toHospital?.name || "Not specified"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Urgency</Label>
                  <Badge className={getPriorityColor(selectedReferral.urgency)}>
                    {getPriorityDisplayName(selectedReferral.urgency)}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                  <p className="text-sm">{new Date(selectedReferral.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Reason for Referral</Label>
                <p className="text-sm mt-1 p-3 bg-muted rounded-md">{selectedReferral.reasonForReferral}</p>
              </div>
              {selectedReferral.clinicalNotes && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Clinical Notes</Label>
                  <p className="text-sm mt-1 p-3 bg-muted rounded-md">{selectedReferral.clinicalNotes}</p>
                </div>
              )}
              {selectedReferral.status === "DRAFT" && !selectedReferral.toHospital && (
                <div className="pt-4 border-t">
                  <Label className="text-sm font-medium">Send Referral</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Select a target hospital to send this referral
                  </p>
                  <div className="flex gap-2">
                    <Select
                      onValueChange={(value) => {
                        handleSendReferral(selectedReferral._id, value)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select target hospital" />
                      </SelectTrigger>
                      <SelectContent>
                        {hospitals
                          .filter((h) => h._id !== user?.hospitalId)
                          .map((hospital) => (
                            <SelectItem key={hospital._id} value={hospital._id}>
                              {hospital.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
