"use client"

import { useEffect, useState } from "react"
import { collection, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import type { User } from "@/lib/firebase/types"

export function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("createdAt", "desc"))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const usersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as User[]
        setUsers(usersData)
        setLoading(false)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [])

  return { users, loading, error }
}

export async function updateUserRole(userId: string, role: "admin" | "user") {
  await updateDoc(doc(db, "users", userId), {
    role,
    updatedAt: serverTimestamp(),
  })
}
