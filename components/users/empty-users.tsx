import { Users2 } from "lucide-react"
import { motion } from "framer-motion"
import { Alert } from "@/components/ui/alert"
import { CreateUserDialog } from "./create-user-dialog"

interface EmptyUsersProps {
  showBackendError?: boolean
}

export function EmptyUsers({ showBackendError = false }: EmptyUsersProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Usuarios</h2>
          <p className="text-muted-foreground">Gestiona los usuarios del sistema</p>
        </div>
        <CreateUserDialog />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 rounded-lg border-2 border-dashed"
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-4">
          <Users2 className="h-10 w-10 text-primary" />
        </div>
        <h3 className="text-2xl font-semibold tracking-tight mb-2">No hay usuarios</h3>
        <p className="text-muted-foreground max-w-sm mb-4">
          {showBackendError ? "No se pudo conectar con el servidor" : "No hay usuarios registrados en el sistema."}
        </p>

        {showBackendError && (
          <Alert className="mb-6 max-w-sm" variant="warning">
            Error al cargar los usuarios. Por favor, intente más tarde.
          </Alert>
        )}
      </motion.div>
    </div>
  )
}

