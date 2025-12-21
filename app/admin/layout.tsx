"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  Zap,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  Ticket,
  Mail,
} from "lucide-react"
import { useState } from "react"

const sidebarLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/templates", label: "Templates", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/messages", label: "Messages", icon: Mail },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin, isWhitelistedAdmin, verifyingWhitelist, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push("/login")
    }
  }, [user, loading, isAdmin, router])

  // Show loading while auth is loading OR while verifying whitelist
  if (loading || verifyingWhitelist) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">
            {loading ? "Loading admin panel..." : "Verifying admin access..."}
          </p>
        </div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return null
  }

  // Check if admin is whitelisted
  if (isAdmin && !isWhitelistedAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="max-w-md rounded-lg border border-destructive/50 bg-destructive/10 p-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-destructive/20 p-4">
              <svg className="h-12 w-12 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <h2 className="mb-2 text-2xl font-bold text-destructive">Access Denied</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Your account does not have permission to access the admin dashboard. Please contact the system administrator to request access.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/")}
              className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              Go to Home
            </button>
            <button
              onClick={() => signOut()}
              className="flex-1 rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card transition-transform duration-300 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold">Admin</span>
          </Link>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-1">
            {sidebarLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href))
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  <link.icon className="h-5 w-5" />
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </ScrollArea>

        {/* User Section */}
        <div className="border-t border-border p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 bg-transparent" asChild>
              <Link href="/">
                <ChevronLeft className="mr-1 h-4 w-4" />
                Store
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => signOut()}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Mobile Header */}
        <header className="flex h-16 items-center gap-4 border-b border-border px-4 lg:hidden">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-display text-lg font-bold">Admin Panel</span>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="container mx-auto p-4 md:p-6 lg:p-8"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
