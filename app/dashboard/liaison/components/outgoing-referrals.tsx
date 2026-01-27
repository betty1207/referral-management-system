"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Eye, Loader2, Send, Clipboard, AlertCircle, QrCode } from "lucide-react"
import { useState, useEffect } from "react"
import QRCode from "qrcode"
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
  createdAt: string
  createdBy?: { fullName: string } | string | null // Allow null
  doctorName?: string // Add optional doctorName field
}

interface Hospital {
  _id: string
  name: string
}

export function OutgoingReferrals() {
  const { user } = useAuth()
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isHospitalsLoading, setIsHospitalsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showSendDialog, setShowSendDialog] = useState(false)
  const [showQRDialog, setShowQRDialog] = useState(false)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("")
  const [targetHospitalId, setTargetHospitalId] = useState("")
  const [isSending, setIsSending] = useState(false)

  const fetchOutgoingReferrals = async () => {
    if (!user?.token) {
      setError("Authentication token missing")
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError("")
      setSuccess("")
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

  const fetchHospitals = async () => {
    if (!user?.token) return
    
    try {
      setIsHospitalsLoading(true)
      const response = await apiClient.getHospitals()
      const hospitalData = response.data || response
      const hospitalsList = Array.isArray(hospitalData) ? hospitalData : []
      
      // Filter out current user's hospital
      const filteredHospitals = hospitalsList.filter((hospital: Hospital) => 
        hospital._id !== user?.hospitalId
      )
      
      setHospitals(filteredHospitals)
    } catch (err: any) {
      console.error("Error fetching hospitals:", err)
    } finally {
      setIsHospitalsLoading(false)
    }
  }

  useEffect(() => {
    fetchOutgoingReferrals()
    fetchHospitals()
  }, [user?.token])

  const handleViewDetails = (referral: Referral) => {
    setSelectedReferral(referral)
    setShowDetailsDialog(true)
  }

  const handleSendClick = (referral: Referral) => {
    setSelectedReferral(referral)
    setTargetHospitalId("")
    setShowSendDialog(true)
  }

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
      setSuccess(`Referral sent successfully to ${getHospitalNameById(targetHospitalId)}!`)
      setShowSendDialog(false)
      setSelectedReferral(null)
      setTargetHospitalId("")
      
      // Refresh the list
      await fetchOutgoingReferrals()
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000)
    } catch (err: any) {
      console.error("Error sending referral:", err)
      setError(err.message || "Failed to send referral")
    } finally {
      setIsSending(false)
    }
  }

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

  const getHospitalNameById = (hospitalId: string) => {
    const hospital = hospitals.find(h => h._id === hospitalId)
    return hospital ? hospital.name : "Unknown Hospital"
  }

  // Helper function to safely get creator name
  const getCreatorName = (referral: Referral): string => {
    // Try doctorName first if available
    if (referral.doctorName) return referral.doctorName
    
    // Try createdBy object with null check
    if (referral.createdBy && typeof referral.createdBy === 'object') {
      return referral.createdBy.fullName || "Doctor"
    }
    
    // If createdBy is a string
    if (typeof referral.createdBy === 'string') {
      return referral.createdBy
    }
    
    // Fallback
    return "Doctor"
  }

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text)
    alert(message)
  }

  const generateQRCode = async (referral: Referral) => {
    try {
      const qrData = {
        referralId: referral._id,
        referralCode: referral.referralCode,
        patientName: referral.patientName,
        patientPhone: referral.patientPhone,
        fromHospital: getHospitalName(referral.fromHospital),
        toHospital: getHospitalName(referral.toHospital),
        urgency: referral.urgency,
        status: "ACCEPTED", // Always show ACCEPTED in QR code, not current status
        timestamp: new Date().toISOString()
      }
      
      const dataUrl = await QRCode.toDataURL(JSON.stringify(qrData), {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      
      setQrCodeDataUrl(dataUrl)
      setShowQRDialog(true)
    } catch (err: any) {
      console.error("Error generating QR code:", err)
      setError("Failed to generate QR code")
    }
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
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
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
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>
                          Ref: <span className="font-mono">{referral.referralCode || referral._id.substring(0, 8)}</span>
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => copyToClipboard(referral._id, `Copied Referral ID: ${referral._id}`)}
                          title="Copy Referral ID"
                        >
                          <Clipboard className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleViewDetails(referral)}
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {referral.status === "ACCEPTED" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => generateQRCode(referral)}
                          title="Generate QR Code"
                        >
                          <QrCode className="w-4 h-4" />
                        </Button>
                      )}
                      {referral.status === "DRAFT" && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleSendClick(referral)}
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
                        {getCreatorName(referral)}
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

      {/* View Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Referral Details</DialogTitle>
            <DialogDescription>Complete details of this referral</DialogDescription>
          </DialogHeader>
          {selectedReferral && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Referral ID</Label>
                  <div className="flex items-center gap-2">
                    <code className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {selectedReferral._id}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => copyToClipboard(selectedReferral._id, "Copied Referral ID")}
                    >
                      <Clipboard className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Referral Code</Label>
                  <p className="font-mono text-sm">{selectedReferral.referralCode || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Patient Name</Label>
                  <p className="text-sm font-medium">{selectedReferral.patientName}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Patient Phone</Label>
                  <p className="text-sm font-medium">{selectedReferral.patientPhone}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">From Hospital</Label>
                  <p className="text-sm">{getHospitalName(selectedReferral.fromHospital)}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">To Hospital</Label>
                  <p className="text-sm">{getHospitalName(selectedReferral.toHospital)}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Priority</Label>
                  <Badge className={getPriorityColor(selectedReferral.urgency)}>
                    {selectedReferral.urgency}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <Badge className={getStatusColor(selectedReferral.status)}>
                    {selectedReferral.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Created By</Label>
                  <p className="text-sm">
                    {getCreatorName(selectedReferral)}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Created Date</Label>
                  <p className="text-sm">{formatDate(selectedReferral.createdAt)}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-xs text-muted-foreground">Reason for Referral</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm">{selectedReferral.reasonForReferral || "N/A"}</p>
                </div>
              </div>
              
              {selectedReferral.clinicalNotes && (
                <div>
                  <Label className="text-xs text-muted-foreground">Clinical Notes</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm">{selectedReferral.clinicalNotes}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Send Referral Dialog */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Referral</DialogTitle>
            <DialogDescription>
              Select a target hospital to send this referral to
            </DialogDescription>
          </DialogHeader>
          {selectedReferral && (
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="font-medium">Patient: {selectedReferral.patientName}</p>
                <p className="text-sm text-gray-600">
                  Referral ID: <span className="font-mono">{selectedReferral._id.substring(0, 8)}...</span>
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="targetHospital">Target Hospital *</Label>
                <Select value={targetHospitalId} onValueChange={setTargetHospitalId}>
                  <SelectTrigger id="targetHospital" disabled={isHospitalsLoading}>
                    <SelectValue placeholder={isHospitalsLoading ? "Loading hospitals..." : "Select hospital"} />
                  </SelectTrigger>
                  <SelectContent>
                    {hospitals.map((hospital) => (
                      <SelectItem key={hospital._id} value={hospital._id}>
                        {hospital.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Select the receiving hospital for this referral
                </p>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowSendDialog(false)}
                  disabled={isSending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSendReferral}
                  disabled={isSending || !targetHospitalId}
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
          )}
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Referral QR Code</DialogTitle>
            <DialogDescription>
              QR code for patient check-in at the receiving hospital
            </DialogDescription>
          </DialogHeader>
          {selectedReferral && qrCodeDataUrl && (
            <div className="space-y-4">
              <div className="text-center">
                <img 
                  src={qrCodeDataUrl} 
                  alt="Referral QR Code" 
                  className="w-48 h-48 mx-auto border border-gray-200 rounded-lg"
                />
                <p className="text-sm text-gray-600 mt-2">
                  QR Code for {selectedReferral.patientName}
                </p>
              </div>
              <div className="text-xs text-gray-500 space-y-1">
                <p>Referral Code: {selectedReferral.referralCode}</p>
                <p>Patient: {selectedReferral.patientName}</p>
                <p>Hospital: {getHospitalName(selectedReferral.toHospital)}</p>
                <p className="text-green-600 font-medium">✓ Ready for check-in</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    const link = document.createElement('a')
                    link.download = `referral-qr-${selectedReferral.referralCode}.png`
                    link.href = qrCodeDataUrl
                    link.click()
                  }}
                >
                  Download QR Code
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowQRDialog(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}