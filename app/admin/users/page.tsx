"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useUsers, updateUserRole } from "@/hooks/use-users"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { format } from "date-fns"
import { formatTimestamp } from "@/lib/utils"
import { Search, MoreVertical, Shield, ShieldOff, Users } from "lucide-react"

export default function AdminUsersPage() {
  const { users, loading } = useUsers()
  const { user: currentUser } = useAuth()
  const [search, setSearch] = useState("")
  const [roleChange, setRoleChange] = useState<{ userId: string; newRole: "admin" | "user" } | null>(null)

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase()),
  )

  const handleRoleChange = async () => {
    if (!roleChange) return
    try {
      await updateUserRole(roleChange.userId, roleChange.newRole)
      toast.success(`User role updated to ${roleChange.newRole}`)
    } catch (error: any) {
      toast.error(error.message || "Failed to update role")
    } finally {
      setRoleChange(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold md:text-3xl">Users</h1>
          <p className="text-muted-foreground">Manage user accounts and roles</p>
        </div>
        <Skeleton className="h-10 max-w-md" />
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.05 }}
                >
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold md:text-3xl">Users</h1>
        <p className="text-muted-foreground">Manage user accounts and roles</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Users Table */}
      <AnimatePresence mode="wait">
        {filteredUsers.length > 0 ? (
          <motion.div
            key="users-table"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead className="hidden md:table-cell">Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead className="hidden md:table-cell">Joined</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user, index) => (
                        <tr
                          key={user.id}
                          className="border-b transition-colors hover:bg-muted/50"
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                                {user.name?.charAt(0).toUpperCase() || "U"}
                              </div>
                              <span className="font-medium">{user.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground">{user.email}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                user.role === "admin" ? "border-primary/50 text-primary" : "border-muted-foreground/50"
                              }
                            >
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                            {formatTimestamp(user.createdAt, (date) => format(date, "PP"))}
                          </TableCell>
                          <TableCell>
                            {user.id !== currentUser?.id && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {user.role === "user" ? (
                                    <DropdownMenuItem
                                      onClick={() => setRoleChange({ userId: user.id, newRole: "admin" })}
                                    >
                                      <Shield className="mr-2 h-4 w-4" />
                                      Make Admin
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem
                                      onClick={() => setRoleChange({ userId: user.id, newRole: "user" })}
                                    >
                                      <ShieldOff className="mr-2 h-4 w-4" />
                                      Remove Admin
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </TableCell>
                        </tr>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="empty-state"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Users className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">No Users Found</h3>
                <p className="text-muted-foreground">
                  {search ? "Try adjusting your search" : "Users will appear here when they sign up"}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Role Change Confirmation */}
      <AlertDialog open={!!roleChange} onOpenChange={() => setRoleChange(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change User Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to{" "}
              {roleChange?.newRole === "admin" ? "grant admin privileges to" : "remove admin privileges from"} this
              user?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRoleChange}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}
