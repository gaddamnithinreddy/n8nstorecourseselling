"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useTemplates, deleteTemplate } from "@/hooks/use-templates"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Plus, Search, MoreVertical, Edit, Trash2, Eye, Package, Zap } from "lucide-react"

export default function AdminTemplatesPage() {
  const { templates, loading } = useTemplates(false)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const filteredTemplates = templates.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase())
    const matchesFilter =
      filter === "all" || (filter === "available" && t.isAvailable) || (filter === "unavailable" && !t.isAvailable)
    return matchesSearch && matchesFilter
  })

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteTemplate(deleteId)
      toast.success("Template deleted successfully")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete template"
      toast.error(message)
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Templates</h1>
          <p className="text-muted-foreground">Manage your n8n template products</p>
        </div>
        <Button asChild>
          <Link href="/admin/templates/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Template
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Templates</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="unavailable">Unavailable</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <Skeleton className="aspect-video w-full" />
              <CardContent className="p-4">
                <Skeleton className="mb-2 h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredTemplates.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="group overflow-hidden">
              <div className="relative aspect-video bg-secondary">
                {template.thumbnailUrl ? (
                  <Image
                    src={template.thumbnailUrl || "/placeholder.svg"}
                    alt={template.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Zap className="h-12 w-12 text-muted-foreground/30" />
                  </div>
                )}
                {!template.isAvailable && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                    <Badge variant="secondary">Unavailable</Badge>
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="flex-1 overflow-hidden">
                    <h3 className="truncate font-semibold">{template.title}</h3>
                    <p className="truncate text-sm text-muted-foreground">{template.shortDescription}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/templates/${template.slug}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/templates/${template.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(template.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {template.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{template.salesCount || 0} sales</span>
                  </div>
                  <span className="font-semibold text-primary">{formatPrice(template.price, template.currency)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="mb-2 text-lg font-semibold">No Templates Found</h3>
            <p className="mb-4 text-muted-foreground">
              {search ? "Try adjusting your search" : "Get started by adding your first template"}
            </p>
            {!search && (
              <Button asChild>
                <Link href="/admin/templates/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Template
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this template? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
