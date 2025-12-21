"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { useTemplates } from "@/hooks/use-templates"
import { useOrders } from "@/hooks/use-orders"
import { useUsers } from "@/hooks/use-users"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { cn, formatTimestamp } from "@/lib/utils"
import { IndianRupee, Package, ShoppingCart, Users, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { format } from "date-fns"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

export default function AdminDashboardPage() {
  const { templates, loading: templatesLoading } = useTemplates(false)
  const { orders, loading: ordersLoading } = useOrders(true) // Fetch all orders for admin
  const { users, loading: usersLoading } = useUsers()

  const loading = templatesLoading || ordersLoading || usersLoading

  // Calculate stats
  const stats = useMemo(() => {
    const paidOrders = orders.filter((o) => o.status === "paid")
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0)
    const activeTemplates = templates.filter((t) => t.isAvailable).length

    return {
      totalRevenue,
      totalOrders: paidOrders.length,
      totalUsers: users.length,
      activeTemplates,
    }
  }, [orders, templates, users])

  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return {
        date: format(date, "MMM dd"),
        fullDate: format(date, "yyyy-MM-dd"),
        revenue: 0,
        orders: 0,
      }
    })

    orders
      .filter((o) => o.status === "paid" && o.createdAt)
      .forEach((order) => {
        const orderDate = formatTimestamp(order.createdAt, (date) => format(date, "yyyy-MM-dd"), null)
        if (orderDate) {
          const dayData = last7Days.find((d) => d.fullDate === orderDate)
          if (dayData) {
            dayData.revenue += order.totalAmount
            dayData.orders += 1
          }
        }
      })

    return last7Days
  }, [orders])

  // Top selling templates
  const topTemplates = useMemo(() => {
    return [...templates].sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0)).slice(0, 5)
  }, [templates])

  // Recent orders
  const recentOrders = useMemo(() => {
    return orders.slice(0, 5)
  }, [orders])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price)
  }

  const statCards = [
    {
      title: "Total Revenue",
      value: formatPrice(stats.totalRevenue),
      icon: IndianRupee,
      trend: "+12%",
      trendUp: true,
    },
    {
      title: "Total Orders",
      value: stats.totalOrders.toString(),
      icon: ShoppingCart,
      trend: "+8%",
      trendUp: true,
    },
    {
      title: "Total Users",
      value: stats.totalUsers.toString(),
      icon: Users,
      trend: "+15%",
      trendUp: true,
    },
    {
      title: "Active Templates",
      value: stats.activeTemplates.toString(),
      icon: Package,
      trend: `${templates.length} total`,
      trendUp: null,
    },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold md:text-3xl">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's an overview of your store.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-32" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-56" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[250px] w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-56" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[250px] w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold md:text-3xl">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's an overview of your store.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <stat.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  {stat.trendUp !== null && (
                    <span
                      className={cn(
                        "flex items-center text-xs font-medium",
                        stat.trendUp ? "text-green-500" : "text-red-500",
                      )}
                    >
                      {stat.trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {stat.trend}
                    </span>
                  )}
                  {stat.trendUp === null && <span className="text-xs text-muted-foreground">{stat.trend}</span>}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Revenue Overview
              </CardTitle>
              <CardDescription>Daily revenue for the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="date" tick={{ fill: "#a1a1aa", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#a1a1aa", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18181b",
                      border: "1px solid #27272a",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [formatPrice(value), "Revenue"]}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#f97316" fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Orders Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Orders Overview
              </CardTitle>
              <CardDescription>Daily orders for the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="date" tick={{ fill: "#a1a1aa", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#a1a1aa", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18181b",
                      border: "1px solid #27272a",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="orders" fill="#f97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Selling Templates */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Templates</CardTitle>
              <CardDescription>Best performing templates by sales</CardDescription>
            </CardHeader>
            <CardContent>
              {topTemplates.length > 0 ? (
                <div className="space-y-4">
                  {topTemplates.map((template, index) => (
                    <motion.div
                      key={template.id}
                      className="flex items-center gap-4"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-sm font-medium">
                        {index + 1}
                      </span>
                      <div className="flex-1 overflow-hidden">
                        <p className="truncate font-medium">{template.title}</p>
                        <p className="text-sm text-muted-foreground">{template.salesCount || 0} sales</p>
                      </div>
                      <p className="font-semibold text-primary">{formatPrice(template.price)}</p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-muted-foreground">No sales data yet</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest orders from your store</CardDescription>
            </CardHeader>
            <CardContent>
              {recentOrders.length > 0 ? (
                <div className="space-y-4">
                  {recentOrders.map((order, index) => (
                    <motion.div
                      key={order.id}
                      className="flex items-center gap-4"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-sm font-medium">
                        {order.userName?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="truncate font-medium">{order.userName}</p>
                        <p className="truncate text-sm text-muted-foreground">
                          {order.templates.map((t) => t.templateTitle).join(", ")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatPrice(order.totalAmount)}</p>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            order.status === "paid" && "border-green-500/50 text-green-500",
                            order.status === "failed" && "border-red-500/50 text-red-500",
                            order.status === "created" && "border-yellow-500/50 text-yellow-500",
                          )}
                        >
                          {order.status}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-muted-foreground">No orders yet</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
