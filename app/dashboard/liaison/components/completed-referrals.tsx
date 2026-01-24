"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Eye, Loader2, MessageSquare } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface CompletedReferral {
  _id: string
  referralCode: string
  patientName: string
  fromHospital?: { name: string; _id: string } | string
  toHospital?: { name: string; _id: string } | string
  urgency: string
  status: string
  reasonForReferral: string
  feedbackNote?: string
  completedAt: string
  createdBy?: { fullName: string } | string
  createdAt: string
}

export function CompletedReferrals() {
  const { user } = useAuth()
  const [referrals, setReferrals] = useState<CompletedReferral[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedReferral, setSelectedReferral] = useState<CompletedReferral | null>(null)
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false)
  const [feedbackNote, setFeedbackNote] = useState("")
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)

  const fetchCompletedReferrals = async () => {
    try {
      setIsLoading(true)
      setError("")
      const response = await apiClient.getAllReferrals()
      const referralData = response.data || response
      const allReferrals = Array.isArray(referralData) ? referralData : []
      const completed = allReferrals.filter((r: any) => {
        const toHospitalId = typeof r.toHospital === 'object' ? r.toHospital?._id : r.toHospital
        return (
          toHospitalId === user?.hospitalId &&
          r.status === "COMPLETED"
        )
      })
      setReferrals(completed)
    } catch (err: any) {
      console.error("Error fetching completed referrals:", err)
      setError(err.message || "Failed to load completed referrals")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCompletedReferrals()
  }, [user?.hospitalId])

  const handleSubmitFeedback = async () => {
    if (!selectedReferral || feedbackNote.length < 10) {
      setError("Feedback note must be at least 10 characters")
      return
    }

    setIsSubmittingFeedback(true)
    setError("")

    try {
      await apiClient.completeReferral(selectedReferral._id, feedbackNote)
      setShowFeedbackDialog(false)
      setFeedbackNote("")
      setSelectedReferral(null)
      await fetchCompletedReferrals()
    } catch (err: any) {
      console.error("Error submitting feedback:", err)
      setError(err.message || "Failed to submit feedback")
    } finally {
      setIsSubmittingFeedback(false)
    }
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
      referral.referralCode?.toLowerCase().includes(searchLower) ||
      getHospitalName(referral.fromHospital).toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div>
        <h2 className="text-2xl font-bold">Completed Referrals</h2>
        <p className="text-muted-foreground">
          View completed referrals and provide feedback
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Completed Cases</CardTitle>
          <CardDescription>
            Referrals that have been completed and can receive feedback
          </CardDescription>
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
              No completed referrals found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Patient
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      From Hospital
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Priority
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Completed Date
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Feedback
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReferrals.map((referral) => (
                    <tr key={referral._id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4 text-sm">{referral.patientName}</td>
                      <td className="py-3 px-4 text-sm">{getHospitalName(referral.fromHospital)}</td>
                      <td className="py-3 px-4">
                        <Badge className={getPriorityColor(referral.urgency)}>
                          {referral.urgency}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {formatDate(referral.completedAt)}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {referral.feedbackNote ? (
                          <span className="text-green-600">Submitted</span>
                        ) : (
                          <span className="text-yellow-600">Pending</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedReferral(referral)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {!referral.feedbackNote && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => {
                                setSelectedReferral(referral)
                                setShowFeedbackDialog(true)
                              }}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </Button>
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

      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Feedback</DialogTitle>
            <DialogDescription>
              Provide feedback for referral: {selectedReferral?.patientName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="feedbackNote">Feedback Note *</Label>
              <Textarea
                id="feedbackNote"
                placeholder="Provide details about patient treatment and outcome (minimum 10 characters)"
                value={feedbackNote}
                onChange={(e) => setFeedbackNote(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Minimum 10 characters required
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowFeedbackDialog(false)
                  setFeedbackNote("")
                }}
                disabled={isSubmittingFeedback}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitFeedback}
                disabled={isSubmittingFeedback || feedbackNote.length < 10}
              >
                {isSubmittingFeedback ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Feedback"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}