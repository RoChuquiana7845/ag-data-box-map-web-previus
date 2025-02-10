import { MapPin } from "lucide-react"
import { motion } from "framer-motion"
import { Alert } from "@/components/ui/alert"
import { useAuth } from "@/lib/hooks/use-auth"

interface EmptyAreasProps {
  showBackendError?: boolean
}

export function EmptyAreas({ showBackendError = false }: EmptyAreasProps) {
  const { user } = useAuth()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 rounded-lg border-2 border-dashed"
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-4">
        <MapPin className="h-10 w-10 text-primary" />
      </div>
      <h3 className="text-2xl font-semibold tracking-tight mb-2">No hay áreas</h3>
      <p className="text-muted-foreground max-w-sm mb-4">
        {showBackendError
          ? "No se pudo conectar con el servidor"
          : user?.role === "User"
            ? "No tienes áreas registradas. Comienza creando tu primera área."
            : "No hay áreas registradas en el sistema."}
      </p>

      {showBackendError && (
        <Alert className="mb-6 max-w-sm" variant="warning">
          Error al cargar las áreas. Por favor, intente más tarde.
        </Alert>
      )}
    </motion.div>
  )
}

