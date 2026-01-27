"use client"

import { Button } from "@/components/ui/button"
import { LayoutGrid, Users, Plus, Shield, BarChart3, User, History, Activity } from "lucide-react"

export type DoctorPage =
  | "overview"
  | "patients"
  | "create-referral"
  | "specialist-queue"
  | "secure-history"
  | "reports"
  | "profile"

interface DoctorSidebarProps {
  currentPage: DoctorPage
  onPageChange: (page: DoctorPage) => void
}

export function DoctorSidebar({ currentPage, onPageChange }: DoctorSidebarProps) {
  const menuItems = [
    { id: "overview" as DoctorPage, label: "Dashboard", icon: LayoutGrid },
    { id: "patients" as DoctorPage, label: "Patients", icon: Users },
    { id: "create-referral" as DoctorPage, label: "Create Referral", icon: Plus },
    { id: "secure-history" as DoctorPage, label: "Patient History", icon: Shield },
    { id: "specialist-queue" as DoctorPage, label: "Complete Treatment", icon: Activity },
    { id: "reports" as DoctorPage, label: "Reports", icon: BarChart3 },
    { id: "profile" as DoctorPage, label: "Profile", icon: User },
  ]

  return (
    <nav className="p-4 space-y-1">
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