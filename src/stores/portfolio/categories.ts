import { CategoriesResponse } from '@/types/apiResponses/portfolio'
import { localApiEndpoints } from '@/utils/constants/endpoints'
import { apiClientSide } from '@/utils/ky'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

type CategoriesStore = {
    categories: string[]
    isLoading: boolean
    initialized: boolean
    error: boolean
    getCategories: () => Promise<void>
}

const initialState: CategoriesStore = {
    categories: [],
    isLoading: false,
    initialized: false,
    error: false,
    getCategories: async () => {},
}

export const useCategoriesStore = create<CategoriesStore>()(
    immer((set) => ({
        ...initialState,

        getCategories: async () => {
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
