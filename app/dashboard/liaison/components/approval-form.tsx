"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { ChevronLeft, Download, Loader2, AlertCircle } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface ApprovalFormProps {
  referralId: string | null
  onBack: () => void
}

interface ReferralDetails {
  _id: string
  patientName: string
  patientPhone: string
  fromHospital?: { name: string; _id: string } | string
  toHospital?: { name: string; _id: string } | string
  urgency: string
  status: string
  reasonForReferral: string
  clinicalNotes?: string
  requiredSpecialty?: string
  requiredBedType?: string
  createdAt: string
  patient?: {
    fullName: string
    sex: string
    dateOfBirth: string
    phone: string
    nationalId?: string
    address?: string
  }
}

export function ApprovalForm({ referralId, onBack }: ApprovalFormProps) {
  const { user } = useAuth()
  const [referral, setReferral] = useState<ReferralDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [notes, setNotes] = useState("")
  const [scheduledDate, setScheduledDate] = useState("")
  const [rejectReason, setRejectReason] = useState("")
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)

  useEffect(() => {
    if (referralId) {
      fetchReferralDetails()
    }
  }, [referralId])

  const fetchReferralDetails = async () => {
    if (!referralId || !user?.token) {
      setError("Referral ID or authentication token missing")
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError("")
      const response = await apiClient.getReferralById(referralId)
      const referralData = response.data || response
      setReferral(referralData)
    } catch (err: any) {
      console.error("Error fetching referral details:", err)
      setError(err.message || "Failed to load referral details")
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!referralId || !user?.token) {
      setError("Referral ID or authentication token missing")
      return
    }

    try {
      setIsApproving(true)
      setError("")
      setSuccess("")

      await apiClient.respondToReferral(
        referralId,
        "ACCEPTED",
        notes
      )

      setSuccess("Referral approved successfully!")
      setTimeout(() => {
        onBack()
      }, 1500)
    } catch (err: any) {
      console.error("Error approving referral:", err)
      setError(err.message || "Failed to approve referral")
    } finally {
      setIsApproving(false)
    }
  }

  const handleReject = async () => {
    if (!referralId || !user?.token) {
      setError("Referral ID or authentication token missing")
      return
    }

    if (!rejectReason.trim()) {
      setError("Please provide a reason for rejection")
      return
    }

    try {
      setIsRejecting(true)
      setError("")
      setSuccess("")

      await apiClient.respondToReferral(
        referralId,
        "REJECTED",
        rejectReason
      )

      setSuccess("Referral rejected successfully!")
      setShowRejectDialog(false)
      setTimeout(() => {
        onBack()
      }, 1500)
    } catch (err: any) {
      console.error("Error rejecting referral:", err)
      setError(err.message || "Failed to reject referral")
    } finally {
      setIsRejecting(false)
    }
  }

  const getHospitalName = (hospital: { name: string } | string | undefined) => {
    if (!hospital) return "N/A"
    if (typeof hospital === "string") return hospital
    return hospital.name || "N/A"
  }

  const getPriorityColor = (priority: string) => {
    const upperPriority = priority.toUpperCase()
    if (upperPriority === "EMERGENCY") return "bg-red-100 text-red-800"
    if (upperPriority === "URGENT") return "bg-orange-100 text-orange-800"
    return "bg-blue-100 text-blue-800"
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!referral) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" className="gap-2" onClick={onBack}>
          <ChevronLeft className="w-4 h-4" />
          Back to Referrals
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Referral not found</AlertDescription>
        </Alert>
      </div>
    )
  }

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

      <Button variant="ghost" className="gap-2" onClick={onBack}>
        <ChevronLeft className="w-4 h-4" />
        Back to Referrals
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Patient Name</p>
                <p className="font-medium">{referral.patientName || referral.patient?.fullName || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="font-medium">{referral.patientPhone || referral.patient?.phone || "N/A"}</p>
              </div>
              {referral.patient && (
                <>
                  <div>
                    <p className="text-xs text-muted-foreground">Gender</p>
                    <p className="font-medium">{referral.patient.sex || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Date of Birth</p>
                    <p className="font-medium">
                      {referral.patient.dateOfBirth
                        ? new Date(referral.patient.dateOfBirth).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </>
              )}
              <div>
                <p className="text-xs text-muted-foreground">From Facility</p>
                <p className="font-medium">{getHospitalName(referral.fromHospital)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">To Facility</p>
                <p className="font-medium">{getHospitalName(referral.toHospital)}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-xs text-muted-foreground mb-2">Reason for Referral</p>
              <p className="font-medium text-sm">{referral.reasonForReferral || "N/A"}</p>
            </div>

            {referral.clinicalNotes && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Clinical Notes</p>
                <p className="text-sm bg-muted p-3 rounded-md">{referral.clinicalNotes}</p>
              </div>
            )}

            {referral.requiredSpecialty && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Required Specialty</p>
                <p className="font-medium text-sm">{referral.requiredSpecialty}</p>
              </div>
            )}

            {referral.requiredBedType && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Required Bed Type</p>
                <p className="font-medium text-sm">{referral.requiredBedType}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Review Action</CardTitle>
            <CardDescription>Approve or reject this referral</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Priority</p>
              <Badge className={`${getPriorityColor(referral.urgency)} w-full justify-center py-2`}>
                {referral.urgency}
              </Badge>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Current Status</p>
              <Badge variant="outline" className="w-full justify-center py-2">
                {referral.status}
              </Badge>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduledDate">Scheduled Date (Optional)</Label>
              <Input
                id="scheduledDate"
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Approval Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add notes about this approval..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="h-24"
              />
            </div>

            <div className="flex gap-2">
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={handleApprove}
                disabled={isApproving || isRejecting}
              >
                {isApproving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Approving...
                  </>
                ) : (
                  "Approve"
                )}
              </Button>
              <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex-1" disabled={isApproving || isRejecting}>
                    Reject
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Reject Referral</DialogTitle>
                    <DialogDescription>
                      Please provide a reason for rejecting this referral. This will be sent to the referring
                      facility.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="rejectReason">Rejection Reason *</Label>
                      <Textarea
                        id="rejectReason"
                        placeholder="e.g., Specialist available internally, No bed availability, etc."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="h-32"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setShowRejectDialog(false)}
                        disabled={isRejecting}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="flex-1 bg-red-600 hover:bg-red-700"
                        onClick={handleReject}
                        disabled={isRejecting || !rejectReason.trim()}
                      >
                        {isRejecting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Rejecting...
                          </>
                        ) : (
                          "Confirm Rejection"
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}