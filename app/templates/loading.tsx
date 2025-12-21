import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Skeleton } from "@/components/ui/skeleton"

function TemplateCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <Skeleton className="aspect-video w-full" />
      <div className="p-4">
        <div className="mb-2 flex items-center gap-2">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="mb-2 h-6 w-3/4" />
        <Skeleton className="mb-2 h-4 w-full" />
        <Skeleton className="mb-4 h-4 w-2/3" />
        <div className="flex items-center justify-between border-t border-border/50 pt-4">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  )
}

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        <section className="border-b border-border bg-card/50 py-12">
          <div className="container mx-auto px-4">
            <Skeleton className="mb-4 h-10 w-64" />
            <Skeleton className="h-5 w-96" />
          </div>
        </section>

        <section className="border-b border-border py-4">
          <div className="container mx-auto px-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <Skeleton className="h-10 w-full md:max-w-md" />
              <div className="hidden items-center gap-4 md:flex">
                <Skeleton className="h-10 w-[140px]" />
                <Skeleton className="h-10 w-[140px]" />
                <Skeleton className="h-10 w-[160px]" />
              </div>
            </div>
          </div>
        </section>

        <section className="py-4">
          <div className="container mx-auto px-4">
            <Skeleton className="h-4 w-32" />
          </div>
        </section>

        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <TemplateCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
