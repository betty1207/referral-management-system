// hooks/use-auth.ts
"use client"

import React from "react"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"

export interface User {
  _id: string
  fullName: string
  email: string
  role: "SYSTEM_ADMIN" | "HOSPITAL_ADMIN" | "DOCTOR" | "LIAISON_OFFICER"
  hospitalId?: string
  isActive: boolean
  createdAt: string
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  setUser: (user: User | null) => void
  setToken: (token: string) => void
  clearError: () => void
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          // Use the apiClient login method if you added it
          // Otherwise use the authApi directly
          const response = await apiClient.login(email, password)
          
          if (!response.success) {
            throw new Error(response.message || "Login failed")
          }

          // Store token and user data
          apiClient.setToken(response.data.token)
          set({ 
            user: response.data.user, 
            token: response.data.token,
            isLoading: false 
          })
        } catch (error: any) {
          set({ 
            error: error.message || "Login failed",
            isLoading: false 
          })
          throw error
        }
      },

      logout: () => {
        apiClient.clearToken()
        set({ user: null, token: null })
        // Use window.location for full page refresh to clear state
        window.location.href = "/login"
      },

      setUser: (user: User | null) => {
        set({ user })
      },

      setToken: (token: string) => {
        apiClient.setToken(token)
        set({ token })
      },

      clearError: () => {
        set({ error: null })
      }
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token 
      }),
    }
  )
)

// Optional: Create a hook for protected routes
export function useProtectedRoute(requiredRole?: string) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  // Check auth on mount
  React.useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
      return
    }

    if (!isLoading && user && requiredRole && user.role !== requiredRole) {
      router.push("/unauthorized")
    }
  }, [user, isLoading, router, requiredRole])

  return { user, isLoading }
}