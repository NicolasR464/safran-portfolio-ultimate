'use client'

import { useThumbnailsStore } from '@/stores/portfolio/thumbnails'
import { keyToCategory, localLogos } from '@/utils/constants'
import { useEffect, useRef, useState } from 'react'
import ThumbnailCard from '@/components/ThumbnailCard'
import Image from 'next/image'
import { useCategoriesStore } from '@/stores/portfolio/categories'
import { VideoSchema } from '@/types/video/schema'
import { Separator } from '@/components/Separator'
import LoaderCinemaReel from '@/components/Loader'

const Thumbnails = () => {
    const loaderRef = useRef<HTMLDivElement | null>(null)
    const separatorsRefs = useRef<Record<string, HTMLElement | null>>({})
    const setActiveCategory = useCategoriesStore(
        (state) => state.setActiveCategory,
    )

    const thumbnailsByCategories = useThumbnailsStore(
        (state) => state.thumbnailsByCategories,
    )
    const isLoading = useThumbnailsStore((state) => state.isLoading)
    const initialized = useThumbnailsStore((state) => state.initialized)
    const fetchNextBatch = useThumbnailsStore((state) => state.fetchNextBatch)
    const isFetchingToClickedCategory = useThumbnailsStore(
        (state) => state.isFetchingToClickedCategory,
    )

    useEffect(() => {
        if (!initialized) {
            fetchNextBatch()
        }
    }, [initialized, fetchNextBatch])

    useEffect(() => {
        const node = loaderRef.current
        if (!node) return

        /** Fetches the next batch of thumbnails on scroll. */
        const observer = new IntersectionObserver(
            (entries) => {
                const firstEntry = entries[0]

                if (firstEntry?.isIntersecting) {
                    fetchNextBatch()
                }
            },
            {
                root: null,
                rootMargin: '0px 0px 150px 0px',
                threshold: 0,
            },
        )

        observer.observe(node)

        return () => observer.disconnect()
    }, [fetchNextBatch])

    useEffect(() => {
        /** Update the active category button style based on the viewport middle. */
        const updateMiddleCategory = () => {
            const viewportMiddle = window.innerHeight / 2

            let currentCategory: VideoSchema['category'] | null = null
            let closestCategory: VideoSchema['category'] | null = null
            let closestDistance = Infinity

            for (const [category, element] of Object.entries(
                separatorsRefs.current,
            )) {
                if (!element) continue

                const rect = element.getBoundingClientRect()

                // Case 1: the center of the viewport is inside this h2
                if (
                    rect.top <= viewportMiddle &&
                    rect.bottom >= viewportMiddle
                ) {
                    currentCategory = category
                    break
                }

                // Case 2: fallback -> nearest h2 to the center
                const elementMiddle = rect.top + rect.height / 2
                const distance = Math.abs(elementMiddle - viewportMiddle)

                if (distance < closestDistance) {
                    closestDistance = distance
                    closestCategory = category
                }
            }

            if (currentCategory) setActiveCategory(currentCategory)
            if (closestCategory) setActiveCategory(closestCategory)
        }

        if (!isFetchingToClickedCategory) updateMiddleCategory()

        window.addEventListener('scroll', updateMiddleCategory, {
            passive: true,
        })
        window.addEventListener('resize', updateMiddleCategory)

        return () => {
            window.removeEventListener('scroll', updateMiddleCategory)
            window.removeEventListener('resize', updateMiddleCategory)
        }
    }, [thumbnailsByCategories])

    const lastCategory = thumbnailsByCategories.at(-1)?.category

    return (
        <div className="mb-32">
            {thumbnailsByCategories &&
                thumbnailsByCategories.map((thumbnailsCategory) => (
                    <div
                        className={`w-full scroll-mt-(--header-height) ${lastCategory === thumbnailsCategory.category && 'min-h-screen'}`}
                        key={thumbnailsCategory.category}
                        id={thumbnailsCategory.category}
                    >
                        <Separator />

                        <div
                            className={`select-none sticky top-(--header-height) flex justify-center content-center p-4`}
                            ref={(separatorElement) => {
                                separatorsRefs.current[
                                    thumbnailsCategory.category
                                ] = separatorElement
                            }}
                        >
                            <span>
                                <Image
                                    className="invert"
                                    src={localLogos.reel.SRC}
                                    alt={localLogos.reel.ALT}
                                    width={25}
                                    height={25}
                                />
                            </span>

                            <h2 className="mx-2 text-white text-xl font-mono">
                                {keyToCategory[thumbnailsCategory.category]}
                            </h2>

                            <span>
                                <Image
                                    className="invert scale-x-[-1]"
                                    src={localLogos.reel.SRC}
                                    alt={localLogos.reel.ALT}
                                    width={25}
                                    height={25}
                                />
                            </span>
                        </div>

                        <div className="flex flex-wrap justify-center items-center">
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

            {isLoading && <LoaderCinemaReel />}

            <div ref={loaderRef} />
        </div>
    )
}

export default Thumbnails
