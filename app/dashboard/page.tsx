"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useOrders } from "@/hooks/use-orders"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { EmailVerificationNotice } from "@/components/email-verification-notice"
import { format } from "date-fns"
import { formatTimestamp } from "@/lib/utils"
import { motion } from "framer-motion"
import { ShoppingBag, ArrowRight, Download, PackageOpen, CreditCard, Eye, FileText, Clock, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}


export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const { orders, loading: ordersLoading } = useOrders()
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [templateData, setTemplateData] = useState<Record<string, any>>({})

  // Fetch template data for all orders
  useEffect(() => {
    const fetchTemplateData = async () => {
      if (!orders || orders.length === 0) return

      const templateIds = new Set<string>()
      orders.forEach(order => {
        order.templates.forEach(t => templateIds.add(t.templateId))
      })

      const data: Record<string, any> = {}
      for (const templateId of templateIds) {
        try {
          const templateDoc = await getDoc(doc(db, "templates", templateId))
          if (templateDoc.exists()) {
            data[templateId] = { id: templateDoc.id, ...templateDoc.data() }
          }
        } catch (error) {
          console.error(`Error fetching template ${templateId}:`, error)
        }
      }
      setTemplateData(data)
    }

    fetchTemplateData()
  }, [orders])

  if (authLoading || ordersLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <div>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-36" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) return null

  const handleDownloadInvoice = async (order: any) => {
    const { generateInvoice } = await import("@/lib/invoice")

    generateInvoice({
      orderId: order.id,
      userName: user.name || "Customer",
      userEmail: user.email || "",
      date: order.createdAt,
      items: order.templates.map((t: any) => ({
        title: t.templateTitle,
        price: t.priceAtPurchase
      })),
      totalAmount: order.totalAmount,
      discountAmount: order.discountAmount,
      currency: order.currency
    })
  }

  const handleRetryPayment = async (order: any) => {
    // Get the template slug from fetched template data
    const templateId = order.templates[0]?.templateId
    const template = templateData[templateId]

    if (template?.slug) {
      window.location.href = `/templates/${template.slug}`
    } else {
      // Fallback to templates page if no slug available
      window.location.href = `/templates`
    }
  }

  const handleViewDetails = (order: any) => {
    setSelectedOrder(order)
    setShowDetailsModal(true)
  }

  return (
    <motion.div
      className="space-y-8 max-w-5xl mx-auto"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={item}>
        <h1 className="font-display text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back, manage your account and downloads.</p>
      </motion.div>

      {/* Email Verification Notice */}
      <motion.div variants={item}>
        <EmailVerificationNotice />
      </motion.div>

      <motion.div variants={item}>
        <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-card to-secondary/10">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:text-left">
              <Avatar className="h-24 w-24 ring-4 ring-background shadow-lg">
                <AvatarFallback className="bg-primary text-3xl font-bold text-primary-foreground">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 space-y-2 pt-2">
                <div className="flex flex-col items-center gap-2 sm:flex-row">
                  <h3 className="text-2xl font-bold truncate">{user.name}</h3>
                  <Badge variant="secondary" className="capitalize px-3 py-1">
                    {user.role}
                  </Badge>
                </div>
                <p className="text-muted-foreground font-medium">{user.email}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground pt-1">
                  <motion.span
                    className="inline-block w-2 h-2 rounded-full bg-green-500"
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                  Member since {formatTimestamp(user.createdAt, (date) => format(date, "MMMM yyyy"))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Orders / Downloads Section */}
      <motion.div variants={item} className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Your Orders</h2>

        {orders.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {orders.map((order) => (
              <Card key={order.id} id={`order-${order.id}`} className="group hover:shadow-lg transition-all duration-300 border-muted flex flex-col">
                <CardHeader className="p-5 pb-3">
                  <div className="flex justify-between items-start gap-2">
                    <Badge
                      variant="outline"
                      className={order.status === 'paid'
                        ? "bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 flex items-center gap-1"
                        : "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800 flex items-center gap-1"
                      }
                    >
                      {order.status === 'paid' ? (
                        <>
                          <Download className="h-3 w-3" />
                          Purchased
                        </>
                      ) : (
                        <>
                          <Clock className="h-3 w-3" />
                          Pending
                        </>
                      )}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-mono">
                      {formatTimestamp(order.createdAt, (date) => format(date, "MMM d, yyyy"))}
                    </span>
                  </div>
                  <CardTitle className="leading-snug pt-2 group-hover:text-primary transition-colors line-clamp-2">
                    {order.templates[0]?.templateTitle || "Order"}
                  </CardTitle>
                  <CardDescription className="font-mono text-xs">#{order.id.slice(0, 8)}</CardDescription>
                </CardHeader>
                <CardContent className="p-5 pt-2 flex-grow">
                  <div className="aspect-video relative rounded-md bg-muted overflow-hidden mb-4 group-hover:scale-[1.02] transition-transform duration-500">
                    {(() => {
                      const templateId = order.templates[0]?.templateId
                      const template = templateData[templateId]
                      return template?.thumbnailUrl ? (
                        <Image
                          src={template.thumbnailUrl}
                          alt={order.templates[0]?.templateTitle || "Template"}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/20">
                          <PackageOpen className="w-12 h-12" />
                        </div>
                      )
                    })()}
                  </div>
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span>Total</span>
                    <span>{order.currency} {order.totalAmount}</span>
                  </div>
                </CardContent>
                <CardFooter className="p-5 pt-0 flex flex-col gap-2">
                  {order.status === 'paid' ? (
                    <>
                      <Button className="w-full gap-2 shadow-sm" asChild>
                        <Link href="/dashboard/downloads">
                          <Download className="w-4 h-4" />
                          Download Files
                        </Link>
                      </Button>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => handleViewDetails(order)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => handleDownloadInvoice(order)}
                        >
                          <FileText className="w-3 h-3 mr-1" />
                          Invoice
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Button
                        className="w-full gap-2 bg-primary hover:bg-primary/90"
                        onClick={() => handleRetryPayment(order)}
                      >
                        <CreditCard className="w-4 h-4" />
                        Resume Payment
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => handleViewDetails(order)}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View Details
                      </Button>
                    </>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed border-2 bg-muted/30">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-background p-4 shadow-sm mb-4">
                <ShoppingBag className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
              <p className="text-muted-foreground max-w-sm mb-6">
                You haven't purchased any templates yet. Browse our collection to get started.
              </p>
              <Button asChild>
                <Link href="/templates">
                  Browse Templates
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Order Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Complete information about your order
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Status */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Order ID</p>
                  <p className="font-mono font-semibold">#{selectedOrder.id.slice(0, 12)}</p>
                </div>
                <Badge
                  variant="outline"
                  className={selectedOrder.status === 'paid'
                    ? "bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
                    : "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800"
                  }
                >
                  {selectedOrder.status === 'paid' ? 'Purchased' : 'Pending Payment'}
                </Badge>
              </div>

              {/* Order Date */}
              <div>
                <p className="text-sm text-muted-foreground">Order Date</p>
                <p className="font-medium">
                  {formatTimestamp(selectedOrder.createdAt, (date) => format(date, "MMMM d, yyyy 'at' h:mm a"))}
                </p>
              </div>

              {/* Templates */}
              <div>
                <p className="text-sm text-muted-foreground mb-3">Templates</p>
                <div className="space-y-2">
                  {selectedOrder.templates.map((template: any, index: number) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30">
                      <div className="flex-1">
                        <p className="font-medium">{template.templateTitle}</p>
                        <p className="text-sm text-muted-foreground">ID: {template.templateId}</p>
                      </div>
                      <p className="font-semibold">
                        {selectedOrder.currency} {template.priceAtPurchase}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Details */}
              <div className="space-y-2 border-t border-border pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{selectedOrder.currency} {selectedOrder.totalAmount + (selectedOrder.discountAmount || 0)}</span>
                </div>
                {selectedOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                    <span>Discount</span>
                    <span>-{selectedOrder.currency} {selectedOrder.discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-lg border-t border-border pt-2">
                  <span>Total</span>
                  <span>{selectedOrder.currency} {selectedOrder.totalAmount}</span>
                </div>
              </div>

              {/* Cashfree Order ID */}
              {selectedOrder.cashfreeOrderId && (
                <div>
                  <p className="text-sm text-muted-foreground">Payment Reference</p>
                  <p className="font-mono text-sm">{selectedOrder.cashfreeOrderId}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                {selectedOrder.status === 'paid' ? (
                  <>
                    <Button className="flex-1" asChild>
                      <Link href="/dashboard/downloads">
                        <Download className="w-4 h-4 mr-2" />
                        Download Files
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleDownloadInvoice(selectedOrder)}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Invoice
                    </Button>
                  </>
                ) : (
                  <Button
                    className="flex-1"
                    onClick={() => {
                      setShowDetailsModal(false)
                      handleRetryPayment(selectedOrder)
                    }}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Resume Payment
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
