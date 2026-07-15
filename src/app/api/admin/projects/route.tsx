import { ObjectId } from 'mongodb'
import { NextResponse } from 'next/server'

import { collections } from '@/utils/constants'
import { backErrors } from '@/utils/constants/messages'
import { getDb, getMongoClient } from '@/utils/mongo'
import { ProjectSchema } from '@/types/project/schema'
import { ProjectCategorySchema } from '@/types/projectCategory/schema'
import { ProjectTableRowType } from '@/utils/enums/admin'
import {
    CreateProjectPayload,
    ProjectsCategoryResponse,
    UpdateProjectsPayload,
    DeleteRowPayload,
} from '@/types/api/admin/projects'

import { cloudinaryImagesDelete } from '@/utils/functions/cloudinary'
import { getVideoInfoFromUrl } from '@/utils/functions/video'

/** Get all projects with categories */
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

/** Create a new project */
export const POST = async (req: Request) => {
    /* @TODO: Add auth */

    const database = await getDb()

    if (!database) {
        return NextResponse.json(
            {
                success: false,
                message: backErrors.DATABASE_CONNECTION_ERROR,
            },
            {
                status: 500,
            },
        )
    }

    const body = await req.json()

    if (!body) {
        return NextResponse.json(
            {
                success: false,
                message: backErrors.INVALID_REQUEST_BODY,
            },
            {
                status: 400,
            },
        )
    }

    const bodyParsed = CreateProjectPayload.safeParse(body)

    if (!bodyParsed.success) {
        return NextResponse.json(
            {
                success: false,
                message: backErrors.INVALID_REQUEST_BODY,
                errors: bodyParsed.error.flatten(),
            },
            {
                status: 400,
            },
        )
    }

    const projectPayload = bodyParsed.data

    if (!ObjectId.isValid(projectPayload.categoryId)) {
        return NextResponse.json(
            {
                success: false,
                message: 'Invalid category ID.',
            },
            {
                status: 400,
            },
        )
    }

    type ProjectInsertSchema = Omit<ProjectSchema, '_id'>

    const projectsCollection = database.collection<ProjectInsertSchema>(
        collections.PROJECTS,
    )

    const categoryId = new ObjectId(projectPayload.categoryId)

    const client = await getMongoClient()
    const mongoSession = client.startSession()

    const createdProject = await mongoSession.withTransaction(async () => {
        const projectsCount = await projectsCollection.countDocuments(
            {
                categoryId,
            },
            {
                session: mongoSession,
            },
        )

        const normalizedOrder = Math.min(
            Math.max(projectPayload.order, 1),
            projectsCount + 1,
        )

        await projectsCollection.updateMany(
            {
                categoryId,
                order: {
                    $gte: normalizedOrder,
                },
            },
            {
                $inc: {
                    order: 1,
                },
            },
            {
                session: mongoSession,
            },
        )

        const {
            categoryId: _categoryId,
            order: _order,
            videoUrl,
            ...project
        } = projectPayload

        const video = videoUrl && getVideoInfoFromUrl(videoUrl)

        const document = {
            ...project,
            categoryId,
            order: normalizedOrder,
            ...(video && {
                video: {
                    videoId: video.id,
                    url: videoUrl,
                    player: video.player,
                },
            }),
        } satisfies Omit<ProjectSchema, '_id'>

        const insertResult = await projectsCollection.insertOne(document, {
            session: mongoSession,
        })

        return {
            _id: insertResult.insertedId,
            ...document,
        }
    })

    await mongoSession.endSession()

    if (!createdProject) {
        return NextResponse.json(null, {
            status: 400,
            statusText: backErrors.PROJECT_ERROR,
        })
    }

    return NextResponse.json(
        {
            success: true,
            message: 'Project created.',
            project: createdProject,
        },
        {
            status: 201,
        },
    )
}

/** Update a project or category */
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

