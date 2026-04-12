import { type NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import {
    ThumbnailsCategory,
    ThumbnailsResponse,
} from '@/types/apiResponses/portfolio'
import { VideoSchema } from '@/types/video/schema'
import {
    collections,
    DEFAULT_BATCH_SIZE,
    searchParamsNames,
} from '@/utils/constants'
import { backErrors } from '@/utils/constants/messages'
import { getDb } from '@/utils/mongo'
import { thumbnailsPipeline } from '@/utils/mongoPipelines/portfolio/thumbnails'

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

    const database = await getDb()

    if (!database) {
        return NextResponse.json(null, {
            status: 500,
            statusText: backErrors.DATABASE_CONNECTION_ERROR,
        })
    }

    const videosCollection = database.collection<VideoSchema>(
        collections.VIDEOS,
    )

    const totalDocuments = await videosCollection.countDocuments()

    const results = await videosCollection
        .aggregate<ThumbnailsCategory>(
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

    return NextResponse.json<ThumbnailsResponse>({
        data: results,
        hasMore,
    })
}
