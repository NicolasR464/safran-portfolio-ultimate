import { create } from 'zustand'

import type {
    VideoHomeResponse,
    VideosHomeListResponse,
} from '@/types/video/schema'
import type {
    CreateVideoHomePayload,
    CreateVideoHomeResult,
    DeleteVideoHomePayload,
    DeleteVideoHomeResult,
    UpdateVideoHomePayload,
    UpdateVideoHomeResult,
    VideoHomeCRUDResult,
} from '@/types/admin/videoUpload'
import { localApiEndpoints } from '@/utils/constants/endpoints'
import { apiClientSide } from '@/utils/ky'

type HomeVideosStore = {
    videos: VideoHomeResponse[]
    initialized: boolean

    isFetching: boolean
    isCreating: boolean
    updatingVideoIds: string[]
    deletingVideoIds: string[]

    fetchVideos: () => Promise<void>

    createVideo: (
        payload: CreateVideoHomePayload,
    ) => Promise<CreateVideoHomeResult>

    updateVideo: (
        payload: UpdateVideoHomePayload,
    ) => Promise<UpdateVideoHomeResult>

    deleteVideo: (
        payload: DeleteVideoHomePayload,
    ) => Promise<DeleteVideoHomeResult>
}

export const useHomeVideosStore = create<HomeVideosStore>((set) => ({
    videos: [],
    initialized: false,

    isFetching: false,
    isCreating: false,
    updatingVideoIds: [],
    deletingVideoIds: [],

    fetchVideos: async () => {
        set({
            isFetching: true,
        })

        const response = await apiClientSide<VideosHomeListResponse>(
            localApiEndpoints.ADMIN.VIDEOS,
        )

        set({
            isFetching: false,
            initialized: true,
        })

        if (!response.ok) {
            return
        }

        const videos = await response.json()

        set({
            videos,
        })
    },

    createVideo: async (payload) => {
        set({
            isCreating: true,
        })

        const response = await apiClientSide<CreateVideoHomeResult>(
            localApiEndpoints.ADMIN.VIDEOS,
            {
                method: 'POST',
                json: payload,
            },
        )

        const result = await response.json()

        set({
            isCreating: false,
        })

        if (!response.ok || !result.success) {
            return result
        }

        set((state) => ({
            videos: [...state.videos, result.video],
        }))

        return result
    },

    updateVideo: async (payload) => {
        set((state) => ({
            updatingVideoIds: state.updatingVideoIds.includes(payload._id)
                ? state.updatingVideoIds
                : [...state.updatingVideoIds, payload._id],
        }))

        const response = await apiClientSide<UpdateVideoHomeResult>(
            localApiEndpoints.ADMIN.VIDEOS,
            {
                method: 'PATCH',
                json: payload,
            },
        )

        const result = await response.json()

        set((state) => ({
            updatingVideoIds: state.updatingVideoIds.filter(
                (videoId) => videoId !== payload._id,
            ),
        }))

        if (!response.ok || !result.success) {
            return result
        }

        set((state) => ({
            videos: state.videos.map((video) =>
                video._id === payload._id
                    ? {
                          ...video,
                          ...(payload.videoUrl !== undefined && {
                              videoUrl: payload.videoUrl,
                          }),
                          ...(payload.videoId !== undefined && {
                              videoId: payload.videoId,
                          }),
                          ...(payload.screenTypes !== undefined && {
                              screenTypes: payload.screenTypes,
                          }),
                      }
                    : video,
            ),
        }))

        return result
    },

    deleteVideo: async (payload) => {
        set((state) => ({
            deletingVideoIds: state.deletingVideoIds.includes(payload._id)
                ? state.deletingVideoIds
                : [...state.deletingVideoIds, payload._id],
        }))

        const response = await apiClientSide<VideoHomeCRUDResult>(
            localApiEndpoints.ADMIN.VIDEOS,
            {
                method: 'DELETE',
                json: payload,
            },
        )

        const result = await response.json()

        set((state) => ({
            deletingVideoIds: state.deletingVideoIds.filter(
                (videoId) => videoId !== payload._id,
            ),
        }))

        if (!response.ok || !result.success) {
            return result
        }

        set((state) => ({
            videos: state.videos.filter((video) => video._id !== payload._id),
        }))

        return result
    },
}))