/** Delete a project or category */
export const DELETE = async (req: Request) => {
    /* @TODO: Add auth */

    const database = await getDb()

    if (!database) {
        return NextResponse.json(
            {
                success: false,
                message: backErrors.DATABASE_CONNECTION_ERROR,
            },
            {
                status: 500,
            },
        )
    }

    let body: unknown

    try {
        body = await req.json()
    } catch {
        return NextResponse.json(
            {
                success: false,
                message: backErrors.INVALID_REQUEST_BODY,
            },
            {
                status: 400,
            },
        )
    }

    const bodyParsed = DeleteRowPayload.safeParse(body)

    if (!bodyParsed.success) {
        return NextResponse.json(
            {
                success: false,
                message: backErrors.INVALID_REQUEST_BODY,
                errors: bodyParsed.error.flatten(),
            },
            {
                status: 400,
            },
        )
    }

    const { _id, type } = bodyParsed.data

    if (!ObjectId.isValid(_id)) {
        return NextResponse.json(
            {
                success: false,
                message: 'Invalid identifier.',
            },
            {
                status: 400,
            },
        )
    }

    const objectId = new ObjectId(_id)

    const projectsCollection = database.collection<ProjectSchema>(
        collections.PROJECTS,
    )

    const categoriesCollection = database.collection<ProjectCategorySchema>(
        collections.PROJECT_CATEGORIES,
    )

    const client = await getMongoClient()
    const mongoSession = client.startSession()

    if (type === ProjectTableRowType.enum.project) {
        const deletedProject = await mongoSession.withTransaction(async () => {
            const project = await projectsCollection.findOne(
                {
                    _id: objectId,
                },
                {
                    session: mongoSession,
                },
            )

            if (!project) {
                return null
            }

            const deleteResult = await projectsCollection.deleteOne(
                {
                    _id: objectId,
                },
                {
                    session: mongoSession,
                },
            )

            if (deleteResult.deletedCount !== 1) {
                throw new Error('Project deletion failed.')
            }

            // Close the order gap in the same category.
            await projectsCollection.updateMany(
                {
                    categoryId: project.categoryId,
                    order: {
                        $gt: project.order,
                    },
                },
                {
                    $inc: {
                        order: -1,
                    },
                },
                {
                    session: mongoSession,
                },
            )

            return project
        })

        await mongoSession.endSession()

        if (!deletedProject) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Project not found.',
                },
                {
                    status: 404,
                },
            )
        }

        const imageIds = new Set(
            deletedProject.images.map((image) => image.imageId),
        )

        await cloudinaryImagesDelete(imageIds)

        return NextResponse.json({
            success: true,
            message: 'Project and its images deleted.',
        })
    }

    if (type === ProjectTableRowType.enum.category) {
        const projectsToDelete = await projectsCollection
            .find(
                { categoryId: objectId },
                {
                    projection: { images: 1 },
                    session: mongoSession,
                },
            )
            .toArray()

        const deletedCategory = await mongoSession.withTransaction(async () => {
            const category = await categoriesCollection.findOne(
                {
                    _id: objectId,
                },
                {
                    session: mongoSession,
                },
            )

            if (!category) {
                return null
            }

            await projectsCollection.deleteMany(
                {
                    categoryId: objectId,
                },
                {
                    session: mongoSession,
                },
            )

            const deleteResult = await categoriesCollection.deleteOne(
                {
                    _id: objectId,
                },
                {
                    session: mongoSession,
                },
            )

            if (deleteResult.deletedCount !== 1) {
                throw new Error('Category deletion failed.')
            }

            // Close the category order gap.
            await categoriesCollection.updateMany(
                {
                    order: {
                        $gt: category.order,
                    },
                },
                {
                    $inc: {
                        order: -1,
                    },
                },
                {
                    session: mongoSession,
                },
            )

            return category
        })

        await mongoSession.endSession()

        if (!deletedCategory) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Category not found.',
                },
                {
                    status: 404,
                },
            )
        }

        const imageIds = new Set(
            projectsToDelete.flatMap((project) =>
                project.images.map((image) => image.imageId),
            ),
        )

        await cloudinaryImagesDelete(imageIds)

        return NextResponse.json({
            success: true,
            message: 'Category, projects, and images deleted.',
        })
    }

    return NextResponse.json(
        {
            success: false,
            message: 'Unsupported row type.',
        },
        {
            status: 400,
        },
    )

    return NextResponse.json(
        {
            success: false,
            message:
                type === ProjectTableRowType.enum.project
                    ? 'Project deletion failed.'
                    : 'Category deletion failed.',
        },
        {
            status: 500,
        },
    )
}
