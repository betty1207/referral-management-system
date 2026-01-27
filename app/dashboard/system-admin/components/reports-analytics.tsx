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
  Hospital, 
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

interface Hospital {
  _id: string
  name: string
  email: string
  region?: string
  city?: string
  level?: string
}

interface User {
  _id: string
  fullName: string
  email: string
  role: string
  hospitalId?: string
  hospitalName?: string
  createdAt: string
  lastLogin?: string
}

interface ReportFilters {
  dateRange: "7days" | "30days" | "90days" | "custom"
  startDate?: string
  endDate?: string
  hospitalId?: string
  status?: string
  urgency?: string
  reportType: "referral" | "user-activity"
}

export function ReportsAnalytics() {
  const [referrals, setReferrals] = useState<ReferralReport[]>([])
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [filters, setFilters] = useState<ReportFilters>({
    dateRange: "30days",
    reportType: "referral"
  })

  // Fetch data for reports
  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setIsLoading(true)
        setError("")

        // Fetch referrals
        const referralsResponse = await apiClient.get('/referrals')
        const referralsData = referralsResponse.data || referralsResponse
        const allReferrals = Array.isArray(referralsData) ? referralsData : []
        
        // Enrich referrals with hospital names
        const hospitalsResponse = await apiClient.get('/hospitals')
        const hospitalsData = hospitalsResponse.data || hospitalsResponse
        const allHospitals = Array.isArray(hospitalsData) ? hospitalsData : []
        
        const enrichedReferrals = allReferrals.map((referral: any) => {
          const hospital = allHospitals.find((h: any) => h._id === referral.fromHospital)
          return {
            ...referral,
            fromHospitalName: hospital?.name || "Unknown Hospital"
          }
        })

        setReferrals(enrichedReferrals)
        setHospitals(allHospitals)

        // Fetch users
        const usersResponse = await apiClient.get('/users')
        const usersData = usersResponse.data || usersResponse
        const allUsers = Array.isArray(usersData) ? usersData : []
        
        // Enrich users with hospital names
        const enrichedUsers = allUsers.map((user: any) => {
          const hospital = allHospitals.find((h: any) => h._id === user.hospitalId)
          return {
            ...user,
            hospitalName: hospital?.name || "Unknown Hospital"
          }
        })

        setUsers(enrichedUsers)

      } catch (err: any) {
        console.error("Error fetching report data:", err)
        setError(err.message || "Failed to load report data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchReportData()
  }, [])

  // Filter data based on selected filters
  const getFilteredReferrals = () => {
    let filtered = [...referrals]
    
    // Date range filtering
    if (filters.dateRange !== "custom") {
      const now = new Date()
      const daysMap = { "7days": 7, "30days": 30, "90days": 90 }
      const days = daysMap[filters.dateRange as keyof typeof daysMap]
      const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
      
      filtered = filtered.filter(r => new Date(r.createdAt) >= startDate)
    } else if (filters.startDate && filters.endDate) {
      filtered = filtered.filter(r => {
        const createdDate = new Date(r.createdAt)
        return createdDate >= new Date(filters.startDate!) && createdDate <= new Date(filters.endDate!)
      })
    }
    
    // Hospital filtering
    if (filters.hospitalId) {
      filtered = filtered.filter(r => r.fromHospital === filters.hospitalId)
    }
    
    // Status filtering
    if (filters.status) {
      filtered = filtered.filter(r => r.status === filters.status)
    }
    
    // Urgency filtering
    if (filters.urgency) {
      filtered = filtered.filter(r => r.urgency === filters.urgency)
    }
    
    return filtered
  }

  const getFilteredUsers = () => {
    let filtered = [...users]
    
    // Date range filtering
    if (filters.dateRange !== "custom") {
      const now = new Date()
      const daysMap = { "7days": 7, "30days": 30, "90days": 90 }
      const days = daysMap[filters.dateRange as keyof typeof daysMap]
      const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
      
      filtered = filtered.filter(u => new Date(u.createdAt) >= startDate)
    } else if (filters.startDate && filters.endDate) {
      filtered = filtered.filter(u => {
        const createdDate = new Date(u.createdAt)
        return createdDate >= new Date(filters.startDate!) && createdDate <= new Date(filters.endDate!)
      })
    }
    
    // Hospital filtering
    if (filters.hospitalId) {
      filtered = filtered.filter(u => u.hospitalId === filters.hospitalId)
    }
    
    return filtered
  }

  // Calculate statistics
  const getReferralStats = () => {
    const filtered = getFilteredReferrals()
    
    const byStatus = {
      pending: filtered.filter(r => r.status === "PENDING").length,
      approved: filtered.filter(r => r.status === "APPROVED").length,
      rejected: filtered.filter(r => r.status === "REJECTED").length
    }
    
    const byUrgency = {
      routine: filtered.filter(r => r.urgency === "ROUTINE").length,
      urgent: filtered.filter(r => r.urgency === "URGENT").length,
      emergency: filtered.filter(r => r.urgency === "EMERGENCY").length
    }
    
    const byHospital = filtered.reduce((acc, referral) => {
      const hospitalName = referral.fromHospitalName || "Unknown"
      acc[hospitalName] = (acc[hospitalName] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const rejectionReasons = filtered
      .filter(r => r.status === "REJECTED" && r.rejectionReason)
      .reduce((acc, referral) => {
        const reason = referral.rejectionReason || "Unknown"
        acc[reason] = (acc[reason] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    
    return {
      total: filtered.length,
      byStatus,
      byUrgency,
      byHospital,
      rejectionReasons
    }
  }

  const getUserStats = () => {
    const filtered = getFilteredUsers()
    
    const byRole = filtered.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const byHospital = filtered.reduce((acc, user) => {
      const hospitalName = user.hospitalName || "Unknown"
      acc[hospitalName] = (acc[hospitalName] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const activeUsers = filtered.filter(u => u.lastLogin && 
      new Date(u.lastLogin) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length
    
    return {
      total: filtered.length,
      byRole,
      byHospital,
      activeUsers
    }
  }

  // Export functions
  const exportToPDF = () => {
    // This would integrate with a PDF library like jsPDF
    console.log("Exporting to PDF...")
    alert("PDF export functionality would be implemented here")
  }

  const exportToExcel = () => {
    const filtered = filters.reportType === "referral" ? getFilteredReferrals() : getFilteredUsers()
    
    // Create CSV content
    const headers = filters.reportType === "referral" 
      ? ["Patient Name", "Phone", "Hospital", "Status", "Urgency", "Created Date", "Doctor"]
      : ["Name", "Email", "Role", "Hospital", "Created Date", "Last Login"]
    
    const rows = filtered.map(item => {
      if (filters.reportType === "referral") {
        const referral = item as ReferralReport
        return [
          referral.patientName,
          referral.patientPhone,
          referral.fromHospitalName || "Unknown",
          referral.status,
          referral.urgency,
          new Date(referral.createdAt).toLocaleDateString(),
          referral.doctorName || "Unknown"
        ]
      } else {
        const user = item as User
        return [
          user.fullName,
          user.email,
          user.role,
          user.hospitalName || "Unknown",
          new Date(user.createdAt).toLocaleDateString(),
          user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"
        ]
      }
    })
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(","))
      .join("\n")
    
    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `${filters.reportType}-report-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Reports & Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">Loading report data...</div>
        </CardContent>
      </Card>
    )
  }

  const referralStats = getReferralStats()
  const userStats = getUserStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="w-6 h-6" />
          Reports & Analytics
        </h2>
        <p className="text-muted-foreground">Generate comprehensive reports and insights</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Report Type</label>
              <select
                value={filters.reportType}
                onChange={(e) => setFilters({ ...filters, reportType: e.target.value as "referral" | "user-activity" })}
                className="w-full p-2 border rounded-md"
              >
                <option value="referral">Referral Reports</option>
                <option value="user-activity">User Activity Reports</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Date Range</label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters({ ...filters, dateRange: e.target.value as any })}
                className="w-full p-2 border rounded-md"
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
            
            {filters.dateRange === "custom" && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Start Date</label>
                  <input
                    type="date"
                    value={filters.startDate || ""}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">End Date</label>
                  <input
                    type="date"
                    value={filters.endDate || ""}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </>
            )}
            
            <div>
              <label className="block text-sm font-medium mb-2">Hospital</label>
              <select
                value={filters.hospitalId || ""}
                onChange={(e) => setFilters({ ...filters, hospitalId: e.target.value || undefined })}
                className="w-full p-2 border rounded-md"
              >
                <option value="">All Hospitals</option>
                {hospitals.map(hospital => (
                  <option key={hospital._id} value={hospital._id}>
                    {hospital.name}
                  </option>
                ))}
              </select>
            </div>
            
            {filters.reportType === "referral" && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select
                    value={filters.status || ""}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Urgency</label>
                  <select
                    value={filters.urgency || ""}
                    onChange={(e) => setFilters({ ...filters, urgency: e.target.value || undefined })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">All Urgencies</option>
                    <option value="ROUTINE">Routine</option>
                    <option value="URGENT">Urgent</option>
                    <option value="EMERGENCY">Emergency</option>
                  </select>
                </div>
              </>
            )}
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button
              onClick={exportToPDF}
              className="flex items-center gap-2"
              variant="outline"
            >
              <FileDown className="w-4 h-4" />
              Export PDF
            </Button>
            <Button
              onClick={exportToExcel}
              className="flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Export Excel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Referral Reports */}
      {filters.reportType === "referral" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-4 h-4" />
                Referral Status Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span className="font-medium">Pending</span>
                  </div>
                  <span className="text-xl font-bold text-amber-600">{referralStats.byStatus.pending}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="font-medium">Approved</span>
                  </div>
                  <span className="text-xl font-bold text-green-600">{referralStats.byStatus.approved}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span className="font-medium">Rejected</span>
                  </div>
                  <span className="text-xl font-bold text-red-600">{referralStats.byStatus.rejected}</span>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Total Referrals</span>
                    <span className="text-xl font-bold">{referralStats.total}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Urgency Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Referral Urgency Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">Routine</span>
                  </div>
                  <span className="text-xl font-bold text-blue-600">{referralStats.byUrgency.routine}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                    <span className="font-medium">Urgent</span>
                  </div>
                  <span className="text-xl font-bold text-orange-600">{referralStats.byUrgency.urgent}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span className="font-medium">Emergency</span>
                  </div>
                  <span className="text-xl font-bold text-red-600">{referralStats.byUrgency.emergency}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hospital Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hospital className="w-4 h-4" />
                Hospital Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(referralStats.byHospital).map(([hospitalName, count]) => (
                  <div key={hospitalName} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{hospitalName}</span>
                    <Badge variant="secondary">{count} referrals</Badge>
                  </div>
                ))}
                {Object.keys(referralStats.byHospital).length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">No referrals found</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Rejection Reasons */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                Rejection Reasons Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(referralStats.rejectionReasons).map(([reason, count]) => (
                  <div key={reason} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <span className="font-medium text-sm">{reason}</span>
                    <Badge variant="destructive">{count}</Badge>
                  </div>
                ))}
                {Object.keys(referralStats.rejectionReasons).length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">No rejections found</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* User Activity Reports */}
      {filters.reportType === "user-activity" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Role Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                User Role Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(userStats.byRole).map(([role, count]) => (
                  <div key={role} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">{role.replace('_', ' ')}</span>
                    </div>
                    <span className="text-xl font-bold text-blue-600">{count}</span>
                  </div>
                ))}
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Total Users</span>
                    <span className="text-xl font-bold">{userStats.total}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-medium">Active Users (7 days)</span>
                    <span className="text-lg font-bold text-green-600">{userStats.activeUsers}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Users by Hospital */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hospital className="w-4 h-4" />
                Users by Hospital
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(userStats.byHospital).map(([hospitalName, count]) => (
                  <div key={hospitalName} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{hospitalName}</span>
                    <Badge variant="secondary">{count} users</Badge>
                  </div>
                ))}
                {Object.keys(userStats.byHospital).length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">No users found</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Example Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Example Reports
          </CardTitle>
          <CardDescription>Pre-configured report templates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold">Monthly Referral Summary</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Complete overview of all referrals in the past month including status breakdown and hospital performance.
              </p>
              <Button size="sm" variant="outline" className="w-full">
                Generate Report
              </Button>
            </div>
            
            <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold">Hospital Performance Report</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Detailed analysis of referral volumes and outcomes by hospital with performance metrics.
              </p>
              <Button size="sm" variant="outline" className="w-full">
                Generate Report
              </Button>
            </div>
            
            <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <h4 className="font-semibold">Rejection Reasons Summary</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Analysis of referral rejection reasons with trends and recommendations for improvement.
              </p>
              <Button size="sm" variant="outline" className="w-full">
                Generate Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
