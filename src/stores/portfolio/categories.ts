import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import { CategoriesResponse } from '@/types/apiResponses/portfolio'
import { ProjectSchema } from '@/types/project/schema'
import { localApiEndpoints } from '@/utils/constants/endpoints'
import { apiClientSide } from '@/utils/ky'

type CategoriesStore = {
    categories: ProjectSchema['category'][]
    isLoading: boolean
    initialized: boolean
    error: boolean
    activeCategory: ProjectSchema['category']
    setActiveCategory: (category: ProjectSchema['category']) => void
    fetchCategories: () => Promise<void>
}

export const useCategoriesStore = create<CategoriesStore>()(
    immer((set) => ({
        categories: [],
        isLoading: false,
        initialized: false,
        error: false,
        activeCategory: '',

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

        setActiveCategory: (category: ProjectSchema['category']) => {
            set((state) => {
                state.activeCategory = category
            })
        },
    })),
)
