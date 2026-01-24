"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { DoctorSidebar } from "./sidebar"
import { DashboardOverview } from "./components/dashboard-overview"
import { PatientsList } from "./components/patients-list"
import { CreateReferral } from "./components/create-referral"
import { SecureHistoryViewer } from "./components/secure-history-viewer"
import { ReferralStatus } from "./components/referral-status"
import { useState } from "react"

type DoctorPage =
  | "overview"
  | "patients"
  | "create-referral"
  | "secure-history"
  | "referral-status"
  | "reports"
  | "profile"

export default function DoctorDashboard() {
  const [currentPage, setCurrentPage] = useState<DoctorPage>("overview")

  const renderContent = () => {
    switch (currentPage) {
      case "overview":
        return <DashboardOverview />
      case "patients":
        return <PatientsList />
      case "create-referral":
        return <CreateReferral />
      case "secure-history":
        return <SecureHistoryViewer />
      case "referral-status":
        return <ReferralStatus />
      case "reports":
        return <div className="p-6">Reports (Coming Soon)</div>
      case "profile":
        return <div className="p-6">Profile (Coming Soon)</div>
      default:
        return <DashboardOverview />
    }
  }

  return (
    <DashboardLayout
      title="Doctor Dashboard"
      sidebar={<DoctorSidebar currentPage={currentPage} onPageChange={setCurrentPage} />}
    >
      {renderContent()}
    </DashboardLayout>
  )
}