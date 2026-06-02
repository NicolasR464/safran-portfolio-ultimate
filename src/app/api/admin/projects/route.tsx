import { ProjectSchema } from '@/types/project/schema'
import { collections } from '@/utils/constants'
import { backErrors } from '@/utils/constants/messages'
import { getDb } from '@/utils/mongo'
import { ObjectId } from 'mongodb'
import { NextResponse } from 'next/server'

type ReorderProjectsPayload = {
    projects: {
        _id: string
        order: number
    }[]
}

export const PATCH = async (req: Request) => {
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

    const { projects } = (await req.json()) as ReorderProjectsPayload

    const result = await projectsCollection.bulkWrite(
        projects.map((project) => ({
            updateOne: {
                filter: {
                    _id: new ObjectId(project._id),
                },
                update: {
                    $set: {
                        order: project.order,
                    },
                },
            },
        })),
    )

    return NextResponse.json(result)
}
