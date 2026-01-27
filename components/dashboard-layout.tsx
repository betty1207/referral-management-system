"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useEffect } from "react"

interface DashboardLayoutProps {
  children: React.ReactNode
  sidebar: React.ReactNode
  title: string
}

export function DashboardLayout({ children, sidebar, title }: DashboardLayoutProps) {
  const { user, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/login")
    }
  }, [user, router])

  if (!user) {
    return null
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-200 bg-white">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white font-semibold text-lg">🏥</span>
            </div>
            <div>
              <span className="font-semibold text-gray-800 text-lg">MOH Referral</span>
              <p className="text-xs text-gray-500">Healthcare System</p>
            </div>
          </div>
          <div className="px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-xs font-medium text-blue-700 capitalize">{user.role.replace("-", " ")}</p>
          </div>
        </div>
        {sidebar}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white w-64">
          <div className="mb-4 p-3 rounded-lg bg-gray-50 border border-gray-200">
            <p className="text-xs font-medium text-gray-800">{user.email}</p>
            <p className="text-xs text-gray-500 capitalize">{user.role.replace("-", " ")}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-800"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gray-50">
        <header className="sticky top-0 z-10 border-b border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
              <p className="text-sm text-gray-500 mt-1">Ministry of Health Referral Management System</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 bg-green-50 rounded-lg border border-green-100">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 inline-block"></span>
                <span className="text-xs font-medium text-green-700">System Active</span>
              </div>
            </div>
          </div>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
