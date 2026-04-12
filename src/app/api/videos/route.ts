import { NextRequest, NextResponse } from 'next/server'

import { ScreenSize } from '@/types/video'
import { VideoSchema } from '@/types/video/schema'
import { collections, searchParamsNames } from '@/utils/constants'
import { backErrors } from '@/utils/constants/messages'
import { getDb } from '@/utils/mongo'

/** This returns video properties. */
export const GET = async (request: NextRequest) => {
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

    const searchParams = request.nextUrl.searchParams

    const screenSize = ScreenSize.safeParse(
        searchParams.get(searchParamsNames.SCREEN_SIZE),
    )

    // If screen size is provided, filter by it.
    if (screenSize.success) {
        const video = await videosCollection.findOne(
            { screenSize: screenSize.data },
            { projection: { vidId: 1, _id: 0 } },
        )

        if (!video) {
            return NextResponse.json(null, {
                status: 404,
                statusText: backErrors.VIDEO_NOT_FOUND,
            })
        }

        return NextResponse.json<VideoSchema['vidId']>(video.vidId)
    }

    return NextResponse.json(null, {
        status: 404,
        statusText: backErrors.VIDEOS_NOT_FOUND,
    })
}
