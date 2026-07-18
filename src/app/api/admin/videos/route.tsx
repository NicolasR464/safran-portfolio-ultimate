import { ObjectId } from 'mongodb'
import { NextResponse } from 'next/server'

import {
    CreateVideoHomePayloadSchema,
    DeleteVideoHomePayloadSchema,
    UpdateVideoHomePayloadSchema,
} from '@/types/video/schema'
import { type VideoHomeDocument } from '@/types/video/server'
import { collections } from '@/utils/constants'
import { backErrors } from '@/utils/constants/messages'
import { getDb } from '@/utils/mongo'
import { cloudinaryVideoDelete } from '@/utils/functions/cloudinary'

/** Get all home videos */
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

    const videosCollection = database.collection<VideoHomeDocument>(
        collections.VIDEOS,
    )

    const videos = await videosCollection.find({}).sort({ _id: 1 }).toArray()

    return NextResponse.json(
        videos.map((video) => ({
            ...video,
            _id: video._id.toString(),
        })),
    )
}

/** Create a home video */
export const POST = async (request: Request) => {
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

    const body: unknown = await request.json()

    const parsedBody = CreateVideoHomePayloadSchema.safeParse(body)

    if (!parsedBody.success) {
        return NextResponse.json(
            {
                success: false,
                message: 'Invalid request body',
                errors: parsedBody.error.flatten(),
            },
            {
                status: 400,
            },
        )
    }

    const videosCollection = database.collection<VideoHomeDocument>(
        collections.VIDEOS,
    )

    const screenTypes = [...new Set(parsedBody.data.screenTypes)]

    const conflictingVideos = await videosCollection
        .find({
            screenTypes: {
                $in: screenTypes,
            },
        })
        .toArray()

    if (conflictingVideos.length > 0) {
        const conflictingScreenTypes = [
            ...new Set(
                conflictingVideos.flatMap((video) =>
                    video.screenTypes.filter((screenType) =>
                        screenTypes.includes(screenType),
                    ),
                ),
            ),
        ]

        return NextResponse.json(
            {
                success: false,
                message: `The following screen types are already assigned: ${conflictingScreenTypes.join(
                    ', ',
                )}`,
            },
            {
                status: 409,
            },
        )
    }

    const videoToCreate: VideoHomeDocument = {
        videoUrl: parsedBody.data.videoUrl,
        videoId: parsedBody.data.videoId,
        screenTypes,
    }

    const result = await videosCollection.insertOne(videoToCreate)

    if (!result.acknowledged) {
        return NextResponse.json(
            {
                success: false,
                message: 'Video creation failed',
            },
            {
                status: 500,
            },
        )
    }

    return NextResponse.json(
        {
            success: true,
            message: 'Video created',
            video: {
                _id: result.insertedId.toString(),
                ...videoToCreate,
            },
        },
        {
            status: 201,
        },
    )
}

/** Update a home video */
export const PATCH = async (request: Request) => {
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

    const body: unknown = await request.json()

    const parsedBody = UpdateVideoHomePayloadSchema.safeParse(body)

    if (!parsedBody.success) {
        return NextResponse.json(
            {
                success: false,
                message: 'Invalid request body',
                errors: parsedBody.error.flatten(),
            },
            {
                status: 400,
            },
        )
    }

    if (!ObjectId.isValid(parsedBody.data._id)) {
        return NextResponse.json(
            {
                success: false,
                message: 'Invalid video ID',
            },
            {
                status: 400,
            },
        )
    }

    const videosCollection = database.collection<VideoHomeDocument>(
        collections.VIDEOS,
    )

    const videoId = new ObjectId(parsedBody.data._id)

    const existingVideo = await videosCollection.findOne({
        _id: videoId,
    })

    if (!existingVideo) {
        return NextResponse.json(
            {
                success: false,
                message: 'Video not found',
            },
            {
                status: 404,
            },
        )
    }

    const screenTypes = [...new Set(parsedBody.data.screenTypes)]

    const conflictingVideos = await videosCollection
        .find({
            _id: {
                $ne: videoId,
            },
            screenTypes: {
                $in: screenTypes,
            },
        })
        .toArray()

    if (conflictingVideos.length > 0) {
        const conflictingScreenTypes = [
            ...new Set(
                conflictingVideos.flatMap((video) =>
                    video.screenTypes.filter((screenType) =>
                        screenTypes.includes(screenType),
                    ),
                ),
            ),
        ]

        return NextResponse.json(
            {
                success: false,
                message: `The following screen types are already assigned: ${conflictingScreenTypes.join(
                    ', ',
                )}`,
            },
            {
                status: 409,
            },
        )
    }

    const result = await videosCollection.updateOne(
        {
            _id: videoId,
        },
        {
            $set: {
                videoUrl: parsedBody.data.videoUrl,
                screenTypes,
            },
        },
    )

    if (!result.acknowledged) {
        return NextResponse.json(
            {
                success: false,
                message: 'Video update failed',
            },
            {
                status: 500,
            },
        )
    }

    const updatedVideo = await videosCollection.findOne({
        _id: videoId,
    })

    if (!updatedVideo) {
        return NextResponse.json(
            {
                success: false,
                message: 'Updated video could not be retrieved',
            },
            {
                status: 500,
            },
        )
    }

    return NextResponse.json({
        success: true,
        message:
            result.modifiedCount > 0 ? 'Video updated' : 'No changes detected',
        video: {
            ...updatedVideo,
            _id: updatedVideo._id.toString(),
        },
    })
}

