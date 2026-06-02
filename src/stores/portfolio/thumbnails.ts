import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import {
    ThumbnailsCategory,
    ThumbnailsResponse,
} from '@/types/apiResponses/portfolio'

import { searchParamsNames } from '@/utils/constants'
import { localApiEndpoints } from '@/utils/constants/endpoints'
import { apiClientSide } from '@/utils/ky'
import { ProjectCategorySchema } from '@/types/projectCategory/schema'

type CategoryName = ProjectCategorySchema['name']

type ThumbnailsStore = {
    thumbnailsByCategories: ThumbnailsCategory[]
    categoriesFetched: CategoryName[]
    batchNumber: number
    isLoading: boolean
    hasMore: boolean
    initialized: boolean
    error: boolean
    isFetchingToClickedCategory: boolean
    fetchNextBatch: (category?: CategoryName) => Promise<void>
    fetchNewCategory: (category: CategoryName) => Promise<void>
    reset: () => void
}
const initialState = {
    thumbnailsByCategories: [],
    categoriesFetched: [],
    batchNumber: 1,
    isLoading: false,
    hasMore: true,
    initialized: false,
    error: false,
    isFetchingToClickedCategory: false,
}

export const useThumbnailsStore = create<ThumbnailsStore>()(
    immer((set, get) => ({
        ...initialState,

        reset: () => {
            set((state) => {
                state.thumbnailsByCategories = []
                state.categoriesFetched = []
                state.batchNumber = 1
                state.isLoading = false
                state.hasMore = true
                state.initialized = false
                state.error = false
            })
        },

        fetchNextBatch: async (categoryName) => {
            const { isLoading, hasMore, batchNumber } = get()

            if (isLoading || !hasMore) return

            set((state) => {
                state.isLoading = true
                state.error = false
            })

            const searchParams = new URLSearchParams()

            if (categoryName) {
                searchParams.set(searchParamsNames.CATEGORY, categoryName)
            }

            searchParams.set(
                searchParamsNames.BATCH_NUMBER,
                batchNumber.toString(),
            )

            const apiResponse = await apiClientSide<ThumbnailsResponse>(
                `${localApiEndpoints.THUMBNAILS}?${searchParams.toString()}`,
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
                state.hasMore = parsedResponse.hasMore
                state.batchNumber += 1

                for (const newBatch of parsedResponse.data) {
                    const newBatchCategoryName =
                        typeof newBatch.category === 'string'
                            ? newBatch.category
                            : newBatch.category.name

                    const existingBatch = state.thumbnailsByCategories.find(
                        (batch) => {
                            const batchCategoryName =
                                typeof batch.category === 'string'
                                    ? batch.category
                                    : batch.category.name

                            return batchCategoryName === newBatchCategoryName
                        },
                    )

                    if (existingBatch) {
                        existingBatch.items.push(...newBatch.items)
                    } else {
                        state.thumbnailsByCategories.push(newBatch)
                        state.categoriesFetched.push(newBatchCategoryName)
                    }
                }
            })
        },

        fetchNewCategory: async (categoryName) => {
            set((state) => {
                state.isFetchingToClickedCategory = true
            })

            while (!get().categoriesFetched.includes(categoryName)) {
                if (!get().hasMore) break
                await get().fetchNextBatch(categoryName)
            }

            set((state) => {
                state.isFetchingToClickedCategory = false
            })
        },
    })),
)
