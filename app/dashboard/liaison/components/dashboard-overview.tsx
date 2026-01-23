"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"
import { Loader2 } from "lucide-react"

export function DashboardOverview() {
  const { user } = useAuth()
  const [stats, setStats] = useState([
    { label: "Pending Approvals", value: "0", change: "Requires action", color: "bg-orange-100 text-orange-800" },
    { label: "Approved This Week", value: "0", change: "This week", color: "bg-green-100 text-green-800" },
    { label: "Rejected", value: "0", change: "Total rejected", color: "bg-red-100 text-red-800" },
    { label: "Completed Referrals", value: "0", change: "This month", color: "bg-blue-100 text-blue-800" },
  ])
  const [isLoading, setIsLoading] = useState(true)
  const [referralTrends, setReferralTrends] = useState([
    { week: "Week 1", received: 0, approved: 0, rejected: 0 },
    { week: "Week 2", received: 0, approved: 0, rejected: 0 },
    { week: "Week 3", received: 0, approved: 0, rejected: 0 },
    { week: "Week 4", received: 0, approved: 0, rejected: 0 },
  ])

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.token || !user?.hospitalId) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        
        // Fetch all referrals and filter client-side
        const response = await apiClient.getAllReferrals()
        const referralData = response.data || response
        const allReferrals = Array.isArray(referralData) ? referralData : []

        // Filter incoming referrals (toHospital matches)
        const incomingReferrals = allReferrals.filter((r: any) => {
          const toHospitalId = typeof r.toHospital === 'object' ? r.toHospital?._id : r.toHospital
          return toHospitalId === user.hospitalId
        })

        // Filter outgoing referrals (fromHospital matches)
        const outgoingReferrals = allReferrals.filter((r: any) => {
          const fromHospitalId = typeof r.fromHospital === 'object' ? r.fromHospital?._id : r.fromHospital
          return fromHospitalId === user.hospitalId
        })

        // Calculate stats
        const pending = incomingReferrals.filter(
          (r: any) => r.status === "PENDING" || r.status === "DRAFT"
        ).length
        const approved = incomingReferrals.filter((r: any) => r.status === "APPROVED").length
        const rejected = incomingReferrals.filter((r: any) => r.status === "REJECTED").length
        const completed = outgoingReferrals.filter((r: any) => r.status === "COMPLETED").length

        // Calculate weekly stats (simplified - using last 4 weeks)
        const now = new Date()
        const weekData = [0, 1, 2, 3].map((weekOffset) => {
          const weekStart = new Date(now)
          weekStart.setDate(now.getDate() - (weekOffset * 7 + 7))
          weekStart.setHours(0, 0, 0, 0)
          const weekEnd = new Date(weekStart)
          weekEnd.setDate(weekStart.getDate() + 7)

          const weekReferrals = incomingReferrals.filter((r: any) => {
            const refDate = new Date(r.createdAt)
            return refDate >= weekStart && refDate < weekEnd
          })

          return {
            week: `Week ${4 - weekOffset}`,
            received: weekReferrals.length,
            approved: weekReferrals.filter((r: any) => r.status === "APPROVED").length,
            rejected: weekReferrals.filter((r: any) => r.status === "REJECTED").length,
          }
        })

        setStats([
          {
            label: "Pending Approvals",
            value: pending.toString(),
            change: "Requires action",
            color: "bg-orange-100 text-orange-800",
          },
          {
            label: "Approved This Week",
            value: approved.toString(),
            change: "This week",
            color: "bg-green-100 text-green-800",
          },
          {
            label: "Rejected",
            value: rejected.toString(),
            change: "Total rejected",
            color: "bg-red-100 text-red-800",
          },
          {
            label: "Completed Referrals",
            value: completed.toString(),
            change: "This month",
            color: "bg-blue-100 text-blue-800",
          },
        ])

        setReferralTrends(weekData.reverse())
      } catch (err) {
        console.error("Error fetching liaison stats:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [user?.token, user?.hospitalId])

  const turnaroundMetrics = [
    { name: "Emergency", avgTime: "2 hours" },
    { name: "Urgent", avgTime: "8 hours" },
    { name: "Routine", avgTime: "24 hours" },
  ]

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="border-l-4 border-l-purple-600">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : stat.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Referral Approval Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Weekly Approval Trends</CardTitle>
          <CardDescription>Referrals received and approved</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-[300px]">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={referralTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="received" fill="#9333ea" radius={[8, 8, 0, 0]} />
                <Bar dataKey="approved" fill="#10b981" radius={[8, 8, 0, 0]} />
                <Bar dataKey="rejected" fill="#ef4444" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Turnaround Time & Key Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Average Turnaround Time</CardTitle>
            <CardDescription>By priority level</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {turnaroundMetrics.map((metric, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <span className="font-medium">{metric.name}</span>
                <Badge variant="outline">{metric.avgTime}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performance Overview</CardTitle>
            <CardDescription>Your approval metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm font-medium text-green-900">Approval Rate</p>
              <p className="text-2xl font-bold text-green-600">
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : stats[1].value !== "0" ? (
                  `${Math.round((parseInt(stats[1].value) / (parseInt(stats[1].value) + parseInt(stats[2].value))) * 100) || 0}%`
                ) : (
                  "0%"
                )}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-900">Total Processed</p>
              <p className="text-2xl font-bold text-blue-600">
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  (parseInt(stats[1].value) + parseInt(stats[2].value)).toString()
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
