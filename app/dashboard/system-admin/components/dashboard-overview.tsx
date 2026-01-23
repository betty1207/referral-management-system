"use client"

import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Hospital, Users, Activity } from "lucide-react"

export function DashboardOverview() {
  const [stats, setStats] = useState({
    hospitals: 0,
    hospitalAdmins: 0,
    doctors: 0,
    liaisonOfficers: 0,
    isLoading: true,
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStats((prev) => ({ ...prev, isLoading: true }))

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

        setStats({
          hospitals: hospitalsCount,
          hospitalAdmins: hospitalAdminsCount,
          doctors: doctorsCount,
          liaisonOfficers: liaisonOfficersCount,
          isLoading: false,
        })
      } catch (err) {
        console.error("Error fetching stats:", err)
        setStats((prev) => ({ ...prev, isLoading: false }))
      }
    }

    fetchStats()
  }, [])

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">System Overview</h2>
        <p className="text-muted-foreground">Welcome to the System Admin Dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
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

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks for system administrators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Manage Hospitals</h3>
              <p className="text-sm text-muted-foreground">
                View and manage all hospitals in the system
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">User Management</h3>
              <p className="text-sm text-muted-foreground">
                Create and manage users (Hospital Admins, Doctors, Liaison Officers)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

