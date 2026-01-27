"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface HospitalAdmin {
  _id: string
  fullName: string
  email: string
  isActive: boolean
}

interface EditAdminModalProps {
  admin: HospitalAdmin
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: { fullName?: string; email?: string; isActive?: boolean }) => void | Promise<void>
}

export function EditAdminModal({ admin, open, onOpenChange, onSubmit }: EditAdminModalProps) {
  const [fullName, setFullName] = useState(admin.fullName || "")
  const [email, setEmail] = useState(admin.email || "")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setFullName(admin.fullName || "")
      setEmail(admin.email || "")
      setIsSubmitting(false)
    }
  }, [open, admin._id, admin.fullName, admin.email])

  const handleSubmit = async () => {
    const updates: { fullName?: string; email?: string } = {}
    if (fullName.trim() && fullName.trim() !== admin.fullName) updates.fullName = fullName.trim()
    if (email.trim() && email.trim() !== admin.email) updates.email = email.trim()

    if (Object.keys(updates).length === 0) {
      onOpenChange(false)
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(updates)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Hospital Admin</DialogTitle>
          <DialogDescription>Update the administrator's profile information.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-admin-fullName">Full Name</Label>
            <Input
              id="edit-admin-fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-admin-email">Email</Label>
            <Input
              id="edit-admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || !fullName.trim() || !email.trim()}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


