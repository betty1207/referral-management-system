// components/ui/nav-link.tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface NavLinkProps extends React.ComponentProps<typeof Link> {
  children: React.ReactNode
  href: string
  exact?: boolean
  icon?: React.ReactNode
}

export function NavLink({ 
  children, 
  href, 
  exact = false, 
  className, 
  icon,
  ...props 
}: NavLinkProps) {
  const pathname = usePathname()
  
  // Check if the link is active
  const isActive = exact 
    ? pathname === href
    : pathname.startsWith(href)

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground",
        isActive 
          ? "bg-accent text-accent-foreground font-medium" 
          : "text-muted-foreground",
        className
      )}
      {...props}
    >
      {icon && <span className="h-4 w-4">{icon}</span>}
      {children}
    </Link>
  )
}