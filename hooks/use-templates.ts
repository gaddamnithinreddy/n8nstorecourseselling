"use client"

import { useEffect, useState, useCallback } from "react"
import {
  collection,
  query,
  where,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  limit,
  getDocs,
} from "firebase/firestore"
import { db } from "@/lib/firebase/utils"
import type { Template } from "@/lib/firebase/types"

const templateCache: Map<string, { data: Template[]; timestamp: number }> = new Map()
const singleTemplateCache: Map<string, { data: Template; timestamp: number }> = new Map()
const CACHE_DURATION = 60000 // 60 seconds

export function useTemplates(onlyAvailable = true) {
  const [templates, setTemplates] = useState<Template[]>(() => {
    const cacheKey = `templates-${onlyAvailable}`
    const cached = templateCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data
    }
    return []
  })
  const [loading, setLoading] = useState(() => {
    const cacheKey = `templates-${onlyAvailable}`
    const cached = templateCache.get(cacheKey)
    return !(cached && Date.now() - cached.timestamp < CACHE_DURATION)
  })
  const [error, setError] = useState<string | null>(null)
  const [permissionError, setPermissionError] = useState(false)

  const fetchTemplates = useCallback(async () => {
    const cacheKey = `templates-${onlyAvailable}`
    const cached = templateCache.get(cacheKey)

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setTemplates(cached.data)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const q = query(collection(db, "templates"))
      const snapshot = await getDocs(q)

      let templatesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Template[]

      if (onlyAvailable) {
        templatesData = templatesData.filter((t) => t.isAvailable !== false)
      }

      templatesData.sort((a, b) => {
        const dateA = a.createdAt?.toMillis?.() || 0
        const dateB = b.createdAt?.toMillis?.() || 0
        return dateB - dateA
      })

      templateCache.set(cacheKey, { data: templatesData, timestamp: Date.now() })

      setTemplates(templatesData)
      setPermissionError(false)
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string }
      console.error("[Templates] Fetch error:", error.code, error.message)

      setTemplates([])

      if (error.code === "permission-denied") {
        setPermissionError(true)
        setError("Please set up Firestore security rules. See FIREBASE_SETUP.md")
      } else if (error.code === "unavailable") {
        setError("Service temporarily unavailable. Please try again.")
      } else {
        setError(error.message || "Failed to load templates")
      }
    } finally {
      setLoading(false)
    }
  }, [onlyAvailable])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  return { templates, loading, error, permissionError, refetch: fetchTemplates }
}

export function useTemplate(slug: string) {
  const [template, setTemplate] = useState<Template | null>(() => {
    const cached = singleTemplateCache.get(slug)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data
    }
    return null
  })
  const [loading, setLoading] = useState(() => {
    const cached = singleTemplateCache.get(slug)
    return !(cached && Date.now() - cached.timestamp < CACHE_DURATION)
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) {
      setLoading(false)
      setError("No template specified")
      return
    }

    let isMounted = true

    const fetchTemplate = async () => {
      const cached = singleTemplateCache.get(slug)
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        if (isMounted) {
          setTemplate(cached.data)
          setLoading(false)
        }
        return
      }

      if (isMounted) {
        setLoading(true)
        setError(null)
      }

      try {
        const q = query(collection(db, "templates"), where("slug", "==", slug.toLowerCase()), limit(1))
        const snapshot = await getDocs(q)

        if (!isMounted) return

        if (!snapshot.empty) {
          const doc = snapshot.docs[0]
          const templateData = { id: doc.id, ...doc.data() } as Template

          singleTemplateCache.set(slug, { data: templateData, timestamp: Date.now() })

          setTemplate(templateData)
        } else {
          setError("Template not found")
        }
      } catch (err: unknown) {
        if (!isMounted) return

        const error = err as { code?: string; message?: string }
        console.error("[Template] Fetch error:", error.code, error.message)

        if (error.code === "permission-denied") {
          setError("Permission denied. Please check Firestore security rules.")
        } else {
          setError(error.message || "Failed to load template")
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchTemplate()

    return () => {
      isMounted = false
    }
  }, [slug])

  return { template, loading, error }
}

export function clearTemplateCache() {
  templateCache.clear()
  singleTemplateCache.clear()
}

export async function createTemplate(
  data: Omit<Template, "id" | "createdAt" | "updatedAt" | "salesCount">,
): Promise<string> {
  const slug = data.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

  const templateData = {
    ...data,
    slug,
    salesCount: 0,
    isAvailable: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }

  const docRef = await addDoc(collection(db, "templates"), templateData)
  clearTemplateCache()
  return docRef.id
}

export async function updateTemplate(id: string, data: Partial<Template>): Promise<void> {
  if (!id) throw new Error("Template ID is required")

  await updateDoc(doc(db, "templates", id), {
    ...data,
    updatedAt: serverTimestamp(),
  })
  clearTemplateCache()
}

export async function deleteTemplate(id: string): Promise<void> {
  if (!id) throw new Error("Template ID is required")
  await deleteDoc(doc(db, "templates", id))
  clearTemplateCache()
}

export async function getTemplateById(id: string): Promise<Template | null> {
  if (!id) return null

  const docSnap = await getDoc(doc(db, "templates", id))
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Template
  }
  return null
}
