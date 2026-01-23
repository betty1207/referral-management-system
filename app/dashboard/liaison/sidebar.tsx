"use client"

import { Button } from "@/components/ui/button"
import { LayoutGrid, ClipboardList, Send, Activity, HelpCircle } from "lucide-react"

type LiaisonPage = "overview" | "incoming" | "outgoing" | "follow-up" | "support"

interface LiaisonSidebarProps {
  currentPage: LiaisonPage
  onPageChange: (page: LiaisonPage) => void
}

export function LiaisonSidebar({ currentPage, onPageChange }: LiaisonSidebarProps) {
  const menuItems = [
    { id: "overview" as LiaisonPage, label: "Dashboard Overview", icon: LayoutGrid },
    { id: "incoming" as LiaisonPage, label: "Incoming Referrals", icon: ClipboardList },
    { id: "outgoing" as LiaisonPage, label: "Outgoing Referrals", icon: Send },
    { id: "follow-up" as LiaisonPage, label: "Follow-up & Feedback", icon: Activity },
    { id: "support" as LiaisonPage, label: "Help & Support", icon: HelpCircle },
  ]

  return (
    <nav className="p-4 space-y-2">
      <div className="mb-6 px-2">
        <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wider mb-2">
          Main Menu
        </h3>
        <div className="space-y-1">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant={currentPage === item.id ? "secondary" : "ghost"}
              className="w-full justify-start gap-3"
              onClick={() => onPageChange(item.id)}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="mt-8 px-2">
        <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wider mb-2">
          Quick Stats
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Pending Review:</span>
            <span className="font-semibold">5</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Today's Approved:</span>
            <span className="font-semibold text-green-600">3</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Awaiting Response:</span>
            <span className="font-semibold text-blue-600">2</span>
          </div>
        </div>
      </div>
    </nav>
  )
}