import type { AreaGeometry } from "@/lib/types/geometry"

export const FIELD_COORDINATES: AreaGeometry = {
  id: "test-area-1",
  areaId: "test-1",
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
  style: {
    fillColor: "#ffffff",
    strokeColor: "#ffffff",
    fillOpacity: 0.2,
    strokeWidth: 2,
  },
  bbox: [-79.671424, -2.06597, -79.6682, -2.063534], // [minLng, minLat, maxLng, maxLat]
}

// Función para validar que el polígono no tenga auto-intersecciones
export function validatePolygon(coordinates: [number, number][]): boolean {
  // Implementación simple de validación
  if (coordinates.length < 4) return false

  // Verificar que los puntos formen un polígono simple
  for (let i = 0; i < coordinates.length - 2; i++) {
    for (let j = i + 2; j < coordinates.length - 1; j++) {
      if (segmentsIntersect(coordinates[i], coordinates[i + 1], coordinates[j], coordinates[j + 1])) {
        return false
      }
    }
  }
  return true
}

// Función auxiliar para verificar si dos segmentos se intersectan
function segmentsIntersect(
  p1: [number, number],
  p2: [number, number],
  p3: [number, number],
  p4: [number, number],
): boolean {
  const ccw = (A: [number, number], B: [number, number], C: [number, number]): number => {
    return (C[1] - A[1]) * (B[0] - A[0]) > (B[1] - A[1]) * (C[0] - A[0])
  }

  return ccw(p1, p3, p4) !== ccw(p2, p3, p4) && ccw(p1, p2, p3) !== ccw(p1, p2, p4)
}

// Función para calcular el área aproximada en hectáreas
export function calculateAreaInHectares(coordinates: [number, number][]): number {
  let area = 0
  for (let i = 0; i < coordinates.length - 1; i++) {
    const [lng1, lat1] = coordinates[i]
    const [lng2, lat2] = coordinates[i + 1]
    area += lng1 * lat2 - lng2 * lat1
  }
  area = Math.abs(area) / 2

  // Convertir a hectáreas (aproximación)
  const latitudeFactor = 111320 // metros por grado de latitud
  const longitudeFactor = Math.cos((coordinates[0][1] * Math.PI) / 180) * 111320
  return (area * latitudeFactor * longitudeFactor) / 10000 // Convertir m² a hectáreas
}

// Función para calcular el centro del polígono
export function calculatePolygonCenter(coordinates: [number, number][]): { lat: number; lng: number } {
  const lats = coordinates.map((coord) => coord[1])
  const lngs = coordinates.map((coord) => coord[0])

  return {
    lat: (Math.min(...lats) + Math.max(...lats)) / 2,
    lng: (Math.min(...lngs) + Math.max(...lngs)) / 2,
  }
}

