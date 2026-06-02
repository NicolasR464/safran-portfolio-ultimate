import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import { localApiEndpoints } from '@/utils/constants/endpoints'
import { apiClientSide } from '@/utils/ky'
import { ProjectsListResponse } from '@/types/apiResponses/admin/projects'
import { ProjectTableRowType } from '@/utils/enums'

type UpdateProjectsPayload =
    | {
          type: typeof ProjectTableRowType.enum.category
          categories: {
              id: string
              order: number
          }[]
      }
    | {
          type: typeof ProjectTableRowType.enum.project
          categoryId?: string
          projects: {
              id: string
              order: number
          }[]
      }

type ProjectsStore = {
    projectsByCategories: ProjectsListResponse
    isLoading: boolean
    initialized: boolean
    error: boolean
    fetchProjects: () => Promise<void>
    updateProjects: (payload: UpdateProjectsPayload) => Promise<void>
    reset: () => void
}

const initialState = {
    projectsByCategories: [],
    isLoading: false,
    initialized: false,
    error: false,
}

export const useProjectsStore = create<ProjectsStore>()(
    immer((set) => ({
        ...initialState,

        reset: () => {
            set((state) => {
                state.projectsByCategories = []
                state.isLoading = false
                state.initialized = false
                state.error = false
            })
        },

        fetchProjects: async () => {
            set((state) => {
                state.isLoading = true
                state.error = false
            })

            const apiResponse = await apiClientSide<ProjectsListResponse>(
                localApiEndpoints.ADMIN.PROJECTS,
            )

            if (!apiResponse.ok) {
                set((state) => {
                    state.isLoading = false
                    state.error = true
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
            console.log('🔥 updateProjects payload', payload)

            set((state) => {
                state.isLoading = true
                state.error = false
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
                    state.error = true
                })

                return
            }

            const projectsResponse = await apiClientSide<ProjectsListResponse>(
                localApiEndpoints.ADMIN.PROJECTS,
            )

            if (!projectsResponse.ok) {
                set((state) => {
                    state.isLoading = false
                    state.error = true
                })

                return
            }

            const parsedResponse = await projectsResponse.json()

            set((state) => {
                state.projectsByCategories = parsedResponse
                state.isLoading = false
                state.initialized = true
            })
        },
    })),
)
