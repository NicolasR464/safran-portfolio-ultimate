'use client'

import { useEffect } from 'react'

import ProjectsTreeTable from './ProjectsTreeTable'
import { useProjectsStore } from '@/stores/admin/projects'

const ProjectsTable = () => {
    const { projectsByCategories, initialized, isLoading, fetchProjects } =
        useProjectsStore()

    useEffect(() => {
        if (!initialized) {
            void fetchProjects()
        }
    }, [initialized, fetchProjects])

    if (isLoading && !initialized) {
        return <p>Loading projects...</p>
    }

    if (!initialized) {
        return null
    }

    return (
        <ProjectsTreeTable
            key={projectsByCategories.length}
            projectsByCategories={projectsByCategories}
        />
    )
}

export default ProjectsTable
