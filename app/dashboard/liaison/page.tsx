"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { LiaisonSidebar } from "./sidebar"
import { DashboardOverview } from "./components/dashboard-overview"
import { IncomingReferrals } from "./components/incoming-referrals"
import { OutgoingReferrals } from "./components/outgoing-referrals"
import { ApprovalForm } from "./components/approval-form"
import { useState } from "react"
import { GateCheckIn } from "./components/gate-check-in"
import { CompletedReferrals } from "./components/completed-referrals"

type LiaisonPage = "overview" | "incoming" | "outgoing" | "gate-checkin" | "completed" | "support"

export default function LiaisonDashboard() {
  const [currentPage, setCurrentPage] = useState<LiaisonPage>("overview")
  const [selectedReferral, setSelectedReferral] = useState<string | null>(null)
  const [showApprovalForm, setShowApprovalForm] = useState(false)

  const handleSelectReferral = (referralId: string) => {
    setSelectedReferral(referralId)
    setShowApprovalForm(true)
  }

  const handleBackFromApproval = () => {
    setShowApprovalForm(false)
    setSelectedReferral(null)
  }

  const renderContent = () => {
    if (showApprovalForm) {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={handleBackFromApproval}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              ← Back to Incoming Referrals
            </button>
            <h2 className="text-xl font-semibold">Review Referral</h2>
          </div>
          <ApprovalForm 
            referralId={selectedReferral} 
            onBack={handleBackFromApproval}
          />
        </div>
      )
    }

    switch (currentPage) {
      case "overview":
        return <DashboardOverview />
      case "incoming":
        return (
          <IncomingReferrals
            onSelectReferralAction={handleSelectReferral}
          />
        )
      case "outgoing":
        return <OutgoingReferrals />
      case "gate-checkin":
        return <GateCheckIn />
      case "completed":
        return <CompletedReferrals />
      case "support":
        return (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-4">Help & Support</h3>
            <p className="text-gray-600">Contact system administrator for assistance.</p>
          </div>
        )
      default:
        return <DashboardOverview />
    }
  }

  return (
    <DashboardLayout
      title="Liaison Officer Dashboard"
      sidebar={
        <LiaisonSidebar 
          currentPage={currentPage} 
          onPageChangeAction={(page: LiaisonPage) => {
            setCurrentPage(page)
            setShowApprovalForm(false)
            setSelectedReferral(null)
          }} 
        />
      }
    >
      {renderContent()}
    </DashboardLayout>
  )
}