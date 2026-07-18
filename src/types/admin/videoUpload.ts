import { z } from 'zod'

import { ScreenTypeSchema } from '../video/schema'

export const CreateVideoHomePayloadSchema = z.object({
    videoUrl: z.url(),
    videoId: z.string().min(1),
    screenTypes: ScreenTypeSchema.array().min(1),
})

export type CreateVideoHomePayload = z.infer<
    typeof CreateVideoHomePayloadSchema
>

export const UpdateVideoHomePayloadSchema = z
    .object({
        _id: z.string().min(1),
        videoUrl: z.url().optional(),
        videoId: z.string().min(1).optional(),
        screenTypes: ScreenTypeSchema.array().min(1).optional(),
    })
    .refine(
        (payload) =>
            payload.videoUrl !== undefined ||
            payload.videoId !== undefined ||
            payload.screenTypes !== undefined,
        {
            message: 'At least one field must be provided',
        },
    )
    .refine(
        (payload) =>
            (payload.videoUrl === undefined && payload.videoId === undefined) ||
            (payload.videoUrl !== undefined && payload.videoId !== undefined),
        {
            message: 'videoUrl and videoId must be updated together',
        },
    )

export type UpdateVideoHomePayload = z.infer<
    typeof UpdateVideoHomePayloadSchema
>

export const DeleteVideoHomePayloadSchema = z.object({
    _id: z.string().min(1),
})

export type DeleteVideoHomePayload = z.infer<
    typeof DeleteVideoHomePayloadSchema
>

export type VideoHomeCRUDResult = {
    success: boolean
    message: string
}