/** Delete a home video */
/** Delete a home video */
export const DELETE = async (request: Request) => {
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

    const body: unknown = await request.json()

    const parsedBody = DeleteVideoHomePayloadSchema.safeParse(body)

    if (!parsedBody.success) {
        return NextResponse.json(
            {
                success: false,
                message: 'Invalid request body',
                errors: parsedBody.error.flatten(),
            },
            {
                status: 400,
            },
        )
    }

    if (!ObjectId.isValid(parsedBody.data._id)) {
        return NextResponse.json(
            {
                success: false,
                message: 'Invalid video ID',
            },
            {
                status: 400,
            },
        )
    }

    const videosCollection = database.collection<VideoHomeDocument>(
        collections.VIDEOS,
    )

    const videoId = new ObjectId(parsedBody.data._id)

    /*
     * Atomically reserve the document for deletion.
     * Only one concurrent request can move it into the deleting state.
     */
    const video = await videosCollection.findOneAndUpdate(
        {
            _id: videoId,
            deletionStatus: {
                $exists: false,
            },
        },
        {
            $set: {
                deletionStatus: 'deleting',
            },
        },
        {
            returnDocument: 'before',
        },
    )

    if (!video) {
        const existingVideo = await videosCollection.findOne({
            _id: videoId,
        })

        if (!existingVideo) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Video not found',
                },
                {
                    status: 404,
                },
            )
        }

        return NextResponse.json(
            {
                success: false,
                message: 'Video deletion is already in progress',
            },
            {
                status: 409,
            },
        )
    }

    try {
        await cloudinaryVideoDelete(video.videoId)
    } catch (error) {
        /*
         * Cloudinary failed, so make the MongoDB document available again.
         */
        await videosCollection.updateOne(
            {
                _id: videoId,
                deletionStatus: 'deleting',
            },
            {
                $unset: {
                    deletionStatus: '',
                },
            },
        )

        // oxlint-disable-next-line no-console
        console.error('Cloudinary video deletion failed:', error)

        return NextResponse.json(
            {
                success: false,
                message: 'Cloudinary video deletion failed',
            },
            {
                status: 502,
            },
        )
    }

    /*
     * Record that Cloudinary has already been deleted.
     * This makes the operation recoverable if the final MongoDB deletion fails.
     */
    await videosCollection.updateOne(
        {
            _id: videoId,
            deletionStatus: 'deleting',
        },
        {
            $set: {
                deletionStatus: 'cloudinary_deleted',
            },
        },
    )

    const result = await videosCollection.deleteOne({
        _id: videoId,
        deletionStatus: 'cloudinary_deleted',
    })

    if (!result.acknowledged || result.deletedCount === 0) {
        /*
         * The Cloudinary asset is gone, but the MongoDB document remains.
         * Keep deletionStatus='cloudinary_deleted' so cleanup can be retried.
         */
        return NextResponse.json(
            {
                success: false,
                message:
                    'The Cloudinary video was deleted, but the database record could not be removed',
            },
            {
                status: 500,
            },
        )
    }

    return NextResponse.json({
        success: true,
        message: 'Video deleted',
        _id: parsedBody.data._id,
    })
}
