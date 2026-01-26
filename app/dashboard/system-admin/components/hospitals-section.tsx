"use client"

import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Hospital, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Users, 
  FileText, 
  Loader2,
  AlertCircle,
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Building,
  UserCheck,
  UserX
} from "lucide-react"

interface Hospital {
  _id: string
  name: string
  email: string
  region?: string
  city?: string
  level?: string
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

interface NewHospital {
  name: string
  region: string
  city: string
  level: string
}

interface HospitalStats {
  adminCount: number
  doctorCount: number
  liaisonOfficerCount: number
  totalReferrals: number
  pendingReferrals: number
  approvedReferrals: number
  rejectedReferrals: number
}

export function HospitalsSection({ onSelectHospital }: { onSelectHospital: (id: string) => void }) {
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  
  // Create hospital states
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState("")
  const [createSuccess, setCreateSuccess] = useState("")
  const [newHospital, setNewHospital] = useState<NewHospital>({
    name: "",
    region: "",
    city: "",
    level: ""
  })
  
  // Hospital detail view states
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null)
  const [showEditForm, setShowEditForm] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isTogglingStatus, setIsTogglingStatus] = useState<string | null>(null)
  
  // Hospital statistics
  const [hospitalStats, setHospitalStats] = useState<Record<string, HospitalStats>>({})
  const [statsLoading, setStatsLoading] = useState(false)

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        setIsLoading(true)
        const response = await apiClient.getHospitals()
        const hospitalsData = response.data || response
        setHospitals(Array.isArray(hospitalsData) ? hospitalsData : [])
        setError("")
      } catch (err: any) {
        setError("Failed to load hospitals")
        console.error("Error fetching hospitals:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchHospitals()
  }, [])

  // Fetch hospital statistics
  const fetchHospitalStats = async (hospitalId: string) => {
    try {
      setStatsLoading(true)
      
      // Fetch all users and filter by hospital
      let adminCount = 0
      let doctorCount = 0
      let liaisonOfficerCount = 0
      
      try {
        const usersResponse = await apiClient.get('/users')
        const usersData = usersResponse.data || usersResponse
        const users = Array.isArray(usersData) ? usersData : []
        
        // Filter users by hospitalId
        const hospitalUsers = users.filter((u: any) => u.hospitalId === hospitalId)
        
        adminCount = hospitalUsers.filter((u: any) => u.role === "HOSPITAL_ADMIN").length
        doctorCount = hospitalUsers.filter((u: any) => u.role === "DOCTOR").length
        liaisonOfficerCount = hospitalUsers.filter((u: any) => u.role === "LIAISON_OFFICER").length
        
        console.log(`[Hospital Stats] Hospital ${hospitalId} users:`, {
          total: hospitalUsers.length,
          admins: adminCount,
          doctors: doctorCount,
          liaisonOfficers: liaisonOfficerCount
        })
      } catch (err) {
        console.error("Error fetching hospital users:", err)
      }
      
      // Fetch all referrals and filter by hospital
      let totalReferrals = 0
      let pendingReferrals = 0
      let approvedReferrals = 0
      let rejectedReferrals = 0
      
      try {
        const referralsResponse = await apiClient.get('/referrals')
        const referralsData = referralsResponse.data || referralsResponse
        const referrals = Array.isArray(referralsData) ? referralsData : []
        
        console.log(`[Hospital Stats] All referrals:`, referrals)
        console.log(`[Hospital Stats] Looking for hospitalId: ${hospitalId}`)
        console.log(`[Hospital Stats] Referral structure sample:`, referrals[0])
        
        // Try different field names for hospital association
        const hospitalReferrals = referrals.filter((r: any) => {
          // Check possible field names and log what we find
          const matches = r.fromHospital === hospitalId || 
                          r.hospitalId === hospitalId || 
                          r.hospital === hospitalId ||
                          (r.hospital && typeof r.hospital === 'object' && r.hospital._id === hospitalId) ||
                          (r.toHospital === hospitalId) || // Check if it's the destination hospital
                          (r.hospital && r.hospital.toString() === hospitalId)
          
          if (matches) {
            console.log(`[Hospital Stats] Match found:`, {
              referralId: r._id,
              fromHospital: r.fromHospital,
              hospitalId: r.hospitalId,
              hospital: r.hospital,
              toHospital: r.toHospital,
              status: r.status
            })
          }
          
          return matches
        })
        
        console.log(`[Hospital Stats] Filtered referrals for hospital ${hospitalId}:`, hospitalReferrals)
        
        totalReferrals = hospitalReferrals.length
        
        // Check different status field names and values
        pendingReferrals = hospitalReferrals.filter((r: any) => {
          const status = r.status?.toUpperCase() || r.status
          return status === "PENDING" || status === "pending"
        }).length
        
        approvedReferrals = hospitalReferrals.filter((r: any) => {
          const status = r.status?.toUpperCase() || r.status
          return status === "APPROVED" || status === "approved"
        }).length
        
        rejectedReferrals = hospitalReferrals.filter((r: any) => {
          const status = r.status?.toUpperCase() || r.status
          return status === "REJECTED" || status === "rejected"
        }).length
        
        console.log(`[Hospital Stats] Hospital ${hospitalId} referrals:`, {
          total: totalReferrals,
          pending: pendingReferrals,
          approved: approvedReferrals,
          rejected: rejectedReferrals,
          allStatuses: hospitalReferrals.map(r => ({ 
            id: r._id, 
            status: r.status,
            statusUpper: r.status?.toUpperCase(),
            hospital: r.fromHospital || r.hospitalId || r.hospital || r.toHospital 
          }))
        })
      } catch (err) {
        console.error("Error fetching hospital referrals:", err)
      }
      
      setHospitalStats(prev => ({
        ...prev,
        [hospitalId]: {
          adminCount,
          doctorCount,
          liaisonOfficerCount,
          totalReferrals,
          pendingReferrals,
          approvedReferrals,
          rejectedReferrals
        }
      }))
    } catch (err) {
      console.error("Error fetching hospital stats:", err)
    } finally {
      setStatsLoading(false)
    }
  }

  // Create hospital
  const handleCreateHospital = async () => {
    if (!newHospital.name || !newHospital.region || !newHospital.city || !newHospital.level) {
      setCreateError("Please fill in all required fields")
      return
    }

    setIsCreating(true)
    setCreateError("")
    setCreateSuccess("")

    try {
      const response = await apiClient.post('/hospitals', newHospital)
      console.log("[Create Hospital] Response:", response)
      
      setCreateSuccess(`Hospital "${newHospital.name}" created successfully!`)
      
      // Refresh hospitals list
      const hospitalsResponse = await apiClient.getHospitals()
      const hospitalsData = hospitalsResponse.data || hospitalsResponse
      setHospitals(Array.isArray(hospitalsData) ? hospitalsData : [])
      
      // Reset form
      setNewHospital({ name: "", region: "", city: "", level: "" })
      setShowCreateForm(false)
    } catch (err: any) {
      console.error("[Create Hospital] Error:", err)
      setCreateError(err.message || "Failed to create hospital")
    } finally {
      setIsCreating(false)
    }
  }

  // Update hospital
  const handleUpdateHospital = async () => {
    if (!selectedHospital) return

    setIsUpdating(true)
    setError("")

    try {
      const updateData = {
        name: newHospital.name,
        region: newHospital.region,
        city: newHospital.city,
        level: newHospital.level
      }
      
      const response = await apiClient.patch(`/hospitals/${selectedHospital._id}`, updateData)
      console.log("[Update Hospital] Response:", response)
      
      // Update hospitals list
      const updatedHospitals = hospitals.map(h => 
        h._id === selectedHospital._id 
          ? { ...h, ...updateData, updatedAt: new Date().toISOString() }
          : h
      )
      setHospitals(updatedHospitals)
      
      // Update selected hospital
      setSelectedHospital({ ...selectedHospital, ...updateData })
      setShowEditForm(false)
    } catch (err: any) {
      console.error("[Update Hospital] Error:", err)
      setError(err.message || "Failed to update hospital")
    } finally {
      setIsUpdating(false)
    }
  }

  // Toggle hospital status
  const handleToggleHospitalStatus = async (hospitalId: string, currentStatus: boolean) => {
    setIsTogglingStatus(hospitalId)
    setError("")
    
    try {
      const response = await apiClient.patch(`/hospitals/${hospitalId}`, {
        isActive: !currentStatus
      })
      
      // Update local state
      const updatedHospitals = hospitals.map(h => 
        h._id === hospitalId 
          ? { ...h, isActive: !currentStatus, updatedAt: new Date().toISOString() }
          : h
      )
      setHospitals(updatedHospitals)
      
      if (selectedHospital?._id === hospitalId) {
        setSelectedHospital({ ...selectedHospital, isActive: !currentStatus })
      }
    } catch (err: any) {
      console.error("[Toggle Status] Error:", err)
      setError(err.message || "Failed to update hospital status")
    } finally {
      setIsTogglingStatus(null)
    }
  }

  // View hospital details
  const handleViewHospitalDetails = (hospital: Hospital) => {
    setSelectedHospital(hospital)
    setNewHospital({
      name: hospital.name,
      region: hospital.region || "",
      city: hospital.city || "",
      level: hospital.level || ""
    })
    fetchHospitalStats(hospital._id)
  }

  // Back to list
  const handleBackToList = () => {
    setSelectedHospital(null)
    setShowEditForm(false)
  }

  // Hospital detail view
  if (selectedHospital) {
    const stats = hospitalStats[selectedHospital._id]
    
    if (showEditForm) {
      return (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={handleBackToList}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <CardTitle>Edit Hospital</CardTitle>
                <CardDescription>Update hospital information</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Hospital Name *</label>
                <input
                  type="text"
                  value={newHospital.name}
                  onChange={(e) => setNewHospital({ ...newHospital, name: e.target.value })}
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter hospital name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Region *</label>
                <input
                  type="text"
                  value={newHospital.region}
                  onChange={(e) => setNewHospital({ ...newHospital, region: e.target.value })}
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter region"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">City *</label>
                <input
                  type="text"
                  value={newHospital.city}
                  onChange={(e) => setNewHospital({ ...newHospital, city: e.target.value })}
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter city"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Level *</label>
                <input
                  type="text"
                  value={newHospital.level}
                  onChange={(e) => setNewHospital({ ...newHospital, level: e.target.value })}
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter hospital level"
                />
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <Button
                onClick={handleUpdateHospital}
                disabled={isUpdating}
                className="flex items-center gap-2"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4" />
                    Update Hospital
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowEditForm(false)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    }
    
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleBackToList}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Hospitals
            </Button>
            <div>
              <h2 className="text-2xl font-bold">{selectedHospital.name}</h2>
              <p className="text-muted-foreground">Hospital Details and Management</p>
            </div>
          </div>
          <Badge variant={selectedHospital.isActive !== false ? "default" : "secondary"}>
            {selectedHospital.isActive !== false ? "Active" : "Inactive"}
          </Badge>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Hospital Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Hospital Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <p className="font-semibold">{selectedHospital.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="font-semibold flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {selectedHospital.email}
                </p>
              </div>
              {selectedHospital.region && selectedHospital.city && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Location</label>
                  <p className="font-semibold flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {selectedHospital.city}, {selectedHospital.region}
                  </p>
                </div>
              )}
              {selectedHospital.level && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Level</label>
                  <p className="font-semibold">{selectedHospital.level}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="mt-1">
                  <Badge variant={selectedHospital.isActive !== false ? "default" : "secondary"}>
                    {selectedHospital.isActive !== false ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              {selectedHospital.createdAt && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created</label>
                  <p className="text-sm">{new Date(selectedHospital.createdAt).toLocaleDateString()}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Staff Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Assigned Staff
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading staff statistics...</div>
              ) : stats ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">Hospital Admins</span>
                    </div>
                    <span className="text-xl font-bold text-blue-600">{stats.adminCount}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-green-600" />
                      <span className="font-medium">Doctors</span>
                    </div>
                    <span className="text-xl font-bold text-green-600">{stats.doctorCount}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-600" />
                      <span className="font-medium">Liaison Officers</span>
                    </div>
                    <span className="text-xl font-bold text-purple-600">{stats.liaisonOfficerCount}</span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Total Staff</span>
                      <span className="text-xl font-bold">
                        {stats.adminCount + stats.doctorCount + stats.liaisonOfficerCount}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">No staff data available</div>
              )}
            </CardContent>
          </Card>

          {/* Referral Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Referral Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading referral statistics...</div>
              ) : stats ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-600" />
                      <span className="font-medium">Total Referrals</span>
                    </div>
                    <span className="text-xl font-bold text-indigo-600">{stats.totalReferrals}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-amber-600" />
                      <span className="font-medium">Pending</span>
                    </div>
                    <span className="text-xl font-bold text-amber-600">{stats.pendingReferrals}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-green-600" />
                      <span className="font-medium">Approved</span>
                    </div>
                    <span className="text-xl font-bold text-green-600">{stats.approvedReferrals}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <UserX className="w-4 h-4 text-red-600" />
                      <span className="font-medium">Rejected</span>
                    </div>
                    <span className="text-xl font-bold text-red-600">{stats.rejectedReferrals}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">No referral data available</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage hospital settings and staff</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={() => setShowEditForm(true)}
                className="flex items-center gap-2"
                variant="outline"
              >
                <Edit className="w-4 h-4" />
                Update Hospital Info
              </Button>
              <Button
                onClick={() => onSelectHospital(selectedHospital._id)}
                className="flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                Manage Hospital Admins
              </Button>
              <Button
                onClick={() => handleToggleHospitalStatus(selectedHospital._id, selectedHospital.isActive !== false)}
                disabled={isTogglingStatus === selectedHospital._id}
                variant={selectedHospital.isActive !== false ? "destructive" : "default"}
                className="flex items-center gap-2"
              >
                {isTogglingStatus === selectedHospital._id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : selectedHospital.isActive !== false ? (
                  <UserX className="w-4 h-4" />
                ) : (
                  <UserCheck className="w-4 h-4" />
                )}
                {selectedHospital.isActive !== false ? "Deactivate Hospital" : "Activate Hospital"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Hospitals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">Loading hospitals...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card id="hospitals">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Hospital className="w-5 h-5" />
                Hospitals
              </CardTitle>
              <CardDescription>Manage all hospitals in the system</CardDescription>
            </div>
            <Button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {showCreateForm ? "Cancel" : "Create Hospital"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm mb-4">{error}</div>}
          
          {/* Create Hospital Form */}
          {showCreateForm && (
            <Card className="mb-6 border-2 border-dashed border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg">Create New Hospital</CardTitle>
                <CardDescription>Fill in the hospital details below</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {createError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{createError}</AlertDescription>
                  </Alert>
                )}
                
                {createSuccess && (
                  <Alert className="border-green-200 bg-green-50 text-green-800">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{createSuccess}</AlertDescription>
                  </Alert>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Hospital Name *</label>
                    <input
                      type="text"
                      value={newHospital.name}
                      onChange={(e) => setNewHospital({ ...newHospital, name: e.target.value })}
                      className="w-full p-2 border rounded-md"
                      placeholder="Enter hospital name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Region *</label>
                    <input
                      type="text"
                      value={newHospital.region}
                      onChange={(e) => setNewHospital({ ...newHospital, region: e.target.value })}
                      className="w-full p-2 border rounded-md"
                      placeholder="Enter region"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">City *</label>
                    <input
                      type="text"
                      value={newHospital.city}
                      onChange={(e) => setNewHospital({ ...newHospital, city: e.target.value })}
                      className="w-full p-2 border rounded-md"
                      placeholder="Enter city"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Level *</label>
                    <input
                      type="text"
                      value={newHospital.level}
                      onChange={(e) => setNewHospital({ ...newHospital, level: e.target.value })}
                      className="w-full p-2 border rounded-md"
                      placeholder="Enter hospital level"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={handleCreateHospital}
                    disabled={isCreating}
                    className="flex items-center gap-2"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Create Hospital
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateForm(false)
                      setCreateError("")
                      setCreateSuccess("")
                      setNewHospital({
                        name: "",
                        region: "",
                        city: "",
                        level: ""
                      })
                    }}
                    disabled={isCreating}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Hospitals List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hospitals.length > 0 ? (
            hospitals.map((hospital) => {
              const stats = hospitalStats[hospital._id]
              return (
                <div
                  key={hospital._id}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">{hospital.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{hospital.email}</p>
                    </div>
                    <Badge variant={hospital.isActive !== false ? "default" : "secondary"}>
                      {hospital.isActive !== false ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1 mb-3">
                    {hospital.region && hospital.city && (
                      <p className="text-xs text-muted-foreground">
                        📍 {hospital.city}, {hospital.region}
                      </p>
                    )}
                    {hospital.level && (
                      <p className="text-xs text-muted-foreground">
                        🏥 Level: {hospital.level}
                      </p>
                    )}
                    {stats && (
                      <div className="text-xs text-muted-foreground">
                        👥 {stats.adminCount + stats.doctorCount + stats.liaisonOfficerCount} staff • 📋 {stats.totalReferrals} referrals
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => handleViewHospitalDetails(hospital)}
                    >
                      View Details
                    </Button>
                    <Button
                      size="sm"
                      variant="default"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectHospital(hospital._id)
                      }}
                    >
                      Manage Admins
                    </Button>
                    <Button
                      size="sm"
                      variant={hospital.isActive !== false ? "destructive" : "default"}
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleToggleHospitalStatus(hospital._id, hospital.isActive !== false)
                      }}
                      disabled={isTogglingStatus === hospital._id}
                    >
                      {isTogglingStatus === hospital._id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        hospital.isActive !== false ? "Deactivate" : "Activate"
                      )}
                    </Button>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              <Hospital className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="mb-2">No hospitals found</p>
              <p className="text-sm">Click "Create Hospital" to add the first hospital.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
    </>
  )
}
