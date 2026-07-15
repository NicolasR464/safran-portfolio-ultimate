import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import { localApiEndpoints } from '@/utils/constants/endpoints'
import { apiClientSide } from '@/utils/ky'
import { ProjectCategorySchema } from '@/types/projectCategory/schema'
import { CategoriesResponse } from '@/types/api/portfolio'

type CategoriesStore = {
    categories: ProjectCategorySchema[]
    isLoading: boolean
    initialized: boolean
    error: boolean
    activeCategory: ProjectCategorySchema['name'] | ''
    setActiveCategory: (category: ProjectCategorySchema['name']) => void
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
            set((state) => {
                state.isLoading = true
                state.error = false
            })

            const apiResponse = await apiClientSide<CategoriesResponse>(
                localApiEndpoints.CATEGORIES,
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

        setActiveCategory: (category) => {
            set((state) => {
                state.activeCategory = category
            })
        },
    })),
)
