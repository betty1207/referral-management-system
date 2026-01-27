// app/layout.tsx
import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"

export const metadata: Metadata = {
  title: "MOH Referral Management System",
  description: "Ministry of Health Referral Management System",
  icons: {
    icon: '/moh.png',
    shortcut: '/moh.png',
    apple: '/moh.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body 
        className="font-sans antialiased" 
        suppressHydrationWarning
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}