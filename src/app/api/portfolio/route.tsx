import { VideoSchema } from '@/types/video/schema'
import { collections } from '@/utils/constants'
import { backErrors } from '@/utils/constants/messages'

import { db } from '@/utils/mongo'
import { NextResponse } from 'next/server'

export const GET = async () => {
    const database = await db()

    if (!database) {
        return NextResponse.json({
            error: backErrors.DATABASE_CONNECTION_ERROR,
        })
    }

    const videosCollection = database.collection<VideoSchema>(
        collections.VIDEOS,
    )

    const videos = await videosCollection.find().toArray()

    return NextResponse.json(videos)
}
