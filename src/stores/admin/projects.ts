import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import { localApiEndpoints } from '@/utils/constants/endpoints'
import { apiClientSide } from '@/utils/ky'
import {
    ActionResult,
    ProjectsListResponse,
    UpdateProjectsPayload,
} from '@/types/apiResponses/admin/projects'

import { backErrors, backSuccess } from '@/utils/constants/messages'
import { ImageMetadata, VideoPlayerType } from '@/types/project'

type ProjectFormDraft = {
    _id: string
    title: string
    description?: string
    order: number
    categoryId: string
    images: ImageMetadata[]
    videoUrl?: string
    videoType?: VideoPlayerType
}

type ProjectFormDraftUpdate =
    | Partial<ProjectFormDraft>
    | ((current: ProjectFormDraft) => Partial<ProjectFormDraft>)

type ProjectsStore = {
    projectsByCategories: ProjectsListResponse
    isLoading: boolean
    initialized: boolean
    projectFormDraft: ProjectFormDraft | null

    fetchProjects: () => Promise<void>
    updateProjects: (payload: UpdateProjectsPayload) => Promise<ActionResult>
    initProjectFormDraft: (draft: ProjectFormDraft) => void
    updateProjectFormDraft: (update: ProjectFormDraftUpdate) => void
    clearProjectFormDraft: () => void
    reset: () => void
}

const initialState: Pick<
    ProjectsStore,
    'projectsByCategories' | 'isLoading' | 'initialized' | 'projectFormDraft'
> = {
    projectsByCategories: [],
    isLoading: false,
    initialized: false,
    projectFormDraft: null,
}

export const useProjectsStore = create<ProjectsStore>()(
    immer((set) => ({
        ...initialState,

        initProjectFormDraft: (draft) => {
            set((state) => {
                state.projectFormDraft = draft
            })
        },

        updateProjectFormDraft: (update) =>
            set((state) => {
                const current = state.projectFormDraft

                if (!current) {
                    return {}
                }

                const changes =
                    typeof update === 'function' ? update(current) : update

                return {
                    projectFormDraft: {
                        ...current,
                        ...changes,
                    },
                }
            }),

        clearProjectFormDraft: () => {
            console.count('🚀 clearProjectFormDraft')

            set((state) => {
                state.projectFormDraft = null
            })
        },

        reset: () => {
            set((state) => {
                state.projectsByCategories = []
                state.isLoading = false
                state.initialized = false
                state.projectFormDraft = null
            })
        },

        fetchProjects: async () => {
            set((state) => {
                state.isLoading = true
            })

            const apiResponse = await apiClientSide<ProjectsListResponse>(
                localApiEndpoints.ADMIN.PROJECTS,
            )

            if (!apiResponse.ok) {
                set((state) => {
                    state.isLoading = false
                    state.initialized = true
                })

                return
            }

            const parsedResponse = await apiResponse.json()

            set((state) => {
                state.projectsByCategories = parsedResponse
                state.isLoading = false
                state.initialized = true
            })
        },

        updateProjects: async (payload) => {
            console.log('🚀 updateProjects')

            console.log({ payload })

            const fail = (message: string): ActionResult => {
                set((state) => {
                    state.isLoading = false
                })

                return {
                    success: false,
                    message,
                }
            }

            set((state) => {
                state.isLoading = true
            })

            const apiResponse = await apiClientSide.patch(
                localApiEndpoints.ADMIN.PROJECTS,
                {
                    json: payload,
                },
            )

            if (!apiResponse.ok) {
                set((state) => {
                    state.isLoading = false
                })

                return fail(backErrors.UPDATE_FAILED)
            }

            const projectsResponse = await apiClientSide<ProjectsListResponse>(
                localApiEndpoints.ADMIN.PROJECTS,
            )

            if (!projectsResponse.ok) {
                set((state) => {
                    state.isLoading = false
                })

                return fail(backErrors.UPDATE_FAILED)
            }

            const parsedResponse = await projectsResponse.json()

            set((state) => {
                state.projectsByCategories = parsedResponse
                state.isLoading = false
                state.initialized = true
                state.clearProjectFormDraft()
            })

            return {
                success: true,
                message: backSuccess.UPDATE_SUCCEEDED,
            }
        },
    })),
)
