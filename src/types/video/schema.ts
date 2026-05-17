import { ObjectId } from 'mongodb'
import { z } from 'zod'
import { ScreenSize } from '.'

export const VideoHomeSchema = z.object({
    _id: z.instanceof(ObjectId),
    videoUrl: z.url(),
    screenSize: ScreenSize,
})

export type VideoHomeSchema = z.infer<typeof VideoHomeSchema>
