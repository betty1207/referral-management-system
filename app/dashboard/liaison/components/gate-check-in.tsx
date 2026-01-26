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
      console.log("[DEBUG] Starting simple referral code check-in...")
      console.log("[DEBUG] Referral Code:", referralCode)
      console.log("[DEBUG] User hospital ID:", user?.hospitalId)

      // PRE-VALIDATION: Get referral details FIRST before any check-in
      console.log("[DEBUG] Getting referral details for pre-validation...")
      
      let referral = null
      
      // Try to get referral details using the GET /referrals endpoint
      try {
        console.log("[DEBUG] Trying GET /referrals with hospital filter...")
        
        // Use hospital-specific endpoint that liaison officers can access
        const currentUserHospitalId = user?.hospitalId
        console.log("[DEBUG] Current user hospital ID:", currentUserHospitalId)
        
        // Try different approaches to get referrals
        let referralList = null
        
        // Method 1: Try with hospital filter
        try {
          const referrals = await apiClient.get(`/referrals?toHospital=${currentUserHospitalId}`)
          referralList = referrals.data || referrals
          console.log("[DEBUG] Referrals for receiving hospital:", referralList)
        } catch (err) {
          console.log("[DEBUG] toHospital filter failed, trying fromHospital filter...")
        }
        
        // Method 2: Try from hospital filter
        if (!referralList) {
          try {
            const referrals = await apiClient.get(`/referrals?fromHospital=${currentUserHospitalId}`)
            referralList = referrals.data || referrals
            console.log("[DEBUG] Referrals from sending hospital:", referralList)
          } catch (err) {
            console.log("[DEBUG] fromHospital filter failed, trying hospitalId filter...")
          }
        }
        
        // Method 3: Try hospitalId filter
        if (!referralList) {
          try {
            const referrals = await apiClient.get(`/referrals?hospitalId=${currentUserHospitalId}`)
            referralList = referrals.data || referrals
            console.log("[DEBUG] Referrals for hospital:", referralList)
          } catch (err) {
            console.log("[DEBUG] hospitalId filter failed, trying without filter...")
          }
        }
        
        // Method 4: Try without filter (last resort)
        if (!referralList) {
          try {
            const referrals = await apiClient.get(`/referrals`)
            referralList = referrals.data || referrals
            console.log("[DEBUG] All referrals:", referralList)
          } catch (err) {
            console.log("[DEBUG] All methods failed")
          }
        }
        
        // Show all available referral codes for debugging
        if (Array.isArray(referralList)) {
          const availableCodes = referralList.map((r: any) => ({
            code: r.referralCode,
            patient: r.patientName,
            status: r.status,
            from: r.fromHospital,
            to: r.toHospital
          }))
          console.log("[DEBUG] Available referral codes:", availableCodes)
          
          // Also log just the codes for easy copying
          const justCodes = referralList.map((r: any) => r.referralCode)
          console.log("[DEBUG] Available codes (copy these):", justCodes.join(", "))
          
          // Find referral by exact code match
          referral = referralList.find((r: any) => r.referralCode === referralCode.trim())
          console.log("[DEBUG] Looking for code:", referralCode.trim())
          console.log("[DEBUG] Exact match found:", referral)
          
          if (!referral) {
            console.log("[DEBUG] Code not found! Available codes are:")
            justCodes.forEach((code: string, index: number) => {
              console.log(`${index + 1}. ${code}`)
            })
          }
        }
      } catch (err: any) {
        console.log("[DEBUG] GET /referrals failed:", err.message)
        console.log("[DEBUG] Cannot pre-validate, proceeding with direct check-in...")
      }

      // CRITICAL: If we found the referral, validate hospitals BEFORE calling gate-check-in
      if (referral) {
        console.log("[DEBUG] Found referral, performing pre-validation...")
        console.log("[DEBUG] Full referral object:", referral)
        
        const currentUserHospitalId = user?.hospitalId
        const fromHospitalId = typeof referral.fromHospital === 'object' 
          ? referral.fromHospital._id 
          : referral.fromHospital
        const toHospitalId = typeof referral.toHospital === 'object' 
          ? referral.toHospital._id 
          : referral.toHospital
        
        console.log("[DEBUG] PRE-VALIDATION hospital check:")
        console.log("- User hospital ID:", currentUserHospitalId)
        console.log("- From hospital:", referral.fromHospital)
        console.log("- From hospital ID:", fromHospitalId)
        console.log("- To hospital:", referral.toHospital)
        console.log("- To hospital ID:", toHospitalId)
        console.log("- Same as sending hospital:", currentUserHospitalId === fromHospitalId)
        console.log("- Same as receiving hospital:", currentUserHospitalId === toHospitalId)
        console.log("- Referral status:", referral.status)
        
        // Check if referral is already checked in
        if (referral.status === "CHECKED_IN") {
          console.log("[DEBUG] Referral already checked in!")
          setError("This patient has already been checked in.")
          return
        }
        
        // Check if referral is accepted (only accepted referrals can be checked in)
        if (referral.status !== "ACCEPTED") {
          console.log("[DEBUG] Referral not accepted! Status:", referral.status)
          setError(`This referral cannot be checked in. Current status: ${referral.status}. Only ACCEPTED referrals can be checked in.`)
          return
        }
        
        // BLOCK: Same hospital (sending hospital)
        if (currentUserHospitalId === fromHospitalId) {
          console.log("[DEBUG] BLOCKED: Same hospital as sender!")
          setError("This referral cannot be checked in at the same hospital that sent it. It must be checked in at the receiving facility.")
          return
        }

        // BLOCK: Wrong hospital (not receiving hospital)
        if (currentUserHospitalId !== toHospitalId) {
          console.log("[DEBUG] BLOCKED: Wrong hospital!")
          setError(`This referral is sent to a different hospital. You can only check in this patient at the designated receiving facility. Current hospital: ${currentUserHospitalId}, Receiving hospital: ${toHospitalId}`)
          return
        }

        console.log("[DEBUG] PRE-VALIDATION PASSED: Proceeding with gate check-in...")
        
        // Only proceed with gate-check-in if hospital validation passes
        try {
          const response = await apiClient.gateCheckIn(referralCode)
          console.log("[DEBUG] Gate check-in successful:", response)
          setCheckedInReferral(response)
          setSuccess("Patient checked in successfully!")
          setReferralCode("")
          return
        } catch (gateErr: any) {
          console.log("[DEBUG] Gate check-in failed:", gateErr.message)
          setError(gateErr.message || "Failed to check in patient")
          return
        }
        
      } else {
        console.log("[DEBUG] Referral not found in pre-validation, trying direct gate-check-in...")
        
        // If referral not found in list, try direct gate-check-in as fallback
        try {
          const directResponse = await apiClient.gateCheckIn(referralCode.trim())
          console.log("[DEBUG] Direct gate-check-in SUCCESS:", directResponse)
          
          // Check if this was the correct hospital
          const currentUserHospitalId = user?.hospitalId
          const toHospitalId = typeof directResponse.toHospital === 'object' 
            ? directResponse.toHospital._id 
            : directResponse.toHospital
          
          if (currentUserHospitalId !== toHospitalId) {
            console.log("[ERROR] Backend allowed check-in at wrong hospital!")
            setError("SYSTEM ERROR: Check-in allowed at wrong hospital. This should have been blocked by the backend.")
            return
          }
          
          setCheckedInReferral(directResponse)
          setSuccess("Patient checked in successfully!")
          setReferralCode("")
          return
          
        } catch (directErr: any) {
          console.log("[DEBUG] Direct gate-check-in also failed:", directErr.message)
          setError(`Referral ${referralCode} not found or cannot be checked in. ${directErr.message}`)
          return
        }
      }
      
    } catch (err: any) {
      console.error("Error checking in:", err)
      // The backend should return appropriate error messages for:
      // - Wrong hospital validation
      // - Referral not found
      // - Already checked in
      // - Invalid status
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
      console.log("[DEBUG] Starting QR code check-in process...")
      console.log("[DEBUG] QR Data:", qrData)

      // First verify the referral exists and is valid
      const response = await apiClient.getReferralById(qrData.referralId)
      const referral = response.data || response

      console.log("[DEBUG] Referral from API:", referral)

      if (!referral) {
        console.log("[DEBUG] Referral not found!")
        setError("Referral not found in system")
        return
      }

      // Verify the QR data matches the referral
      console.log("[DEBUG] Checking QR data match...")
      console.log("[DEBUG] Referral codes match:", referral.referralCode, "vs", qrData.referralCode)
      console.log("[DEBUG] Patient names match:", referral.patientName, "vs", qrData.patientName)
      console.log("[DEBUG] Referral status:", referral.status, "vs ACCEPTED")

      if (referral.referralCode !== qrData.referralCode || 
          referral.patientName !== qrData.patientName ||
          referral.status !== "ACCEPTED") {
        console.log("[DEBUG] QR validation failed!")
        setError("Invalid QR code or referral not accepted for check-in")
        return
      }

      console.log("[DEBUG] QR validation passed, proceeding to hospital validation...")

      // IMPORTANT: Prevent scanning at the same hospital that sent the referral
      const currentUserHospitalId = user?.hospitalId
      const fromHospitalId = typeof referral.fromHospital === 'object' 
        ? referral.fromHospital._id 
        : referral.fromHospital

      // Get the receiving hospital ID
      const toHospitalId = typeof referral.toHospital === 'object' 
        ? referral.toHospital._id 
        : referral.toHospital

      console.log("[DEBUG] Current user hospital ID:", currentUserHospitalId)
      console.log("[DEBUG] From hospital ID:", fromHospitalId)
      console.log("[DEBUG] To hospital ID:", toHospitalId)

      if (currentUserHospitalId === fromHospitalId) {
        console.log("[DEBUG] Same hospital error!")
        setError("This QR code cannot be scanned at the same hospital that sent the referral. It must be scanned at the receiving facility.")
        return
      }

      // CRITICAL: Only allow check-in at the correct receiving hospital
      if (currentUserHospitalId !== toHospitalId) {
        console.log("[DEBUG] Different hospital error!")
        setError(`This referral is sent to a different hospital. You can only check in this patient at the designated receiving facility. Current hospital: ${currentUserHospitalId}, Receiving hospital: ${toHospitalId}`)
        return
      }

      // Check if already checked in
      try {
        const checkInResponse = await apiClient.get(`/check-ins/${qrData.referralId}`)
        if (checkInResponse.data) {
          console.log("[DEBUG] Already checked in error!")
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
      console.log("[DEBUG] Starting QR code check-in process...")
      console.log("[DEBUG] QR Data:", qrData)

      // First verify the referral exists and is valid
      const response = await apiClient.getReferralById(qrData.referralId)
      const referral = response.data || response

      console.log("[DEBUG] Referral from API:", referral)

      if (!referral) {
        console.log("[DEBUG] Referral not found!")
        setError("Referral not found in system")
        return
      }

      // Verify the QR data matches the referral
      console.log("[DEBUG] Checking QR data match...")
      console.log("[DEBUG] Referral codes match:", referral.referralCode, "vs", qrData.referralCode)
      console.log("[DEBUG] Patient names match:", referral.patientName, "vs", qrData.patientName)
      console.log("[DEBUG] Referral status:", referral.status, "vs ACCEPTED")
      
      if (referral.referralCode !== qrData.referralCode || 
          referral.patientName !== qrData.patientName ||
          referral.status !== "ACCEPTED") {
        console.log("[DEBUG] QR validation failed!")
        setError("Invalid QR code or referral not accepted for check-in")
        return
      }

      console.log("[DEBUG] QR validation passed, proceeding to hospital validation...")

      // IMPORTANT: Prevent scanning at the same hospital that sent the referral
      const currentUserHospitalId = user?.hospitalId
      const fromHospitalId = typeof referral.fromHospital === 'object' 
        ? referral.fromHospital._id 
        : referral.fromHospital
      
      // Get the receiving hospital ID
      const toHospitalId = typeof referral.toHospital === 'object' 
        ? referral.toHospital._id 
        : referral.toHospital
      
      // DEBUG: Log the values to understand the data structure
      console.log("=== HOSPITAL VALIDATION DEBUG ===")
      console.log("Current user hospital ID:", currentUserHospitalId)
      console.log("From hospital:", referral.fromHospital)
      console.log("From hospital ID:", fromHospitalId)
      console.log("To hospital:", referral.toHospital)
      console.log("To hospital ID:", toHospitalId)
      console.log("================================")
      
      if (currentUserHospitalId === fromHospitalId) {
        setError("This QR code cannot be scanned at the same hospital that sent the referral. It must be scanned at the receiving facility.")
        return
      }

      // CRITICAL: Only allow check-in at the correct receiving hospital
      if (currentUserHospitalId !== toHospitalId) {
        setError(`This referral is sent to a different hospital. You can only check in this patient at the designated receiving facility. Current hospital: ${currentUserHospitalId}, Receiving hospital: ${toHospitalId}`)
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
