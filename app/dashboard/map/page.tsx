import { InteractiveMap } from "@/components/map/interactive-map"
import { ResizableLayout } from "@/components/dashboard/resizable-layout"
import { CompactSidebar } from "@/components/dashboard/compact-sidebar"

// Mock data - Replace with actual API calls
const mockAreas = [
  {
    id: "1",
    code: "AREA-001",
    description: "Área de Cultivo 1",
    size: 100,
    user_id: "user1",
    geom: {
      type: "Polygon",
      coordinates: [
        [
          [-70.9, -33.4],
          [-70.8, -33.4],
          [-70.8, -33.3],
          [-70.9, -33.3],
          [-70.9, -33.4],
        ],
      ],
    },
  },
]

const mockSamplePoints = [
  {
    id: "1",
    sample_id: "SAMPLE-001",
    geom: {
      type: "Point",
      coordinates: [-70.85, -33.35],
    },
    value: 0.75,
    type: "NDVI",
    status: "active" as const,
  },
]

export default function MapPage() {
  const content = (
    <div className="h-full">
      <InteractiveMap areas={mockAreas} samplePoints={mockSamplePoints} />
    </div>
  )

  return <ResizableLayout sidebar={<CompactSidebar />} content={content} />
}

