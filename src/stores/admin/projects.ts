import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import { localApiEndpoints } from '@/utils/constants/endpoints'
import { apiClientSide } from '@/utils/ky'
import { ProjectsListResponse } from '@/types/apiResponses/admin/projects'

type ProjectsStore = {
    projectsByCategories: ProjectsListResponse
    isLoading: boolean
    initialized: boolean
    error: boolean
    fetchProjects: () => Promise<void>
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
            console.log('🚀 fetchProjects')

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

            console.log('🚀 in store')

            console.log({ parsedResponse })

            set((state) => {
                state.projectsByCategories = parsedResponse
                state.isLoading = false
                state.initialized = true
            })
        },
    })),
)
