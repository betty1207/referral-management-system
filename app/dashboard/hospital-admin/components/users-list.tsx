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

    if (!confirm("Are you sure you want to delete this user?")) {
      return
    }

    try {
      setError("")
      await apiClient.deleteUser(userId)
      await fetchUsers()
    } catch (err: any) {
      console.error("Error deleting user:", err)
      setError(err.message || "Failed to delete user")
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
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Hospital Staff</CardTitle>
          <CardDescription>All users in your facility</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No users found</div>
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
                        <Badge className={`${getRoleColor(userItem.role)} text-xs`}>
                          {getRoleLabel(userItem.role)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={`${getStatusColor(userItem.isActive)} text-xs`}>
                          {userItem.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleToggleActive(userItem._id, userItem.isActive)}
                            title={userItem.isActive ? "Deactivate" : "Activate"}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                            onClick={() => handleDeleteUser(userItem._id)}
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
    </div>
  )
}
