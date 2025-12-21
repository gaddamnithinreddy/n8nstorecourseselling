"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { User, ShoppingBag, Download, Loader2 } from "lucide-react"

const sidebarLinks = [
  { href: "/dashboard", label: "Profile", icon: User },
  { href: "/dashboard/orders", label: "My Orders", icon: ShoppingBag },
  { href: "/dashboard/downloads", label: "My Downloads", icon: Download },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading your account...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-border bg-card/30 md:block sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
          <nav className="p-5">
            <div className="mb-6">
              <h2 className="text-lg font-semibold">My Account</h2>
              <p className="mt-1 truncate text-sm text-muted-foreground">{user.email}</p>
            </div>
            <ul className="space-y-1">
              {sidebarLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                      pathname === link.href
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Mobile Nav */}
        <div className="w-full md:hidden">
          <div className="border-b border-border bg-card/30 p-3">
            <div className="flex gap-2 overflow-x-auto scrollbar-none">
              {sidebarLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
                    pathname === link.href
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile Main Content */}
          <main className="p-4 sm:p-6 animate-fade-in">{children}</main>
        </div>

        {/* Desktop Main Content */}
        <main className="hidden flex-1 p-6 md:block lg:p-8 animate-fade-in">{children}</main>
      </div>

      <Footer />
    </div>
  )
}
