"use client"

import { Button } from "@/components/ui/button"
import { LayoutGrid, Users, Plus, Shield, Activity } from "lucide-react"

export type DoctorPage =
  | "overview"
  | "patients"
  | "create-referral"
  | "specialist-queue"
  | "secure-history"

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