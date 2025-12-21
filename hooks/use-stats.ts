"use client"

import { useEffect, useState } from "react"
import { collection, query, where, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import type { Order } from "@/lib/firebase/types"

interface Stats {
  totalRevenue: number
  totalOrders: number
  totalUsers: number
  activeTemplates: number
  recentOrders: Order[]
  topTemplates: { templateId: string; title: string; sales: number }[]
}

export function useStats() {
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    activeTemplates: 0,
    recentOrders: [],
    topTemplates: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Listen to orders
    const ordersUnsubscribe = onSnapshot(query(collection(db, "orders"), where("status", "==", "paid")), (snapshot) => {
      const orders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[]

      const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0)

      // Calculate top templates
      const templateSales: Record<string, { title: string; sales: number }> = {}
      orders.forEach((order) => {
        order.templates.forEach((t) => {
          if (!templateSales[t.templateId]) {
            templateSales[t.templateId] = { title: t.templateTitle, sales: 0 }
          }
          templateSales[t.templateId].sales++
        })
      })

      const topTemplates = Object.entries(templateSales)
        .map(([templateId, data]) => ({ templateId, ...data }))
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5)

      setStats((prev) => ({
        ...prev,
        totalRevenue,
        totalOrders: orders.length,
        recentOrders: orders.slice(0, 5),
        topTemplates,
      }))
    })

    // Listen to users
    const usersUnsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      setStats((prev) => ({ ...prev, totalUsers: snapshot.size }))
    })

    // Listen to templates
    const templatesUnsubscribe = onSnapshot(
      query(collection(db, "templates"), where("isAvailable", "==", true)),
      (snapshot) => {
        setStats((prev) => ({ ...prev, activeTemplates: snapshot.size }))
        setLoading(false)
      },
    )

    return () => {
      ordersUnsubscribe()
      usersUnsubscribe()
      templatesUnsubscribe()
    }
  }, [])

  return { stats, loading }
}
