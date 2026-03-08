'use client'

import {
    ThumbnailsCategory,
    ThumbnailsResponse,
} from '@/types/apiResponses/portfolio'
import ThumbnailCard from '@/components/ThumbnailCard'
import { apiClientSide } from '@/utils/ky'
import { useEffect, useRef, useState } from 'react'
import { localApiEndpoints } from '@/utils/constants/endpoints'
import { searchParamsNames } from '@/utils/constants'

export const Thumbnails = () => {
    const [thumbnailsByCategories, setThumbnailsByCategories] =
        useState<ThumbnailsCategory[]>()
    const [batchNumber, setBatchNumber] = useState<number>(1)
    const [isLoading, setIsLoading] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const [askingMore, setAskingMore] = useState(false)

    const loaderRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        const fetchThumbnails = async () => {
            if (isLoading || !hasMore) return

            setIsLoading(true)

            const searchParams = new URLSearchParams()

            searchParams.set(
                searchParamsNames.BATCH_NUMBER,
                batchNumber.toString(),
            )

            const thumbnailsResponse = await apiClientSide<ThumbnailsResponse>(
                `${localApiEndpoints.PORTFOLIO}?${searchParams}`,
            )

            if (!thumbnailsResponse.ok) return

            const thumbnails = await thumbnailsResponse.json()

            setHasMore(thumbnails.hasMore)
            setIsLoading(false)
            setBatchNumber((prev) => prev + 1)
            setAskingMore(false)

            setThumbnailsByCategories((prev) => {
                if (!prev) return thumbnails.data

                const previousBatches = structuredClone(prev)

                for (const newCategory of thumbnails.data) {
                    const existingCategory = previousBatches.find(
                        (category) =>
                            category.category === newCategory.category,
                    )

                    if (existingCategory) {
                        existingCategory.items = [
                            ...existingCategory.items,
                            ...newCategory.items,
                        ]
                    }

                    if (!existingCategory) previousBatches.push(newCategory)
                }

                return previousBatches
            })
        }

        if (!askingMore) return

        fetchThumbnails()
    }, [askingMore])

    useEffect(() => {
        const node = loaderRef.current
        if (!node) return

        const observer = new IntersectionObserver(
            (entries) => {
                const firstEntry = entries[0]

                if (firstEntry.isIntersecting && !isLoading && hasMore)
                    setAskingMore(true)
            },
            {
                root: null,
                rootMargin: '0px 0px 200px 0px',
                threshold: 0,
            },
        )

        observer.observe(node)

        return () => observer.disconnect()
    }, [isLoading, hasMore])

    return (
        <>
            {thumbnailsByCategories &&
                thumbnailsByCategories.map((thumbnailsCategory) => (
                    <div key={thumbnailsCategory.category}>
                        <h2>{thumbnailsCategory.category}</h2>

                        <div>
                            {thumbnailsCategory.items.map((item) => (
                                <div key={item._id}>
                                    <ThumbnailCard
                                        title={item.title}
                                        imgUrl={item.imageUrl}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

            {isLoading && <p>Loading...</p>}

            <div ref={loaderRef} />
        </>
    )
}
