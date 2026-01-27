"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface User {
  _id: string
  fullName: string
  email: string
  role: string
  isActive: boolean
}

export function UsersList() {
  const { user } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "DOCTOR",
  })

  const fetchUsers = async () => {
    if (!user?.token) {
      setError("Authentication token missing. Please log in again.")
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError("")
      const response = await apiClient.getUsers({ hospitalId: user.hospitalId })
      const userData = response.data || response
      const allUsers = Array.isArray(userData) ? userData : []
      
      // Filter to only show DOCTOR and LIAISON_OFFICER roles
      const filteredUsers = allUsers.filter(
        (u: any) => u.role === "DOCTOR" || u.role === "LIAISON_OFFICER"
      )
      
      setUsers(filteredUsers)
    } catch (err: any) {
      console.error("Error fetching users:", err)
      setError(err.message || "Failed to load users")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [user?.token, user?.hospitalId])

  const handleAddUser = async () => {
    if (!formData.fullName || !formData.email || !formData.password) {
      setError("Please fill in all required fields")
      return
    }

    if (!user?.token || !user?.hospitalId) {
      setError("Authentication token or hospital ID missing")
      return
    }

    try {
      setIsSubmitting(true)
      setError("")
      await apiClient.createUser({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        hospitalId: user.hospitalId,
      })
      
      setFormData({ fullName: "", email: "", password: "", role: "DOCTOR" })
      setIsOpen(false)
      await fetchUsers()
    } catch (err: any) {
      console.error("Error creating user:", err)
      setError(err.message || "Failed to create user")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
    console.log("[HospitalAdminUsers] Starting update for user:", userId, updates)
    
    if (!user?.token) {
      console.error("[HospitalAdminUsers] No auth token found")
      setError("Authentication token missing")
      return
    }

    try {
      setIsUpdating(true)
      setError("")
      const updateData: any = {}
      if (updates.fullName !== undefined) updateData.fullName = updates.fullName
      if (updates.email !== undefined) updateData.email = updates.email
      if (updates.role !== undefined) updateData.role = updates.role
      if (updates.isActive !== undefined) updateData.isActive = updates.isActive

      // Check if there are any updates to send
      if (Object.keys(updateData).length === 0) {
        console.log("[HospitalAdminUsers] No updates to send")
        setEditingUser(null)
        setIsUpdating(false)
        return
      }

      console.log("[HospitalAdminUsers] Sending update request:", userId, updateData)
      const response = await apiClient.updateUser(userId, updateData)
      console.log("[HospitalAdminUsers] Update response:", response)
      
      setEditingUser(null)
      await fetchUsers()
      console.log("[HospitalAdminUsers] Update completed successfully")
    } catch (err: any) {
      console.error("[HospitalAdminUsers] Update error:", err)
      setError(err.message || "Failed to update user")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    if (!user?.token) {
      setError("Authentication token missing")
      return
    }

    try {
      setError("")
      await apiClient.updateUser(userId, { isActive: !currentStatus })
      await fetchUsers()
    } catch (err: any) {
      console.error("Error updating user:", err)
      setError(err.message || "Failed to update user")
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!user?.token) {
      setError("Authentication token missing")
      return
    }

    try {
      setError("")
      await apiClient.deleteUser(userId)
      setDeletingUserId(null)
      await fetchUsers()
    } catch (err: any) {
      console.error("Error deleting user:", err)
      setError(err.message || "Failed to delete user")
      setDeletingUserId(null)
    }
  }

  const getRoleColor = (role: string) => {
    if (role === "DOCTOR") return "bg-blue-100 text-blue-800"
    if (role === "LIAISON_OFFICER") return "bg-purple-100 text-purple-800"
    return "bg-gray-100 text-gray-800"
  }

  const getRoleLabel = (role: string) => {
    if (role === "DOCTOR") return "Doctor"
    if (role === "LIAISON_OFFICER") return "Liaison Officer"
    return role
  }

  const getStatusColor = (status: boolean) => {
    return status ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <CardTitle className="text-xl font-semibold text-gray-800">User Management</CardTitle>
            <CardDescription className="text-gray-600">Manage doctors and liaison officers</CardDescription>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 font-medium gap-2">
                <Plus className="w-4 h-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-white border-gray-200 shadow-lg">
              <DialogHeader className="pb-4 border-b border-gray-100">
                <DialogTitle className="text-lg font-semibold text-gray-800">Add New User</DialogTitle>
                <DialogDescription className="text-gray-600">Create a new doctor or liaison officer in your hospital</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                {error && <div className="p-3 bg-red-50 text-red-800 rounded-lg text-sm border border-red-200">{error}</div>}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">Full Name</Label>
                  <Input
                    id="fullName"
                    placeholder="Enter full name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-sm font-medium text-gray-700">Role</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                    <SelectTrigger id="role" className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DOCTOR">Doctor</SelectItem>
                      <SelectItem value="LIAISON_OFFICER">Liaison Officer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleAddUser}
                  className="w-full bg-blue-600 hover:bg-blue-700 font-medium"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Add User"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="pt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No users found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-800">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-800">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-800">Role</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-800">Status</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-800">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((userItem) => (
                    <tr key={userItem._id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-800">{userItem.fullName}</td>
                      <td className="py-3 px-4 text-gray-600">{userItem.email}</td>
                      <td className="py-3 px-4">
                        <Badge className={`${getRoleColor(userItem.role)} text-xs border-0`}>
                          {getRoleLabel(userItem.role)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={`${getStatusColor(userItem.isActive)} text-xs border-0`}>
                          {userItem.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-gray-300 text-gray-700 hover:bg-gray-50"
                            onClick={() => setEditingUser(userItem)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-300 text-red-700 hover:bg-red-50"
                            onClick={() => setDeletingUserId(userItem._id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Modal */}
      {editingUser && (
        <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
          <DialogContent className="max-w-md bg-white border-gray-200 shadow-lg">
            <DialogHeader className="pb-4 border-b border-gray-100">
              <DialogTitle className="text-lg font-semibold text-gray-800">Edit User</DialogTitle>
              <DialogDescription className="text-gray-600">Update user details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              {error && <div className="p-3 bg-red-50 text-red-800 rounded-lg text-sm border border-red-200">{error}</div>}
              <div className="space-y-2">
                <Label htmlFor="edit-fullName" className="text-sm font-medium text-gray-700">Full Name</Label>
                <Input
                  id="edit-fullName"
                  value={editingUser.fullName}
                  onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email" className="text-sm font-medium text-gray-700">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role" className="text-sm font-medium text-gray-700">Role</Label>
                <Select
                  value={editingUser.role}
                  onValueChange={(value) => setEditingUser({ ...editingUser, role: value })}
                >
                  <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder={getRoleLabel(editingUser.role)} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DOCTOR">Doctor</SelectItem>
                    <SelectItem value="LIAISON_OFFICER">Liaison Officer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="edit-isActive"
                  type="checkbox"
                  checked={editingUser.isActive}
                  onChange={(e) => setEditingUser({ ...editingUser, isActive: e.target.checked })}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
                <Label htmlFor="edit-isActive" className="text-sm font-medium text-gray-700">Active Status</Label>
              </div>
            </div>
            <DialogFooter className="pt-4 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingUser(null)}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => {
                  if (editingUser) {
                    handleUpdateUser(editingUser._id, {
                      fullName: editingUser.fullName,
                      email: editingUser.email,
                      role: editingUser.role,
                      isActive: editingUser.isActive
                    })
                  }
                }}
                disabled={isUpdating}
                className="bg-blue-600 text-white hover:bg-blue-700 font-medium"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update User"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingUserId && (
        <Dialog open={!!deletingUserId} onOpenChange={() => setDeletingUserId(null)}>
          <DialogContent className="max-w-md bg-white border-gray-200 shadow-lg">
            <DialogHeader className="pb-4 border-b border-gray-100">
              <DialogTitle className="text-lg font-semibold text-gray-800">Delete User</DialogTitle>
              <DialogDescription className="text-gray-600">
                Are you sure you want to delete this user? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="pt-4 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeletingUserId(null)}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => handleDeleteUser(deletingUserId)}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
