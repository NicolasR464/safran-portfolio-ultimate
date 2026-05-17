import { ProjectSchema } from '@/types/project/schema'
import {
    collections,
    DEFAULT_BATCH_SIZE,
    searchParamsNames,
} from '@/utils/constants'
import { backErrors } from '@/utils/constants/messages'
import { getDb } from '@/utils/mongo'
import { NextRequest, NextResponse } from 'next/server'

/** This returns the paginated project list. */
export const GET = async (request: NextRequest) => {
    const searchParams = request.nextUrl.searchParams

    const batchNumber = Number(searchParams.get(searchParamsNames.BATCH_NUMBER))

    if (!Number.isInteger(batchNumber) || batchNumber < 1) {
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

    const projectsCollection = database.collection<ProjectSchema>(
        collections.PROJECTS,
    )

    const projects = await projectsCollection
        .find(
            {},
            {
                projection: {
                    _id: 1,
                    title: 1,
                    category: 1,
                    order: 1,
                    images: 1,
                },
            },
        )
        .sort({ category: 1, order: 1, _id: 1 })
        .skip((batchNumber - 1) * DEFAULT_BATCH_SIZE)
        .limit(DEFAULT_BATCH_SIZE)
        .toArray()

    return NextResponse.json(projects)
}
