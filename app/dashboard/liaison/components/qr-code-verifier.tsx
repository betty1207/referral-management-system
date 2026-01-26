"use client"

import { useState, useRef, useEffect } from "react"
import { QrCode, Camera, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"

interface QRData {
  referralId: string
  referralCode: string
  patientName: string
  patientPhone: string
  fromHospital: string
  toHospital: string
  urgency: string
  status: string
  timestamp: string
}

interface CheckInRecord {
  _id: string
  referralId: string
  referralCode: string
  patientName: string
  checkInTime: string
  verifiedBy: string
  status: "CHECKED_IN" | "VERIFIED" | "CANCELLED"
}

export function QRCodeVerifier() {
  const { user } = useAuth()
  const [qrInput, setQrInput] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean
    data?: QRData
    message: string
    checkInRecord?: CheckInRecord
  } | null>(null)
  const [recentCheckIns, setRecentCheckIns] = useState<CheckInRecord[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const parseQRData = (qrText: string): QRData | null => {
    try {
      const data = JSON.parse(qrText)
      if (data.referralId && data.patientName && data.referralCode) {
        return data as QRData
      }
      return null
    } catch {
      return null
    }
  }

  const verifyQRCode = async (qrData: QRData) => {
    if (!user?.token) {
      setVerificationResult({
        success: false,
        message: "Authentication required"
      })
      return
    }

    setIsVerifying(true)
    setVerificationResult(null)

    try {
      // First verify the referral exists and is valid
      const response = await apiClient.getReferralById(qrData.referralId)
      const referral = response.data || response

      if (!referral) {
        setVerificationResult({
          success: false,
          message: "Referral not found in system"
        })
        return
      }

      // Verify the QR data matches the referral
      if (referral.referralCode !== qrData.referralCode || 
          referral.patientName !== qrData.patientName ||
          referral.status !== "ACCEPTED") {
        setVerificationResult({
          success: false,
          message: "Invalid QR code or referral not accepted for check-in"
        })
        return
      }

      // Check if already checked in
      const checkInResponse = await apiClient.get(`/check-ins/${qrData.referralId}`)
      if (checkInResponse.data) {
        setVerificationResult({
          success: false,
          message: "Patient already checked in",
          checkInRecord: checkInResponse.data
        })
        return
      }

      // Process check-in
      const checkInData = {
        referralId: qrData.referralId,
        referralCode: qrData.referralCode,
        patientName: qrData.patientName,
        checkInTime: new Date().toISOString(),
        verifiedBy: user.name || user.email || "Unknown",
        status: "CHECKED_IN" as const,
        hospitalId: user.hospitalId
      }

      const checkInResult = await apiClient.post("/check-ins", checkInData)
      
      setVerificationResult({
        success: true,
        data: qrData,
        message: "Patient checked in successfully!",
        checkInRecord: checkInResult.data
      })

      // Refresh recent check-ins
      fetchRecentCheckIns()

    } catch (error: any) {
      console.error("Verification error:", error)
      setVerificationResult({
        success: false,
        message: error.message || "Verification failed"
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const handleManualInput = () => {
    const qrData = parseQRData(qrInput)
    if (!qrData) {
      setVerificationResult({
        success: false,
        message: "Invalid QR code format"
      })
      return
    }
    verifyQRCode(qrData)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // For now, we'll use a simple text reader
    // In production, you'd use a QR code scanning library
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      setQrInput(text)
    }
    reader.readAsText(file)
  }

  const fetchRecentCheckIns = async () => {
    if (!user?.token) return

    try {
      const response = await apiClient.get("/check-ins/recent")
      const checkIns = response.data || []
      setRecentCheckIns(checkIns)
    } catch (error) {
      console.error("Error fetching check-ins:", error)
    }
  }

  useEffect(() => {
    fetchRecentCheckIns()
  }, [user?.token])

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString()
    } catch {
      return dateString
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">QR Code Check-in</h2>
        <p className="text-muted-foreground">Verify patient QR codes for hospital check-in</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR Code Scanner */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              QR Code Verification
            </CardTitle>
            <CardDescription>
              Scan or input QR code data to verify patient check-in
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="qr-input" className="text-sm font-medium">
                QR Code Data
              </label>
              <Input
                id="qr-input"
                placeholder="Paste QR code data or upload file..."
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleManualInput}
                disabled={!qrInput.trim() || isVerifying}
                className="flex-1"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Verify QR Code
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isVerifying}
              >
                <Camera className="w-4 h-4 mr-2" />
                Upload
              </Button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {verificationResult && (
              <Alert className={verificationResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                {verificationResult.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={verificationResult.success ? "text-green-800" : "text-red-800"}>
                  {verificationResult.message}
                </AlertDescription>
              </Alert>
            )}

            {verificationResult?.success && verificationResult.data && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">Patient Verified</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Name:</span> {verificationResult.data.patientName}</p>
                  <p><span className="font-medium">Referral Code:</span> {verificationResult.data.referralCode}</p>
                  <p><span className="font-medium">From:</span> {verificationResult.data.fromHospital}</p>
                  <p><span className="font-medium">To:</span> {verificationResult.data.toHospital}</p>
                  <p><span className="font-medium">Priority:</span> 
                    <Badge className="ml-2" variant="secondary">
                      {verificationResult.data.urgency}
                    </Badge>
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Check-ins */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Check-ins</CardTitle>
            <CardDescription>
              Latest patient check-ins at your facility
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentCheckIns.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No recent check-ins
              </div>
            ) : (
              <div className="space-y-3">
                {recentCheckIns.map((checkIn) => (
                  <div
                    key={checkIn._id}
                    className="p-3 border rounded-lg"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{checkIn.patientName}</h4>
                        <p className="text-sm text-muted-foreground">
                          Ref: {checkIn.referralCode}
                        </p>
                      </div>
                      <Badge className={
                        checkIn.status === "CHECKED_IN" 
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }>
                        {checkIn.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <p>Checked in: {formatDate(checkIn.checkInTime)}</p>
                      <p>Verified by: {checkIn.verifiedBy}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
