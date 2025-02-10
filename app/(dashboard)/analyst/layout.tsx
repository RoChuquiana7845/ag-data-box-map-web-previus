import type { ReactNode } from "react"
import { withRoleGuard } from "@/lib/hocs/with-role-guard"

function AnalystLayout({ children }: { children: ReactNode }) {
  return <div className="analyst-layout">{children}</div>
}

// Only Analyst and Admin can access analyst routes
export default withRoleGuard(AnalystLayout, ["Analyst", "Admin"])

