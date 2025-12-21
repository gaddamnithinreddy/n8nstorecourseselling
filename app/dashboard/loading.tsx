import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function DashboardLoading() {
    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Header Skeleton */}
            <div className="space-y-2">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-5 w-72" />
            </div>

            {/* Profile Card Skeleton */}
            <Card>
                <CardContent className="p-6 md:p-8">
                    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                        <Skeleton className="h-24 w-24 rounded-full" />
                        <div className="flex-1 space-y-2 w-full">
                            <Skeleton className="h-8 w-48 mx-auto sm:mx-0" />
                            <Skeleton className="h-5 w-32 mx-auto sm:mx-0" />
                            <Skeleton className="h-4 w-40 mx-auto sm:mx-0" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Orders Section Skeleton */}
            <div className="space-y-4">
                <Skeleton className="h-7 w-40" />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="border-muted">
                            <CardHeader className="p-5 pb-3 space-y-2">
                                <Skeleton className="h-5 w-20" />
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </CardHeader>
                            <CardContent className="p-5 pt-2">
                                <Skeleton className="aspect-video w-full rounded-md" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}
