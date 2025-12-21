import { db } from "./config"
import { persistentLocalCache, initializeFirestore } from "firebase/firestore"

// Enable offline persistence for better reliability using the new API
// Note: We're not initializing persistence here since it's already handled by the config
console.log("[v0] Using Firestore with default configuration")

export { db }