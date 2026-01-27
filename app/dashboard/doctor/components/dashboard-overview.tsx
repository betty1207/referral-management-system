"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { apiClient } from "@/lib/api-client"

interface Referral {
  _id: string
  patientName: string
  patientPhone: string
  urgency: string
  reasonForReferral: string
  status: string
  createdAt: string
  updatedAt: string
  fromHospital?: string
  toHospital?: string
}

interface RecentReferral {
  id: string
  patientName: string
  status: string
  date: string
  hospital: string
}

interface DashboardStats {
  totalReferrals: number
  activeReferrals: number
  approvedReferrals: number
  rejectedReferrals: number
  totalPatients: number
}

export function DashboardOverview() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalReferrals: 0,
    activeReferrals: 0,
    approvedReferrals: 0,
    rejectedReferrals: 0,
    totalPatients: 0
  })
  const [referralTrends, setReferralTrends] = useState<any[]>([])
  const [recentReferrals, setRecentReferrals] = useState<RecentReferral[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch doctor's referrals
      const referralsResponse = await apiClient.get('/referrals/doctor/my-referrals')
      const referrals = referralsResponse.data || referralsResponse
      
      // Fetch patients from the doctor's hospital
      const patientsResponse = await apiClient.get(`/patients?hospitalId=${user?.hospitalId}`)
      const patients = patientsResponse.data || patientsResponse
      
      // Calculate stats
      const totalReferrals = Array.isArray(referrals) ? referrals.length : 0
      const activeReferrals = Array.isArray(referrals) 
        ? referrals.filter((r: Referral) => r.status === 'PENDING' || r.status === 'DRAFT').length 
        : 0
      const approvedReferrals = Array.isArray(referrals) 
        ? referrals.filter((r: Referral) => r.status === 'ACCEPTED').length 
        : 0
      const rejectedReferrals = Array.isArray(referrals) 
        ? referrals.filter((r: Referral) => r.status === 'REJECTED').length 
        : 0
      const totalPatients = Array.isArray(patients) ? patients.length : 0
      
      setStats({
        totalReferrals,
        activeReferrals,
        approvedReferrals,
        rejectedReferrals,
        totalPatients
      })
      
      // Calculate referral trends for last 4 weeks
      const trends = calculateReferralTrends(referrals)
      setReferralTrends(trends)
      
      // Get recent referrals (last 5)
      const recent = Array.isArray(referrals) 
        ? referrals.slice(0, 5).map((referral: Referral) => ({
            id: referral._id,
            patientName: referral.patientName,
            status: referral.status,
            date: new Date(referral.createdAt).toLocaleDateString(),
            hospital: referral.toHospital || 'Unknown Hospital'
          }))
        : []
      setRecentReferrals(recent)
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateReferralTrends = (referrals: any[]) => {
    if (!Array.isArray(referrals)) return []
    
    const fourWeeksAgo = new Date()
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28)
    
    const weeklyData = []
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - (i * 7))
      weekStart.setHours(0, 0, 0, 0)
      
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)
      weekEnd.setHours(23, 59, 59, 999)
      
      const weekReferrals = referrals.filter((referral: Referral) => {
        const refDate = new Date(referral.createdAt)
        return refDate >= weekStart && refDate <= weekEnd
      })
      
      const sent = weekReferrals.length
      const approved = weekReferrals.filter((r: Referral) => r.status === 'ACCEPTED').length
      const rejected = weekReferrals.filter((r: Referral) => r.status === 'REJECTED').length
      
      weeklyData.push({
        week: `Week ${4 - i}`,
        sent,
        approved,
        rejected
      })
    }
    
    return weeklyData
  }

  const statsData = [
    { label: "Total Patients", value: stats.totalPatients.toString(), change: stats.totalPatients > 0 ? "Active patients" : "No patients yet" },
    { label: "Active Referrals", value: stats.activeReferrals.toString(), change: stats.activeReferrals > 0 ? "Awaiting response" : "No active referrals" },
    { label: "Approved Referrals", value: stats.approvedReferrals.toString(), change: "This month" },
    { label: "Rejected Referrals", value: stats.rejectedReferrals.toString(), change: stats.rejectedReferrals > 0 ? "Needs follow-up" : "No rejections" },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat, index) => (
          <Card
            key={index}
            className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950 dark:to-blue-950 border-cyan-200 dark:border-cyan-800"
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Action */}
      <Card className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Create a New Referral</CardTitle>
          <CardDescription className="text-cyan-100">
            Refer a patient to a higher-level facility for specialized care
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            className="bg-white text-blue-600 hover:bg-gray-100 gap-2"
            onClick={() => {
              // This will be handled by the parent component navigation
              console.log('Navigate to create referral')
            }}
          >
            <Plus className="w-4 h-4" />
            New Referral
          </Button>
        </CardContent>
      </Card>

      {/* Referral Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Referral Activity</CardTitle>
          <CardDescription>Last 4 weeks</CardDescription>
        </CardHeader>
        <CardContent>
          {referralTrends.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={referralTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sent" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                <Bar dataKey="approved" fill="#10b981" radius={[8, 8, 0, 0]} />
                <Bar dataKey="rejected" fill="#ef4444" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No referral data available for the last 4 weeks
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Referrals */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Referrals</CardTitle>
          <CardDescription>Your most recent referral submissions</CardDescription>
        </CardHeader>
        <CardContent>
          {recentReferrals.length > 0 ? (
            <div className="space-y-3">
              {recentReferrals.map((ref) => (
                <div
                  key={ref.id}
                  className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50"
                >
                  <div>
                    <p className="font-medium text-sm">{ref.patientName}</p>
                    <p className="text-xs text-muted-foreground">{ref.hospital}</p>
                  </div>
                  <div className="text-right">
                    <Badge
                      className={
                        ref.status === "ACCEPTED"
                          ? "bg-green-100 text-green-800"
                          : ref.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : ref.status === "REJECTED"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                      }
                    >
                      {ref.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">{ref.date}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No referrals submitted yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}