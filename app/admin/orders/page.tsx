"use client"

import { useState } from "react"
import { useOrders } from "@/hooks/use-orders"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { format } from "date-fns"
import { formatTimestamp } from "@/lib/utils"
import { Search, MoreVertical, Mail, RefreshCw, ShoppingCart } from "lucide-react"
import type { Order } from "@/lib/firebase/types"

export default function AdminOrdersPage() {
  const { orders, loading } = useOrders(true) // Fetch all orders for admin
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.userName?.toLowerCase().includes(search.toLowerCase()) ||
      order.userEmail?.toLowerCase().includes(search.toLowerCase()) ||
      order.id.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleStatusChange = async (orderId: string, newStatus: Order["status"]) => {
    // TODO: Implement updateOrderStatus API endpoint
    toast.info("Status update feature coming soon")
    console.log(`Would update order ${orderId} to ${newStatus}`)
  }

  const handleResendEmail = async (orderId: string) => {
    try {
      const response = await fetch("/api/orders/resend-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      })
      if (response.ok) {
        toast.success("Email sent successfully")
      } else {
        throw new Error("Failed to send email")
      }
    } catch {
      toast.error("Failed to resend email")
    }
  }

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      paid: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
      created: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
      failed: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
      refunded: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    }
    return styles[status] || "bg-muted text-muted-foreground"
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Orders</h1>
          <p className="text-muted-foreground">Manage customer orders and payments</p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-full sm:w-[180px]" />
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-12 w-24" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-8 w-8" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">Orders</h1>
        <p className="text-muted-foreground">Manage customer orders and payments</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="created">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredOrders.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead className="hidden md:table-cell">Customer</TableHead>
                    <TableHead className="hidden lg:table-cell">Templates</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Date</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs">{order.id.slice(0, 8).toUpperCase()}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div>
                          <p className="font-medium">{order.userName}</p>
                          <p className="text-xs text-muted-foreground">{order.userEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="max-w-[200px]">
                          {order.templates.map((t) => (
                            <p key={t.templateId} className="truncate text-sm">
                              {t.templateTitle}
                            </p>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">{formatPrice(order.totalAmount, order.currency)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusBadge(order.status)}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        {formatTimestamp(order.createdAt, (date) => format(date, "PP"))}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {order.status === "paid" && (
                              <DropdownMenuItem onClick={() => handleResendEmail(order.id)}>
                                <Mail className="mr-2 h-4 w-4" />
                                Resend Email
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(order.id, "refunded")}
                              disabled={order.status !== "paid"}
                            >
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Mark Refunded
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ShoppingCart className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="mb-2 text-lg font-semibold">No Orders Found</h3>
            <p className="text-muted-foreground">
              {search || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "Orders will appear here when customers make purchases"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
