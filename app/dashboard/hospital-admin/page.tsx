"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { HospitalAdminSidebar } from "./sidebar"
import { DashboardOverview } from "./components/dashboard-overview"
import { UsersList } from "./components/users-list"
import { ReferralsOverview } from "./components/referrals-overview"
import { HospitalReportsAnalytics } from "./components/hospital-reports-analytics"
import { useState } from "react"

type HospitalAdminPage = "overview" | "users" | "referrals" | "reports" | "audit" | "support"

export default function HospitalAdminDashboard() {
  const [currentPage, setCurrentPage] = useState<HospitalAdminPage>("overview")

  const renderContent = () => {
    switch (currentPage) {
      case "overview":
        return <DashboardOverview />
      case "users":
        return <UsersList />
      case "referrals":
        return <ReferralsOverview />
      case "reports":
        return <HospitalReportsAnalytics />
      case "audit":
        return <div className="text-center py-12">Audit Logs Page (Coming Soon)</div>
      case "support":
        return <div className="text-center py-12">Support Page (Coming Soon)</div>
      default:
        return <DashboardOverview />
    }
  }

  return (
    <DashboardLayout
      title="Hospital Admin Dashboard"
      sidebar={<HospitalAdminSidebar currentPage={currentPage} onPageChange={setCurrentPage} />}
    >
      {renderContent()}
    </DashboardLayout>
  )
}
