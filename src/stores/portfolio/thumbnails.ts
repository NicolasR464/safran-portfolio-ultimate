import {
    ThumbnailsCategory,
    ThumbnailsResponse,
} from '@/types/apiResponses/portfolio'
import { searchParamsNames } from '@/utils/constants'
import { localApiEndpoints } from '@/utils/constants/endpoints'
import { apiClientSide } from '@/utils/ky'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

type ThumbnailsStore = {
    thumbnailsByCategories: ThumbnailsCategory[]
    batchNumber: number
    isLoading: boolean
    hasMore: boolean
    initialized: boolean
    error: boolean

    fetchNextBatch: () => Promise<void>
    reset: () => void
}

const initialState = {
    thumbnailsByCategories: [],
    batchNumber: 1,
    isLoading: false,
    hasMore: true,
    initialized: false,
    error: false,
}

export const useThumbnailsStore = create<ThumbnailsStore>()(
    immer((set, get) => ({
        ...initialState,

        reset: () => {
            set((state) => {
                state.thumbnailsByCategories = []
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
                    const existingBatch = state.thumbnailsByCategories.find(
                        (batch) => batch.category === newBatch.category,
                    )

                    if (existingBatch) {
                        existingBatch.items.push(...newBatch.items)
                    } else {
                        state.thumbnailsByCategories.push(newBatch)
                    }
                }
            })
        },
    })),
)
