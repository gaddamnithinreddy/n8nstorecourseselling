import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileQuestion } from "lucide-react"

export default function NotFound() {
    return (
        <div className="flex min-h-[80vh] flex-col items-center justify-center text-center px-4">
            <div className="rounded-full bg-muted p-4 mb-4">
                <FileQuestion className="h-12 w-12 text-muted-foreground" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-2">Page not found</h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-md">
                Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
            </p>
            <Button asChild>
                <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Home
                </Link>
            </Button>
        </div>
    )
}
