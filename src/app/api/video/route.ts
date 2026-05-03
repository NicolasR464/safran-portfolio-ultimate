import { NextRequest, NextResponse } from 'next/server'

import { ScreenSize } from '@/types/project'
import { ProjectSchema } from '@/types/project/schema'
import { collections, searchParamsNames } from '@/utils/constants'
import { backErrors } from '@/utils/constants/messages'
import { getDb } from '@/utils/mongo'

/** This returns video properties for the Home page. */
export const GET = async (request: NextRequest) => {
    const database = await getDb()

    if (!database) {
        return NextResponse.json(null, {
            status: 500,
            statusText: backErrors.DATABASE_CONNECTION_ERROR,
        })
    }

    const projectsCollection = database.collection<ProjectSchema>(
        collections.PROJECTS,
    )

    const searchParams = request.nextUrl.searchParams

    const screenSize = ScreenSize.safeParse(
        searchParams.get(searchParamsNames.SCREEN_SIZE),
    )

    // If screen size is provided, filter by it.
    if (screenSize.success) {
        const project = await projectsCollection.findOne<ProjectSchema>(
            { 'video.screenSize': screenSize.data },
            { projection: { 'video.videoId': 1, _id: 0 } },
        )

        if (!project) {
            return NextResponse.json(null, {
                status: 404,
                statusText: backErrors.VIDEO_NOT_FOUND,
            })
        }

        return NextResponse.json<ProjectSchema['video']>(project.video)
    }

    return NextResponse.json(null, {
        status: 403,
        statusText: backErrors.INVALID_SCREEN_SIZE,
    })
}
