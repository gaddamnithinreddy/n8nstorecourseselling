"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import {
  type User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  fetchSignInMethodsForEmail,
  sendEmailVerification,
} from "firebase/auth"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "@/lib/firebase/config"
import type { User } from "@/lib/firebase/types"
import { validateEmail } from "@/lib/validation"

interface AuthContextType {
  firebaseUser: FirebaseUser | null
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signUp: (name: string, email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  checkEmailProvider: (email: string) => Promise<{ exists: boolean; provider: string | null }>
  resendVerificationEmail: () => Promise<void>
  isEmailVerified: boolean
  isAdmin: boolean
  isWhitelistedAdmin: boolean
  verifyingWhitelist: boolean
  verifyAdminAccess: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function getAuthErrorMessage(errorCode: string): string {
  const errorMessages: Record<string, string> = {
    "auth/invalid-email": "Invalid email address format.",
    "auth/user-disabled": "This account has been disabled.",
    "auth/user-not-found": "No account found with this email. Please sign up first.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/email-already-in-use": "An account with this email already exists.",
    "auth/weak-password": "Password should be at least 6 characters.",
    "auth/operation-not-allowed": "Email/password accounts are not enabled. Please enable it in Firebase Console.",
    "auth/too-many-requests": "Too many failed attempts. Please try again later.",
    "auth/network-request-failed": "Network error. Please check your connection.",
    "auth/invalid-credential": "Invalid email or password. Please try again.",
    "auth/invalid-login-credentials": "Invalid email or password. Please try again.",
    "auth/configuration-not-found": "Firebase configuration error. Please check your environment variables.",
  }
  return errorMessages[errorCode] || `Authentication error: ${errorCode}`
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // console.log("AuthProvider rendered") // Debug log
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser)

      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
          if (userDoc.exists()) {
            setUser({ id: userDoc.id, ...userDoc.data() } as User)
          } else {
            const userData = {
              name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
              email: firebaseUser.email || "",
              role: "user" as const,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            }
            try {
              await setDoc(doc(db, "users", firebaseUser.uid), userData)
              setUser({ id: firebaseUser.uid, ...userData } as unknown as User)
            } catch (writeError: any) {
              console.error("[v0] Could not create user document:", writeError)
              // Still set user from Firebase Auth data even if Firestore write fails
              setUser({
                id: firebaseUser.uid,
                name: userData.name,
                email: userData.email,
                role: "user",
              } as User)
            }
          }
        } catch (error: any) {
          console.error("[v0] Error fetching user document:", error.message)
          setUser({
            id: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
            email: firebaseUser.email || "",
            role: "user",
          } as User)
        }
      } else {
        setUser(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    // Validate email domain
    const emailValidation = validateEmail(email)
    if (!emailValidation.valid) {
      throw new Error(emailValidation.error)
    }

    try {
      const result = await signInWithEmailAndPassword(auth, emailValidation.data!, password)

      try {
        const userDoc = await getDoc(doc(db, "users", result.user.uid))
        if (userDoc.exists()) {
          setUser({ id: userDoc.id, ...userDoc.data() } as User)
        } else {
          // Create user document if it doesn't exist
          const userData = {
            name: result.user.displayName || email.split("@")[0],
            email: emailValidation.data!,
            role: "user" as const,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }
          await setDoc(doc(db, "users", result.user.uid), userData)
          setUser({ id: result.user.uid, ...userData } as unknown as User)
        }
      } catch (firestoreError: any) {
        console.error("[v0] Firestore error during sign in:", firestoreError.message)
        // Still allow sign in even if Firestore fails
        setUser({
          id: result.user.uid,
          name: result.user.displayName || email.split("@")[0],
          email: emailValidation.data!,
          role: "user",
        } as User)
      }
    } catch (error: any) {
      console.error("[v0] Sign in error:", error.code)
      throw new Error(getAuthErrorMessage(error.code))
    }
  }

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)

      try {
        const userDoc = await getDoc(doc(db, "users", result.user.uid))
        if (userDoc.exists()) {
          setUser({ id: userDoc.id, ...userDoc.data() } as User)
        } else {
          const userData = {
            name: result.user.displayName || "User",
            email: result.user.email || "",
            role: "user" as const,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }
          await setDoc(doc(db, "users", result.user.uid), userData)
          setUser({ id: result.user.uid, ...userData } as unknown as User)
        }
      } catch (firestoreError: any) {
        console.error("[v0] Firestore error during google sign in:", firestoreError.message)
        setUser({
          id: result.user.uid,
          name: result.user.displayName || "User",
          email: result.user.email || "",
          role: "user",
        } as User)
      }
    } catch (error: any) {
      console.error("[v0] Google sign in error:", error.code)
      throw new Error(getAuthErrorMessage(error.code))
    }
  }

  const signUp = async (name: string, email: string, password: string) => {
    // Validate email domain
    const emailValidation = validateEmail(email)
    if (!emailValidation.valid) {
      throw new Error(emailValidation.error)
    }

    try {
      const result = await createUserWithEmailAndPassword(auth, emailValidation.data!, password)
      await updateProfile(result.user, { displayName: name })

      // Send email verification
      await sendEmailVerification(result.user)

      const userData = {
        name,
        email: emailValidation.data!,
        role: "user" as const,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      try {
        await setDoc(doc(db, "users", result.user.uid), userData)
        setUser({ id: result.user.uid, ...userData } as unknown as User)
      } catch (firestoreError: any) {
        console.error("[v0] Firestore error during sign up:", firestoreError.message)
        // Still allow sign up even if Firestore fails
        setUser({ id: result.user.uid, ...userData } as unknown as User)
      }
    } catch (error: any) {
      console.error("[v0] Sign up error:", error.code)

      // Handle email already in use
      if (error.code === 'auth/email-already-in-use') {
        // Check which provider the existing account uses
        try {
          const providerCheck = await checkEmailProvider(emailValidation.data!)
          if (providerCheck.provider === 'google.com') {
            throw new Error("An account with this email already exists and uses Google Sign-In. Please click 'Sign in with Google' to continue.")
          } else {
            throw new Error("An account with this email already exists. Please sign in instead.")
          }
        } catch (checkError: any) {
          // If provider check fails, show generic message
          throw new Error("An account with this email already exists. Please sign in instead.")
        }
      }

      throw new Error(getAuthErrorMessage(error.code))
    }
  }

  const signOut = async () => {
    await firebaseSignOut(auth)
    setUser(null)
  }

  /**
   * Check if email exists and which provider it uses
   */
  const checkEmailProvider = async (email: string): Promise<{ exists: boolean; provider: string | null }> => {
    try {
      const signInMethods = await fetchSignInMethodsForEmail(auth, email)

      if (signInMethods.length === 0) {
        return { exists: false, provider: null }
      }

      // Check if uses Google OAuth
      if (signInMethods.includes('google.com')) {
        return { exists: true, provider: 'google.com' }
      }

      // Check if uses email/password
      if (signInMethods.includes('password')) {
        return { exists: true, provider: 'password' }
      }

      return { exists: true, provider: signInMethods[0] }
    } catch (error: any) {
      console.error("Error checking email provider:", error)
      return { exists: false, provider: null }
    }
  }

  /**
   * Resend verification email to current user
   */
  const resendVerificationEmail = async () => {
    if (!firebaseUser) {
      throw new Error("No user is currently signed in")
    }

    if (firebaseUser.emailVerified) {
      throw new Error("Email is already verified")
    }

    await sendEmailVerification(firebaseUser)
  }

  const isEmailVerified = firebaseUser?.emailVerified || false

  const isAdmin = user?.role === "admin"
  const [isWhitelistedAdmin, setIsWhitelistedAdmin] = useState(false)
  const [verifyingWhitelist, setVerifyingWhitelist] = useState(false)

  // Verify admin access against whitelist
  const verifyAdminAccess = async (): Promise<boolean> => {
    if (!firebaseUser || !isAdmin) {
      setIsWhitelistedAdmin(false)
      setVerifyingWhitelist(false)
      return false
    }

    setVerifyingWhitelist(true)
    try {
      const token = await firebaseUser.getIdToken()
      const response = await fetch("/api/admin/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      })

      const data = await response.json()
      const verified = response.ok && data.isWhitelisted
      setIsWhitelistedAdmin(verified)
      return verified
    } catch (error) {
      console.error("Error verifying admin access:", error)
      setIsWhitelistedAdmin(false)
      return false
    } finally {
      setVerifyingWhitelist(false)
    }
  }

  // Check admin whitelist status when user changes
  useEffect(() => {
    if (isAdmin && firebaseUser) {
      verifyAdminAccess()
    } else {
      setIsWhitelistedAdmin(false)
      setVerifyingWhitelist(false)
    }
  }, [isAdmin, firebaseUser])

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        user,
        loading,
        signIn,
        signInWithGoogle,
        signUp,
        signOut,
        checkEmailProvider,
        resendVerificationEmail,
        isEmailVerified,
        isAdmin,
        isWhitelistedAdmin,
        verifyingWhitelist,
        verifyAdminAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    console.error("useAuth called outside AuthProvider")
    // Return safe defaults instead of throwing to prevent SSR errors
    return {
      firebaseUser: null,
      user: null,
      loading: true,
      signIn: async () => { throw new Error("useAuth must be used within an AuthProvider") },
      signInWithGoogle: async () => { throw new Error("useAuth must be used within an AuthProvider") },
      signUp: async () => { throw new Error("useAuth must be used within an AuthProvider") },
      signOut: async () => { throw new Error("useAuth must be used within an AuthProvider") },
      checkEmailProvider: async () => ({ exists: false, provider: null }),
      resendVerificationEmail: async () => { throw new Error("useAuth must be used within an AuthProvider") },
      isEmailVerified: false,
      isAdmin: false,
      isWhitelistedAdmin: false,
      verifyingWhitelist: false,
      verifyAdminAccess: async () => false,
    }
  }
  return context
}
