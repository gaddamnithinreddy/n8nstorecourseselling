import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8 h-5 w-32 rounded bg-muted" />
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-4">
              <Skeleton className="aspect-video w-full rounded-xl" />
              <div className="grid grid-cols-4 gap-2">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="aspect-video rounded-lg" />
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex gap-2">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-12 w-40" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-12 w-48" />
              <Skeleton className="h-40 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
