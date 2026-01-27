"use client"

import { Button } from "@/components/ui/button"
import { Users, Hospital, BarChart3, Settings, LayoutGrid } from "lucide-react"

export type SystemAdminPage = "overview" | "hospitals" | "users" | "reports" | "settings"

interface SystemAdminSidebarProps {
  currentPage: SystemAdminPage
  onPageChange: (page: SystemAdminPage) => void
}

export function SystemAdminSidebar({ currentPage, onPageChange }: SystemAdminSidebarProps) {
  const menuItems = [
    { id: "overview" as SystemAdminPage, label: "Dashboard", icon: LayoutGrid },
    { id: "hospitals" as SystemAdminPage, label: "Hospitals", icon: Hospital },
    { id: "users" as SystemAdminPage, label: "User Management", icon: Users },
    { id: "reports" as SystemAdminPage, label: "Reports & Analytics", icon: BarChart3 },
    { id: "settings" as SystemAdminPage, label: "System Settings", icon: Settings },
  ]

  return (
    <nav className="p-4 space-y-2">
      {menuItems.map((item) => (
        <Button
          key={item.id}
          variant={currentPage === item.id ? "default" : "ghost"}
          className="w-full justify-start gap-3"
          onClick={() => onPageChange(item.id)}
        >
          <item.icon className="w-4 h-4" />
          {item.label}
        </Button>
      ))}
    </nav>
  )
}
