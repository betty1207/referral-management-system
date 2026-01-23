"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { SystemAdminSidebar, SystemAdminPage } from "./sidebar"
import { DashboardOverview } from "./components/dashboard-overview"
import { HospitalsSection } from "./components/hospitals-section"
import { UserManagement } from "./components/user-management"

export default function SystemAdminDashboard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState<SystemAdminPage>("overview")

  useEffect(() => {
    console.log("[SystemAdminPage] Auth state:", { user, isLoading, userRole: user?.role })
    
    if (!isLoading && !user) {
      console.log("[SystemAdminPage] No user, redirecting to login")
      router.push("/login")
      return
    }
    
    // Check if user has system admin role
    if (!isLoading && user && user.role !== "system-admin") {
      console.log(`[SystemAdminPage] Wrong role: ${user.role}, expected system-admin, redirecting`)
      router.push("/unauthorized")
      return
    }
  }, [user, isLoading, router])

  if (isLoading) {
    console.log("[SystemAdminPage] Loading...")
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    )
  }

  if (!user) {
    console.log("[SystemAdminPage] No user, showing redirect...")
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Redirecting to login...</div>
      </div>
    )
  }

  console.log("[SystemAdminPage] Rendering dashboard for:", user.email)

  const renderContent = () => {
    switch (currentPage) {
      case "overview":
        return <DashboardOverview />
      case "hospitals":
        return <HospitalsSection onSelectHospital={() => {}} />
      case "users":
        return <UserManagement />
      case "reports":
        return <div className="text-center py-12">Reports & Analytics Page (Coming Soon)</div>
      case "settings":
        return <div className="text-center py-12">System Settings Page (Coming Soon)</div>
      default:
        return <DashboardOverview />
    }
  }

  return (
    <DashboardLayout
      title="System Admin Dashboard"
      sidebar={<SystemAdminSidebar currentPage={currentPage} onPageChange={setCurrentPage} />}
    >
      {renderContent()}
    </DashboardLayout>
  )
}
