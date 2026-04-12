import { NextResponse } from 'next/server'

import { CategoriesResponse } from '@/types/apiResponses/portfolio'
import { VideoSchema } from '@/types/video/schema'
import { collections } from '@/utils/constants'
import { backErrors } from '@/utils/constants/messages'
import { getDb } from '@/utils/mongo'

/** This returns the list portfolio categories. */
export const GET = async () => {
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

    const categories = await videosCollection.distinct('category', {
        category: { $ne: 'home' },
    })

    if (!categories) {
        return NextResponse.json(null, {
            status: 500,
            statusText: backErrors.DATABASE_QUERY_ERROR,
        })
    }

    return NextResponse.json<CategoriesResponse>({
        data: categories,
    })
}
