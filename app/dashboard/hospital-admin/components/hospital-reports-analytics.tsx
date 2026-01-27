"use client"

import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  FileText, 
  Download, 
  TrendingUp, 
  Users, 
  Calendar,
  Filter,
  BarChart3,
  PieChart,
  Activity,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  FileSpreadsheet,
  FileDown
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"

interface ReferralReport {
  _id: string
  patientName: string
  patientPhone: string
  urgency: "ROUTINE" | "URGENT" | "EMERGENCY"
  status: "PENDING" | "APPROVED" | "REJECTED"
  createdAt: string
  updatedAt: string
  fromHospital?: string
  fromHospitalName?: string
  doctorName?: string
  reasonForReferral?: string
  rejectionReason?: string
}

interface User {
  _id: string
  fullName: string
  email: string
  role: string
  isActive: boolean
  createdAt: string
}

export function HospitalReportsAnalytics() {
  const { user } = useAuth()
  const [referrals, setReferrals] = useState<ReferralReport[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [dateRange, setDateRange] = useState("7days")

  const fetchHospitalData = async () => {
    if (!user?.token || !user?.hospitalId) {
      setError("Authentication token or hospital ID missing")
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError("")

      // Fetch hospital-specific referrals
      const referralsResponse = await apiClient.getAllReferrals({ hospitalId: user.hospitalId })
      const referralsData = referralsResponse.data || referralsResponse
      const allReferrals = Array.isArray(referralsData) ? referralsData : []
      
      // Fetch hospital-specific users
      const usersResponse = await apiClient.getUsers({ hospitalId: user.hospitalId })
      const usersData = usersResponse.data || usersResponse
      const allUsers = Array.isArray(usersData) ? usersData : []

      setReferrals(allReferrals)
      setUsers(allUsers)
    } catch (err: any) {
      console.error("Error fetching hospital data:", err)
      setError(err.message || "Failed to load hospital data")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchHospitalData()
  }, [user?.token, user?.hospitalId])

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "EMERGENCY": return "bg-red-100 text-red-800"
      case "URGENT": return "bg-orange-100 text-orange-800"
      case "ROUTINE": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED": return "bg-green-100 text-green-800"
      case "REJECTED": return "bg-red-100 text-red-800"
      case "PENDING": return "bg-yellow-100 text-yellow-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "HOSPITAL_ADMIN": return "bg-purple-100 text-purple-800"
      case "DOCTOR": return "bg-blue-100 text-blue-800"
      case "LIAISON_OFFICER": return "bg-indigo-100 text-indigo-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "HOSPITAL_ADMIN": return "Hospital Admin"
      case "DOCTOR": return "Doctor"
      case "LIAISON_OFFICER": return "Liaison Officer"
      default: return role
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const filterByDateRange = (data: any[]) => {
    if (!dateRange || dateRange === "all") return data
    
    const now = new Date()
    const daysAgo = dateRange === "7days" ? 7 : dateRange === "30days" ? 30 : 365
    const cutoffDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000))
    
    return data.filter(item => new Date(item.createdAt) >= cutoffDate)
  }

  const filteredReferrals = filterByDateRange(referrals)
  const filteredUsers = filterByDateRange(users)

  const stats = {
    totalReferrals: filteredReferrals.length,
    approvedReferrals: filteredReferrals.filter(r => r.status === "APPROVED").length,
    rejectedReferrals: filteredReferrals.filter(r => r.status === "REJECTED").length,
    pendingReferrals: filteredReferrals.filter(r => r.status === "PENDING").length,
    totalUsers: filteredUsers.length,
    activeUsers: filteredUsers.filter(u => u.isActive).length,
    doctors: filteredUsers.filter(u => u.role === "DOCTOR").length,
    liaisonOfficers: filteredUsers.filter(u => u.role === "LIAISON_OFFICER").length,
  }

  const exportToCSV = () => {
    const csvContent = [
      ["Patient Name", "Phone", "Urgency", "Status", "Created Date", "Doctor", "Reason"],
      ...filteredReferrals.map(r => [
        r.patientName,
        r.patientPhone,
        r.urgency,
        r.status,
        formatDate(r.createdAt),
        r.doctorName || "N/A",
        r.reasonForReferral || "N/A"
      ])
    ].map(row => row.join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `hospital-referrals-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Hospital Reports & Analytics</h2>
          <p className="text-gray-600">Comprehensive overview of your hospital's referral and user data</p>
        </div>
        <div className="flex gap-2">
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="365days">Last Year</option>
            <option value="all">All Time</option>
          </select>
          <Button onClick={exportToCSV} className="bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Referrals</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">{stats.totalReferrals}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.approvedReferrals} approved, {stats.rejectedReferrals} rejected
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Approval Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">
              {stats.totalReferrals > 0 ? Math.round((stats.approvedReferrals / stats.totalReferrals) * 100) : 0}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.pendingReferrals} pending review
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">{stats.totalUsers}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.activeUsers} active, {stats.doctors} doctors
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Staff Activity</CardTitle>
            <Activity className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">
              {stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.liaisonOfficers} liaison officers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Referrals */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader className="pb-4 border-b border-gray-100">
          <CardTitle className="text-lg font-semibold text-gray-800">Recent Referrals</CardTitle>
          <CardDescription className="text-gray-600">Latest referral activity in your hospital</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {filteredReferrals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No referrals found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-800">Patient</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-800">Phone</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-800">Urgency</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-800">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-800">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-800">Doctor</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReferrals.slice(0, 10).map((referral) => (
                    <tr key={referral._id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-800">{referral.patientName}</td>
                      <td className="py-3 px-4 text-gray-600">{referral.patientPhone}</td>
                      <td className="py-3 px-4">
                        <Badge className={`${getUrgencyColor(referral.urgency)} text-xs border-0`}>
                          {referral.urgency}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={`${getStatusColor(referral.status)} text-xs border-0`}>
                          {referral.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{formatDate(referral.createdAt)}</td>
                      <td className="py-3 px-4 text-gray-600">{referral.doctorName || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Staff Overview */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader className="pb-4 border-b border-gray-100">
          <CardTitle className="text-lg font-semibold text-gray-800">Staff Overview</CardTitle>
          <CardDescription className="text-gray-600">Current staff members and their roles</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No staff found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-800">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-800">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-800">Role</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-800">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-800">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((staff) => (
                    <tr key={staff._id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-800">{staff.fullName}</td>
                      <td className="py-3 px-4 text-gray-600">{staff.email}</td>
                      <td className="py-3 px-4">
                        <Badge className={`${getRoleColor(staff.role)} text-xs border-0`}>
                          {getRoleLabel(staff.role)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={`${staff.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"} text-xs border-0`}>
                          {staff.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{formatDate(staff.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
