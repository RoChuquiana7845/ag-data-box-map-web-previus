"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useAuth } from "@/lib/hooks/use-auth"
import type { UserRole } from "@/lib/types/auth"

export function withRoleGuard(WrappedComponent: React.ComponentType<any>, allowedRoles: UserRole[]) {
  return function RoleGuardComponent(props: any) {
    const { user } = useAuth()
    const router = useRouter()

    useEffect(() => {
      if (user && !allowedRoles.includes(user.role)) {
        router.push("/dashboard")
      }
    }, [user, router, allowedRoles]) // Added allowedRoles to dependencies

    if (!user || !allowedRoles.includes(user.role)) {
      return null
    }

    return <WrappedComponent {...props} />
  }
}

