"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit2, Trash2 } from "lucide-react"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/lib/auth-context"
import { userApi } from "@/lib/api-client"

interface User {
  _id?: string
  id?: string
  fullName: string
  email: string
  role: string
  hospitalId?: string
  department?: string
  status?: string
  isActive?: boolean
}

export function UsersList() {
  const { user } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "DOCTOR",
    department: "General",
  })
  
  // Edit states
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editFormData, setEditFormData] = useState({
    fullName: "",
    email: "",
    role: "DOCTOR",
    isActive: true,
  })

  // Fetch users function
  const fetchUsers = async () => {
    if (!user?.token) {
      console.log("[UsersList] Missing token")
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const response = await userApi.getUsers(user.token)
      console.log("[UsersList] Fetch response:", response)

      if (response.success && response.data) {
        const filteredUsers = Array.isArray(response.data)
          ? response.data.filter((u: any) => 
              u.role === "DOCTOR" || u.role === "LIAISON_OFFICER"
            )
          : []
        
        const formattedUsers = filteredUsers.map((u: any) => ({
          _id: u._id,
          id: u._id,
          fullName: u.fullName,
          email: u.email,
          role: u.role === "DOCTOR" ? "Doctor" : 
                u.role === "LIAISON_OFFICER" ? "Liaison Officer" : u.role,
          backendRole: u.role, // Keep original for editing
          department: u.department || "General",
          status: u.isActive ? "Active" : "Inactive",
          isActive: u.isActive
        }))
        
        setUsers(formattedUsers)
        setError("")
      } else {
        setError(response.error || "Failed to fetch users")
        setUsers([])
      }
    } catch (err) {
      console.error("[UsersList] Error fetching users:", err)
      setError("Failed to fetch users")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    console.log("[DEBUG] Current user:", user)
    fetchUsers()
  }, [user?.token])

  // Add user
  const handleAddUser = async () => {
    if (!formData.fullName || !formData.email || !formData.password || !user?.token || !user?.hospitalId) {
      setError("Please fill in all fields")
      return
    }

    try {
      setIsSubmitting(true)
      setError("")

      const createData = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        hospitalId: user.hospitalId,
      }

      console.log("[UsersList] Creating user:", createData)
      const response = await userApi.createUser(createData, user.token)

      if (response.success && response.data) {
        const newUser: User = {
          _id: response.data._id,
          id: response.data._id,
          fullName: response.data.fullName,
          email: response.data.email,
          role: response.data.role === "DOCTOR" ? "Doctor" : "Liaison Officer",
          status: response.data.isActive ? "Active" : "Inactive",
          isActive: response.data.isActive
        }
        setUsers([...users, newUser])
        setFormData({ fullName: "", email: "", password: "", role: "DOCTOR", department: "General" })
        setIsOpen(false)
        setError("")
      } else {
        setError(response.error || "Failed to create user")
      }
    } catch (err) {
      console.error("[UsersList] Error creating user:", err)
      setError("Failed to create user")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete user
  const handleDeleteUser = async (userId: string) => {
    console.log("🗑️ Deleting user:", userId)
    
    if (!user?.token) {
      setError("No authentication token")
      return
    }

    try {
      setDeletingUserId(userId)
      setError("")
      
      // Optimistic update - remove immediately from UI
      setUsers(prevUsers => prevUsers.filter(u => u._id !== userId))
      
      const response = await userApi.deleteUser(userId, user.token)
      console.log("Delete response:", response)

      if (!response.success) {
        // If delete failed, refetch users to restore state
        await fetchUsers()
        setError(response.error || "Failed to delete user")
      }
    } catch (err) {
      console.error("Delete error:", err)
      // If error, refetch users to restore state
      await fetchUsers()
      setError("Failed to delete user")
    } finally {
      setDeletingUserId(null)
    }
  }

  // Open edit dialog
  const handleEditClick = (userItem: User) => {
    console.log("✏️ Opening edit for:", userItem.fullName)
    setEditingUser(userItem)
    setEditFormData({
      fullName: userItem.fullName,
      email: userItem.email,
      role: userItem.role === "Doctor" ? "DOCTOR" : "LIAISON_OFFICER",
      isActive: userItem.isActive || true
    })
    setIsEditOpen(true)
  }

  // Save edited user
  const handleSaveEdit = async () => {
    if (!editingUser?._id || !user?.token) {
      setError("Cannot save edit")
      return
    }

    try {
      setIsSubmitting(true)
      setError("")
      
      // Prepare update data
      const updateData: any = {
        fullName: editFormData.fullName,
        isActive: editFormData.isActive
      }
      
      console.log("💾 Saving edit for user:", editingUser._id)
      console.log("📝 Update data:", updateData)
      
      const response = await userApi.updateUser(editingUser._id, updateData, user.token)
      console.log("Edit API response:", response)

      if (response.success) {
        console.log("✅ Edit successful")
        
        // Update local state
        setUsers(prevUsers => 
          prevUsers.map(u => {
            if (u._id === editingUser._id) {
              return {
                ...u,
                fullName: editFormData.fullName,
                email: editFormData.email,
                role: editFormData.role === "DOCTOR" ? "Doctor" : "Liaison Officer",
                status: editFormData.isActive ? "Active" : "Inactive",
                isActive: editFormData.isActive
              }
            }
            return u
          })
        )
        
        // Close dialog and reset
        setIsEditOpen(false)
        setEditingUser(null)
        setEditFormData({
          fullName: "",
          email: "",
          role: "DOCTOR",
          isActive: true
        })
      } else {
        console.log("❌ Edit failed:", response.error)
        setError(response.error || "Failed to update user")
      }
    } catch (err) {
      console.error("🔥 Edit error:", err)
      setError("Failed to update user")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getRoleColor = (role: string) => {
    if (role === "Doctor") return "bg-blue-100 text-blue-800"
    if (role === "Liaison Officer") return "bg-purple-100 text-purple-800"
    return "bg-gray-100 text-gray-800"
  }

  const getStatusColor = (status: string) => {
    return status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">User Management</h2>
          <p className="text-sm text-muted-foreground">Manage doctors and liaison officers</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700 gap-2">
              <Plus className="w-4 h-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>Create a new doctor or liaison officer in your hospital</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {error && <div className="p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Enter full name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger id="role">
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
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Add User"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {error && <div className="p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
            <div>
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                placeholder="Enter full name"
                value={editFormData.fullName}
                onChange={(e) => setEditFormData({...editFormData, fullName: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                placeholder="Enter email address"
                value={editFormData.email}
                onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit-role">Role</Label>
              <Select 
                value={editFormData.role} 
                onValueChange={(value) => setEditFormData({...editFormData, role: value})}
              >
                <SelectTrigger id="edit-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DOCTOR">Doctor</SelectItem>
                  <SelectItem value="LIAISON_OFFICER">Liaison Officer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-status">Status</Label>
              <Select 
                value={editFormData.isActive ? "active" : "inactive"} 
                onValueChange={(value) => setEditFormData({...editFormData, isActive: value === "active"})}
              >
                <SelectTrigger id="edit-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSaveEdit}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                onClick={() => {
                  setIsEditOpen(false)
                  setEditingUser(null)
                }}
                className="flex-1"
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Hospital Staff</CardTitle>
          <CardDescription>All doctors and liaison officers in your facility</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading users...</p>
            </div>
          ) : error && !users.length ? (
            <div className="text-center py-8">
              <p className="text-red-600">{error}</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No users found. Add your first user to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Role</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((userItem) => (
                    <tr key={userItem._id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4 text-sm">{userItem.fullName}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{userItem.email}</td>
                      <td className="py-3 px-4">
                        <Badge className={`${getRoleColor(userItem.role)} text-xs`}>{userItem.role}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={`${getStatusColor(userItem.status || "Active")} text-xs`}>
                          {userItem.status || "Active"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => handleEditClick(userItem)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                            onClick={() => {
                              if (userItem._id && confirm(`Delete ${userItem.fullName}?`)) {
                                handleDeleteUser(userItem._id)
                              }
                            }}
                            disabled={deletingUserId === userItem._id}
                          >
                            {deletingUserId === userItem._id ? (
                              <span className="animate-spin">↻</span>
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
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
    </div>
  )
}