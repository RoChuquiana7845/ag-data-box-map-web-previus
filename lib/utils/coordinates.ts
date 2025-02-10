import type { AreaGeometry } from "@/lib/types/geometry"

// Exportamos las coordenadas en formato GeoJSON compatible con AreaGeometry
export const FIELD_COORDINATES: AreaGeometry = {
  id: "default-field",
  name: "Campo Por Defecto",
  description: "Coordenadas por defecto para análisis",
  geom: {
    type: "Polygon",
    coordinates: [
      [
        [-79.671282, -2.063534], // Punto 1 (esquina noroeste)
        [-79.6682, -2.063898], // Punto 2 (esquina noreste)
        [-79.670403, -2.06597], // Punto 4 (esquina sureste)
        [-79.671424, -2.065951], // Punto 3 (esquina suroeste)
        [-79.671282, -2.063534], // Cerrar el polígono volviendo al primer punto
      ],
    ],
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  projectId: "default-project",
}

export const validatePolygon = (geometry: AreaGeometry | null): boolean => {
  if (!geometry || !geometry.geom) return false
  return geometry.geom.type === "Polygon" && geometry.geom.coordinates.length > 0
}

export const calculatePolygonCenter = (geometry: AreaGeometry | null): { lng: number; lat: number } => {
  if (!validatePolygon(geometry)) {
    return { lng: -79.671282, lat: -2.063534 } // Default center if no valid geometry
  }

  const coordinates = geometry.geom.coordinates[0]
  const center = coordinates.reduce(
    (acc, curr) => ({
      lng: acc.lng + curr[0],
      lat: acc.lat + curr[1],
    }),
    { lng: 0, lat: 0 },
  )

  return {
    lng: center.lng / coordinates.length,
    lat: center.lat / coordinates.length,
  }
}

export const calculateAreaInHectares = (geometry: AreaGeometry | null): number => {
  if (!validatePolygon(geometry)) return 0

  const coordinates = geometry.geom.coordinates[0]
  let area = 0

  for (let i = 0; i < coordinates.length; i++) {
    const j = (i + 1) % coordinates.length
    area += coordinates[i][0] * coordinates[j][1]
    area -= coordinates[j][0] * coordinates[i][1]
  }

  area = Math.abs(area) / 2
  // Convert square degrees to hectares (approximate conversion)
  return area * 10000000
}

