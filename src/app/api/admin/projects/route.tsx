import { ObjectId } from 'mongodb'
import { NextResponse } from 'next/server'

import { collections } from '@/utils/constants'
import { backErrors } from '@/utils/constants/messages'
import { getDb } from '@/utils/mongo'
import { ProjectSchema } from '@/types/project/schema'
import { ProjectCategorySchema } from '@/types/projectCategory/schema'
import { ProjectTableRowType } from '@/utils/enums'
import {
    ProjectsCategoryResponse,
    UpdateProjectsPayload,
} from '@/types/apiResponses/admin/projects'

export const PATCH = async (req: Request) => {
    /* @TODO : Add auth */

    const database = await getDb()

    if (!database) {
        return NextResponse.json(null, {
            status: 500,
            statusText: backErrors.DATABASE_CONNECTION_ERROR,
        })
    }

    const body = await req.json()

    const bodyParsed = UpdateProjectsPayload.safeParse(body)

    if (!bodyParsed.success) {
        return NextResponse.json(null, {
            status: 400,
            statusText: backErrors.INVALID_REQUEST_BODY,
        })
    }

    /* Category update */
    if (bodyParsed.data.type === ProjectTableRowType.enum.category) {
        const categoriesCollection = database.collection<ProjectCategorySchema>(
            collections.PROJECT_CATEGORIES,
        )

        const result = await categoriesCollection.bulkWrite(
            bodyParsed.data.categories.map((category) => ({
                updateOne: {
                    filter: {
                        _id: new ObjectId(category._id),
                    },
                    update: {
                        $set: {
                            order: category.order,
                            ...(category.name !== undefined && {
                                name: category.name,
                            }),
                        },
                    },
                },
            })),
        )

        return NextResponse.json(result)
    }

    /* Project update */
    if (body.type === ProjectTableRowType.enum.project) {
        const projectsCollection = database.collection<ProjectSchema>(
            collections.PROJECTS,
        )

        // Moving inside the same category
        if (
            bodyParsed.data.categoryInitialId ===
            bodyParsed.data.project.categoryId
        ) {
            if (
                bodyParsed.data.orderInitial === bodyParsed.data.project.order
            ) {
                return
            }

            // Moving up
            if (bodyParsed.data.project.order < bodyParsed.data.orderInitial) {
                await projectsCollection.updateMany(
                    {
                        categoryId: new ObjectId(
                            bodyParsed.data.project.categoryId,
                        ),
                        order: {
                            $gt: bodyParsed.data.project.order,
                            $lte: bodyParsed.data.orderInitial,
                        },
                    },
                    {
                        $inc: {
                            order: 1,
                        },
                    },
                )
            }

            // Moving down
            if (bodyParsed.data.project.order > bodyParsed.data.orderInitial) {
                await projectsCollection.updateMany(
                    {
                        categoryId: new ObjectId(
                            bodyParsed.data.project.categoryId,
                        ),
                        order: {
                            $gte: bodyParsed.data.orderInitial,
                            $lt: bodyParsed.data.project.order,
                        },
                    },
                    {
                        $inc: {
                            order: -1,
                        },
                    },
                )
            }
        }

        // Moving into an other category
        if (
            bodyParsed.data.categoryInitialId !==
            bodyParsed.data.project.categoryId
        ) {
            // Updating the old category
            await projectsCollection.updateMany(
                {
                    categoryId: new ObjectId(bodyParsed.data.categoryInitialId),
                    order: {
                        $gte: bodyParsed.data.orderInitial,
                    },
                },
                {
                    $inc: {
                        order: -1,
                    },
                },
            )

            // Updating the targeted category
            await projectsCollection.updateMany(
                {
                    categoryId: new ObjectId(
                        bodyParsed.data.project.categoryId,
                    ),
                    order: {
                        $gte: bodyParsed.data.project.order,
                    },
                },
                {
                    $inc: {
                        order: 1,
                    },
                },
            )
        }

        // Update the project
        const { _id, categoryId, ...project } = bodyParsed.data.project

        const projectUpdated = await projectsCollection.updateOne(
            { _id: new ObjectId(_id) },
            {
                $set: {
                    categoryId: new ObjectId(categoryId),
                    ...project,
                },
            },
        )

        return NextResponse.json(projectUpdated, {
            status: 200,
            statusText: 'Updated',
        })
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
