"use client"

import { motion } from "framer-motion"
import { AreaCard } from "./area-card"
import type { Area } from "@/lib/types/area"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

interface AreasGridProps {
  areas: Area[]
}

export function AreasGrid({ areas }: AreasGridProps) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {areas.map((area) => (
        <motion.div key={area.id} variants={item}>
          <AreaCard area={area} />
        </motion.div>
      ))}
    </motion.div>
  )
}

