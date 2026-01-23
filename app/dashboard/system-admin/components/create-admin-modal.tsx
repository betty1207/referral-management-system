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

interface CreateAdminModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: { fullName: string; email: string; password?: string }) => void | Promise<void>
  hospitalId: string
}

export function CreateAdminModal({ open, onOpenChange, onSubmit }: CreateAdminModalProps) {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!open) {
      setFullName("")
      setEmail("")
      setPassword("")
      setIsSubmitting(false)
    }
  }, [open])

  const handleSubmit = async () => {
    if (!fullName.trim() || !email.trim()) return
    setIsSubmitting(true)
    try {
      await onSubmit({ fullName: fullName.trim(), email: email.trim(), password: password.trim() || undefined })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Hospital Admin</DialogTitle>
          <DialogDescription>Add a new hospital administrator for this facility.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-fullName">Full Name</Label>
            <Input
              id="admin-fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Abebe Kebede"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-email">Email</Label>
            <Input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@hospital.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-password">Password (optional)</Label>
            <Input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave empty to use default"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || !fullName.trim() || !email.trim()}>
              {isSubmitting ? "Creating..." : "Create"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


