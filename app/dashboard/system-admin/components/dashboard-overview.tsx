"use client"

import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Hospital, 
  Users, 
  Activity, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  Calendar, 
  UserPlus, 
  Building,
  AlertCircle 
} from "lucide-react"

interface SystemStats {
  hospitals: number
  hospitalAdmins: number
  doctors: number
  liaisonOfficers: number
  totalReferrals: number
  todayReferrals: number
  monthReferrals: number
  pendingReferrals: number
  approvedReferrals: number
  rejectedReferrals: number
  isLoading: boolean
}

interface RecentActivity {
  id: string
  type: "user_created" | "hospital_created" | "referral_created" | "referral_updated"
  description: string
  timestamp: string
  user?: string
}

export function DashboardOverview() {
  const [stats, setStats] = useState<SystemStats>({
    hospitals: 0,
    hospitalAdmins: 0,
    doctors: 0,
    liaisonOfficers: 0,
    totalReferrals: 0,
    todayReferrals: 0,
    monthReferrals: 0,
    pendingReferrals: 0,
    approvedReferrals: 0,
    rejectedReferrals: 0,
    isLoading: true,
  })

  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [activitiesLoading, setActivitiesLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStats((prev) => ({ ...prev, isLoading: true }))
        setActivitiesLoading(true)

        // Fetch hospitals
        const hospitalsResponse = await apiClient.getHospitals()
        const hospitalsData = hospitalsResponse.data || hospitalsResponse
        const hospitalsCount = Array.isArray(hospitalsData) ? hospitalsData.length : 0

        // Fetch users
        const usersResponse = await apiClient.getUsers()
        const usersData = usersResponse.data || usersResponse
        const allUsers = Array.isArray(usersData) ? usersData : []

        const hospitalAdminsCount = allUsers.filter((u: any) => u.role === "HOSPITAL_ADMIN").length
        const doctorsCount = allUsers.filter((u: any) => u.role === "DOCTOR").length
        const liaisonOfficersCount = allUsers.filter((u: any) => u.role === "LIAISON_OFFICER").length

        // Fetch referrals
        let totalReferrals = 0
        let todayReferrals = 0
        let monthReferrals = 0
        let pendingReferrals = 0
        let approvedReferrals = 0
        let rejectedReferrals = 0

        try {
          const referralsResponse = await apiClient.get('/referrals')
          const referralsData = referralsResponse.data || referralsResponse
          const allReferrals = Array.isArray(referralsData) ? referralsData : []
          
          totalReferrals = allReferrals.length
          
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          const thisMonth = new Date()
          thisMonth.setDate(1)
          thisMonth.setHours(0, 0, 0, 0)
          
          allReferrals.forEach((referral: any) => {
            const createdAt = new Date(referral.createdAt)
            
            if (createdAt >= today) {
              todayReferrals++
            }
            if (createdAt >= thisMonth) {
              monthReferrals++
            }
            
            if (referral.status === "PENDING") {
              pendingReferrals++
            } else if (referral.status === "APPROVED") {
              approvedReferrals++
            } else if (referral.status === "REJECTED") {
              rejectedReferrals++
            }
          })
        } catch (err) {
          console.error("Error fetching referrals:", err)
        }

        setStats({
          hospitals: hospitalsCount,
          hospitalAdmins: hospitalAdminsCount,
          doctors: doctorsCount,
          liaisonOfficers: liaisonOfficersCount,
          totalReferrals,
          todayReferrals,
          monthReferrals,
          pendingReferrals,
          approvedReferrals,
          rejectedReferrals,
          isLoading: false,
        })

        // Mock recent activities (replace with real API call later)
        const mockActivities: RecentActivity[] = [
          {
            id: "1",
            type: "referral_created",
            description: "New referral created for Samson Bekele",
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            user: "Dr. Alemayehu"
          },
          {
            id: "2",
            type: "user_created",
            description: "New hospital admin registered",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            user: "System Admin"
          },
          {
            id: "3",
            type: "hospital_created",
            description: "Felege Hospital added to system",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
            user: "System Admin"
          },
          {
            id: "4",
            type: "referral_updated",
            description: "Referral status changed to Approved",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
            user: "Liaison Officer"
          },
          {
            id: "5",
            type: "user_created",
            description: "New doctor account created",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
            user: "System Admin"
          }
        ]
        
        setRecentActivities(mockActivities)
        setActivitiesLoading(false)
      } catch (err) {
        console.error("Error fetching stats:", err)
        setStats((prev) => ({ ...prev, isLoading: false }))
        setActivitiesLoading(false)
      }
    }

    fetchStats()
  }, [])

  // Helper functions
  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const past = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60)
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`
    } else {
      const days = Math.floor(diffInMinutes / 1440)
      return `${days} day${days !== 1 ? 's' : ''} ago`
    }
  }

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'user_created':
        return UserPlus
      case 'hospital_created':
        return Building
      case 'referral_created':
        return FileText
      case 'referral_updated':
        return Activity
      default:
        return AlertCircle
    }
  }

  const getActivityColor = (type: RecentActivity['type']) => {
    switch (type) {
      case 'user_created':
        return 'bg-blue-100 text-blue-600'
      case 'hospital_created':
        return 'bg-purple-100 text-purple-600'
      case 'referral_created':
        return 'bg-green-100 text-green-600'
      case 'referral_updated':
        return 'bg-orange-100 text-orange-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const statCards = [
    {
      label: "Total Hospitals",
      value: stats.hospitals,
      icon: Hospital,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Hospital Admins",
      value: stats.hospitalAdmins,
      icon: Users,
      color: "bg-purple-100 text-purple-600",
    },
    {
      label: "Doctors",
      value: stats.doctors,
      icon: Users,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Liaison Officers",
      value: stats.liaisonOfficers,
      icon: Activity,
      color: "bg-orange-100 text-orange-600",
    },
  ]

  const referralCards = [
    {
      label: "Total Referrals",
      value: stats.totalReferrals,
      icon: FileText,
      color: "bg-indigo-100 text-indigo-600",
      trend: stats.todayReferrals > 0 ? "+" + stats.todayReferrals + " today" : "No referrals today"
    },
    {
      label: "Today's Referrals",
      value: stats.todayReferrals,
      icon: Calendar,
      color: "bg-cyan-100 text-cyan-600",
    },
    {
      label: "This Month",
      value: stats.monthReferrals,
      icon: TrendingUp,
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      label: "Pending Review",
      value: stats.pendingReferrals,
      icon: Clock,
      color: "bg-amber-100 text-amber-600",
    },
  ]

  const statusCards = [
    {
      label: "Pending",
      value: stats.pendingReferrals,
      icon: Clock,
      color: "bg-amber-100 text-amber-600",
      variant: "secondary" as const
    },
    {
      label: "Approved",
      value: stats.approvedReferrals,
      icon: CheckCircle,
      color: "bg-green-100 text-green-600",
      variant: "default" as const
    },
    {
      label: "Rejected",
      value: stats.rejectedReferrals,
      icon: XCircle,
      color: "bg-red-100 text-red-600",
      variant: "destructive" as const
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">System Overview</h2>
          <p className="text-muted-foreground text-lg mt-1">Quick system overview and statistics</p>
        </div>
        <Badge variant="outline" className="text-sm px-3 py-1">
          Read-only Dashboard
        </Badge>
      </div>

      {/* System Statistics */}
      <div>
        <h3 className="text-xl font-semibold mb-4 text-gray-800">System Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {stats.isLoading ? "..." : stat.value}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Referral Statistics */}
      <div>
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Referral Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {referralCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {stats.isLoading ? "..." : stat.value}
                  </div>
                  {stat.trend && (
                    <p className="text-xs text-muted-foreground mt-1">{stat.trend}</p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Referral Status Summary */}
      <div>
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Referral Status Summary</h3>
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {statusCards.map((status, index) => {
                const Icon = status.icon
                return (
                  <div key={index} className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg ${status.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{status.label}</p>
                      <p className="text-2xl font-bold">{stats.isLoading ? "..." : status.value}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent System Activities */}
      <div>
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Recent System Activities</h3>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Last 5 Actions</CardTitle>
            <CardDescription>Recent system activities and changes</CardDescription>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading activities...</div>
            ) : recentActivities.length > 0 ? (
              <div className="space-y-4">
                {recentActivities.map((activity) => {
                  const Icon = getActivityIcon(activity.type)
                  return (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className={`p-2 rounded-lg ${getActivityColor(activity.type)} mt-1`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{activity.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-sm text-muted-foreground">
                            {activity.user && `by ${activity.user}`}
                          </span>
                          <span className="text-sm text-muted-foreground">•</span>
                          <span className="text-sm text-muted-foreground">
                            {formatTimeAgo(activity.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">No recent activities</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Quick Actions</h3>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Common Tasks</CardTitle>
            <CardDescription>Frequently used system administration tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Hospital className="w-5 h-5 text-blue-600" />
                  </div>
                  <h4 className="font-semibold">Manage Hospitals</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  View and manage all hospitals in the system
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <h4 className="font-semibold">User Management</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Create and manage users (Hospital Admins, Doctors, Liaison Officers)
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <FileText className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h4 className="font-semibold">Referral Analytics</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  View detailed referral statistics and reports
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

