import { Suspense } from "react"
import { AreasContent } from "@/components/areas/areas-content"
import { AreasSkeleton } from "@/components/areas/areas-skeleton"
import { ResizableLayout } from "@/components/dashboard/resizable-layout"
import { CompactSidebar } from "@/components/dashboard/compact-sidebar"

export default function AreasPage() {
  const content = (
    <div className="p-6">
      <Suspense fallback={<AreasSkeleton />}>
        <AreasContent />
      </Suspense>
    </div>
  )

  return <ResizableLayout sidebar={<CompactSidebar />} content={content} />
}

