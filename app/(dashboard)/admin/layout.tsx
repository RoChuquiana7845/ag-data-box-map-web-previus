import type { ReactNode } from "react"
import { withRoleGuard } from "@/lib/hocs/with-role-guard"

function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="admin-layout">{children}</div>
}

// Only Admin can access admin routes
export default withRoleGuard(AdminLayout, ["Admin"])

