import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import {
    VideosHomeListResponseSchema,
    type VideoHomeResponse,
    type VideosHomeListResponse,
} from '@/types/video/schema'
import {
    type CreateVideoHomePayload,
    type DeleteVideoHomePayload,
    type UpdateVideoHomePayload,
    type VideoHomeCRUDResult,
} from '@/types/admin/videoUpload'
import { localApiEndpoints } from '@/utils/constants/endpoints'
import { apiClientSide } from '@/utils/ky'

export type VideoHomeFormDraft = {
    _id: string | null
    videoUrl: string
    screenTypes: VideoHomeResponse['screenTypes']
}

type VideoHomeFormDraftUpdate =
    | Partial<VideoHomeFormDraft>
    | ((current: VideoHomeFormDraft) => Partial<VideoHomeFormDraft>)

type VideosHomeStore = {
    videos: VideosHomeListResponse
    isLoading: boolean
    initialized: boolean
    videoFormDraft: VideoHomeFormDraft | null

    fetchVideos: (manageLoading?: boolean) => Promise<boolean>

    createVideo: (
        payload: CreateVideoHomePayload,
    ) => Promise<VideoHomeCRUDResult>

    updateVideo: (
        payload: UpdateVideoHomePayload,
    ) => Promise<VideoHomeCRUDResult>

    deleteVideo: (
        payload: DeleteVideoHomePayload,
    ) => Promise<VideoHomeCRUDResult>

    initVideoFormDraft: (draft: VideoHomeFormDraft) => void
    updateVideoFormDraft: (update: VideoHomeFormDraftUpdate) => void
    clearVideoFormDraft: () => void
    reset: () => void
}

const initialState: Pick<
    VideosHomeStore,
    'videos' | 'isLoading' | 'initialized' | 'videoFormDraft'
> = {
    videos: [],
    isLoading: false,
    initialized: false,
    videoFormDraft: null,
}

export const useHomeVideosStore = create<VideosHomeStore>()(
    immer((set, get) => ({
        ...initialState,

        initVideoFormDraft: (draft) => {
            set((state) => {
                state.videoFormDraft = draft
            })
        },

        updateVideoFormDraft: (update) => {
            set((state) => {
                const current = state.videoFormDraft

                if (!current) {
                    return
                }

                const changes =
                    typeof update === 'function' ? update(current) : update

                state.videoFormDraft = {
                    ...current,
                    ...changes,
                }
            })
        },

        clearVideoFormDraft: () => {
            set((state) => {
                state.videoFormDraft = null
            })
        },

        reset: () => {
            set((state) => {
                state.videos = []
                state.isLoading = false
                state.initialized = false
                state.videoFormDraft = null
            })
        },

        fetchVideos: async (manageLoading = true) => {
            if (manageLoading) {
                set((state) => {
                    state.isLoading = true
                })
            }

            try {
                const apiResponse = await apiClientSide(
                    localApiEndpoints.ADMIN.VIDEOS,
                )

                if (!apiResponse.ok) {
                    return false
                }

                const rawResponse: unknown = await apiResponse.json()

                const parsedResponse =
                    VideosHomeListResponseSchema.safeParse(rawResponse)

                if (!parsedResponse.success) {
                    return false
                }

                set((state) => {
                    state.videos = parsedResponse.data
                })

                return true
            } catch {
                return false
            } finally {
                if (manageLoading) {
                    set((state) => {
                        state.isLoading = false
                        state.initialized = true
                    })
                }
            }
        },

        createVideo: async (payload) => {
            set((state) => {
                state.isLoading = true
            })

            try {
                const apiResponse = await apiClientSide.post(
                    localApiEndpoints.ADMIN.VIDEOS,
                    {
                        json: payload,
                    },
                )

                if (!apiResponse.ok) {
                    return {
                        success: false,
                        message:
                            apiResponse.statusText || 'Video creation failed',
                    }
                }

                const refreshed = await get().fetchVideos(false)

                if (!refreshed) {
                    return {
                        success: false,
                        message: 'Video created, but refreshing videos failed',
                    }
                }

                set((state) => {
                    state.videoFormDraft = null
                })

                return {
                    success: true,
                    message: 'Video created',
                }
            } catch {
                return {
                    success: false,
                    message: 'Video creation failed',
                }
            } finally {
                set((state) => {
                    state.isLoading = false
                })
            }
        },

        updateVideo: async (payload) => {
            set((state) => {
                state.isLoading = true
            })

            try {
                const apiResponse = await apiClientSide.patch(
                    localApiEndpoints.ADMIN.VIDEOS,
                    {
                        json: payload,
                    },
                )

                if (!apiResponse.ok) {
                    return {
                        success: false,
                        message:
                            apiResponse.statusText || 'Video update failed',
                    }
                }

                const refreshed = await get().fetchVideos(false)

                if (!refreshed) {
                    return {
                        success: false,
                        message: 'Video updated, but refreshing videos failed',
                    }
                }

                set((state) => {
                    state.videoFormDraft = null
                })

                return {
                    success: true,
                    message: 'Video updated',
                }
            } catch {
                return {
                    success: false,
                    message: 'Video update failed',
                }
            } finally {
                set((state) => {
                    state.isLoading = false
                })
            }
        },

        deleteVideo: async (payload) => {
            set((state) => {
                state.isLoading = true
            })

            try {
                const apiResponse = await apiClientSide.delete(
                    localApiEndpoints.ADMIN.VIDEOS,
                    {
                        json: payload,
                    },
                )

                if (!apiResponse.ok) {
                    return {
                        success: false,
                        message:
                            apiResponse.statusText || 'Video deletion failed',
                    }
                }

                const refreshed = await get().fetchVideos(false)

                if (!refreshed) {
                    return {
                        success: false,
                        message: 'Video deleted, but refreshing videos failed',
                    }
                }

                set((state) => {
                    state.videoFormDraft = null
                })

                return {
                    success: true,
                    message: 'Video deleted',
                }
            } catch {
                return {
                    success: false,
                    message: 'Video deletion failed',
                }
            } finally {
                set((state) => {
                    state.isLoading = false
                })
            }
        },
    })),
)
