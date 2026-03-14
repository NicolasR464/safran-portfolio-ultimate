import { type NextRequest } from 'next/server'

import { VideoSchema } from '@/types/video/schema'
import {
    collections,
    DEFAULT_BATCH_SIZE,
    searchParamsNames,
} from '@/utils/constants'
import { backErrors } from '@/utils/constants/messages'

import { db } from '@/utils/mongo'
import { NextResponse } from 'next/server'
import { thumbnailsPipeline } from '@/utils/mongoPipelines/portfolio/thumbnails'
import {
    ThumbnailsPipeline,
    ThumbnailsResponseAPI,
} from '@/types/apiResponses/portfolio'

/** This returns the thumbnails info for the portfolio main page. */
export const GET = async (request: NextRequest) => {
    const searchParams = request.nextUrl.searchParams

    const batchNumber = Number(searchParams.get(searchParamsNames.BATCH_NUMBER))

    if (!batchNumber) {
        return NextResponse.json(null, {
            status: 400,
            statusText: backErrors.INVALID_SEARCH_PARAMS,
        })
    }

    const database = await db()

    const testErrorState = Math.random() > 0.5

    if (!database || testErrorState < 0.5) {
        return NextResponse.json(null, {
            status: 500,
            statusText: backErrors.DATABASE_CONNECTION_ERROR,
        })
    }

    const videosCollection = database.collection<VideoSchema>(
        collections.VIDEOS,
    )

    const totalDocuments = await videosCollection.countDocuments()

    const [results] = await videosCollection
        .aggregate<ThumbnailsPipeline>(
            thumbnailsPipeline(batchNumber, DEFAULT_BATCH_SIZE),
        )
        .toArray()

    if (!results) {
        return NextResponse.json(null, {
            status: 500,
            statusText: backErrors.DATABASE_QUERY_ERROR,
        })
    }

    const hasMore = batchNumber * DEFAULT_BATCH_SIZE < totalDocuments

    return NextResponse.json<ThumbnailsResponseAPI>({
        data: results,
        hasMore,
    })
}
