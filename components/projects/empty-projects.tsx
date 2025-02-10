import { FolderPlus, Construction } from "lucide-react"
import { CreateProjectDialog } from "./create-project-dialog"
import { useAuth } from "@/lib/hooks/use-auth"
import { motion } from "framer-motion"
import { Alert } from "@/components/ui/alert"

interface EmptyProjectsProps {
  showBackendError?: boolean
}

export function EmptyProjects({ showBackendError = false }: EmptyProjectsProps) {
  const { user } = useAuth()
  const canCreateProject = user?.role === "Admin" || user?.role === "User"

  // Actualizar el mensaje para usuarios
  const getMessage = () => {
    if (showBackendError) {
      return "No hay servicio del backend"
    }

    switch (user?.role) {
      case "Admin":
        return "No hay proyectos creados en el sistema. Comienza creando el primer proyecto."
      case "User":
        return "No tienes proyectos creados aún. Puedes comenzar creando tu primer proyecto."
      case "Analyst":
        return "Los usuarios no han creado ningún proyecto todavía."
      default:
        return "No hay proyectos disponibles."
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 rounded-lg border-2 border-dashed"
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-4">
        {showBackendError ? (
          <Construction className="h-10 w-10 text-primary" />
        ) : (
          <FolderPlus className="h-10 w-10 text-primary" />
        )}
      </div>
      <h3 className="text-2xl font-semibold tracking-tight mb-2">No hay proyectos</h3>
      <p className="text-muted-foreground max-w-sm mb-4">{getMessage()}</p>

      {showBackendError && (
        <Alert className="mb-6 max-w-sm" variant="warning">
          No hay servicio del backend
        </Alert>
      )}

      {canCreateProject && !showBackendError && <CreateProjectDialog />}
    </motion.div>
  )
}

