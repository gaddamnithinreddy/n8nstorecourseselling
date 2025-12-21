"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { TemplateCard } from "@/components/template-card"
import { SetupBanner } from "@/components/setup-banner"
import { useTemplates } from "@/hooks/use-templates"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, SlidersHorizontal, X, PackageOpen, AlertCircle, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"

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

const categories = ["All", "Automation", "Integration", "CRM", "Marketing", "Data", "AI"]
const levels = ["All", "Beginner", "Intermediate", "Advanced"]
const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
]

function TemplateCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <Skeleton className="aspect-[16/10] w-full" />
      <div className="p-4 sm:p-5">
        <div className="mb-3 flex items-center gap-2">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="mb-2 h-6 w-3/4" />
        <Skeleton className="mb-2 h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-4">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  )
}

export default function TemplatesPage() {
  const { templates, loading, error, permissionError, refetch } = useTemplates(true)
  const searchParams = useSearchParams()
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [category, setCategory] = useState("All")
  const [level, setLevel] = useState("All")

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 300)

    return () => clearTimeout(timer)
  }, [search])

  // Update category from URL params (only on initial load or when coming from footer link)
  useEffect(() => {
    const categoryParam = searchParams.get("category")
    if (categoryParam) {
      // Find matching category (case-insensitive)
      const matchedCategory = categories.find(c => c.toLowerCase() === categoryParam.toLowerCase())
      if (matchedCategory && matchedCategory !== category) {
        setCategory(matchedCategory)
      }
    }
  }, [searchParams])

  const [sort, setSort] = useState("newest")
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const templatesPerPage = 12

  const filteredTemplates = useMemo(() => {
    let filtered = [...templates]

    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase()
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(searchLower) ||
          t.shortDescription.toLowerCase().includes(searchLower) ||
          t.tags?.some((tag) => tag.toLowerCase().includes(searchLower)),
      )
    }

    if (category !== "All") {
      filtered = filtered.filter((t) => t.category?.toLowerCase() === category.toLowerCase())
    }

    if (level !== "All") {
      filtered = filtered.filter((t) => t.level?.toLowerCase() === level.toLowerCase())
    }

    switch (sort) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        filtered.sort((a, b) => b.price - a.price)
        break
      case "popular":
        filtered.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))
        break
      case "newest":
      default:
        break
    }

    return filtered
  }, [templates, debouncedSearch, category, level, sort])

  // Pagination logic
  const totalPages = Math.ceil(filteredTemplates.length / templatesPerPage)
  const startIndex = (currentPage - 1) * templatesPerPage
  const endIndex = startIndex + templatesPerPage
  const paginatedTemplates = filteredTemplates.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  const resetPagination = () => setCurrentPage(1)

  const clearFilters = () => {
    setSearch("")
    setDebouncedSearch("")
    setCategory("All")
    setLevel("All")
    setSort("newest")
    setCurrentPage(1)
  }

  const hasActiveFilters = debouncedSearch || category !== "All" || level !== "All" || sort !== "newest"

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch, category, level, sort])

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <section className="border-b border-border bg-card/30 py-8 sm:py-10 md:py-12">
          <div className="container mx-auto px-4">
            <h1 className="mb-2 text-2xl font-bold sm:text-3xl md:text-4xl animate-fade-in">Browse Templates</h1>
            <p className="text-sm text-muted-foreground sm:text-base animate-fade-in">
              Explore our collection of premium n8n automation templates
            </p>
          </div>
        </section>

        {/* Filters */}
        <section className="sticky top-16 z-40 border-b border-border bg-background/95 py-3 backdrop-blur-lg sm:py-4">
          <div className="container mx-auto px-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 sm:max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
                {search !== debouncedSearch && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    Searching...
                  </span>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="sm:hidden bg-transparent"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Filters
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                    !
                  </Badge>
                )}
              </Button>

              <div className="hidden items-center gap-3 sm:flex">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={level} onValueChange={setLevel}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Level" />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map((lvl) => (
                      <SelectItem key={lvl} value={lvl}>
                        {lvl}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sort} onValueChange={setSort}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                    <X className="mr-1 h-4 w-4" />
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {/* Mobile Filters */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-out sm:hidden ${showFilters ? "mt-3 max-h-96" : "max-h-0"}`}
            >
              <div className="flex flex-col gap-3 border-t border-border pt-3">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={level} onValueChange={setLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Level" />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map((lvl) => (
                      <SelectItem key={lvl} value={lvl}>
                        {lvl}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sort} onValueChange={setSort}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {hasActiveFilters && (
                  <Button variant="outline" size="sm" onClick={clearFilters} className="bg-transparent">
                    <X className="mr-1 h-4 w-4" />
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Results Info */}
        <section className="py-3 sm:py-4">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {loading
                  ? "Loading templates..."
                  : filteredTemplates.length === 0
                    ? "No templates found"
                    : `Showing ${startIndex + 1}-${Math.min(endIndex, filteredTemplates.length)} of ${filteredTemplates.length} template${filteredTemplates.length !== 1 ? "s" : ""}`}
              </span>
              {hasActiveFilters && !loading && (
                <div className="flex flex-wrap gap-1.5">
                  {category !== "All" && (
                    <Badge variant="secondary" className="text-xs">
                      {category}
                    </Badge>
                  )}
                  {level !== "All" && (
                    <Badge variant="secondary" className="text-xs">
                      {level}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Templates Grid */}
        <section className="pb-12 sm:pb-16">
          <div className="container mx-auto px-4">
            {permissionError && <SetupBanner type="firestore-rules" />}

            {error && !permissionError ? (
              <div className="mx-auto max-w-md rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center animate-fade-in">
                <AlertCircle className="mx-auto mb-4 h-10 w-10 text-destructive" />
                <h3 className="mb-2 text-lg font-semibold">Failed to Load Templates</h3>
                <p className="mb-4 text-sm text-muted-foreground">{error}</p>
                <Button variant="outline" onClick={() => refetch()}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              </div>
            ) : loading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
                {[...Array(6)].map((_, i) => (
                  <TemplateCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredTemplates.length > 0 ? (
              <motion.div
                key={`${category}-${level}-${sort}-${search}`}
                variants={container}
                initial="hidden"
                animate="show"
                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6"
              >
                {paginatedTemplates.map((template, index) => (
                  <motion.div key={template.id} variants={item}>
                    <TemplateCard template={template} index={index} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="mx-auto max-w-md rounded-xl border border-dashed border-border bg-card/50 p-12 text-center animate-fade-in">
                <PackageOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
                <h3 className="mb-2 text-lg font-semibold">No Templates Found</h3>
                <p className="mb-6 text-sm text-muted-foreground">
                  {hasActiveFilters
                    ? "No templates match your current filters. Try adjusting your search criteria."
                    : "There are no templates available at the moment. Check back soon!"}
                </p>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters}>
                    <X className="mr-2 h-4 w-4" />
                    Clear All Filters
                  </Button>
                )}
              </div>
            )}

            {/* Pagination Controls */}
            {!loading && !error && filteredTemplates.length > templatesPerPage && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Show first page, last page, current page, and pages around current
                    const showPage =
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - currentPage) <= 1

                    if (!showPage && page === 2 && currentPage > 3) {
                      return <span key={page} className="px-2 text-muted-foreground">...</span>
                    }
                    if (!showPage && page === totalPages - 1 && currentPage < totalPages - 2) {
                      return <span key={page} className="px-2 text-muted-foreground">...</span>
                    }
                    if (!showPage) return null

                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="min-w-[40px]"
                      >
                        {page}
                      </Button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
