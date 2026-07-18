import { ObjectId } from 'mongodb'
import { NextResponse } from 'next/server'

import { collections } from '@/utils/constants'
import { backErrors } from '@/utils/constants/messages'
import { getDb, getMongoClient } from '@/utils/mongo'
import { ProjectSchema } from '@/types/project/schema'
import { ProjectCategorySchema } from '@/types/projectCategory/schema'
import { ProjectTableRowType } from '@/utils/enums/admin'
import {
    CreateProjectOrCategoryPayload,
    DeleteRowPayload,
    ProjectsCategoryResponse,
    UpdateProjectsPayload,
} from '@/types/api/admin/projects'

import { cloudinaryImagesDelete } from '@/utils/functions/cloudinary'
import { getVideoInfoFromUrl } from '@/utils/functions/video'

const parseRequestBody = (req: Request): Promise<unknown | null> =>
    req.json().catch(() => null)

/** Get all projects with categories */
export const GET = async () => {
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

    const categoriesCollection = database.collection<ProjectCategorySchema>(
        collections.PROJECT_CATEGORIES,
    )

    const projectsByCategories = await categoriesCollection
        .aggregate<ProjectsCategoryResponse>([
            {
                $lookup: {
                    from: collections.PROJECTS,
                    let: {
                        categoryId: '$_id',
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ['$categoryId', '$$categoryId'],
                                },
                            },
                        },
                        {
                            $sort: {
                                order: 1,
                                _id: 1,
                            },
                        },
                    ],
                    as: 'projects',
                },
            },
            {
                $sort: {
                    order: 1,
                    name: 1,
                    _id: 1,
                },
            },
            {
                $project: {
                    _id: 0,
                    category: {
                        _id: '$_id',
                        name: '$name',
                        order: '$order',
                    },
                    projects: 1,
                },
            },
        ])
        .toArray()

    return NextResponse.json(projectsByCategories)
}

