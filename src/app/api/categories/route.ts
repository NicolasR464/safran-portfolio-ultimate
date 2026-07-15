import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'

import { ProjectSchema } from '@/types/project/schema'
import { collections } from '@/utils/constants'
import { backErrors } from '@/utils/constants/messages'
import { getDb } from '@/utils/mongo'
import { ProjectCategorySchema } from '@/types/projectCategory/schema'
import { CategoriesResponse } from '@/types/api/portfolio'

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

    const categoriesCollection = database.collection<ProjectCategorySchema>(
        collections.PROJECT_CATEGORIES,
    )

    // Category ids referenced by at least one project
    const categoryIds = await projectsCollection.distinct('categoryId')

    const categories = await categoriesCollection
        .find({
            _id: {
                $in: categoryIds as ObjectId[],
            },
        })
        .sort({ order: 1 })
        .toArray()

    return NextResponse.json<CategoriesResponse>({
        data: categories,
    })
}
