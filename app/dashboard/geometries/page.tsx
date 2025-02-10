import { Suspense } from "react"
import { GeometriesServer } from "@/components/geometries/geometries-server"
import { GeometriesTableSkeleton } from "@/components/geometries/geometries-skeleton"
import { ResizableLayout } from "@/components/dashboard/resizable-layout"
import { CompactSidebar } from "@/components/dashboard/compact-sidebar"

export default function GeometriesPage() {
  const content = (
    <div className="p-6">
      <Suspense fallback={<GeometriesTableSkeleton />}>
        <GeometriesServer />
      </Suspense>
    </div>
  )

  return <ResizableLayout sidebar={<CompactSidebar />} content={content} />
}

