import type { Metadata } from "next"
import AnalyticsContent from "@/components/analytics/analytics-content"
import { ResizableLayout } from "@/components/dashboard/resizable-layout"
import { CompactSidebar } from "@/components/dashboard/compact-sidebar"

export const metadata: Metadata = {
  title: "Analytics | AG Data Box",
  description: "Gestión y análisis estadístico de datos geoespaciales",
}

export default function AnalyticsPage() {
  return <ResizableLayout sidebar={<CompactSidebar />} content={<AnalyticsContent />} />
}

