"use client"

import { Suspense } from "react"
import { ProjectsGrid } from "@/components/projects/projects-grid"
import { getProjects } from "@/lib/services/projects"
import { ResizableLayout } from "@/components/dashboard/resizable-layout"
import { CompactSidebar } from "@/components/dashboard/compact-sidebar"
import { useAuth } from "@/lib/hooks/use-auth"
import { withRoleGuard } from "@/lib/hocs/with-role-guard"
import { Skeleton } from "@/components/ui/skeleton"

function ProjectsGridSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-[150px]" />
          <Skeleton className="h-4 w-[250px] mt-2" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-[125px] w-full rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  )
}

async function ProjectsGridServer() {
  const { projects, isBackendError } = await getProjects()
  return <ProjectsGrid projects={projects} isBackendError={isBackendError} />
}

function AnalystDashboardComponent() {
  const { user } = useAuth()

  const content = (
    <div className="p-6">
      <Suspense fallback={<ProjectsGridSkeleton />}>
        <ProjectsGridServer />
      </Suspense>
    </div>
  )

  return <ResizableLayout sidebar={<CompactSidebar />} content={content} />
}

// Analyst can only access analyst dashboard
export const AnalystDashboard = withRoleGuard(AnalystDashboardComponent, ["Analyst", "Admin"])

