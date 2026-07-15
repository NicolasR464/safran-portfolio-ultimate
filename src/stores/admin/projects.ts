import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import { localApiEndpoints } from '@/utils/constants/endpoints'
import { apiClientSide } from '@/utils/ky'

import { backErrors, backSuccess } from '@/utils/constants/messages'
import { ImageMetadata } from '@/types/project'
import { ProjectTableRowType } from '@/utils/enums/admin'
import {
    CRUDResult,
    ProjectsListResponse,
    UpdateProjectsPayload,
} from '@/types/api/admin/projects'

export type ProjectFormDraft = {
    _id: string | null
    title: string
    description?: string
    order: number
    categoryId: string
    images: ImageMetadata[]
    videoUrl?: string
}

type CreateProjectPayload = Omit<ProjectFormDraft, '_id'>

type DeleteRowPayload = {
    _id: string
    type: ProjectTableRowType
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
    createProject: (project: CreateProjectPayload) => Promise<CRUDResult>
    updateProjects: (payload: UpdateProjectsPayload) => Promise<CRUDResult>
    deleteRow: (payload: DeleteRowPayload) => Promise<CRUDResult>

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
    immer((set, get) => ({
        ...initialState,

        initProjectFormDraft: (draft) => {
            set((state) => {
                state.projectFormDraft = draft
            })
        },

        updateProjectFormDraft: (update) => {
            set((state) => {
                const current = state.projectFormDraft

                if (!current) return

                const changes =
                    typeof update === 'function' ? update(current) : update

                state.projectFormDraft = {
                    ...current,
                    ...changes,
                }
            })
        },

        clearProjectFormDraft: () => {
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

            try {
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
            } catch {
                set((state) => {
                    state.isLoading = false
                    state.initialized = true
                })
            }
        },

        createProject: async (project) => {
            set((state) => {
                state.isLoading = true
            })

            try {
                const apiResponse = await apiClientSide.post(
                    localApiEndpoints.ADMIN.PROJECTS,
                    {
                        json: project,
                    },
                )

                if (!apiResponse.ok) {
                    return {
                        success: false,
                        message:
                            apiResponse.statusText || backErrors.UPDATE_FAILED,
                    }
                }

                await get().fetchProjects()

                set((state) => {
                    state.projectFormDraft = null
                })

                return {
                    success: true,
                    message: 'Project created',
                }
            } catch {
                return {
                    success: false,
                    message: 'Project creation failed',
                }
            } finally {
                set((state) => {
                    state.isLoading = false
                })
            }
        },

        updateProjects: async (payload) => {
            set((state) => {
                state.isLoading = true
            })

            try {
                const apiResponse = await apiClientSide.patch(
                    localApiEndpoints.ADMIN.PROJECTS,
                    {
                        json: payload,
                    },
                )

                if (!apiResponse.ok) {
                    return {
                        success: false,
                        message: backErrors.UPDATE_FAILED,
                    }
                }

                await get().fetchProjects()

                set((state) => {
                    state.projectFormDraft = null
                })

                return {
                    success: true,
                    message: backSuccess.UPDATE_SUCCEEDED,
                }
            } catch {
                return {
                    success: false,
                    message: backErrors.UPDATE_FAILED,
                }
            } finally {
                set((state) => {
                    state.isLoading = false
                })
            }
        },

        deleteRow: async (payload) => {
            set((state) => {
                state.isLoading = true
            })

            const apiResponse = await apiClientSide.delete(
                localApiEndpoints.ADMIN.PROJECTS,
                {
                    json: payload,
                },
            )

            if (!apiResponse.ok) {
                return {
                    success: false,
                    message: apiResponse.statusText || 'Deletion failed',
                }
            }

            await get().fetchProjects()

            set((state) => {
                state.projectFormDraft = null
                state.isLoading = false
            })

            return {
                success: true,
                message:
                    payload.type === ProjectTableRowType.enum.project
                        ? 'Project deleted'
                        : 'Category deleted',
            }
        },
    })),
)
