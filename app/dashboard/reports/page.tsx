import type { Metadata } from "next"
import { ReportsContent } from "@/components/reports/reports-content"
import { ResizableLayout } from "@/components/dashboard/resizable-layout"
import { CompactSidebar } from "@/components/dashboard/compact-sidebar"

export const metadata: Metadata = {
  title: "Reportes | AG Data Box",
  description: "Generación y gestión de reportes",
}

export default function ReportsPage() {
  return <ResizableLayout sidebar={<CompactSidebar />} content={<ReportsContent />} />
}

