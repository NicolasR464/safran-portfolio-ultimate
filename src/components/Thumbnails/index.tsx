'use client'

import {
    ThumbnailsCategory,
    ThumbnailsResponseAPI,
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
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [hasMore, setHasMore] = useState<boolean>(true)
    const [askingMore, setAskingMore] = useState<boolean>(false)

    const loaderRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        console.log(thumbnailsByCategories)
    }, [thumbnailsByCategories])

    useEffect(() => {
        const fetchThumbnails = async () => {
            if (isLoading || !hasMore) return

            setIsLoading(true)

            const searchParams = new URLSearchParams()

            searchParams.set(
                searchParamsNames.BATCH_NUMBER,
                batchNumber.toString(),
            )

            const apiResponse = await apiClientSide<ThumbnailsResponseAPI>(
                `${localApiEndpoints.PORTFOLIO}?${searchParams}`,
            )

            if (!apiResponse.ok) return

            const parsedResponse = await apiResponse.json()

            console.log(parsedResponse.data.thumbnails)

            setHasMore(parsedResponse.hasMore)
            setIsLoading(false)
            setBatchNumber((prev) => prev + 1)
            setAskingMore(false)

            setThumbnailsByCategories((prev) => {
                if (!prev) return parsedResponse.data.thumbnails

                const previousBatches = structuredClone(prev)

                for (const newBatch of parsedResponse.data.thumbnails) {
                    const existingBatch = previousBatches.find(
                        (batch) => batch.category === newBatch.category,
                    )

                    if (existingBatch) {
                        existingBatch.items = [
                            ...existingBatch.items,
                            ...newBatch.items,
                        ]
                    }

                    if (!existingBatch) previousBatches.push(newBatch)
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
