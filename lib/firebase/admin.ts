let adminApp: unknown = null
let adminAuth: unknown = null
let adminDb: unknown = null
let initError: string | null = null
let initPromise: Promise<void> | null = null

async function initializeFirebaseAdmin() {
  if (adminApp) return
  if (initError) return

  try {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL
    let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY

    if (!projectId || !clientEmail || !privateKey) {
      initError =
        "Firebase Admin credentials not configured. Required: NEXT_PUBLIC_FIREBASE_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY"
      console.error("[Firebase Admin]", initError)
      return
    }

    // The private key might come in different formats from environment variables
    if (privateKey.includes("\\n")) {
      privateKey = privateKey.replace(/\\n/g, "\n")
    }
    // Handle case where key is JSON stringified
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      try {
        privateKey = JSON.parse(privateKey)
      } catch {
        // Not valid JSON, use as-is
      }
    }

    // Ensure privateKey is a string and has proper format
    if (typeof privateKey !== 'string') {
      initError = "Invalid FIREBASE_ADMIN_PRIVATE_KEY format. Key must be a string."
      console.error("[Firebase Admin]", initError)
      return
    }

    // Ensure key has proper format
    if (!privateKey.includes("-----BEGIN PRIVATE KEY-----")) {
      initError = "Invalid FIREBASE_ADMIN_PRIVATE_KEY format. Key must be a valid PEM private key."
      console.error("[Firebase Admin]", initError)
      return
    }

    // Environment variable isolation removed for stability
    /*
    const conflictingEnvVars = [
      'GOOGLE_APPLICATION_CREDENTIALS',
      'GCLOUD_PROJECT',
      'GOOGLE_CLOUD_PROJECT',
      'CLOUDSDK_CORE_PROJECT'
    ];

    // Save and temporarily clear conflicting environment variables
    const savedEnvVars: Record<string, string | undefined> = {};
    conflictingEnvVars.forEach(key => {
      savedEnvVars[key] = process.env[key];
      delete process.env[key]; // Always delete, regardless of whether it exists
    });
    */

    try {
      // Dynamic import to prevent build-time errors
      const { initializeApp, getApps, cert } = await import("firebase-admin/app")
      const { getAuth } = await import("firebase-admin/auth")
      const { getFirestore } = await import("firebase-admin/firestore")

      const apps = getApps()

      if (apps.length === 0) {
        // Initialize Firebase Admin with explicit credentials
        adminApp = initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        })
      } else {
        adminApp = apps[0]
      }

      adminAuth = getAuth(adminApp as import("firebase-admin/app").App)
      adminDb = getFirestore(adminApp as import("firebase-admin/app").App)

      console.log("[Firebase Admin] Initialized successfully")
    } finally {
      // Restore environment variables logic removed
    }
  } catch (error) {
    initError = error instanceof Error ? error.message : String(error)
    console.error("[Firebase Admin] Init error:", initError)
  }
}

// Lazy initialization
export async function getAdminDb(): Promise<import("firebase-admin/firestore").Firestore | null> {
  if (!initPromise) {
    initPromise = initializeFirebaseAdmin()
  }
  await initPromise
  return adminDb as import("firebase-admin/firestore").Firestore | null
}

export async function getAdminAuth(): Promise<import("firebase-admin/auth").Auth | null> {
  if (!initPromise) {
    initPromise = initializeFirebaseAdmin()
  }
  await initPromise
  return adminAuth as import("firebase-admin/auth").Auth | null
}

export function getInitError(): string | null {
  return initError
}

export async function isFirebaseAdminReady(): Promise<boolean> {
  if (!initPromise) {
    initPromise = initializeFirebaseAdmin()
  }
  await initPromise
  return adminApp !== null && adminDb !== null && !initError
}