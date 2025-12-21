"use client"

import { useAuth } from "@/contexts/auth-context"
import { useOrders } from "@/hooks/use-orders"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Download, AlertCircle, RefreshCw, FileDown, Clock } from "lucide-react"
import { format } from "date-fns"
import { formatTimestamp, isTimestampExpired } from "@/lib/utils"

export default function DownloadsPage() {
  const { user } = useAuth()
  const { orders, loading, refetch } = useOrders(user?.id)

  const paidOrders = orders.filter((order) => order.status === "paid")

  const downloads = paidOrders.flatMap((order) =>
    order.templates.map((template, index) => ({
      ...template,
      orderId: order.id,
      token: order.downloadTokens?.[index]?.token,
      expiresAt: order.downloadTokens?.[index]?.expiresAt,
      purchasedAt: order.createdAt,
    })),
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Downloads</h1>
          <p className="text-muted-foreground">Download your purchased templates</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-9 w-28" />
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
          <h1 className="text-2xl font-bold">My Downloads</h1>
          <p className="text-sm text-muted-foreground">Download your purchased templates</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {downloads.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {downloads.map((download, index) => {
            const expired = isTimestampExpired(download.expiresAt)
            return (
              <Card
                key={`${download.orderId}-${index}`}
                className="overflow-hidden transition-all hover:shadow-md"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-start gap-2 text-base">
                    <FileDown className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {download.templateTitle}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Purchased {formatTimestamp(download.purchasedAt, (date) => format(date, "PP"))}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between gap-4">
                    {expired ? (
                      <div className="flex items-center gap-2 text-sm text-destructive">
                        <AlertCircle className="h-4 w-4" />
                        <span>Link expired</span>
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-xs font-normal">
                        Expires {formatTimestamp(download.expiresAt, (date) => format(date, "PP"))}
                      </Badge>
                    )}
                    <Button size="sm" disabled={expired} asChild={!expired}>
                      {expired ? (
                        <span className="cursor-not-allowed">
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Request New
                        </span>
                      ) : (
                        <a href={`/api/downloads/${download.token}`} download>
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </a>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 rounded-full bg-muted p-4">
              <Download className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">No Downloads Yet</h3>
            <p className="text-center text-sm text-muted-foreground">Purchase a template to see your downloads here.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
