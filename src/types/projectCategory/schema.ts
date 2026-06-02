import { ObjectId } from 'mongodb'
import z from 'zod'

export const ProjectCategorySchema = z.object({
    _id: z.instanceof(ObjectId),
    name: z.string().min(1),
    order: z.number().int().nonnegative(),
})

export type ProjectCategorySchema = z.infer<typeof ProjectCategorySchema>
