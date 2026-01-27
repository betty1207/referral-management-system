const API_BASE_URL = "http://localhost:3000"

class ApiClient {
  private token: string | null = null

  constructor() {
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("token") || null
    }
  }

  setToken(token: string | null) {
    this.token = token
    if (token && typeof window !== "undefined") {
      localStorage.setItem("token", token)
    } else if (typeof window !== "undefined") {
      localStorage.removeItem("token")
    }
  }

  getToken(): string | null {
    return this.token
  }

  clearToken() {
    this.token = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("token")
    }
  }

  private async request<T>(
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
    endpoint: string,
    body?: Record<string, any>,
    customToken?: string
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    const tokenToUse = customToken || this.token

    if (tokenToUse) {
      headers["Authorization"] = `Bearer ${tokenToUse}`
    }

    const options: RequestInit = {
      method,
      headers,
    }

    if (body && (method === "POST" || method === "PUT" || method === "PATCH")) {
      options.body = JSON.stringify(body)
    }

    try {
      const response = await fetch(url, options)

      if (!response.ok) {
        let errorData: any = {}
        try {
          const text = await response.text()
          if (text && text.trim()) {
            try {
              errorData = JSON.parse(text)
            } catch (parseError) {
              errorData = { message: text }
            }
          }
        } catch (textError) {
          console.warn(`[API] Could not read error response body:`, textError)
        }
        const errorMessage =
          errorData.message ||
          errorData.error ||
          errorData.msg ||
          (Object.keys(errorData).length > 0 ? JSON.stringify(errorData) : null) ||
          `HTTP Error: ${response.status}`
        throw new Error(errorMessage)
      }

      if (response.status === 204) {
        return {} as T
      }

      try {
        const text = await response.text()
        if (!text || text.trim().length === 0) {
          return {} as T
        }
        const data = JSON.parse(text)
        return data
      } catch (parseError) {
        return {} as T
      }
    } catch (error) {
      console.error(`[API] ${method} ${endpoint} failed:`, error)
      throw error
    }
  }

  async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<T> {
    let url = endpoint
    if (params && Object.keys(params).length > 0) {
      const queryParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value))
        }
      })
      url = `${endpoint}?${queryParams.toString()}`
    }
    return this.request<T>("GET", url)
  }

  async post<T = any>(endpoint: string, data?: Record<string, any>): Promise<T> {
    return this.request<T>("POST", endpoint, data)
  }

  async put<T = any>(endpoint: string, data?: Record<string, any>): Promise<T> {
    return this.request<T>("PUT", endpoint, data)
  }

  async patch<T = any>(endpoint: string, data?: Record<string, any>): Promise<T> {
    return this.request<T>("PATCH", endpoint, data)
  }

  async delete<T = any>(endpoint: string): Promise<T> {
    return this.request<T>("DELETE", endpoint)
  }

  // User methods
  async getUsers(params?: {
    role?: string
    hospitalId?: string
    limit?: number
    skip?: number
  }) {
    return this.get<any>("/users", params)
  }

  async createUser(data: any) {
    return this.post<any>("/users", data)
  }

  async updateUser(userId: string, data: any) {
    return this.patch<any>(`/users/${userId}`, data)
  }

  async deleteUser(userId: string) {
    return this.delete<any>(`/users/${userId}`)
  }

  async resetPassword(userId: string, newPassword: string) {
    return this.patch<any>(`/users/${userId}/reset-password`, { password: newPassword })
  }

  // Hospital methods
  async getHospitals() {
    return this.get<any>("/hospitals")
  }

  async createHospital(data: any) {
    return this.post<any>("/hospitals", data)
  }

  async getHospitalById(hospitalId: string) {
    return this.get<any>(`/hospitals/${hospitalId}`)
  }

  // Auth methods
  async login(email: string, password: string) {
    const response = await this.request<any>("POST", "/auth/login", { email, password }, undefined)
    if (response.access_token) {
      this.setToken(response.access_token)
    }
    return response
  }

  async logout() {
    this.clearToken()
  }

  async getProfile() {
    return this.get<any>("/auth/profile")
  }

  async getHospitalsWithToken(token: string) {
    return this.request<any>("GET", "/hospitals", undefined, token)
  }

  // Patient methods
  async searchPatients(params: { nationalId?: string; phone?: string; fullName?: string }) {
    try {
      return await this.post<any>("/patients/search", params)
    } catch (err: any) {
      const msg = String(err?.message || "")
      if (msg.includes("404") || msg.includes("Cannot GET") || msg.includes("405")) {
        return this.get<any>("/patients/search", params)
      }
      throw err
    }
  }

  async createPatient(data: {
    fullName: string
    sex: "Male" | "Female"
    dateOfBirth: string
    phone: string
    nationalId?: string
    address?: string
  }) {
    return this.post<any>("/patients", data)
  }

  async findOrCreatePatient(data: {
    fullName: string
    sex: "Male" | "Female"
    dateOfBirth: string
    phone: string
    nationalId?: string
    address?: string
  }) {
    return this.post<any>("/patients/find-or-create", data)
  }

  async getPatientById(patientId: string) {
    return this.get<any>(`/patients/${patientId}`)
  }

  // Referral methods
  async createReferral(data: {
    patientId?: string
    patient: {
      fullName: string
      sex: "Male" | "Female"
      dateOfBirth: string
      phone: string
      nationalId?: string
      address?: string
    }
    toHospital?: string
    patientName: string
    patientPhone: string
    urgency: "ROUTINE" | "URGENT" | "EMERGENCY"
    reasonForReferral: string
    clinicalNotes?: string
    attachments?: string[]
    requiredSpecialty?: string
    requiredBedType?: string
  }) {
    return this.post<any>("/referrals", data)
  }

  async getMyReferrals() {
    return this.get<any>("/referrals/my")
  }

  async getAllReferrals(params?: {
    hospitalId?: string
    status?: string
    fromHospital?: string
    toHospital?: string
    urgency?: string
    // limit?: number
    // skip?: number
    // limit?: number;
    // skip?: number;
  }) {
    return this.get<any>("/referrals", params)
  }

  async getReferralById(referralId: string) {
    return this.get<any>(`/referrals/${referralId}`)
  }

  async updateReferral(referralId: string, data: any) {
    return this.patch<any>(`/referrals/${referralId}`, data)
  }

  // ==== LIAISON SPECIFIC METHODS (ADD THESE) ====
  async getLiaisonOutbox() {
    return this.get<any>("/referrals/liaison/outbox")
  }

  async sendReferral(referralId: string, targetHospitalId: string) {
    return this.patch<any>(`/referrals/${referralId}/send`, { targetHospitalId })
  }

  async getIncomingReferrals() {
    return this.get<any>("/referrals/incoming")
  }

  async respondToReferral(referralId: string, status: string, justification?: string) {
    return this.patch<any>(`/referrals/${referralId}/respond`, { 
      status, 
      justification 
    })
  }

  async gateCheckIn(referralCode: string) {
    return this.patch<any>("/referrals/gate-check-in", { referralCode })
  }

  async completeReferral(referralId: string, feedbackNote: string) {
    return this.patch<any>(`/referrals/${referralId}/complete`, { feedbackNote })
  }

  // ==== END LIAISON METHODS ====

  async unlockReferral(referralId: string, otp: string) {
    return this.post<any>(`/referrals/${referralId}/unlock`, { otp })
  }

  async resendOtp(referralId: string) {
    return this.post<any>(`/referrals/${referralId}/resend-otp`)
  }

  // Status-specific referral methods
  async getReferralsByStatus(status: string, params?: { hospitalId?: string }) {
    return this.getAllReferrals({ ...params, status })
  }

  async getPendingReferrals(hospitalId?: string) {
    return this.getReferralsByStatus("PENDING", { hospitalId })
  }

  async getApprovedReferrals(hospitalId?: string) {
    return this.getReferralsByStatus("APPROVED", { hospitalId })
  }

  async getRejectedReferrals(hospitalId?: string) {
    return this.getReferralsByStatus("REJECTED", { hospitalId })
  }

  async getCompletedReferrals(hospitalId?: string) {
    return this.getReferralsByStatus("COMPLETED", { hospitalId })
  }

  async getDraftReferrals(hospitalId?: string) {
    return this.getReferralsByStatus("DRAFT", { hospitalId })
  }

  // Statistics and dashboard methods
  async getReferralStats(hospitalId?: string) {
    return this.get<any>("/referrals/stats", { hospitalId })
  }

  async getHospitalStats(hospitalId: string) {
    return this.get<any>(`/hospitals/${hospitalId}/stats`)
  }

  // File/Attachment methods
  async uploadAttachment(referralId: string, file: File) {
    const formData = new FormData()
    formData.append("file", file)
    
    const url = `${API_BASE_URL}/referrals/${referralId}/attachments`
    const headers: Record<string, string> = {}
    
    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`
    }
    
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
    })
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`)
    }
    
    return response.json()
  }

  async getAttachment(referralId: string, filename: string) {
    return this.get<any>(`/referrals/${referralId}/attachments/${filename}`)
  }
}

export const apiClient = new ApiClient()