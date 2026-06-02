import { ProjectsCategoryResponse } from '@/types/apiResponses/admin/projects'
import { ProjectSchema } from '@/types/project/schema'
import { collections } from '@/utils/constants'
import { backErrors } from '@/utils/constants/messages'
import { getDb } from '@/utils/mongo'
import { ObjectId } from 'mongodb'
import { NextResponse } from 'next/server'

type ReorderProjectsPayload = {
    projects: {
        _id: string
        order: number
    }[]
}

export const PATCH = async (req: Request) => {
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

    const { projects } = (await req.json()) as ReorderProjectsPayload

    const result = await projectsCollection.bulkWrite(
        projects.map((project) => ({
            updateOne: {
                filter: {
                    _id: new ObjectId(project._id),
                },
                update: {
                    $set: {
                        order: project.order,
                    },
                },
            },
        })),
    )

    return NextResponse.json(result)
}

export const GET = async () => {
    const database = await getDb()

    const projectsCollection = database.collection<ProjectSchema>(
        collections.PROJECTS,
    )

    const projectsByCategories = await projectsCollection
        .aggregate<ProjectsCategoryResponse>([
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
                        _id: '$category._id',
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
                        _id: '$_id._id',
                        name: '$_id.name',
                        order: '$_id.order',
                    },
                    projects: 1,
                },
            },
        ])
        .toArray()

    return NextResponse.json(projectsByCategories)
}