/** Create a new project or category */
export const POST = async (req: Request) => {
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

    const body = await parseRequestBody(req)

    if (body === null) {
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

    const bodyParsed = CreateProjectOrCategoryPayload.safeParse(body)

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

    const client = await getMongoClient()
    const mongoSession = client.startSession()

    if (bodyParsed.data.type === ProjectTableRowType.enum.category) {
        type CategoryInsertSchema = Omit<ProjectCategorySchema, '_id'>

        const categoriesCollection = database.collection<CategoryInsertSchema>(
            collections.PROJECT_CATEGORIES,
        )

        const categoryPayload = bodyParsed.data.category

        const createdCategory = await mongoSession
            .withTransaction(async () => {
                const categoriesCount =
                    await categoriesCollection.countDocuments(
                        {},
                        {
                            session: mongoSession,
                        },
                    )

                const normalizedOrder = Math.min(
                    Math.max(categoryPayload.order, 1),
                    categoriesCount + 1,
                )

                await categoriesCollection.updateMany(
                    {
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

                const document = {
                    name: categoryPayload.name.trim(),
                    order: normalizedOrder,
                } satisfies CategoryInsertSchema

                const insertResult = await categoriesCollection.insertOne(
                    document,
                    {
                        session: mongoSession,
                    },
                )

                return {
                    _id: insertResult.insertedId,
                    ...document,
                }
            })
            .finally(() => mongoSession.endSession())

        if (!createdCategory) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Category creation failed.',
                },
                {
                    status: 400,
                },
            )
        }

        return NextResponse.json(
            {
                success: true,
                message: 'Category created.',
                category: createdCategory,
            },
            {
                status: 201,
            },
        )
    }

    const projectPayload = bodyParsed.data.project

    if (!ObjectId.isValid(projectPayload.categoryId)) {
        await mongoSession.endSession()

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

    const categoryId = new ObjectId(projectPayload.categoryId)

    const categoriesCollection = database.collection<ProjectCategorySchema>(
        collections.PROJECT_CATEGORIES,
    )

    type ProjectInsertSchema = Omit<ProjectSchema, '_id'>

    const projectsCollection = database.collection<ProjectInsertSchema>(
        collections.PROJECTS,
    )

    const createdProject = await mongoSession
        .withTransaction(async () => {
            const category = await categoriesCollection.findOne(
                {
                    _id: categoryId,
                },
                {
                    session: mongoSession,
                },
            )

            if (!category) {
                return null
            }

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

            const videoInfo = videoUrl
                ? getVideoInfoFromUrl(videoUrl)
                : undefined

            const video =
                videoUrl && videoInfo?.id && videoInfo.player
                    ? {
                          videoId: videoInfo.id,
                          url: videoUrl,
                          player: videoInfo.player,
                      }
                    : undefined

            const document = {
                ...project,
                categoryId,
                order: normalizedOrder,
                ...(video && { video }),
            } satisfies ProjectInsertSchema

            const insertResult = await projectsCollection.insertOne(document, {
                session: mongoSession,
            })

            return {
                _id: insertResult.insertedId,
                ...document,
            }
        })
        .finally(() => mongoSession.endSession())

    if (!createdProject) {
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
/** Update a project or category */
export const PATCH = async (req: Request) => {
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

    const body = await parseRequestBody(req)

    if (body === null) {
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

    const bodyParsed = UpdateProjectsPayload.safeParse(body)

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

    if (bodyParsed.data.type === ProjectTableRowType.enum.category) {
        const categoriesCollection = database.collection<ProjectCategorySchema>(
            collections.PROJECT_CATEGORIES,
        )

        const containsInvalidId = bodyParsed.data.categories.some(
            (category) => !ObjectId.isValid(category._id),
        )

        if (containsInvalidId) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Invalid category identifier.',
                },
                {
                    status: 400,
                },
            )
        }

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
                                name: category.name.trim(),
                            }),
                        },
                    },
                },
            })),
        )

        return NextResponse.json({
            success: true,
            message: 'Categories updated.',
            result,
        })
    }

    const projectPayload = bodyParsed.data

    if (
        !ObjectId.isValid(projectPayload.project._id) ||
        !ObjectId.isValid(projectPayload.categoryInitialId) ||
        !ObjectId.isValid(projectPayload.project.categoryId)
    ) {
        return NextResponse.json(
            {
                success: false,
                message: 'Invalid project or category identifier.',
            },
            {
                status: 400,
            },
        )
    }

    const projectsCollection = database.collection<ProjectSchema>(
        collections.PROJECTS,
    )

    const client = await getMongoClient()
    const mongoSession = client.startSession()

    const updateResult = await mongoSession
        .withTransaction(async () => {
            const initialCategoryId = new ObjectId(
                projectPayload.categoryInitialId,
            )

            const targetCategoryId = new ObjectId(
                projectPayload.project.categoryId,
            )

            const isSameCategory =
                projectPayload.categoryInitialId ===
                projectPayload.project.categoryId

            if (isSameCategory) {
                if (
                    projectPayload.project.order < projectPayload.orderInitial
                ) {
                    await projectsCollection.updateMany(
                        {
                            categoryId: targetCategoryId,
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
                        {
                            session: mongoSession,
                        },
                    )
                }

                if (
                    projectPayload.project.order > projectPayload.orderInitial
                ) {
                    await projectsCollection.updateMany(
                        {
                            categoryId: targetCategoryId,
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
                        {
                            session: mongoSession,
                        },
                    )
                }
            } else {
                await projectsCollection.updateMany(
                    {
                        categoryId: initialCategoryId,
                        order: {
                            $gt: projectPayload.orderInitial,
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

                await projectsCollection.updateMany(
                    {
                        categoryId: targetCategoryId,
                        order: {
                            $gte: projectPayload.project.order,
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
            }

            const {
                _id,
                categoryId: _categoryId,
                order,
                videoUrl,
                ...project
            } = projectPayload.project

            const video =
                videoUrl === undefined
                    ? undefined
                    : videoUrl
                      ? getVideoInfoFromUrl(videoUrl)
                      : null

            const $set: Partial<ProjectSchema> = {
                ...project,
                categoryId: targetCategoryId,
                order,
            }

            if (videoUrl !== undefined) {
                $set.video = video
                    ? {
                          videoId: video.id,
                          url: videoUrl,
                          player: video.player,
                      }
                    : undefined
            }

            const result = await projectsCollection.updateOne(
                {
                    _id: new ObjectId(_id),
                },
                {
                    $set,
                    ...(!videoUrl &&
                        videoUrl !== undefined && {
                            $unset: {
                                video: '',
                            },
                        }),
                },
                {
                    session: mongoSession,
                },
            )

            return result
        })
        .finally(() => mongoSession.endSession())

    if (!updateResult?.matchedCount) {
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

    return NextResponse.json({
        success: true,
        message: 'Project updated.',
    })
}

/** Delete a project or category */
export const DELETE = async (req: Request) => {
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

    const body = await parseRequestBody(req)

    if (body === null) {
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
        const deletedProject = await mongoSession
            .withTransaction(async () => {
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
                    return null
                }

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
            .finally(() => mongoSession.endSession())

        if (!deletedProject) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Project not found or could not be deleted.',
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
        const deletedData = await mongoSession
            .withTransaction(async () => {
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

                const projectsToDelete = await projectsCollection
                    .find(
                        {
                            categoryId: objectId,
                        },
                        {
                            projection: {
                                images: 1,
                            },
                            session: mongoSession,
                        },
                    )
                    .toArray()

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
                    return null
                }

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

                return {
                    projectsToDelete,
                }
            })
            .finally(() => mongoSession.endSession())

        if (!deletedData) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Category not found or could not be deleted.',
                },
                {
                    status: 404,
                },
            )
        }

        const imageIds = new Set(
            deletedData.projectsToDelete.flatMap((project) =>
                project.images.map((image) => image.imageId),
            ),
        )

        await cloudinaryImagesDelete(imageIds)

        return NextResponse.json({
            success: true,
            message: 'Category, projects, and images deleted.',
        })
    }

    await mongoSession.endSession()

    return NextResponse.json(
        {
            success: false,
            message: 'Unsupported row type.',
        },
        {
            status: 400,
        },
    )
}
