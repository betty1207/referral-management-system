// app/dashboard/system-admin/components/dashboard-header.tsx
"use client"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import type { User } from "@/hooks/use-auth"

export function DashboardHeader({ user }: { user: User | null }) {
  const { logout } = useAuth()

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-background px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold">System Admin Dashboard</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-sm text-muted-foreground">
          {user?.fullName} ({user?.email})
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => logout()}
        >
          Logout
        </Button>
      </div>
    </header>
  )
}