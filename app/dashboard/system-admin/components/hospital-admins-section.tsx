// app/dashboard/system-admin/components/hospital-admins-section.tsx
"use client"

import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context" // Import useAuth to get token
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CreateAdminModal } from "./create-admin-modal"
import { EditAdminModal } from "./edit-admin-model"
import { DeleteAdminDialog } from "./delete-admin-dialog"

interface HospitalAdmin {
  _id: string
  fullName: string
  email: string
  role: string
  isActive: boolean
  createdAt: string
  hospitalId?: string
}

interface PaginationMeta {
  total: number
  limit: number
  skip: number
  hasMore: boolean
}

const LIMIT = 10

export function HospitalAdminsSection({ hospitalId }: { hospitalId: string }) {
  const [admins, setAdmins] = useState<HospitalAdmin[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [skip, setSkip] = useState(0)
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<HospitalAdmin | null>(null)
  const [deletingAdminId, setDeletingAdminId] = useState<string | null>(null)
  
  const { user } = useAuth() // Get auth context

  const fetchAdmins = async (skipValue = 0) => {
    try {
      setIsLoading(true)
      console.log(`[HospitalAdminsSection] Fetching admins for hospital ${hospitalId}, skip: ${skipValue}`)
      
      // First, ensure apiClient has the token
      if (user?.token) {
        apiClient.setToken(user.token)
      }
      
      const response = await apiClient.getUsers({
        role: "HOSPITAL_ADMIN",
        hospitalId,
        limit: LIMIT,
        skip: skipValue,
      })

      console.log("[HospitalAdminsSection] API Response:", response)
      
      // Handle different response formats
      let adminsData: HospitalAdmin[] = []
      let metaData: PaginationMeta | null = null
      
      if (Array.isArray(response)) {
        // If response is an array directly
        adminsData = response
      } else if (response.data && Array.isArray(response.data)) {
        // If response has data property
        adminsData = response.data
        if (response.meta) {
          metaData = response.meta
        }
      } else if (response.users && Array.isArray(response.users)) {
        // If response has users property
        adminsData = response.users
      if (response.meta) {
          metaData = response.meta
        }
      }
      
      // Filter by hospitalId to be safe (in case API doesn't filter)
      const filteredAdmins = adminsData.filter(admin => 
        admin.hospitalId === hospitalId || !admin.hospitalId
      )
      
      setAdmins(filteredAdmins)
      setPagination(metaData)
      setError("")
    } catch (err: any) {
      console.error("[HospitalAdminsSection] Error fetching admins:", err)
      setError(err.message || "Failed to load hospital admins")
      
      // Check if it's an auth error
      if (err.message.includes("401") || err.message.includes("Unauthorized")) {
        setError("Authentication failed. Please try logging in again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (hospitalId) {
    fetchAdmins(0)
    }
  }, [hospitalId])

  const handleCreateAdmin = async (data: any) => {
    try {
      setError("")
      console.log("[HospitalAdminsSection] Creating admin:", data)
      
      // Ensure apiClient has the token
      if (user?.token) {
        apiClient.setToken(user.token)
      }
      
      const createData = {
        fullName: data.fullName,
        email: data.email,
        password: data.password || "defaultPassword123", // Add a default password if not provided
        role: "HOSPITAL_ADMIN",
        hospitalId: hospitalId,
        isActive: true
      }
      
      await apiClient.createUser(createData)
      setCreateModalOpen(false)
      fetchAdmins(skip) // Refresh the list
    } catch (err: any) {
      console.error("[HospitalAdminsSection] Error creating admin:", err)
      setError(err.message || "Failed to create admin")
    }
  }

  const handleUpdateAdmin = async (data: any) => {
    if (!editingAdmin) return
    
    try {
      setError("")
      console.log("[HospitalAdminsSection] Updating admin:", editingAdmin._id, data)
      
      // Ensure apiClient has the token
      if (user?.token) {
        apiClient.setToken(user.token)
      }
      
      await apiClient.updateUser(editingAdmin._id, data)
      setEditingAdmin(null)
      fetchAdmins(skip) // Refresh the list
    } catch (err: any) {
      console.error("[HospitalAdminsSection] Error updating admin:", err)
      setError(err.message || "Failed to update admin")
    }
  }

  const handleDeleteAdmin = async (adminId: string) => {
    try {
      setError("")
      console.log("[HospitalAdminsSection] Deleting admin:", adminId)
      
      // Ensure apiClient has the token
      if (user?.token) {
        apiClient.setToken(user.token)
      }
      
      await apiClient.deleteUser(adminId)
      setDeletingAdminId(null)
      fetchAdmins(skip) // Refresh the list
    } catch (err: any) {
      console.error("[HospitalAdminsSection] Error deleting admin:", err)
      setError(err.message || "Failed to delete admin")
    }
  }

  const handlePrevious = () => {
    const newSkip = Math.max(0, skip - LIMIT)
    setSkip(newSkip)
    fetchAdmins(newSkip)
  }

  const handleNext = () => {
    const newSkip = skip + LIMIT
    setSkip(newSkip)
    fetchAdmins(newSkip)
  }

  return (
    <>
      <Card id="admins">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Hospital Admins</CardTitle>
            <CardDescription>Manage hospital administrators for this facility</CardDescription>
          </div>
          <Button 
            onClick={() => setCreateModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Add New Admin
          </Button>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm mb-4">
              {error}
              {error.includes("Authentication") && (
                <Button 
                  size="sm" 
                  variant="link" 
                  className="ml-2 h-auto p-0"
                  onClick={() => window.location.href = "/login"}
                >
                  Login Again
                </Button>
              )}
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
              <div>Loading admins...</div>
            </div>
          ) : admins.length > 0 ? (
            <>
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Created</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admins.map((admin) => (
                      <tr key={admin._id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-800">{admin.fullName}</td>
                        <td className="py-3 px-4 text-gray-600">{admin.email}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              admin.isActive 
                                ? "bg-green-100 text-green-800" 
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {admin.isActive ? (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1"></span>
                                Active
                              </>
                            ) : (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1"></span>
                                Inactive
                              </>
                            )}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {new Date(admin.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex gap-2 justify-end">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => setEditingAdmin(admin)}
                              className="border-gray-300 hover:bg-gray-100"
                            >
                              Edit
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              onClick={() => setDeletingAdminId(admin._id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <div className="text-sm text-gray-500">
                  Showing <span className="font-medium">{skip + 1}</span> to{" "}
                  <span className="font-medium">
                    {Math.min(skip + LIMIT, pagination?.total || skip + admins.length)}
                  </span> of{" "}
                  <span className="font-medium">{pagination?.total || admins.length}</span> admins
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={handlePrevious} 
                    disabled={skip === 0}
                    className="border-gray-300"
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleNext}
                    disabled={!pagination?.hasMore || admins.length < LIMIT}
                    className="border-gray-300"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-7.645a4 4 0 11-5.5 5.5" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hospital admins found</h3>
              <p className="text-gray-500 mb-6">Get started by creating the first hospital administrator.</p>
              <Button 
                onClick={() => setCreateModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Create First Admin
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateAdminModal 
        open={createModalOpen} 
        onOpenChange={setCreateModalOpen} 
        onSubmit={handleCreateAdmin} 
        hospitalId={hospitalId}
      />

      {editingAdmin && (
        <EditAdminModal
          admin={editingAdmin}
          open={!!editingAdmin}
          onOpenChange={(open) => !open && setEditingAdmin(null)}
          onSubmit={handleUpdateAdmin}
        />
      )}

      {deletingAdminId && (
        <DeleteAdminDialog
          open={!!deletingAdminId}
          onOpenChange={(open) => !open && setDeletingAdminId(null)}
          onConfirm={() => handleDeleteAdmin(deletingAdminId)}
        />
      )}
    </>
  )
}