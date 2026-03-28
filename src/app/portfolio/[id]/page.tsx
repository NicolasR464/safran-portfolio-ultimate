import { VideoSchema } from '@/types/video/schema'
import { collections } from '@/utils/constants'

import { db } from '@/utils/mongo'
import { ObjectId } from 'mongodb'

const Video = async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params

    const database = await db()

    const videosCollection = database.collection<VideoSchema>(
        collections.VIDEOS,
    )

    const video = await videosCollection.findOne({
        _id: new ObjectId(id),
    })

    console.log(video)

    return <div>{JSON.stringify(video)}</div>
}

export default Video
