import { ObjectId } from 'mongodb'
import { notFound } from 'next/navigation'

import { ProjectSchema } from '@/types/project/schema'
import { collections } from '@/utils/constants'
import { ProjectCategorySchema } from '@/types/projectCategory/schema'
import { getDb } from '@/utils/mongo'

type ProjectWithCategory = ProjectSchema & {
    category: ProjectCategorySchema
}

/**
 * Get a project with its category
 * @param id - The project id
 * @returns The project with its category
 */
export const getProjectWithCategory = async (
    id: string,
): Promise<ProjectWithCategory> => {
    if (!ObjectId.isValid(id)) {
        notFound()
    }

    const database = await getDb()

    const projectsCollection = database.collection<ProjectSchema>(
        collections.PROJECTS,
    )

    const [project] = await projectsCollection
        .aggregate<ProjectWithCategory>([
            {
                $match: {
                    _id: new ObjectId(id),
                },
            },
            {
                $lookup: {
                    from: collections.PROJECT_CATEGORIES,
                    localField: 'categoryId',
                    foreignField: '_id',
                    as: 'category',
                },
            },
            {
                $unwind: '$category',
            },
        ])
        .toArray()

    if (!project) {
        notFound()
    }

    return project
}
