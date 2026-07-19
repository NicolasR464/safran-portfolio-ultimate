import { NextRequest, NextResponse } from 'next/server'

import { collections, searchParamsNames } from '@/utils/constants'
import { backErrors } from '@/utils/constants/messages'
import { getDb } from '@/utils/mongo'
import { ScreenTypeSchema, VideoHomeResponse } from '@/types/video/schema'
import { VideoHomeDocument } from '@/types/video/server'

/** This returns video properties, filtered by user screen size. A video here is hosted on a private cloud, contrary to Projects' videos hosted by Youtube or Vimeo. */
export const GET = async (request: NextRequest) => {
    const database = await getDb()

    console.log('GET')

    if (!database) {
        return NextResponse.json(null, {
            status: 500,
            statusText: backErrors.DATABASE_CONNECTION_ERROR,
        })
    }

    const videosCollection = database.collection<VideoHomeDocument>(
        collections.VIDEOS,
    )

    const searchParams = request.nextUrl.searchParams

    const screenType = ScreenTypeSchema.safeParse(
        searchParams.get(searchParamsNames.SCREEN_TYPE),
    )

    console.log('screenType : ', screenType)

    if (!screenType.success) {
        return NextResponse.json(null, {
            status: 400,
            statusText: backErrors.INVALID_SCREEN_TYPE,
        })
    }

    const video = await videosCollection.findOne({
        screenTypes: screenType.data,
    })

    console.log({ video })

    if (!video) {
        return NextResponse.json(null, {
            status: 404,
            statusText: backErrors.VIDEO_NOT_FOUND,
        })
    }

    return NextResponse.json<VideoHomeResponse>({
        _id: video._id.toString(),
        videoUrl: video.videoUrl,
        videoId: video.videoId,
        screenTypes: video.screenTypes,
    })
}
