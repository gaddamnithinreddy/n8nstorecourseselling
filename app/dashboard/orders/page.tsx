"use client"

import { useAuth } from "@/contexts/auth-context"
import { useOrders } from "@/hooks/use-orders"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ShoppingBag, RefreshCw } from "lucide-react"
import { format } from "date-fns"
import { formatTimestamp } from "@/lib/utils"

export default function OrdersPage() {
  const { user } = useAuth()
  const { orders, loading, refetch } = useOrders()

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      paid: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
      created: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
      failed: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
      refunded: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    }
    return styles[status] || "bg-muted text-muted-foreground"
  }

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(price)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">My Orders</h1>
            <p className="text-muted-foreground">View your purchase history</p>
          </div>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Orders</h1>
          <p className="text-sm text-muted-foreground">View your purchase history</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order, index) => (
            <Card
              key={order.id}
              className="overflow-hidden transition-all hover:shadow-md"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold">
                      Order #{order.id.slice(0, 8).toUpperCase()}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {formatTimestamp(order.createdAt, (date) => format(date, "PPP 'at' p"))}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className={getStatusBadge(order.status)}>
                    {order.status === 'created' ? 'Pending Payment' : order.status === 'paid' ? 'Paid' : order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {order.templates.map((template) => (
                    <div key={template.templateId} className="flex items-center justify-between text-sm">
                      <span className="font-medium">{template.templateTitle}</span>
                      <span className="text-muted-foreground">
                        {formatPrice(template.priceAtPurchase, order.currency)}
                      </span>
                    </div>
                  ))}
                  <div className="mt-3 border-t border-border pt-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Total</span>
                      <span className="text-lg font-bold text-primary">
                        {formatPrice(order.totalAmount, order.currency)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 rounded-full bg-muted p-4">
              <ShoppingBag className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">No Orders Yet</h3>
            <p className="text-center text-sm text-muted-foreground">
              Your purchase history will appear here once you buy a template.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
