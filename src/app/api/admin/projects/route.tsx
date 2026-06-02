import { ObjectId } from 'mongodb'
import { NextResponse } from 'next/server'

import { collections } from '@/utils/constants'
import { backErrors } from '@/utils/constants/messages'
import { getDb } from '@/utils/mongo'
import { ProjectSchema } from '@/types/project/schema'
import { ProjectCategorySchema } from '@/types/projectCategory/schema'
import { ProjectTableRowType } from '@/utils/enums'
import { ProjectsCategoryResponse } from '@/types/apiResponses/admin/projects'

type ReorderCategoriesPayload = {
    type: typeof ProjectTableRowType.enum.category
    categories: {
        id: string
        order: number
    }[]
}

type ReorderProjectsPayload = {
    type: typeof ProjectTableRowType.enum.project
    categoryId: string
    projects: {
        id: string
        order: number
    }[]
}

type ReorderPayload = ReorderCategoriesPayload | ReorderProjectsPayload

export const PATCH = async (req: Request) => {
    console.log(
        '🔥 PATCH categories at ' +
            new Date().toLocaleString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            }),
    )

    const database = await getDb()

    if (!database) {
        return NextResponse.json(null, {
            status: 500,
            statusText: backErrors.DATABASE_CONNECTION_ERROR,
        })
    }

    const body = (await req.json()) as ReorderPayload

    console.log({ body })

    if (body.type === ProjectTableRowType.enum.category) {
        console.log({ body: body.categories })

        const categoriesCollection = database.collection<ProjectCategorySchema>(
            collections.PROJECT_CATEGORIES,
        )

        const result = await categoriesCollection.bulkWrite(
            body.categories.map((category) => ({
                updateOne: {
                    filter: {
                        _id: new ObjectId(category.id),
                    },
                    update: {
                        $set: {
                            order: category.order,
                        },
                    },
                },
            })),
        )

        console.log({ result })

        return NextResponse.json(result)
    }

    if (body.type === ProjectTableRowType.enum.project) {
        const projectsCollection = database.collection<ProjectSchema>(
            collections.PROJECTS,
        )

        const result = await projectsCollection.bulkWrite(
            body.projects.map((project) => ({
                updateOne: {
                    filter: {
                        _id: new ObjectId(project.id),
                        categoryId: new ObjectId(body.categoryId),
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

    return NextResponse.json(null, {
        status: 400,
        statusText: backErrors.INVALID_REQUEST_BODY,
    })
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
