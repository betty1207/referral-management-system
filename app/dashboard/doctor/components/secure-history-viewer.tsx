"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  FileText,
  Image as ImageIcon,
  File,
  Lock,
  Unlock,
  Eye,
  Download,
  Calendar,
  User,
  AlertCircle,
  Loader2,
  CheckCircle,
  Shield,
  Stethoscope
} from "lucide-react"

interface UnlockRequest {
  referralCode: string
  otp?: string
}

export function SecureHistoryViewer() {
  const [referralCode, setReferralCode] = useState("")
  const [isUnlocking, setIsUnlocking] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [referralData, setReferralData] = useState<any>(null)

  const handleUnlock = async () => {
    if (!referralCode.trim()) {
      setError("Please enter a referral code")
      return
    }

    setIsUnlocking(true)
    setError("")
    setSuccess("")

    try {
      const unlockRequest: UnlockRequest = {
        referralCode: referralCode.trim()
      }

      // Call your unlock endpoint
      const response = await fetch('/api/referrals/unlock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(unlockRequest)
      })

      if (!response.ok) {
        throw new Error('Failed to unlock referral')
      }

      const data = await response.json()
      
      // Fetch referral details after successful unlock
      const referralResponse = await fetch(`/api/referrals/${data._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (referralResponse.ok) {
        const referralDetails = await referralResponse.json()
        setReferralData(referralDetails)
      }

      setSuccess("Patient history unlocked successfully!")
      
    } catch (err: any) {
      setError(err.message || "Failed to unlock patient history")
    } finally {
      setIsUnlocking(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Patient History Viewer</h2>
        <p className="text-muted-foreground">Unlock and view patient clinical data</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 border-green-200 text-green-800">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Unlock Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Unlock className="w-5 h-5" />
            Unlock Patient Data
          </CardTitle>
          <CardDescription>
            Enter referral code to access patient medical history
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="referralCode">Referral Code *</Label>
            <div className="flex gap-2">
              <Input
                id="referralCode"
                placeholder="Enter referral code (e.g., REF-12345)"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleUnlock}
                disabled={isUnlocking || !referralCode.trim()}
              >
                {isUnlocking ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Unlocking...
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4 mr-2" />
                    Unlock
                  </>
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Get referral code from gate check-in or patient records
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Patient History Display */}
      {referralData && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Patient Medical History
                </CardTitle>
                <CardDescription>
                  Unlocked on {formatDate(new Date().toISOString())}
                </CardDescription>
              </div>
              <Badge variant="outline" className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Unlocked
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Patient Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Patient Name</Label>
                <p className="font-medium">{referralData.patientName}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Referral Code</Label>
                <p className="font-medium">{referralData.referralCode}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Status</Label>
                <Badge variant="outline">{referralData.status}</Badge>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Check-in Time</Label>
                <p className="font-medium">
                  {referralData.gateCheckedInAt ? formatDate(referralData.gateCheckedInAt) : "Not checked in"}
                </p>
              </div>
            </div>

            <Separator />

            {/* Clinical Notes */}
            {referralData.clinicalNotes && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Stethoscope className="w-4 h-4" />
                  Clinical Notes
                </h3>
                <div className="p-4 bg-muted rounded-md whitespace-pre-wrap">
                  {referralData.clinicalNotes}
                </div>
              </div>
            )}

            {/* Attachments */}
            {referralData.attachments && referralData.attachments.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Medical Files
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {referralData.attachments.map((file: string, index: number) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        {file.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                          <ImageIcon className="w-5 h-5 text-blue-500" />
                        ) : file.match(/\.(pdf)$/i) ? (
                          <FileText className="w-5 h-5 text-red-500" />
                        ) : (
                          <File className="w-5 h-5 text-gray-500" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-sm truncate">{file}</p>
                          <p className="text-xs text-muted-foreground">
                            Medical document
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Activity Log */}
            {referralData.activityLog && referralData.activityLog.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Activity Timeline</h3>
                <div className="space-y-3">
                  {referralData.activityLog.slice().reverse().map((log: any, index: number) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-primary mt-1" />
                        {index < referralData.activityLog.length - 1 && (
                          <div className="w-0.5 h-full bg-border mt-1" />
                        )}
                      </div>
                      <div className="pb-3 flex-1">
                        <p className="font-medium">{log.note}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(log.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      {!referralData && (
        <Card className="bg-muted/50">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">How to Access Patient History</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Enter a referral code above to unlock and view patient medical records
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="font-medium flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                      1
                    </div>
                    Get Referral Code
                  </div>
                  <p className="text-muted-foreground">From gate check-in or patient records</p>
                </div>
                <div className="space-y-2">
                  <div className="font-medium flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                      2
                    </div>
                    Enter Code
                  </div>
                  <p className="text-muted-foreground">Type referral code in the field above</p>
                </div>
                <div className="space-y-2">
                  <div className="font-medium flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                      3
                    </div>
                    View History
                  </div>
                  <p className="text-muted-foreground">Access patient clinical data and files</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}