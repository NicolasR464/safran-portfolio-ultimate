import z from 'zod'
import { ImageMetadata } from '@/types/project'
import { ObjectId } from 'mongodb'

export const AboutSchema = z.object({
    _id: z.instanceof(ObjectId),
    text: z.string(),
    image: ImageMetadata,
})

export type AboutSchema = z.infer<typeof AboutSchema>
