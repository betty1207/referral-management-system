"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"

type UserRole = "system-admin" | "hospital-admin" | "liaison" | "doctor"


const decodeJWT = (token: string) => {
  try {
    // JWT
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
};

// Map backend role to frontend role
const mapBackendToFrontendRole = (backendRole: string): UserRole => {
  const roleMap: Record<string, UserRole> = {
    "DOCTOR": "doctor",
    "LIAISON_OFFICER": "liaison",
    "HOSPITAL_ADMIN": "hospital-admin",
    "SYSTEM_ADMIN": "system-admin"
  }
  return roleMap[backendRole] || "doctor"
}

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      console.log("🔄 Sending login request...")
      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })
      console.log("📊 Response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.message || "Login failed")
        return
      }

      const data = await response.json()
      console.log("✅ Full login response:", JSON.stringify(data, null, 2))

      // DECODE THE JWT TOKEN TO GET USER INFO
      const token = data.access_token
      console.log("🔐 Token received:", token ? "Yes" : "No")

      if (!token) {
        throw new Error("No token received from server")
      }

      // Decode the token
      const decoded = decodeJWT(token)
      console.log("🔓 Decoded JWT payload:", decoded)
      
      // Get user info from decoded token
      const backendRole = decoded?.role
      const userId = decoded?.sub
      const hospitalId = decoded?.hospitalId
      
      console.log("🎭 Role from JWT:", backendRole)
      console.log("🆔 User ID from JWT:", userId)
      console.log("🏥 Hospital ID from JWT:", hospitalId)

      if (!backendRole) {
        throw new Error("No role found in JWT token")
      }

      const frontendRole = mapBackendToFrontendRole(backendRole)
      console.log("🔄 Mapped frontend role:", frontendRole)

      // Store user data
      const userData = {
        id: userId || `user-${Date.now()}`,
        email: email,
        role: frontendRole,
        name: email, // We'll get the actual name later if needed
        hospitalId: hospitalId,
        token: token,
        backendRole: backendRole
      }

      console.log("💾 Storing user data:", userData)
      
      // Set token in apiClient and localStorage
      apiClient.setToken(token)
      localStorage.setItem("token", token)
      console.log("✅ Token set in apiClient")
      
      login(userData)

      // Redirect based on actual role
      const dashboardRoutes: Record<UserRole, string> = {
        "system-admin": "/dashboard/system-admin",
        "hospital-admin": "/dashboard/hospital-admin",
        liaison: "/dashboard/liaison",
        doctor: "/dashboard/doctor",
      }

      console.log("🚀 Redirecting to:", dashboardRoutes[frontendRole])
      router.push(dashboardRoutes[frontendRole])
    } catch (error) {
      console.error("🔥 Login error:", error)
      setError("An error occurred. Please check the backend is running.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-teal-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold">M</span>
            </div>
            <span className="text-xl font-bold text-blue-600">Med_Link</span>
          </div>
          <CardTitle className="text-2xl">Referral System</CardTitle>
          <CardDescription>Sign in to your dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@hospital.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center mb-3">
              Your role will be automatically detected from your account
            </p>
            <div className="space-y-2 text-xs">
              <p>
                <strong>Email:</strong> Use your registered email
              </p>
              <p>
                <strong>Password:</strong> Use your account password
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}