import { ProjectsListResponse } from '@/types/apiResponses/admin/projects'
import { ProjectSchema } from '@/types/project/schema'
import { collections } from '@/utils/constants'
import { backErrors } from '@/utils/constants/messages'
import { getDb } from '@/utils/mongo'
import { NextResponse } from 'next/server'

/** This returns the project list grouped by category. */
export const GET = async () => {
    const database = await getDb()

    if (!database) {
        return NextResponse.json(null, {
            status: 500,
            statusText: backErrors.DATABASE_CONNECTION_ERROR,
        })
    }

    const projectsCollection = database.collection<ProjectSchema>(
        collections.PROJECTS,
    )

    const projectsByCategories = await projectsCollection
        .aggregate<ProjectsListResponse[number]>([
            {
                $sort: {
                    'category.order': 1,
                    order: 1,
                    _id: 1,
                },
            },
            {
                $group: {
                    _id: {
                        name: '$category.name',
                        order: '$category.order',
                    },
                    projects: {
                        $push: '$$ROOT',
                    },
                },
            },
            {
                $sort: {
                    '_id.order': 1,
                    '_id.name': 1,
                },
            },
            {
                $project: {
                    _id: 0,
                    category: {
                        name: '$_id.name',
                        order: '$_id.order',
                    },
                    projects: 1,
                },
            },
        ])
        .toArray()

    return NextResponse.json<ProjectsListResponse>(projectsByCategories)
}
