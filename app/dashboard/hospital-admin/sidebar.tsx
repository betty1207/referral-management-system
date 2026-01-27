"use client"

import { Button } from "@/components/ui/button"
import { Users, CheckCircle2, BarChart3, Notebook as LogBook, HelpCircle, LayoutGrid } from "lucide-react"

type HospitalAdminPage = "overview" | "users" | "referrals" | "reports" | "audit" | "support"

interface HospitalAdminSidebarProps {
  currentPage: HospitalAdminPage
  onPageChange: (page: HospitalAdminPage) => void
}

export function HospitalAdminSidebar({ currentPage, onPageChange }: HospitalAdminSidebarProps) {
  const menuItems = [
    { id: "overview" as HospitalAdminPage, label: "Dashboard", icon: LayoutGrid },
    { id: "users" as HospitalAdminPage, label: "Users Management", icon: Users },
    { id: "referrals" as HospitalAdminPage, label: "Referrals Overview", icon: CheckCircle2 },
    { id: "reports" as HospitalAdminPage, label: "Reports", icon: BarChart3 },
    { id: "audit" as HospitalAdminPage, label: "Audit Logs", icon: LogBook },
    { id: "support" as HospitalAdminPage, label: "Support", icon: HelpCircle },
  ]

  return (
    <nav className="p-4 space-y-1">
      {menuItems.map((item) => (
        <Button
          key={item.id}
          variant={currentPage === item.id ? "default" : "ghost"}
          className={`w-full justify-start gap-3 h-10 px-3 rounded-lg transition-all duration-200 ${
            currentPage === item.id 
              ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm" 
              : "text-gray-700 hover:bg-gray-100 hover:text-gray-800"
          }`}
          onClick={() => onPageChange(item.id)}
        >
          <item.icon className="w-4 h-4" />
          <span className="font-medium">{item.label}</span>
        </Button>
      ))}
    </nav>
  )
}
