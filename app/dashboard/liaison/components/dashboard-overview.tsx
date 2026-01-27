"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  ClipboardCheck, 
  Clock, 
  CheckCircle, 
  XCircle,
  ArrowUpRight,
  AlertCircle
} from "lucide-react"
import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"

export function DashboardOverview() {
  const { user } = useAuth()
  const [stats, setStats] = useState([
    { title: "Pending Review", value: "0", icon: Clock, color: "text-amber-600", bgColor: "bg-amber-50" },
    { title: "Approved Today", value: "0", icon: CheckCircle, color: "text-green-600", bgColor: "bg-green-50" },
    { title: "Rejected Today", value: "0", icon: XCircle, color: "text-red-600", bgColor: "bg-red-50" },
    { title: "Awaiting Response", value: "0", icon: AlertCircle, color: "text-blue-600", bgColor: "bg-blue-50" },
  ])
  const [recentActivity, setRecentActivity] = useState([
    { id: 1, action: "Approved referral", patient: "John Doe", time: "10:30 AM", type: "incoming" },
    { id: 2, action: "Sent to Hospital B", patient: "Jane Smith", time: "9:45 AM", type: "outgoing" },
    { id: 3, action: "Referred to Cardiology", patient: "Mike Johnson", time: "Yesterday", type: "incoming" },
    { id: 4, action: "Received from Hospital C", patient: "Sarah Williams", time: "Yesterday", type: "incoming" },
  ])
  const [quickActions, setQuickActions] = useState([
    { label: "Review Pending", count: 5, action: "review" },
    { label: "Follow-up Needed", count: 2, action: "followup" },
    { label: "Generate Reports", count: null, action: "reports" },
  ])

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.hospitalId) return
      
      try {
        const response = await apiClient.getAllReferrals()
        const referrals = Array.isArray(response) ? response : response.data || []
        const today = new Date().toISOString().split('T')[0]
        
        const pending = referrals.filter((r: any) => {
          const toHospital = typeof r.toHospital === 'object' ? r.toHospital?._id : r.toHospital
          return toHospital === user.hospitalId && r.status === "PENDING"
        }).length

        const approvedToday = referrals.filter((r: any) => {
          const toHospital = typeof r.toHospital === 'object' ? r.toHospital?._id : r.toHospital
          const acceptedDate = r.acceptedAt ? new Date(r.acceptedAt).toISOString().split('T')[0] : null
          return toHospital === user.hospitalId && r.status === "ACCEPTED" && acceptedDate === today
        }).length

        const rejectedToday = referrals.filter((r: any) => {
          const toHospital = typeof r.toHospital === 'object' ? r.toHospital?._id : r.toHospital
          const decisionDate = r.decisionMeta?.timestamp ? new Date(r.decisionMeta.timestamp).toISOString().split('T')[0] : null
          return toHospital === user.hospitalId && r.status === "REJECTED" && decisionDate === today
        }).length

        const awaiting = referrals.filter((r: any) => {
          const fromHospital = typeof r.fromHospital === 'object' ? r.fromHospital?._id : r.fromHospital
          return fromHospital === user.hospitalId && r.status === "PENDING"
        }).length

        setStats([
          { title: "Pending Review", value: pending.toString(), icon: Clock, color: "text-amber-600", bgColor: "bg-amber-50" },
          { title: "Approved Today", value: approvedToday.toString(), icon: CheckCircle, color: "text-green-600", bgColor: "bg-green-50" },
          { title: "Rejected Today", value: rejectedToday.toString(), icon: XCircle, color: "text-red-600", bgColor: "bg-red-50" },
          { title: "Awaiting Response", value: awaiting.toString(), icon: AlertCircle, color: "text-blue-600", bgColor: "bg-blue-50" },
        ])
      } catch (error) {
        console.error("Error fetching stats:", error)
      }
    }

    fetchStats()
  }, [user?.hospitalId])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with referrals.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="border-none shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold mt-2">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {quickActions.map((action) => (
                  <div 
                    key={action.label}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="font-medium">{action.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {action.count !== null && (
                        <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                          {action.count}
                        </span>
                      )}
                      <ArrowUpRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4" variant="outline">
                View All Actions
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 pb-4 border-b last:border-0">
                    <div className={`mt-1 p-2 rounded-full ${
                      activity.type === 'incoming' ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                      {activity.type === 'incoming' ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-gray-600">{activity.patient}</p>
                    </div>
                    <span className="text-sm text-gray-500">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Today's Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Approval Rate</span>
                    <span className="font-semibold">75%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Response Time</span>
                    <span className="font-semibold">2.4h</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Completion Rate</span>
                    <span className="font-semibold">92%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Need Attention</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                  <span className="text-sm font-medium">Urgent: Patient waiting</span>
                  <Button size="sm" variant="destructive">Review</Button>
                </div>
                <div className="flex items-center justify-between p-2 bg-amber-50 rounded-lg">
                  <span className="text-sm font-medium">Missing documents</span>
                  <Button size="sm" variant="outline">Request</Button>
                </div>
                <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium">Follow-up due</span>
                  <Button size="sm" variant="outline">Schedule</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}