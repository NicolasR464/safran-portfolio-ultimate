import { ObjectId } from 'mongodb'
import { NextResponse } from 'next/server'

import { collections } from '@/utils/constants'
import { backErrors } from '@/utils/constants/messages'
import { getDb, getMongoClient } from '@/utils/mongo'
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
    if (bodyParsed.data.type === ProjectTableRowType.enum.project) {
        const projectsCollection = database.collection<ProjectSchema>(
            collections.PROJECTS,
        )

        const projectPayload = bodyParsed.data

        const client = await getMongoClient()
        const mongoSession = client.startSession()

        await mongoSession
            .withTransaction(async () => {
                // Moving inside the same category
                if (
                    projectPayload.categoryInitialId ===
                    projectPayload.project.categoryId
                ) {
                    // Moving up
                    if (
                        projectPayload.project.order <
                        projectPayload.orderInitial
                    ) {
                        await projectsCollection.updateMany(
                            {
                                categoryId: new ObjectId(
                                    projectPayload.project.categoryId,
                                ),
                                order: {
                                    $gte: projectPayload.project.order,
                                    $lt: projectPayload.orderInitial,
                                },
                            },
                            {
                                $inc: {
                                    order: 1,
                                },
                            },
                            { session: mongoSession },
                        )
                    }

                    // Moving down
                    if (
                        projectPayload.project.order >
                        projectPayload.orderInitial
                    ) {
                        // Update projects with orders below the target
                        await projectsCollection.updateMany(
                            {
                                categoryId: new ObjectId(
                                    projectPayload.project.categoryId,
                                ),
                                order: {
                                    $gt: projectPayload.orderInitial,
                                    $lte: projectPayload.project.order,
                                },
                            },
                            {
                                $inc: {
                                    order: -1,
                                },
                            },
                            { session: mongoSession },
                        )
                    }
                }

                // Moving into an other category
                if (
                    projectPayload.categoryInitialId !==
                    projectPayload.project.categoryId
                ) {
                    // Updating the old category
                    await projectsCollection.updateMany(
                        {
                            categoryId: new ObjectId(
                                projectPayload.categoryInitialId,
                            ),
                            order: {
                                $gte: projectPayload.orderInitial,
                            },
                        },
                        {
                            $inc: {
                                order: -1,
                            },
                        },
                        { session: mongoSession },
                    )

                    // Updating the targeted category
                    await projectsCollection.updateMany(
                        {
                            categoryId: new ObjectId(
                                projectPayload.project.categoryId,
                            ),
                            order: {
                                $gte: projectPayload.project.order,
                            },
                        },
                        {
                            $inc: {
                                order: 1,
                            },
                        },
                        { session: mongoSession },
                    )
                }

                // Update the project
                const { _id, categoryId, order, ...project } =
                    projectPayload.project

                await projectsCollection.updateOne(
                    { _id: new ObjectId(_id) },
                    {
                        $set: {
                            categoryId: new ObjectId(categoryId),
                            order: order,
                            ...project,
                        },
                    },
                    { session: mongoSession },
                )
            })
            .finally(async () => {
                await mongoSession.endSession()
            })

        return new NextResponse(null, {
            status: 204,
            statusText: 'Updated',
        })
    }
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
