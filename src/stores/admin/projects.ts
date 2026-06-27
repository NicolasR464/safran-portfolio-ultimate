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

// type UpdateProjectsPayload =
//     | {
//           type: typeof ProjectTableRowType.enum.category
//           categories: {
//               id: string
//               order: number
//           }[]
//       }
//     | {
//           type: typeof ProjectTableRowType.enum.project
//           categoryId?: string
//           projects: {
//               id: string
//               order: number
//               name?: string
//           }[]
//       }

type ProjectsStore = {
    projectsByCategories: ProjectsListResponse
    isLoading: boolean
    initialized: boolean

    fetchProjects: () => Promise<void>
    updateProjects: (payload: UpdateProjectsPayload) => Promise<ActionResult>
    reset: () => void
}

const initialState = {
    projectsByCategories: [],
    isLoading: false,
    initialized: false,
}

export const useProjectsStore = create<ProjectsStore>()(
    immer((set) => ({
        ...initialState,

        reset: () => {
            set((state) => {
                state.projectsByCategories = []
                state.isLoading = false
                state.initialized = false
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
            console.log('🔥  updateProjects')
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
            })

            return {
                success: true,
                message: backSuccess.UPDATE_SUCCEEDED,
            }
        },
    })),
)
