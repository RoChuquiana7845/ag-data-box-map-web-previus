import { BrushIcon as Draw } from "lucide-react"
import { motion } from "framer-motion"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface EmptyGeometriesProps {
  showBackendError?: boolean
}

export function EmptyGeometries({ showBackendError = false }: EmptyGeometriesProps) {
  const router = useRouter()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 rounded-lg border-2 border-dashed"
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-4">
        <Draw className="h-10 w-10 text-primary" />
      </div>
      <h3 className="text-2xl font-semibold tracking-tight mb-2">No hay geometrías</h3>
      <p className="text-muted-foreground max-w-sm mb-4">
        {showBackendError
          ? "No se pudo conectar con el servidor"
          : "No hay geometrías registradas. Comienza dibujando una nueva geometría en el mapa."}
      </p>

      {showBackendError ? (
        <Alert className="mb-6 max-w-sm" variant="warning">
          Error al cargar las geometrías. Por favor, intente más tarde.
        </Alert>
      ) : (
        <Button onClick={() => router.push("/dashboard/map")}>Ir al mapa</Button>
      )}
    </motion.div>
  )
}

