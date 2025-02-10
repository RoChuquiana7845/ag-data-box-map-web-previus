import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { UserRole } from "@/lib/types/auth"

interface RoleContentProps {
  role: UserRole
  name: string
}

const roleDescriptions: Record<UserRole, string> = {
  User: "Access and view agricultural data",
  Analyst: "Analyze and manage agricultural data",
  Admin: "Manage users and system settings",
}

export function RoleContent({ role, name }: RoleContentProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome, {name}</CardTitle>
        <CardDescription>You are logged in as: {role}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{roleDescriptions[role]}</p>
      </CardContent>
    </Card>
  )
}

