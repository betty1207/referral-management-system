"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Loader2, Eye, CheckCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface Referral {
  _id: string
  patientName: string
  patientPhone?: string
  fromHospital?: { name: string; _id: string } | string
  toHospital?: { name: string; _id: string } | string
  urgency: string
  status: string
  reasonForReferral?: string
  clinicalNotes?: string
  createdAt: string
  updatedAt?: string
  feedbackNote?: string
  completedAt?: string
  doctorName?: string
}

export function ReferralsOverview() {
  const { user } = useAuth()
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showCompleteDialog, setShowCompleteDialog] = useState(false)
  const [completionNote, setCompletionNote] = useState("")
  const [isCompleting, setIsCompleting] = useState(false)

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

  const handleCompleteReferral = async () => {
    if (!selectedReferral || !user?.token) {
      setError("Referral or authentication token missing")
      return
    }

    if (!completionNote.trim()) {
      setError("Please provide a completion note")
      return
    }

    try {
      setIsCompleting(true)
      setError("")

      console.log("[HospitalAdminReferrals] Completing referral:", selectedReferral._id, completionNote)
      await apiClient.completeReferral(selectedReferral._id, completionNote)

      setShowCompleteDialog(false)
      setCompletionNote("")
      setSelectedReferral(null)
      await fetchReferrals()
    } catch (err: any) {
      console.error("Error completing referral:", err)
      setError(err.message || "Failed to complete referral")
    } finally {
      setIsCompleting(false)
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
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      <div>
        <h2 className="text-xl font-semibold text-gray-800">Referrals Overview</h2>
        <p className="text-sm text-gray-600">Monitor and manage all referrals involving your hospital</p>
      </div>

      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader className="pb-4 border-b border-gray-100">
          <CardTitle className="text-lg font-semibold text-gray-800">Recent Referrals</CardTitle>
          <CardDescription className="text-gray-600">All referrals involving your hospital</CardDescription>
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by patient name or referral ID"
              className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
            </div>
          ) : filteredReferrals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? "No referrals found matching your search" : "No referrals found"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-800">Referral ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-800">Patient</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-800">From</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-800">To</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-800">Priority</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-800">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-800">Date</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-800">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReferrals.map((referral) => (
                    <tr key={referral._id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium font-mono text-gray-800">{referral._id.substring(0, 8)}...</td>
                      <td className="py-3 px-4 text-sm text-gray-800">{referral.patientName || "N/A"}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{getHospitalName(referral.fromHospital)}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{getHospitalName(referral.toHospital)}</td>
                      <td className="py-3 px-4">
                        <Badge className={`${getPriorityColor(referral.urgency)} text-xs border-0`}>
                          {referral.urgency || "N/A"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={`${getStatusColor(referral.status)} text-xs border-0`}>
                          {referral.status || "N/A"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {formatDate(referral.createdAt)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedReferral(referral)
                              setShowDetailsDialog(true)
                            }}
                            className="border-gray-300 text-gray-700 hover:bg-gray-50"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {referral.status === "APPROVED" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedReferral(referral)
                                setShowCompleteDialog(true)
                              }}
                              className="border-blue-300 text-blue-700 hover:bg-blue-50"
                            >
                              <CheckCircle className="w-4 h-4" />
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

      {/* Referral Details Dialog */}
      {selectedReferral && (
        <Dialog open={showDetailsDialog} onOpenChange={() => setShowDetailsDialog(false)}>
          <DialogContent className="max-w-2xl bg-white border-gray-200 shadow-lg">
            <DialogHeader className="pb-4 border-b border-gray-100">
              <DialogTitle className="text-lg font-semibold text-gray-800">Referral Details</DialogTitle>
              <DialogDescription className="text-gray-600">
                Complete information for referral: {selectedReferral.patientName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Patient Name</p>
                  <p className="font-medium text-gray-800">{selectedReferral.patientName || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="font-medium text-gray-800">{selectedReferral.patientPhone || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">From Hospital</p>
                  <p className="font-medium text-gray-800">{getHospitalName(selectedReferral.fromHospital)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">To Hospital</p>
                  <p className="font-medium text-gray-800">{getHospitalName(selectedReferral.toHospital)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Priority</p>
                  <Badge className={`${getPriorityColor(selectedReferral.urgency)} text-xs border-0`}>
                    {selectedReferral.urgency || "N/A"}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <Badge className={`${getStatusColor(selectedReferral.status)} text-xs border-0`}>
                    {selectedReferral.status || "N/A"}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Created Date</p>
                  <p className="font-medium text-gray-800">{formatDate(selectedReferral.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Doctor</p>
                  <p className="font-medium text-gray-800">{selectedReferral.doctorName || "N/A"}</p>
                </div>
              </div>
              
              {selectedReferral.reasonForReferral && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Reason for Referral</p>
                  <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg">{selectedReferral.reasonForReferral}</p>
                </div>
              )}
              
              {selectedReferral.clinicalNotes && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Clinical Notes</p>
                  <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg">{selectedReferral.clinicalNotes}</p>
                </div>
              )}
              
              {selectedReferral.completedAt && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Completion Date</p>
                  <p className="font-medium text-gray-800">{formatDate(selectedReferral.completedAt)}</p>
                </div>
              )}
              
              {selectedReferral.feedbackNote && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Feedback Note</p>
                  <p className="text-sm text-gray-800 bg-green-50 p-3 rounded-lg border border-green-200">{selectedReferral.feedbackNote}</p>
                </div>
              )}
            </div>
            <DialogFooter className="pt-4 border-t border-gray-100">
              <Button
                variant="outline"
                onClick={() => setShowDetailsDialog(false)}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Complete Referral Dialog */}
      {selectedReferral && (
        <Dialog open={showCompleteDialog} onOpenChange={() => setShowCompleteDialog(false)}>
          <DialogContent className="max-w-md bg-white border-gray-200 shadow-lg">
            <DialogHeader className="pb-4 border-b border-gray-100">
              <DialogTitle className="text-lg font-semibold text-gray-800">Complete Referral</DialogTitle>
              <DialogDescription className="text-gray-600">
                Provide completion details for referral: {selectedReferral.patientName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              {error && <div className="p-3 bg-red-50 text-red-800 rounded-lg text-sm border border-red-200">{error}</div>}
              <div className="space-y-2">
                <Label htmlFor="completionNote" className="text-sm font-medium text-gray-700">Completion Note *</Label>
                <Textarea
                  id="completionNote"
                  placeholder="Provide details about patient treatment and outcome..."
                  value={completionNote}
                  onChange={(e) => setCompletionNote(e.target.value)}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter className="pt-4 border-t border-gray-100">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCompleteDialog(false)
                  setCompletionNote("")
                }}
                disabled={isCompleting}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCompleteReferral}
                disabled={isCompleting || !completionNote.trim()}
                className="bg-blue-600 text-white hover:bg-blue-700 font-medium"
              >
                {isCompleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Completing...
                  </>
                ) : (
                  "Complete Referral"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
