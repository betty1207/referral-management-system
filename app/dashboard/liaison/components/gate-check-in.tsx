"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, QrCode, CheckCircle, Camera, AlertCircle, X } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"
import { BrowserMultiFormatReader, Result } from "@zxing/library"

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

export function GateCheckIn() {
  const { user } = useAuth()
  const [referralCode, setReferralCode] = useState("")
  const [qrInput, setQrInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [checkedInReferral, setCheckedInReferral] = useState<any>(null)
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [cameraError, setCameraError] = useState("")
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null)

  const handleCheckIn = async () => {
    if (!referralCode.trim()) {
      setError("Please enter a referral code")
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess("")
    setCheckedInReferral(null)

    try {
      const response = await apiClient.gateCheckIn(referralCode)
      setCheckedInReferral(response)
      setSuccess("Patient checked in successfully!")
      setReferralCode("")
    } catch (err: any) {
      console.error("Error checking in:", err)
      setError(err.message || "Failed to check in patient")
    } finally {
      setIsLoading(false)
    }
  }

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

  const handleQRCodeCheckIn = async () => {
    if (!qrInput.trim()) {
      setError("Please enter QR code data")
      return
    }

    const qrData = parseQRData(qrInput)
    if (!qrData) {
      setError("Invalid QR code format")
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess("")
    setCheckedInReferral(null)

    try {
      // First verify the referral exists and is valid
      const response = await apiClient.getReferralById(qrData.referralId)
      const referral = response.data || response

      if (!referral) {
        setError("Referral not found in system")
        return
      }

      // Verify the QR data matches the referral
      if (referral.referralCode !== qrData.referralCode || 
          referral.patientName !== qrData.patientName ||
          referral.status !== "ACCEPTED") {
        setError("Invalid QR code or referral not accepted for check-in")
        return
      }

      // Check if already checked in
      try {
        const checkInResponse = await apiClient.get(`/check-ins/${qrData.referralId}`)
        if (checkInResponse.data) {
          setError("Patient already checked in")
          return
        }
      } catch {
        // No check-in record found, proceed with check-in
      }

      // Process check-in
      const checkInData = {
        referralId: qrData.referralId,
        referralCode: qrData.referralCode,
        patientName: qrData.patientName,
        checkInTime: new Date().toISOString(),
        verifiedBy: user?.email || "Unknown",
        status: "CHECKED_IN",
        hospitalId: user?.hospitalId
      }

      // Use the existing gate check-in API
      const checkInResult = await apiClient.gateCheckIn(qrData.referralCode)
      
      setCheckedInReferral({
        ...checkInResult,
        ...qrData
      })
      setSuccess("Patient checked in successfully via QR code!")
      setQrInput("")
      setShowQRScanner(false)

    } catch (error: any) {
      console.error("QR check-in error:", error)
      setError(error.message || "QR code verification failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      setQrInput(text)
    }
    reader.readAsText(file)
  }

  const startCamera = async () => {
    try {
      setCameraError("")
      setIsScanning(true)
      
      const codeReader = new BrowserMultiFormatReader()
      codeReaderRef.current = codeReader
      
      const videoInputDevices = await codeReader.listVideoInputDevices()
      if (videoInputDevices.length === 0) {
        throw new Error("No camera devices found")
      }
      
      const selectedDeviceId = videoInputDevices[0].deviceId
      
      await codeReader.decodeFromVideoDevice(selectedDeviceId, videoRef.current!, (result, error) => {
        if (result) {
          handleQRCodeScan(result)
        }
        if (error && !(error instanceof Error)) {
          console.error("QR scan error:", error)
        }
      })
      
    } catch (err: any) {
      console.error("Camera error:", err)
      setCameraError(err.message || "Failed to access camera")
      setIsScanning(false)
    }
  }

  const stopCamera = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset()
      codeReaderRef.current = null
    }
    setIsScanning(false)
    setCameraError("")
  }

  const handleQRCodeScan = async (result: Result) => {
    const qrText = result.getText()
    const qrData = parseQRData(qrText)
    
    if (!qrData) {
      setError("Invalid QR code format")
      return
    }

    // Stop camera immediately after successful scan
    stopCamera()
    setShowQRScanner(false)

    // Process the check-in
    await processQRCheckIn(qrData)
  }

  const processQRCheckIn = async (qrData: QRData) => {
    setIsLoading(true)
    setError("")
    setSuccess("")
    setCheckedInReferral(null)

    try {
      // First verify the referral exists and is valid
      const response = await apiClient.getReferralById(qrData.referralId)
      const referral = response.data || response

      if (!referral) {
        setError("Referral not found in system")
        return
      }

      // Verify the QR data matches the referral
      if (referral.referralCode !== qrData.referralCode || 
          referral.patientName !== qrData.patientName ||
          referral.status !== "ACCEPTED") {
        setError("Invalid QR code or referral not accepted for check-in")
        return
      }

      // Check if already checked in
      try {
        const checkInResponse = await apiClient.get(`/check-ins/${qrData.referralId}`)
        if (checkInResponse.data) {
          setError("Patient already checked in")
          return
        }
      } catch {
        // No check-in record found, proceed with check-in
      }

      // Process check-in
      const checkInResult = await apiClient.gateCheckIn(qrData.referralCode)
      
      setCheckedInReferral({
        ...checkInResult,
        ...qrData
      })
      setSuccess("Patient checked in successfully via QR code!")
      setQrInput("")

    } catch (error: any) {
      console.error("QR check-in error:", error)
      setError(error.message || "QR code verification failed")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    return () => {
      if (codeReaderRef.current) {
        codeReaderRef.current.reset()
      }
    }
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Gate Check-in</h2>
        <p className="text-muted-foreground">
          Scan QR code or enter referral code for patient arrival
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Patient Arrival</CardTitle>
          <CardDescription>
            Enter referral code to check in arriving patient
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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

          <div className="space-y-2">
            <Label htmlFor="referralCode">Referral Code</Label>
            <div className="flex gap-2">
              <Input
                id="referralCode"
                placeholder="Enter referral code (e.g., REF-1769217004966)"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleCheckIn}
                disabled={isLoading || !referralCode.trim()}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Check In
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Enter the referral code from patient's QR code
            </p>
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <QrCode className="w-4 h-4" />
                <span>Patient QR Code Scanner</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowQRScanner(!showQRScanner)}
              >
                {showQRScanner ? "Hide" : "Show"} Scanner
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Scan patient's QR code for instant check-in
            </p>
          </div>

          {showQRScanner && (
            <div className="mt-4 p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Patient QR Code Scanner</h4>
                {isScanning && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={stopCamera}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Stop Camera
                  </Button>
                )}
              </div>
              
              {/* Camera View - Primary Interface */}
              {!isScanning ? (
                <div className="text-center py-8">
                  <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Ready to Scan Patient QR Code</h3>
                  <p className="text-muted-foreground mb-6">
                    Position the patient's QR code in front of the camera to check them in
                  </p>
                  <Button
                    onClick={startCamera}
                    disabled={isLoading}
                    size="lg"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Start Camera Scanner
                  </Button>
                </div>
              ) : (
                <div className="mb-4">
                  <div className="relative bg-black rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      className="w-full h-64 object-cover"
                      autoPlay
                      playsInline
                    />
                    <div className="absolute inset-0 border-2 border-green-400 pointer-events-none">
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="w-48 h-48 border-2 border-green-400 rounded-lg">
                          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400"></div>
                          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400"></div>
                          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400"></div>
                          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400"></div>
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                      Scanning...
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Position patient's QR code within the green frame
                  </p>
                </div>
              )}

              {/* Camera Error */}
              {cameraError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{cameraError}</AlertDescription>
                </Alert>
              )}

              {/* Manual Entry Fallback - Secondary */}
              {!isScanning && (
                <div className="mt-6 pt-6 border-t">
                  <details className="cursor-pointer">
                    <summary className="text-sm text-muted-foreground hover:text-foreground">
                      Manual entry (if camera doesn't work)
                    </summary>
                    <div className="mt-3 space-y-3">
                      <div>
                        <Label htmlFor="qrInput" className="text-sm">Referral Code</Label>
                        <Input
                          id="qrInput"
                          placeholder="Enter referral code (e.g., REF-123456)"
                          value={qrInput}
                          onChange={(e) => setQrInput(e.target.value)}
                          className="font-mono text-sm"
                        />
                      </div>
                      <Button
                        onClick={handleQRCodeCheckIn}
                        disabled={!qrInput.trim() || isLoading}
                        variant="outline"
                        size="sm"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Check In Manually
                          </>
                        )}
                      </Button>
                    </div>
                  </details>
                </div>
              )}
            </div>
          )}

          {checkedInReferral && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Check-in Successful</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Patient:</span>
                  <p className="font-medium">{checkedInReferral.patientName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">From:</span>
                  <p className="font-medium">
                    {typeof checkedInReferral.fromHospital === 'object' 
                      ? checkedInReferral.fromHospital.name 
                      : checkedInReferral.fromHospital}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Check-in Time:</span>
                  <p className="font-medium">
                    {new Date(checkedInReferral.gateCheckedInAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <p className="font-medium">CHECKED_IN</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
