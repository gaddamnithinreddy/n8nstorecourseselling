"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { db } from "@/lib/firebase/config"
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore"
import { Order } from "@/lib/firebase/types"

export function useOrders(fetchAll = false) {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    // For non-admin users, require user to be loaded
    if (!fetchAll && (!user || !user.id)) {
      setOrders([])
      setLoading(false)
      return
    }

    setLoading(true)

    // Build query based on fetchAll parameter
    const q = fetchAll
      ? query(collection(db, "orders"), orderBy("createdAt", "desc"))
      : query(
        collection(db, "orders"),
        where("userId", "==", user!.id),
        orderBy("createdAt", "desc")
      )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[]
      setOrders(ordersData)
      setLoading(false)
    }, (error) => {
      console.error("Error fetching orders:", error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user, fetchAll, refreshTrigger])

  const refetch = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return { orders, loading, refetch }
}
