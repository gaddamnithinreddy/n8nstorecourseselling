"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useSettings } from "@/hooks/use-settings"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Zap, User, LogOut, LayoutDashboard, Download, ShoppingBag } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

export function Navbar() {
  const { user, signOut, isAdmin, loading } = useAuth()
  const { settings } = useSettings()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/templates", label: "Templates" },
    { href: "/contact", label: "Contact" },
  ]

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <>
      <motion.header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300",
          scrolled
            ? "border-b border-border bg-background/95 backdrop-blur-lg shadow-sm"
            : "border-b border-transparent bg-background/80 backdrop-blur-sm",
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <nav className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-6">
          <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
            {settings?.logoUrl ? (
              <div className="relative h-9 w-9 overflow-hidden rounded-lg shadow-sm">
                <Image src={settings.logoUrl} alt={settings.siteName} fill className="object-cover" />
              </div>
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary shadow-sm">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
            )}
            <span className="text-xl font-bold tracking-tight">
              {settings?.siteName || "n8n Store"}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
                  mounted && pathname === link.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Auth & Theme Toggle */}
          <div className="hidden items-center gap-3 md:flex">
            <ThemeToggle />

            {loading ? (
              <div className="h-9 w-24 animate-pulse rounded-lg bg-muted" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full ring-offset-background transition-all hover:ring-2 hover:ring-primary/20"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary text-sm font-semibold text-primary-foreground">
                        {user.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 animate-scale-in" align="end" forceMount>
                  <div className="flex flex-col space-y-1 p-3">
                    <p className="text-sm font-semibold">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  {isAdmin && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex cursor-pointer items-center">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex cursor-pointer items-center">
                      <User className="mr-2 h-4 w-4" />
                      My Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/orders" className="flex cursor-pointer items-center">
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/downloads" className="flex cursor-pointer items-center">
                      <Download className="mr-2 h-4 w-4" />
                      My Downloads
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut()}
                    className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/signup">Get Started</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              <div className="relative h-5 w-5">
                <motion.span
                  className="absolute left-0 h-0.5 w-5 bg-current"
                  animate={{
                    top: mobileMenuOpen ? "50%" : "25%",
                    rotate: mobileMenuOpen ? 45 : 0,
                    y: mobileMenuOpen ? "-50%" : 0
                  }}
                  transition={{ duration: 0.2 }}
                />
                <motion.span
                  className="absolute left-0 top-1/2 h-0.5 w-5 bg-current -translate-y-1/2"
                  animate={{ opacity: mobileMenuOpen ? 0 : 1 }}
                  transition={{ duration: 0.2 }}
                />
                <motion.span
                  className="absolute left-0 h-0.5 w-5 bg-current"
                  animate={{
                    top: mobileMenuOpen ? "50%" : "75%",
                    rotate: mobileMenuOpen ? -45 : 0,
                    y: mobileMenuOpen ? "-50%" : 0
                  }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            </Button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 top-16 z-40 bg-background/80 backdrop-blur-sm md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Mobile Menu */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed left-0 right-0 top-16 z-50 border-b border-border bg-background shadow-lg md:hidden"
              onClick={(e) => e.stopPropagation()}
              style={{ maxHeight: "calc(100vh - 4rem)", overflowY: "auto" }}
            >
              <div className="container mx-auto px-4 py-4">
                <div className="space-y-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "block rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                        mounted && pathname === link.href
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-muted",
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}

                  <div className="my-3 border-t border-border" />

                  {loading ? (
                    <div className="space-y-2 px-4 py-2">
                      <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                      <div className="h-3 w-32 animate-pulse rounded bg-muted" />
                    </div>
                  ) : user ? (
                    <>
                      <div className="px-4 py-3">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>

                      <Link
                        href="/dashboard"
                        className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-muted"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Link>

                      <Link
                        href="/dashboard/orders"
                        className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-muted"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <ShoppingBag className="h-4 w-4" />
                        My Orders
                      </Link>

                      <Link
                        href="/dashboard/downloads"
                        className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-muted"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Download className="h-4 w-4" />
                        Downloads
                      </Link>

                      {isAdmin && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          Admin Panel
                        </Link>
                      )}

                      <div className="my-2 border-t border-border" />

                      <button
                        onClick={() => {
                          signOut()
                          setMobileMenuOpen(false)
                        }}
                        className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <Link
                        href="/login"
                        className="block rounded-lg px-4 py-3 text-center text-sm font-medium transition-colors hover:bg-muted"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/signup"
                        className="block rounded-lg bg-primary px-4 py-3 text-center text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Get Started
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
