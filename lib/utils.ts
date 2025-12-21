import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Timestamp } from "firebase/firestore"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTimestamp<T>(
  timestamp: Timestamp | Date | { seconds: number; nanoseconds: number } | null | undefined,
  formatter: (date: Date) => T,
  fallback: T = "N/A" as T,
): T {
  if (!timestamp) return fallback

  try {
    // If it's a Firestore Timestamp with toDate method
    if (typeof timestamp === "object" && "toDate" in timestamp && typeof timestamp.toDate === "function") {
      return formatter(timestamp.toDate())
    }

    // If it's already a Date object
    if (timestamp instanceof Date) {
      return formatter(timestamp)
    }

    // If it's a plain object with seconds (serialized Timestamp)
    if (typeof timestamp === "object" && "seconds" in timestamp) {
      return formatter(new Date((timestamp as any).seconds * 1000))
    }

    // If it's a plain object with _seconds (Serialized Admin SDK Timestamp)
    if (typeof timestamp === "object" && "_seconds" in timestamp) {
      return formatter(new Date((timestamp as any)._seconds * 1000))
    }

    // If it's a number (Unix timestamp)
    if (typeof timestamp === "number") {
      return formatter(new Date(timestamp))
    }

    if (typeof timestamp === "string") {
      const date = new Date(timestamp)
      if (!isNaN(date.getTime())) {
        return formatter(date)
      }
    }

    return fallback
  } catch {
    return fallback
  }
}

export function isTimestampExpired(
  timestamp: Timestamp | Date | { seconds: number; nanoseconds: number } | null | undefined,
): boolean {
  if (!timestamp) return true

  try {
    let date: Date

    if (typeof timestamp === "object" && "toDate" in timestamp && typeof timestamp.toDate === "function") {
      date = timestamp.toDate()
    } else if (timestamp instanceof Date) {
      date = timestamp
    } else if (typeof timestamp === "object" && "seconds" in timestamp) {
      date = new Date((timestamp as any).seconds * 1000)
    } else if (typeof timestamp === "object" && "_seconds" in timestamp) {
      date = new Date((timestamp as any)._seconds * 1000)
    } else if (typeof timestamp === "number") {
      date = new Date(timestamp)
    } else if (typeof timestamp === "string") {
      date = new Date(timestamp)
    } else {
      return true
    }

    return new Date() > date
  } catch {
    return true
  }
}
