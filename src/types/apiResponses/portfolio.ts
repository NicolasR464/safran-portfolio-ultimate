import z from 'zod'

import { ProjectSchema } from '@/types/project/schema'

const Thumbnail = z.object({
    _id: ProjectSchema.shape._id,
    title: ProjectSchema.shape.title,
    category: ProjectSchema.shape.category,
    imageUrl: ProjectSchema.shape.images.unwrap().element.shape.url,
})
export type Thumbnail = z.infer<typeof Thumbnail>

const ThumbnailsCategory = z.object({
    category: Thumbnail.shape.category,
    items: Thumbnail.array(),
})
export type ThumbnailsCategory = z.infer<typeof ThumbnailsCategory>

const ThumbnailsResponse = z.object({
    data: ThumbnailsCategory.array(),
    hasMore: z.boolean(),
})
/** Response type for the thumbnails API endpoint. */
export type ThumbnailsResponse = z.infer<typeof ThumbnailsResponse>

const CategoriesResponse = z.object({
    data: ProjectSchema.shape.category.array(),
})
/** Response type for the categories API endpoint. */
export type CategoriesResponse = z.infer<typeof CategoriesResponse>
