"use client"

import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Pencil, Trash2, KeyRound, Eye, EyeOff } from "lucide-react"

interface User {
  _id: string
  fullName: string
  email: string
  role: string
  hospitalId?: string
  hospitalName?: string
  isActive: boolean
  createdAt?: string
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)
  const [resettingUserId, setResettingUserId] = useState<string | null>(null)
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [newPassword, setNewPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "HOSPITAL_ADMIN",
    hospitalId: "",
  })

  const [hospitals, setHospitals] = useState<Array<{ _id: string; name: string }>>([])

  const fetchHospitals = async () => {
    try {
      const response = await apiClient.getHospitals()
      console.log("[UserManagement] Hospitals response:", response)
      const hospitalData = response.data || response
      const hospitalsList = Array.isArray(hospitalData) ? hospitalData : []
      console.log("[UserManagement] Hospitals list:", hospitalsList)
      setHospitals(hospitalsList)
      return hospitalsList
    } catch (err) {
      console.error("Error fetching hospitals:", err)
      setError("Failed to load hospitals. Please refresh the page.")
      return []
    }
  }

  const fetchUsers = async (hospitalsList?: Array<{ _id: string; name: string }>) => {
    try {
      setIsLoading(true)
      const response = await apiClient.getUsers()
      const userData = response.data || response
      const allUsers = Array.isArray(userData) ? userData : []

      // Filter out system-admin users
      const filteredUsers = allUsers.filter((u: any) => u.role !== "SYSTEM_ADMIN")

      // Use passed hospitals list or state
      const hospitalsToUse = hospitalsList || hospitals

      // Format users with hospital names
      const formattedUsers: User[] = filteredUsers.map((u: any) => ({
        _id: u._id,
        fullName: u.fullName,
        email: u.email,
        role: u.role,
        hospitalId: u.hospitalId,
        hospitalName: hospitalsToUse.find((h) => h._id === u.hospitalId)?.name || "N/A",
        isActive: u.isActive,
        createdAt: u.createdAt,
      }))

      setUsers(formattedUsers)
      setError("")
    } catch (err: any) {
      setError("Failed to load users")
      console.error("Error fetching users:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      // Fetch hospitals first
      const hospitalsList = await fetchHospitals()
      // Then fetch users with the hospitals list
      await fetchUsers(hospitalsList)
    }
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCreateUser = async () => {
    if (!formData.fullName || !formData.email || !formData.password) {
      setError("Please fill in all required fields")
      return
    }

    if ((formData.role === "HOSPITAL_ADMIN" || formData.role === "DOCTOR" || formData.role === "LIAISON_OFFICER") && !formData.hospitalId) {
      setError("Please select a hospital")
      return
    }

    try {
      setError("")
      const createData: any = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      }

      if (formData.hospitalId) {
        createData.hospitalId = formData.hospitalId
      }

      await apiClient.createUser(createData)
      setCreateModalOpen(false)
      setFormData({ fullName: "", email: "", password: "", role: "HOSPITAL_ADMIN", hospitalId: "" })
      fetchUsers()
    } catch (err: any) {
      setError(err.message || "Failed to create user")
    }
  }

  const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
    try {
      setError("")
      const updateData: any = {}
      if (updates.fullName !== undefined) updateData.fullName = updates.fullName
      if (updates.isActive !== undefined) updateData.isActive = updates.isActive

      // Check if there are any updates to send
      if (Object.keys(updateData).length === 0) {
        setEditingUser(null)
        return
      }

      await apiClient.updateUser(userId, updateData)
      setEditingUser(null)
      await fetchUsers()
    } catch (err: any) {
      setError(err.message || "Failed to update user")
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      setError("")
      await apiClient.deleteUser(userId)
      setDeletingUserId(null)
      await fetchUsers()
    } catch (err: any) {
      setError(err.message || "Failed to delete user")
      setDeletingUserId(null)
    }
  }

  const handleResetPassword = async (userId: string) => {
    if (!newPassword) {
      setError("Please enter a new password")
      return
    }

    try {
      setError("")
      await apiClient.resetPassword(userId, newPassword)
      setResettingUserId(null)
      setNewPassword("")
      alert("Password reset successfully")
    } catch (err: any) {
      setError(err.message || "Failed to reset password")
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "HOSPITAL_ADMIN":
        return "Hospital Admin"
      case "DOCTOR":
        return "Doctor"
      case "LIAISON_OFFICER":
        return "Liaison Officer"
      default:
        return role
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "HOSPITAL_ADMIN":
        return "bg-purple-100 text-purple-800"
      case "DOCTOR":
        return "bg-blue-100 text-blue-800"
      case "LIAISON_OFFICER":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredUsers = roleFilter === "all" 
    ? users 
    : users.filter(u => u.role === roleFilter)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Manage all system users (Hospital Admins, Doctors, Liaison Officers)</CardDescription>
          </div>
          <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setFormData({ fullName: "", email: "", password: "", role: "HOSPITAL_ADMIN", hospitalId: "" })}>
                <Plus className="w-4 h-4 mr-2" />
                Create User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>Add a new user to the system</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {error && <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">{error}</div>}
                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HOSPITAL_ADMIN">Hospital Admin</SelectItem>
                      <SelectItem value="DOCTOR">Doctor</SelectItem>
                      <SelectItem value="LIAISON_OFFICER">Liaison Officer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {(formData.role === "HOSPITAL_ADMIN" || formData.role === "DOCTOR" || formData.role === "LIAISON_OFFICER") && (
                  <div className="space-y-2">
                    <Label htmlFor="hospitalId">Hospital *</Label>
                    <Select
                      value={formData.hospitalId}
                      onValueChange={(value) => setFormData({ ...formData, hospitalId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={hospitals.length === 0 ? "No hospitals available" : "Select a hospital"} />
                      </SelectTrigger>
                      <SelectContent>
                        {hospitals.length === 0 ? (
                          <SelectItem value="" disabled>
                            No hospitals available
                          </SelectItem>
                        ) : (
                          hospitals.map((hospital) => (
                            <SelectItem key={hospital._id} value={hospital._id}>
                              {hospital.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {hospitals.length === 0 && (
                      <p className="text-xs text-muted-foreground">
                        No hospitals found. Please create a hospital first or check your connection.
                      </p>
                    )}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleCreateUser}>
                  Create User
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {error && <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm mb-4">{error}</div>}

          <div className="mb-4">
            <Label htmlFor="roleFilter">Filter by Role</Label>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="HOSPITAL_ADMIN">Hospital Admin</SelectItem>
                <SelectItem value="DOCTOR">Doctor</SelectItem>
                <SelectItem value="LIAISON_OFFICER">Liaison Officer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading users...</div>
          ) : filteredUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Name</th>
                    <th className="text-left py-3 px-4 font-semibold">Email</th>
                    <th className="text-left py-3 px-4 font-semibold">Role</th>
                    <th className="text-left py-3 px-4 font-semibold">Hospital</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-right py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">{user.fullName}</td>
                      <td className="py-3 px-4">{user.email}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                          {getRoleDisplayName(user.role)}
                        </span>
                      </td>
                      <td className="py-3 px-4">{user.hospitalName || "N/A"}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingUser(user)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          {user.role === "HOSPITAL_ADMIN" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setResettingUserId(user._id)
                                setNewPassword("")
                              }}
                            >
                              <KeyRound className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeletingUserId(user._id)}
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
          ) : (
            <div className="text-center py-8 text-muted-foreground">No users found</div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Modal */}
      {editingUser && (
        <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>Update user details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {error && <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">{error}</div>}
              <div className="space-y-2">
                <Label htmlFor="edit-fullName">Full Name</Label>
                <Input
                  id="edit-fullName"
                  value={editingUser.fullName}
                  onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input id="edit-email" type="email" value={editingUser.email} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">Role</Label>
                <Input id="edit-role" value={getRoleDisplayName(editingUser.role)} disabled />
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="edit-isActive"
                  type="checkbox"
                  checked={editingUser.isActive}
                  onChange={(e) => setEditingUser({ ...editingUser, isActive: e.target.checked })}
                />
                <Label htmlFor="edit-isActive">Active Status</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => handleUpdateUser(editingUser._id, { fullName: editingUser.fullName, isActive: editingUser.isActive })}
              >
                Update User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingUserId && (
        <Dialog open={!!deletingUserId} onOpenChange={() => setDeletingUserId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete User</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this user? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDeletingUserId(null)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => handleDeleteUser(deletingUserId)}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Reset Password Dialog */}
      {resettingUserId && (
        <Dialog open={!!resettingUserId} onOpenChange={() => setResettingUserId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reset Password</DialogTitle>
              <DialogDescription>Enter a new password for this user</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {error && <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">{error}</div>}
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setResettingUserId(null)}>
                Cancel
              </Button>
              <Button type="button" onClick={() => handleResetPassword(resettingUserId)}>
                Reset Password
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

