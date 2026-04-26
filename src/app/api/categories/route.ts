import { NextResponse } from 'next/server'

import { CategoriesResponse } from '@/types/apiResponses/portfolio'
import { ProjectSchema } from '@/types/project/schema'
import { collections } from '@/utils/constants'
import { backErrors } from '@/utils/constants/messages'
import { getDb } from '@/utils/mongo'

/** This returns the list of portfolio categories. */
export const GET = async () => {
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

    const categories = await projectsCollection.distinct('category', {
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
