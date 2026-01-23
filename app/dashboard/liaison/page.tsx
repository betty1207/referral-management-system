"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { LiaisonSidebar } from "./sidebar"
import { DashboardOverview } from "./components/dashboard-overview"
import { IncomingReferrals } from "./components/incoming-referrals"
import { OutgoingReferrals } from "./components/outgoing-referrals"
import { ApprovalForm } from "./components/approval-form"
import { useState } from "react"

type LiaisonPage = "overview" | "incoming" | "outgoing" | "follow-up" | "support"

export default function LiaisonDashboard() {
  const [currentPage, setCurrentPage] = useState<LiaisonPage>("overview")
  const [selectedReferral, setSelectedReferral] = useState<string | null>(null)
  const [showApprovalForm, setShowApprovalForm] = useState(false)

  // Handle selecting a referral for approval
  const handleSelectReferral = (referralId: string) => {
    setSelectedReferral(referralId)
    setShowApprovalForm(true)
  }

  // Handle back from approval form
  const handleBackFromApproval = () => {
    setShowApprovalForm(false)
    setSelectedReferral(null)
  }

  const renderContent = () => {
    // If approval form is open, show it
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
            onComplete={handleBackFromApproval}
          />
        </div>
      )
    }

    // Otherwise show the regular page
    switch (currentPage) {
      case "overview":
        return <DashboardOverview />
      case "incoming":
        return (
          <IncomingReferrals
            onSelectReferral={handleSelectReferral}
          />
        )
      case "outgoing":
        return <OutgoingReferrals />
      case "follow-up":
        return <div className="text-center py-12">Follow-up & Feedback (Coming Soon)</div>
      case "support":
        return <div className="text-center py-12">Support (Coming Soon)</div>
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
          onPageChange={(page) => {
            setCurrentPage(page)
            setShowApprovalForm(false) // Close approval form if open
            setSelectedReferral(null)
          }} 
        />
      }
    >
      {renderContent()}
    </DashboardLayout>
  )
}