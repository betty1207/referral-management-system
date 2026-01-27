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
      <DialogContent className="bg-white border-gray-200 shadow-lg max-w-md">
        <DialogHeader className="pb-4 border-b border-gray-100">
          <DialogTitle className="text-xl font-semibold text-gray-800">Create Hospital Admin</DialogTitle>
          <DialogDescription className="text-gray-600">
            Add a new hospital administrator for this facility.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="admin-fullName" className="text-sm font-medium text-gray-700">
              Full Name
            </Label>
            <Input
              id="admin-fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Abebe Kebede"
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-email" className="text-sm font-medium text-gray-700">
              Email
            </Label>
            <Input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@hospital.com"
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-password" className="text-sm font-medium text-gray-700">
              Password (optional)
            </Label>
            <Input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave empty to use default"
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-10"
            />
            <p className="text-xs text-gray-500">
              If left empty, a secure default password will be generated
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              disabled={isSubmitting}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-800"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || !fullName.trim() || !email.trim()}
              className="bg-blue-600 text-white hover:bg-blue-700 font-medium"
            >
              {isSubmitting ? "Creating..." : "Create Admin"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


