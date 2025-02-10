"use client"

import { motion } from "framer-motion"
import { ProjectCard } from "./project-card"
import { CreateProjectDialog } from "./create-project-dialog"
import { EmptyProjects } from "./empty-projects"
import { useAuth } from "@/lib/hooks/use-auth"
import type { Project } from "@/lib/types/project"

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

interface ProjectsGridProps {
  projects: Project[]
  isBackendError?: boolean
}

export function ProjectsGrid({ projects = [], isBackendError = false }: ProjectsGridProps) {
  const { user } = useAuth()
  const canCreateProject = user?.role === "Admin" || user?.role === "User"

  // Filtrar proyectos según el rol
  const filteredProjects = projects.filter((project) => {
    switch (user?.role) {
      case "Admin":
        return true // Admin ve todos los proyectos
      case "User":
        return project.userId === user.id // Usuario solo ve sus proyectos
      case "Analyst":
        return true // Analyst ve todos los proyectos
      default:
        return false
    }
  })

  // Si no hay proyectos después del filtrado, mostrar estado vacío
  if (filteredProjects.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Proyectos</h2>
            <p className="text-muted-foreground">
              {user?.role === "User" ? "Comienza a gestionar tus proyectos agrícolas" : "No hay proyectos disponibles"}
            </p>
          </div>
          {canCreateProject && <CreateProjectDialog />}
        </div>
        <EmptyProjects showBackendError={isBackendError} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Proyectos</h2>
          <p className="text-muted-foreground">
            {`${filteredProjects.length} proyecto${filteredProjects.length === 1 ? "" : "s"} en total`}
          </p>
        </div>
        {canCreateProject && <CreateProjectDialog />}
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredProjects.map((project) => (
          <motion.div key={project.id} variants={item}>
            <ProjectCard project={project} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

