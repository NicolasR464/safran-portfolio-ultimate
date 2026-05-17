import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import { ProjectSchema } from '@/types/project/schema'
import { searchParamsNames } from '@/utils/constants'
import { localApiEndpoints } from '@/utils/constants/endpoints'
import { apiClientSide } from '@/utils/ky'

type ProjectsResponse = {
    data: ProjectSchema[]
    hasMore: boolean
}

type ProjectsStore = {
    projects: ProjectSchema[]
    batchNumber: number
    isLoading: boolean
    hasMore: boolean
    initialized: boolean
    error: boolean
    fetchNextBatch: () => Promise<void>
    reset: () => void
}

const initialState = {
    projects: [],
    batchNumber: 1,
    isLoading: false,
    hasMore: true,
    initialized: false,
    error: false,
}

export const useProjectsStore = create<ProjectsStore>()(
    immer((set, get) => ({
        ...initialState,

        reset: () => {
            set((state) => {
                state.projects = []
                state.batchNumber = 1
                state.isLoading = false
                state.hasMore = true
                state.initialized = false
                state.error = false
            })
        },

        fetchNextBatch: async () => {
            const { isLoading, hasMore, batchNumber } = get()

            if (isLoading || !hasMore) return

            set((state) => {
                state.isLoading = true
                state.error = false
            })

            const searchParams = new URLSearchParams()

            searchParams.set(
                searchParamsNames.BATCH_NUMBER,
                batchNumber.toString(),
            )

            const apiResponse = await apiClientSide<ProjectsResponse>(
                `${localApiEndpoints.ADMIN.PROJECTS}?${searchParams.toString()}`,
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
                state.projects.push(...parsedResponse.data)
                state.batchNumber += 1
                state.hasMore = parsedResponse.hasMore
                state.isLoading = false
                state.initialized = true
            })
        },
    })),
)
