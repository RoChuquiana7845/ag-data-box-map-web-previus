import type { ReactNode } from "react"
import { withRoleGuard } from "@/lib/hocs/with-role-guard"

function UserLayout({ children }: { children: ReactNode }) {
  return <div className="user-layout">{children}</div>
}

// All authenticated users can access user routes
export default withRoleGuard(UserLayout, ["User", "Analyst", "Admin"])

