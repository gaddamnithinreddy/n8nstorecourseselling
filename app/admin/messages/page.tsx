"use client"

import { useState, useEffect } from "react"
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import { ContactMessage } from "@/lib/firebase/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { formatDistanceToNow } from "date-fns"
import { Mail, CheckCircle, Loader2, Eye } from "lucide-react"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

export default function AdminMessagesPage() {
    const [messages, setMessages] = useState<ContactMessage[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const q = query(collection(db, "messages"), orderBy("createdAt", "desc"))

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as ContactMessage[]
            setMessages(data)
            setLoading(false)
        })

        return () => unsubscribe()
    }, [])

    const markAsRead = async (id: string, currentStatus: string) => {
        if (currentStatus !== "unread") return

        try {
            await updateDoc(doc(db, "messages", id), {
                status: "read"
            })
            toast.success("Marked as read")
        } catch (error) {
            toast.error("Failed to update status")
        }
    }

    const handleReply = (email: string, subject: string, id: string) => {
        // Mark as replied when starting to reply
        updateDoc(doc(db, "messages", id), {
            status: "replied"
        })
        window.location.href = `mailto:${email}?subject=Re: ${subject}`
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
                    <p className="text-muted-foreground">
                        Manage user inquiries and support requests
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Inbox ({messages.filter(m => m.status === 'unread').length} unread)</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Status</TableHead>
                                <TableHead>From</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {messages.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        No messages found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                messages.map((message) => (
                                    <TableRow key={message.id}>
                                        <TableCell>
                                            <Badge
                                                variant={message.status === 'unread' ? 'destructive' : 'secondary'}
                                                className={message.status === 'replied' ? 'bg-green-500 hover:bg-green-600 custom-success' : ''}
                                            >
                                                {message.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{message.name}</span>
                                                <span className="text-xs text-muted-foreground">{message.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="max-w-[300px]">
                                                <div className="font-medium truncate">{message.subject}</div>
                                                <div className="text-xs text-muted-foreground truncate" title={message.message}>
                                                    {message.message.length > 50 ? `${message.message.substring(0, 50)}...` : message.message}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            {message.createdAt ? formatDistanceToNow(message.createdAt.toDate(), { addSuffix: true }) : 'N/A'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" title="View Details">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="sm:max-w-[500px]">
                                                        <DialogHeader>
                                                            <DialogTitle>Message Details</DialogTitle>
                                                            <DialogDescription>
                                                                Received {message.createdAt ? formatDistanceToNow(message.createdAt.toDate(), { addSuffix: true }) : ''}
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <div className="grid gap-4 py-4">
                                                            <div className="grid grid-cols-4 items-center gap-4">
                                                                <span className="text-right font-medium text-muted-foreground">From:</span>
                                                                <div className="col-span-3 flex flex-col">
                                                                    <span className="font-medium">{message.name}</span>
                                                                    <span className="text-sm text-muted-foreground">{message.email}</span>
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-4 items-center gap-4">
                                                                <span className="text-right font-medium text-muted-foreground">Subject:</span>
                                                                <span className="col-span-3 font-medium">{message.subject}</span>
                                                            </div>
                                                            <div className="mt-4 space-y-2 border-t pt-4">
                                                                <span className="font-medium text-muted-foreground">Message:</span>
                                                                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                                                                    {message.message}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex justify-end gap-2">
                                                            {message.status === 'unread' && (
                                                                <Button
                                                                    variant="outline"
                                                                    onClick={() => markAsRead(message.id, message.status)}
                                                                >
                                                                    <CheckCircle className="mr-2 h-4 w-4" />
                                                                    Mark as Read
                                                                </Button>
                                                            )}
                                                            <Button
                                                                onClick={() => handleReply(message.email, message.subject, message.id)}
                                                            >
                                                                <Mail className="mr-2 h-4 w-4" />
                                                                Reply via Email
                                                            </Button>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>

                                                {message.status === 'unread' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => markAsRead(message.id, message.status)}
                                                        title="Mark as read"
                                                    >
                                                        <CheckCircle className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleReply(message.email, message.subject, message.id)}
                                                    title="Reply via Email"
                                                >
                                                    <Mail className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
