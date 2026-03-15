import { CategoriesResponse } from '@/types/apiResponses/portfolio'
import { VideoSchema } from '@/types/video/schema'
import { localApiEndpoints } from '@/utils/constants/endpoints'
import { apiClientSide } from '@/utils/ky'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

type CategoriesStore = {
    categories: VideoSchema['category'][]
    isLoading: boolean
    initialized: boolean
    error: boolean
    fetchCategories: () => Promise<void>
}

const initialState: CategoriesStore = {
    categories: [],
    isLoading: false,
    initialized: false,
    error: false,
    fetchCategories: async () => {},
}

export const useCategoriesStore = create<CategoriesStore>()(
    immer((set) => ({
        ...initialState,

        fetchCategories: async () => {
            const apiResponse = await apiClientSide<CategoriesResponse>(
                `${localApiEndpoints.CATEGORIES}`,
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
                state.isLoading = false
                state.initialized = true
                state.categories = parsedResponse.data
            })
        },
    })),
)
