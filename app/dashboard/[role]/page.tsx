import { notFound } from "next/navigation"
import { UserDashboard } from "@/components/dashboard/user-dashboard"
import { AnalystDashboard } from "@/components/dashboard/analyst-dashboard"
import { AdminDashboard } from "@/components/dashboard/admin-dashboard"

interface RoleDashboardPageProps {
  params: {
    role: string
  }
}

const validRoles = new Set(["user", "analyst", "admin"])

export default function RoleDashboardPage({ params }: RoleDashboardPageProps) {
  const role = params.role.toLowerCase()

  if (!validRoles.has(role)) {
    notFound()
  }

  switch (role) {
    case "user":
      return <UserDashboard />
    case "analyst":
      return <AnalystDashboard />
    case "admin":
      return <AdminDashboard />
    default:
      notFound()
  }
}

