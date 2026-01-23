"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Loader2, Send, X, Eye } from "lucide-react"
import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

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
  attachments?: string[]
  createdBy?: { _id: string; fullName: string } | string
  createdAt: string
  updatedAt?: string
}

export function OutgoingReferrals() {
  const { user } = useAuth()
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null)
  const [showSendDialog, setShowSendDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [targetHospitalId, setTargetHospitalId] = useState("")
  const [hospitals, setHospitals] = useState<Array<{ _id: string; name: string }>>([])
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    fetchHospitals()
  }, [])

  const fetchHospitals = async () => {
    try {
      const response = await apiClient.getHospitals()
      const hospitalData = response.data || response
      const hospitalsList = Array.isArray(hospitalData) ? hospitalData : []
      // Filter out the current hospital
      setHospitals(hospitalsList.filter((h: any) => h._id !== user?.hospitalId))
    } catch (err) {
      console.error("Error fetching hospitals:", err)
    }
  }

  const fetchOutgoingReferrals = async () => {
    if (!user?.token || !user?.hospitalId) {
      setError("Authentication token or hospital ID missing")
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError("")
      // Use the liaison outbox endpoint to get draft referrals
      const response = await apiClient.getLiaisonOutbox()
      const referralData = response.data || response
      const referralsList = Array.isArray(referralData) ? referralData : []
      setReferrals(referralsList)
    } catch (err: any) {
      console.error("Error fetching outgoing referrals:", err)
      setError(err.message || "Failed to load draft referrals")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchOutgoingReferrals()
  }, [user?.token, user?.hospitalId])

  const handleSendReferral = async () => {
    if (!selectedReferral || !targetHospitalId) {
      setError("Please select a target hospital")
      return
    }

    setIsSending(true)
    setError("")
    setSuccess("")

    try {
      await apiClient.sendReferral(selectedReferral._id, targetHospitalId)
      setSuccess("Referral sent successfully!")
      setShowSendDialog(false)
      setTargetHospitalId("")
      setSelectedReferral(null)
      await fetchOutgoingReferrals()
      setTimeout(() => setSuccess(""), 3000)
    } catch (err: any) {
      console.error("Error sending referral:", err)
      setError(err.message || "Failed to send referral")
    } finally {
      setIsSending(false)
    }
  }

  const handleRejectDraft = async (referralId: string) => {
    if (!confirm("Are you sure you want to reject this draft referral? This action cannot be undone.")) {
      return
    }

    try {
      setError("")
      // You might want to add a rejectDraft method or use updateReferral
      // For now, we'll just delete/update the status
      await apiClient.updateReferral(referralId, { status: "REJECTED" })
      setSuccess("Draft referral rejected")
      await fetchOutgoingReferrals()
      setTimeout(() => setSuccess(""), 3000)
    } catch (err: any) {
      console.error("Error rejecting draft:", err)
      setError(err.message || "Failed to reject draft")
    }
  }

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

  const getDoctorName = (createdBy: { fullName: string } | string | undefined) => {
    if (!createdBy) return "N/A"
    if (typeof createdBy === "string") return createdBy
    return createdBy.fullName || "N/A"
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

      {success && (
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <div>
        <h2 className="text-xl font-semibold">Draft Referrals (Outbox)</h2>
        <p className="text-sm text-muted-foreground">
          Review and send draft referrals created by doctors in your hospital
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Draft Referrals</CardTitle>
          <CardDescription>Referrals waiting to be sent to other facilities</CardDescription>
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
              {searchTerm
                ? "No referrals found matching your search"
                : "No draft referrals at this time"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Referral Code
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Patient
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Created By
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      To Facility
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Priority
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Created Date
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReferrals.map((referral) => (
                    <tr key={referral._id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4 text-sm font-mono text-muted-foreground">
                        {referral.referralCode || referral._id.substring(0, 8)}
                      </td>
                      <td className="py-3 px-4 text-sm">{referral.patientName || "N/A"}</td>
                      <td className="py-3 px-4 text-sm">{getDoctorName(referral.createdBy)}</td>
                      <td className="py-3 px-4 text-sm">
                        {referral.toHospital
                          ? getHospitalName(referral.toHospital)
                          : "Not assigned"}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <Badge className={getPriorityColor(referral.urgency)}>
                          {referral.urgency}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(referral.status)}>{referral.status}</Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {formatDate(referral.createdAt)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedReferral(referral)
                              setShowDetailsDialog(true)
                            }}
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {referral.status === "DRAFT" && (
                            <>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => {
                                  setSelectedReferral(referral)
                                  setShowSendDialog(true)
                                }}
                                className="bg-green-600 hover:bg-green-700"
                                title="Send Referral"
                              >
                                <Send className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleRejectDraft(referral._id)}
                                title="Reject Draft"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Send Referral Dialog */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Referral</DialogTitle>
            <DialogDescription>
              Select a target hospital to send this referral to. The referral will be sent to the
              receiving hospital's liaison officer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedReferral && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">Patient: {selectedReferral.patientName}</p>
                <p className="text-sm text-muted-foreground">
                  Referral Code: {selectedReferral.referralCode || selectedReferral._id.substring(0, 8)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Reason: {selectedReferral.reasonForReferral}
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="targetHospital">Target Hospital *</Label>
              <Select value={targetHospitalId} onValueChange={setTargetHospitalId}>
                <SelectTrigger id="targetHospital">
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
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowSendDialog(false)} disabled={isSending}>
                Cancel
              </Button>
              <Button
                onClick={handleSendReferral}
                disabled={!targetHospitalId || isSending}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Referral
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Referral Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Referral Details</DialogTitle>
            <DialogDescription>View full details of this referral</DialogDescription>
          </DialogHeader>
          {selectedReferral && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Referral Code</Label>
                  <p className="font-mono text-sm">{selectedReferral.referralCode || selectedReferral._id}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <Badge className={getStatusColor(selectedReferral.status)}>
                    {selectedReferral.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Patient Name</Label>
                  <p className="text-sm">{selectedReferral.patientName}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Patient Phone</Label>
                  <p className="text-sm">{selectedReferral.patientPhone}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Created By</Label>
                  <p className="text-sm">{getDoctorName(selectedReferral.createdBy)}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Priority</Label>
                  <Badge className={getPriorityColor(selectedReferral.urgency)}>
                    {selectedReferral.urgency}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">To Hospital</Label>
                  <p className="text-sm">
                    {selectedReferral.toHospital
                      ? getHospitalName(selectedReferral.toHospital)
                      : "Not assigned"}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Created Date</Label>
                  <p className="text-sm">{formatDate(selectedReferral.createdAt)}</p>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Reason for Referral</Label>
                <p className="text-sm bg-muted p-3 rounded-md">{selectedReferral.reasonForReferral}</p>
              </div>
              {selectedReferral.clinicalNotes && (
                <div>
                  <Label className="text-xs text-muted-foreground">Clinical Notes</Label>
                  <p className="text-sm bg-muted p-3 rounded-md">{selectedReferral.clinicalNotes}</p>
                </div>
              )}
              {selectedReferral.attachments && selectedReferral.attachments.length > 0 && (
                <div>
                  <Label className="text-xs text-muted-foreground">Attachments</Label>
                  <div className="text-sm">
                    {selectedReferral.attachments.map((att, idx) => (
                      <span key={idx} className="inline-block mr-2">
                        {att}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
