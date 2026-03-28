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

const ThumbnailsResponse = z.object({
    data: z.array(ThumbnailsCategory),
    hasMore: z.boolean(),
})

/** Response type for the thumbnails API endpoint. */
export type ThumbnailsResponse = z.infer<typeof ThumbnailsResponse>

const CategoriesResponse = z.object({
    data: VideoSchema.shape.category.array(),
})
/** Response type for the categories API endpoint. */
export type CategoriesResponse = z.infer<typeof CategoriesResponse>
