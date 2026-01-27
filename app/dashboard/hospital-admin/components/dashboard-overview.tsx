"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import { useAuth } from "@/lib/auth-context"
import { apiClient } from "@/lib/api-client"
import { useState, useEffect } from "react"

// Mock data for charts (keep these as they are)
const monthlyReferrals = [
  { month: "Jan", referrals: 65, completed: 58 },
  { month: "Feb", referrals: 78, completed: 71 },
  { month: "Mar", referrals: 82, completed: 75 },
  { month: "Apr", referrals: 170, completed: 165 },
  { month: "May", referrals: 160, completed: 155 },
  { month: "Jun", referrals: 140, completed: 135 },
]


const referralStatus = [
  { name: "Approved", value: 0, fill: "#10b981" },
  { name: "Pending", value: 0, fill: "#f59e0b" },
  { name: "Rejected", value: 0, fill: "#ef4444" },
  { name: "Completed", value: 0, fill: "#3b82f6" },
]

export function DashboardOverview() {
  const { user } = useAuth()
  const [stats, setStats] = useState([
    { label: "Total Doctors", value: "0", change: "+0 this month" },
    { label: "Total Liaisons", value: "0", change: "+0 this month" },
    { label: "Active Referrals", value: "156", change: "+12 today" },
    { label: "Completed Referrals", value: "2,843", change: "+89 this month" },
  ])
  const [referralStatusData, setReferralStatusData] = useState([
    { name: "Approved", value: 0, fill: "#10b981" },
    { name: "Pending", value: 0, fill: "#f59e0b" },
    { name: "Rejected", value: 0, fill: "#ef4444" },
    { name: "Completed", value: 0, fill: "#3b82f6" },
    { name: "Draft", value: 0, fill: "#6b7280" },
    { name: "Accepted", value: 0, fill: "#8b5cf6" },
  ])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user?.token) {
        console.log("[Dashboard] Missing token")
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const response = await apiClient.getUsers({ hospitalId: user.hospitalId })
        console.log("[Dashboard] Users response:", response)

        const userData = response.data || response
        const users = Array.isArray(userData) ? userData : []
        
        // Count doctors and liaisons
        const doctorCount = users.filter((u: any) => u.role === "DOCTOR").length
        const liaisonCount = users.filter((u: any) => u.role === "LIAISON_OFFICER").length
        
        // Fetch referrals for stats and status distribution
        let activeReferrals = 0
        let completedReferrals = 0
        const statusCounts = {
          APPROVED: 0,
          PENDING: 0,
          REJECTED: 0,
          COMPLETED: 0,
          DRAFT: 0,
          ACCEPTED: 0
        }
        try {
          const referralsResponse = await apiClient.getAllReferrals({ hospitalId: user.hospitalId })
          const referralsData = referralsResponse.data || referralsResponse
          const referrals = Array.isArray(referralsData) ? referralsData : []
          
          // Count referrals by status
          referrals.forEach((referral: any) => {
            const status = referral.status?.toUpperCase()
            if (status && statusCounts.hasOwnProperty(status)) {
              statusCounts[status as keyof typeof statusCounts]++
            }
          })
          
          activeReferrals = referrals.filter((r: any) => 
            r.status === "PENDING" || r.status === "DRAFT" || r.status === "APPROVED" || r.status === "ACCEPTED"
          ).length
          completedReferrals = referrals.filter((r: any) => r.status === "COMPLETED").length
          
          // Update referral status data for pie chart
          setReferralStatusData([
            { name: "Approved", value: statusCounts.APPROVED, fill: "#10b981" },
            { name: "Pending", value: statusCounts.PENDING, fill: "#f59e0b" },
            { name: "Rejected", value: statusCounts.REJECTED, fill: "#ef4444" },
            { name: "Completed", value: statusCounts.COMPLETED, fill: "#3b82f6" },
            { name: "Draft", value: statusCounts.DRAFT, fill: "#6b7280" },
            { name: "Accepted", value: statusCounts.ACCEPTED, fill: "#8b5cf6" },
          ])
          
          console.log("[Dashboard] Referral status counts:", statusCounts)
        } catch (err) {
          console.error("[Dashboard] Error fetching referrals:", err)
        }
        
        // Update stats with real data
        setStats([
          { 
            label: "Total Doctors", 
            value: doctorCount.toString(), 
            change: doctorCount > 0 ? `${doctorCount} total` : "No doctors yet" 
          },
          { 
            label: "Total Liaisons", 
            value: liaisonCount.toString(), 
            change: liaisonCount > 0 ? `${liaisonCount} total` : "No liaisons yet" 
          },
          { label: "Active Referrals", value: activeReferrals.toString(), change: "Currently active" },
          { label: "Completed Referrals", value: completedReferrals.toString(), change: "Total completed" },
        ])
      } catch (err) {
        console.error("[Dashboard] Error fetching users:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserStats()
  }, [user?.token])

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="bg-linear-to-br from-green-50 to-teal-50 dark:from-green-950 dark:to-teal-950 border-green-200 dark:border-green-800"
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {isLoading && (index === 0 || index === 1) ? "..." : stat.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Referral Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Referral Trends</CardTitle>
            <CardDescription>Last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyReferrals}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="referrals" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="completed" stroke="#059669" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Referral Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Referral Status</CardTitle>
            <CardDescription>Current distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={referralStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {referralStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
