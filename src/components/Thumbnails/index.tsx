'use client'

import { useThumbnailsStore } from '@/stores/portfolio/thumbnails'
import { keyToCategory } from '@/utils/constants'
import { useEffect, useRef } from 'react'
import ThumbnailCard from '../ThumbnailCard'

export const Thumbnails = () => {
    const loaderRef = useRef<HTMLDivElement | null>(null)

    const thumbnailsByCategories = useThumbnailsStore(
        (state) => state.thumbnailsByCategories,
    )
    const isLoading = useThumbnailsStore((state) => state.isLoading)
    const initialized = useThumbnailsStore((state) => state.initialized)
    const fetchNextBatch = useThumbnailsStore((state) => state.fetchNextBatch)

    useEffect(() => {
        if (!initialized) {
            fetchNextBatch()
        }
    }, [initialized, fetchNextBatch])

    useEffect(() => {
        const node = loaderRef.current
        if (!node) return

        const observer = new IntersectionObserver(
            (entries) => {
                const firstEntry = entries[0]

                if (firstEntry?.isIntersecting) {
                    fetchNextBatch()
                }
            },
            {
                root: null,
                rootMargin: '0px 0px 200px 0px',
                threshold: 0,
            },
        )

        observer.observe(node)

        return () => observer.disconnect()
    }, [fetchNextBatch])

    return (
        <>
            {thumbnailsByCategories &&
                thumbnailsByCategories.map((thumbnailsCategory) => (
                    <div
                        className="w-full p-[5%]"
                        key={thumbnailsCategory.category}
                    >
                        <h2 className="text-2xl font-bold text-center p-4">
                            {keyToCategory[thumbnailsCategory.category]}
                        </h2>

                        <div className="flex flex-wrap justify-center items-center ">
                            {thumbnailsCategory.items.map((item) => (
                                <ThumbnailCard
                                    title={item.title}
                                    imgUrl={item.imageUrl}
                                    key={item._id}
                                />
                            ))}
                        </div>
                    </div>
                ))}

            {isLoading && <p>Loading...</p>}

            <div ref={loaderRef} />
        </>
    )
}
