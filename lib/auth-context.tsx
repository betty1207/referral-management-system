"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type UserRole = "system-admin" | "hospital-admin" | "liaison" | "doctor"

interface User {
  id: string
  email: string
  role: UserRole
  name?: string
  hospitalId?: string
  token?: string
  backendRole?: string // Store original backend role
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (userData: User) => void
  logout: () => void
  getBackendRole: () => string // Helper to get backend role format
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Map frontend role to backend role for API calls
const mapFrontendToBackendRole = (frontendRole: UserRole): string => {
  const roleMap: Record<UserRole, string> = {
    "doctor": "DOCTOR",
    "liaison": "LIAISON_OFFICER",
    "hospital-admin": "HOSPITAL_ADMIN",
    "system-admin": "SYSTEM_ADMIN"
  }
  return roleMap[frontendRole] || "DOCTOR"
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user")
    console.log("[Auth] Checking stored user:", storedUser)
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        console.log("[Auth] Setting user from storage:", parsedUser)
        setUser(parsedUser)
      } catch (error) {
        console.error("[Auth] Failed to parse user data:", error)
        sessionStorage.removeItem("user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = (userData: User) => {
    console.log("[Auth] Logging in user:", userData)
    sessionStorage.setItem("user", JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    console.log("[Auth] Logging out user")
    sessionStorage.removeItem("user")
    setUser(null)
    router.push("/login")
  }

  // Helper to get backend role format for API calls
  const getBackendRole = (): string => {
    if (!user?.backendRole) {
      return mapFrontendToBackendRole(user?.role || "doctor")
    }
    return user.backendRole
  }

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    getBackendRole
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}