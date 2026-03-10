import z from 'zod'
import { VideoSchema } from '@/types/video/schema'

const Thumbnail = z.object({
    _id: VideoSchema.shape._id,
    title: VideoSchema.shape.title,
    category: VideoSchema.shape.category,
    imageUrl: VideoSchema.shape.image.shape.url,
})

export type Thumbnail = z.infer<typeof Thumbnail>

const ThumbnailsCategory = z.object({
    category: Thumbnail.shape.category,
    items: z.array(Thumbnail),
})

export type ThumbnailsCategory = z.infer<typeof ThumbnailsCategory>

const ThumbnailsPipeline = z.object({
    thumbnails: z.array(ThumbnailsCategory),
    categories: z.array(Thumbnail.shape.category),
})

export type ThumbnailsPipeline = z.infer<typeof ThumbnailsPipeline>

const ThumbnailsResponseAPI = z.object({
    data: ThumbnailsPipeline,
    hasMore: z.boolean(),
})

export type ThumbnailsResponseAPI = z.infer<typeof ThumbnailsResponseAPI>
