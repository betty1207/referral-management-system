"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { DoctorSidebar, type DoctorPage } from "./sidebar"
import { DashboardOverview } from "./components/dashboard-overview"
import { PatientsList } from "./components/patients-list"
import { CreateReferral } from "./components/create-referral"
import { SecureHistoryViewer } from "./components/secure-history-viewer"
import { CompleteTreatmentPage } from "./components/complete-treatment"
import { useState } from "react"

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
      case "specialist-queue":
        return <CompleteTreatmentPage />
      case "secure-history":
        return <SecureHistoryViewer />
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