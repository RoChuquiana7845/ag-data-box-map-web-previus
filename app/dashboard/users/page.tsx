import { Suspense } from "react"
import { UsersTable } from "@/components/users/users-table"
import { EmptyUsers } from "@/components/users/empty-users"
import { CreateUserDialog } from "@/components/users/create-user-dialog"
import { getUsers } from "@/lib/services/users" // Fixed import path
import { withRoleGuard } from "@/lib/hocs/with-role-guard"
import { Skeleton } from "@/components/ui/skeleton"
import { ResizableLayout } from "@/components/dashboard/resizable-layout"
import { CompactSidebar } from "@/components/dashboard/compact-sidebar"

function UsersTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-10 w-[150px]" />
      </div>
      <div className="border rounded-md">
        <div className="p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center py-4 space-x-4">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

async function UsersContent() {
  const { users, isBackendError } = await getUsers()

  if (users.length === 0) {
    return <EmptyUsers showBackendError={isBackendError} />
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Usuarios</h2>
          <p className="text-muted-foreground">Gestiona los usuarios del sistema</p>
        </div>
        <CreateUserDialog />
      </div>
      <UsersTable users={users} />
    </div>
  )
}

function UsersPage() {
  const content = (
    <div className="p-6">
      <Suspense fallback={<UsersTableSkeleton />}>
        <UsersContent />
      </Suspense>
    </div>
  )

  return <ResizableLayout sidebar={<CompactSidebar />} content={content} />
}

// Only Admin can access users page
export default withRoleGuard(UsersPage, ["Admin"])

