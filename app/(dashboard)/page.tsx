"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/hooks/use-auth"

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      router.push(`/dashboard/${user.role.toLowerCase()}`)
    }
  }, [user, router])

  return null // This page immediately redirects
}

