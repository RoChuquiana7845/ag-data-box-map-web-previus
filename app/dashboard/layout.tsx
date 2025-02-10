import type { ReactNode } from "react"
import { ProtectedLayout } from "@/components/auth/protected-layout"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <ProtectedLayout>{children}</ProtectedLayout>
}

