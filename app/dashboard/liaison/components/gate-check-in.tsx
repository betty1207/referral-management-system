"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, QrCode, CheckCircle } from "lucide-react"
import { apiClient } from "@/lib/api-client"

export function GateCheckIn() {
  const [referralCode, setReferralCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [checkedInReferral, setCheckedInReferral] = useState<any>(null)

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
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <QrCode className="w-4 h-4" />
              <span>QR Code Scanner</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Future implementation: Camera-based QR code scanning
            </p>
          </div>

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