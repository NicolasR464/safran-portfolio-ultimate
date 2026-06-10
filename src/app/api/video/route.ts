import { NextRequest, NextResponse } from 'next/server'

import { ScreenSize } from '@/types/video'
import { collections, searchParamsNames } from '@/utils/constants'
import { backErrors } from '@/utils/constants/messages'
import { getDb } from '@/utils/mongo'
import { VideoHomeSchema } from '@/types/video/schema'

/** This returns video properties, filtered by user screen size. A video here is hosted on a private cloud, contrary to Projects' videos hosted by Youtube or Vimeo. */
export const GET = async (request: NextRequest) => {
    const database = await getDb()

    console.log({ database })

    if (!database) {
        return NextResponse.json(null, {
            status: 500,
            statusText: backErrors.DATABASE_CONNECTION_ERROR,
        })
    }

    const videosCollection = database.collection<VideoHomeSchema>(
        collections.VIDEOS,
    )

    console.log({ videosCollection })

    const searchParams = request.nextUrl.searchParams

    const screenSize = ScreenSize.safeParse(
        searchParams.get(searchParamsNames.SCREEN_SIZE),
    )

    // If screen size is provided, filter by it.
    if (screenSize.success) {
        const video = await videosCollection.findOne<VideoHomeSchema>({
            screenSize: screenSize.data,
        })

        console.log({ video })

        if (!video) {
            return NextResponse.json(null, {
                status: 404,
                statusText: backErrors.VIDEO_NOT_FOUND,
            })
        }

        return NextResponse.json<VideoHomeSchema>(video)
    }

    return NextResponse.json(null, {
        status: 403,
        statusText: backErrors.INVALID_SCREEN_SIZE,
    })
}
