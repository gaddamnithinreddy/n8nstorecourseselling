"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { format } from "date-fns"
import { formatTimestamp } from "@/lib/utils"
import { Plus, Trash2, Tag, Calendar, Mail, Users, Ticket } from "lucide-react"
import { Coupon } from "@/lib/firebase/types"

const getCouponStatus = (coupon: Coupon) => {
    const now = new Date()
    // Handle Firestore Timestamp or Date string/object
    const validUntil = coupon.validUntil instanceof Object && 'toDate' in coupon.validUntil
        ? coupon.validUntil.toDate()
        : new Date(coupon.validUntil as any)

    const validFrom = coupon.validFrom instanceof Object && 'toDate' in coupon.validFrom
        ? coupon.validFrom.toDate()
        : new Date(coupon.validFrom as any)

    if (now > validUntil) return "expired"
    if (now < validFrom) return "scheduled"
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return "limit_reached"
    return "active"
}

export default function AdminCouponsPage() {
    const { user, loading: authLoading, firebaseUser } = useAuth()
    const [coupons, setCoupons] = useState<Coupon[]>([])
    const [loading, setLoading] = useState(true)
    const [createOpen, setCreateOpen] = useState(false)
    const [creating, setCreating] = useState(false)
    const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null)
    const [purchasesDialogOpen, setPurchasesDialogOpen] = useState(false)

    // Form State
    const [code, setCode] = useState("")
    const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage")
    const [discountValue, setDiscountValue] = useState("")
    const [validFrom, setValidFrom] = useState("")
    const [validUntil, setValidUntil] = useState("")
    const [usageLimit, setUsageLimit] = useState("")
    const [specificEmail, setSpecificEmail] = useState("")

    useEffect(() => {
        if (!authLoading) {
            fetchCoupons()
        }
    }, [authLoading, firebaseUser])

    const fetchCoupons = async () => {
        try {
            let headers = {}
            if (firebaseUser) {
                const token = await firebaseUser.getIdToken()
                headers = { "Authorization": `Bearer ${token}` }
            }

            const res = await fetch("/api/admin/coupons", {
                cache: "no-store",
                headers: headers
            })
            if (res.ok) {
                const data = await res.json()
                setCoupons(data)
            }
        } catch (error) {
            console.error("Failed to load coupons", error)
            toast.error("Failed to load coupons")
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setCreating(true)

        try {
            // Get Firebase auth token
            if (!firebaseUser) {
                throw new Error("Not authenticated")
            }

            const token = await firebaseUser.getIdToken()

            const res = await fetch("/api/admin/coupons", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    code,
                    discountType,
                    discountValue: Number(discountValue),
                    validFrom, // Send as string IDSO format or similar
                    validUntil,
                    usageLimit: usageLimit ? Number(usageLimit) : null,
                    specificEmail: specificEmail || null,
                }),
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.error || "Failed to create coupon")
            }

            toast.success("Coupon created successfully")
            setCreateOpen(false)
            resetForm()
            fetchCoupons()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setCreating(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this coupon?")) return

        try {
            const res = await fetch(`/api/admin/coupons/${id}`, {
                method: "DELETE",
            })

            if (res.ok) {
                toast.success("Coupon deleted")
                setCoupons(coupons.filter((c) => c.id !== id))
            } else {
                throw new Error("Failed to delete")
            }
        } catch (error) {
            toast.error("Failed to delete coupon")
        }
    }

    const resetForm = () => {
        setCode("")
        setDiscountType("percentage")
        setDiscountValue("")
        setValidFrom(new Date().toISOString().split("T")[0])
        // Default to 30 days from now
        const nextMonth = new Date()
        nextMonth.setDate(nextMonth.getDate() + 30)
        setValidUntil(nextMonth.toISOString().split("T")[0])
        setUsageLimit("")
        setSpecificEmail("")
    }

    if (loading || authLoading) {
        return (
            <div className="space-y-6">
                <div>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Card>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <Skeleton key={i} className="h-12 w-full" />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Coupons</h1>
                    <p className="text-muted-foreground">Manage discount codes and promotions</p>
                </div>
                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={resetForm}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Coupon
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Create New Coupon</DialogTitle>
                            <DialogDescription>Add a new discount code for your store.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="code">Coupon Code</Label>
                                <div className="relative">
                                    <Ticket className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="code"
                                        placeholder="SUMMER2024"
                                        className="pl-9 uppercase"
                                        value={code}
                                        onChange={e => setCode(e.target.value.toUpperCase())}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="type">Discount Type</Label>
                                    <Select value={discountType} onValueChange={(v: "percentage" | "fixed") => setDiscountType(v)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="percentage">Percentage (%)</SelectItem>
                                            <SelectItem value="fixed">Fixed Amount</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="value">Value</Label>
                                    <Input
                                        id="value"
                                        type="number"
                                        min="0"
                                        placeholder={discountType === "percentage" ? "10" : "500"}
                                        value={discountValue}
                                        onChange={e => setDiscountValue(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="validFrom">Valid From</Label>
                                    <Input
                                        id="validFrom"
                                        type="date"
                                        value={validFrom}
                                        onChange={e => setValidFrom(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="validUntil">Valid Until</Label>
                                    <Input
                                        id="validUntil"
                                        type="date"
                                        value={validUntil}
                                        onChange={e => setValidUntil(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="usageLimit">Usage Limit (Optional)</Label>
                                <div className="relative">
                                    <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="usageLimit"
                                        type="number"
                                        placeholder="Unlimited"
                                        className="pl-9"
                                        value={usageLimit}
                                        onChange={e => setUsageLimit(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Specific Email (Optional)</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="user@example.com"
                                        className="pl-9"
                                        value={specificEmail}
                                        onChange={e => setSpecificEmail(e.target.value)}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">If set, only this email address can use this coupon.</p>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={creating}>
                                    {creating ? "Creating..." : "Create Coupon"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Code</TableHead>
                                <TableHead>Discount</TableHead>
                                <TableHead className="hidden sm:table-cell">Status</TableHead>
                                <TableHead className="hidden md:table-cell">Validity</TableHead>
                                <TableHead className="hidden md:table-cell">Usage</TableHead>
                                <TableHead className="hidden lg:table-cell">Purchases</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {coupons.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                        No coupons found. Create one to get started.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                coupons.map((coupon) => (
                                    <TableRow key={coupon.id}>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <span className="font-mono font-medium">{coupon.code}</span>
                                                {coupon.specificEmail && (
                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                        <Mail className="h-3 w-3" /> {coupon.specificEmail}
                                                    </div>
                                                )}
                                                <div className="md:hidden text-xs text-muted-foreground">
                                                    Usage: {coupon.usedCount} / {coupon.usageLimit ? coupon.usageLimit : "∞"}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">
                                                {coupon.discountType === "percentage"
                                                    ? `${coupon.discountValue}% OFF`
                                                    : `₹${coupon.discountValue} OFF`}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell">
                                            {(() => {
                                                const status = getCouponStatus(coupon)
                                                return (
                                                    <Badge
                                                        variant={status === "active" ? "default" : status === "scheduled" ? "secondary" : "destructive"}
                                                        className={status === "active" ? "bg-green-600 hover:bg-green-700" : ""}
                                                    >
                                                        {status === "limit_reached" ? "Limit Reached" : status.charAt(0).toUpperCase() + status.slice(1)}
                                                    </Badge>
                                                )
                                            })()}
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            <div className="flex flex-col gap-1 text-sm">
                                                <span className="text-muted-foreground">
                                                    {formatTimestamp(coupon.validFrom, d => format(d, "MMM d"))} - {formatTimestamp(coupon.validUntil, d => format(d, "MMM d, yyyy"))}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            <div className="text-sm">
                                                {coupon.usedCount} / {coupon.usageLimit ? coupon.usageLimit : "∞"}
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden lg:table-cell">
                                            {coupon.purchases && coupon.purchases.length > 0 ? (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 text-xs"
                                                    onClick={() => {
                                                        setSelectedCoupon(coupon)
                                                        setPurchasesDialogOpen(true)
                                                    }}
                                                >
                                                    {coupon.purchases.length} {coupon.purchases.length === 1 ? 'purchase' : 'purchases'}
                                                </Button>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">No purchases</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => handleDelete(coupon.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Purchases Dialog */}
            <Dialog open={purchasesDialogOpen} onOpenChange={setPurchasesDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Coupon Purchases - {selectedCoupon?.code}</DialogTitle>
                        <DialogDescription>
                            Users who purchased templates using this coupon
                        </DialogDescription>
                    </DialogHeader>
                    {selectedCoupon?.purchases && selectedCoupon.purchases.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Order ID</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead className="text-right">Discount</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {selectedCoupon.purchases.map((purchase, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{purchase.userName}</span>
                                                <span className="text-xs text-muted-foreground">{purchase.userEmail}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-mono text-xs">#{purchase.orderId.slice(0, 8)}</span>
                                        </TableCell>
                                        <TableCell className="text-right">₹{purchase.amount}</TableCell>
                                        <TableCell className="text-right text-green-600">-₹{purchase.discountApplied}</TableCell>
                                        <TableCell>
                                            {formatTimestamp(purchase.purchasedAt, (date) => format(date, "MMM d, yyyy"))}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className="text-center text-muted-foreground py-8">No purchases yet</p>
                    )}
                </DialogContent>
            </Dialog>
        </motion.div>
    )
}
