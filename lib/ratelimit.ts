import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// Create a new ratelimiter lazily
let ratelimit: Ratelimit | null = null

export async function rateLimit(identifier: string) {
    // If Redis environment variables are not set, skip rate limiting (fail open)
    // This ensures the app still works in development or if credentials are missing
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
        console.warn("[RateLimit] Upstash Redis credentials missing. Skipping rate limit.")
        return { success: true, limit: 10, remaining: 10, reset: 0 }
    }

    try {
        if (!ratelimit) {
            ratelimit = new Ratelimit({
                redis: Redis.fromEnv(),
                limiter: Ratelimit.slidingWindow(10, "10 s"),
                analytics: true,
                prefix: "@upstash/ratelimit",
            })
        }

        const { success, limit, remaining, reset } = await ratelimit.limit(identifier)
        return { success, limit, remaining, reset }
    } catch (error) {
        console.error("[RateLimit] Error checking rate limit:", error)
        // Fail open if rate limiter fails
        return { success: true, limit: 10, remaining: 10, reset: 0 }
    }
}
