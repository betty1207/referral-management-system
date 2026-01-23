"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Filter, 
  User, 
  Clock, 
  Stethoscope,
  AlertCircle,
  ChevronRight
} from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Mock data - from YOUR doctors to YOU
const mockReferrals = [
  {
    id: "REF-001",
    patientName: "John Doe",
    patientAge: 45,
    patientGender: "Male",
    doctorName: "Dr. Smith",
    department: "Cardiology",
    priority: "High",
    submittedDate: "2024-01-15",
    status: "pending",
    notes: "Needs urgent cardiology consultation",
  },
  {
    id: "REF-002", 
    patientName: "Jane Smith",
    patientAge: 32,
    patientGender: "Female",
    doctorName: "Dr. Johnson",
    department: "Neurology",
    priority: "Medium",
    submittedDate: "2024-01-15",
    status: "pending",
    notes: "MRI results available",
  },
  {
    id: "REF-003",
    patientName: "Mike Brown",
    patientAge: 58,
    patientGender: "Male",
    doctorName: "Dr. Williams",
    department: "Orthopedics",
    priority: "Low",
    submittedDate: "2024-01-14",
    status: "pending",
    notes: "Routine follow-up",
  },
  {
    id: "REF-004",
    patientName: "Sarah Lee",
    patientAge: 29,
    patientGender: "Female",
    doctorName: "Dr. Chen",
    department: "Pediatrics",
    priority: "High",
    submittedDate: "2024-01-14",
    status: "pending",
    notes: "Pediatric emergency",
  },
]

interface IncomingReferralsProps {
  onSelectReferral: (referralId: string) => void
}

export function IncomingReferrals({ onSelectReferral }: IncomingReferralsProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterDepartment, setFilterDepartment] = useState("all")
  const [filterPriority, setFilterPriority] = useState("all")

  // Filter referrals
  const filteredReferrals = mockReferrals.filter((referral) => {
    const matchesSearch = 
      referral.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.id.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesDepartment = 
      filterDepartment === "all" || referral.department === filterDepartment
    
    const matchesPriority = 
      filterPriority === "all" || referral.priority.toLowerCase() === filterPriority

    return matchesSearch && matchesDepartment && matchesPriority
  })

  // Get priority badge color
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high": return "bg-red-100 text-red-800"
      case "medium": return "bg-amber-100 text-amber-800"
      case "low": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const filteredReferrals = referrals.filter((referral) => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      referral.patientName?.toLowerCase().includes(searchLower) ||
      referral._id?.toLowerCase().includes(searchLower) ||
      getHospitalName(referral.fromHospital).toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Incoming Referrals</h1>
        <p className="text-gray-600">
          Review referrals from doctors in your hospital. Click any to approve or reject.
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by patient, doctor, or ID..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Department Filter */}
            <div className="w-full md:w-48">
              <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="Cardiology">Cardiology</SelectItem>
                  <SelectItem value="Neurology">Neurology</SelectItem>
                  <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                  <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Priority Filter */}
            <div className="w-full md:w-48">
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger>
                  <AlertCircle className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referrals List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Referrals Awaiting Review ({filteredReferrals.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredReferrals.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No referrals match your filters</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReferrals.map((referral) => (
                <div
                  key={referral.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onSelectReferral(referral.id)}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Left: Patient Info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{referral.id}</Badge>
                        <Badge className={getPriorityColor(referral.priority)}>
                          {referral.priority} Priority
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="font-semibold">{referral.patientName}</span>
                          <span className="text-sm text-gray-600">
                            ({referral.patientAge}y, {referral.patientGender})
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Stethoscope className="w-4 h-4" />
                          <span>From: {referral.doctorName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>Submitted: {referral.submittedDate}</span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-700 mt-2">
                        <span className="font-medium">Department:</span> {referral.department}
                        {referral.notes && ` • ${referral.notes}`}
                      </p>
                    </div>

                    {/* Right: Action Button */}
                    <div className="flex items-center">
                      <Button variant="outline" className="gap-2">
                        Review Referral
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{mockReferrals.length}</p>
              <p className="text-sm text-gray-600">Total Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-600">
                {mockReferrals.filter(r => r.priority === "High").length}
              </p>
              <p className="text-sm text-gray-600">High Priority</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">
                {mockReferrals.filter(r => r.department === "Cardiology").length}
              </p>
              <p className="text-sm text-gray-600">Cardiology Cases</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}