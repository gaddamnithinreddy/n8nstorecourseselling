import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            {/* Hero Section Skeleton */}
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
                <Skeleton className="h-12 w-3/4 max-w-lg" />
                <Skeleton className="h-6 w-1/2 max-w-md" />
            </div>

            {/* Content Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="flex flex-col space-y-3">
                        <Skeleton className="h-[200px] w-full rounded-xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-4/5" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
