// hooks/use-api-client.ts
"use client"

import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"
import { useEffect } from "react"

export function useApiClient() {
  const { user } = useAuth()

  // Sync token from auth context to apiClient
  useEffect(() => {
    if (user?.token) {
      apiClient.setToken(user.token)
      console.log("[useApiClient] Token synced to apiClient")
    }
  }, [user?.token])

  return apiClient
}