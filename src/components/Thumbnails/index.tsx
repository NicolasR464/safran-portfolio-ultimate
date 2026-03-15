'use client'

import { useThumbnailsStore } from '@/stores/portfolio/thumbnails'
import { keyToCategory } from '@/utils/constants'
import { useEffect, useRef } from 'react'
import ThumbnailCard from '../ThumbnailCard'
import Loader from '../Loader'
import Image from 'next/image'

const Thumbnails = () => {
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
        <div className="mt-16">
            {thumbnailsByCategories &&
                thumbnailsByCategories.map((thumbnailsCategory) => (
                    <div
                        className="w-full p-[5%]"
                        key={thumbnailsCategory.category}
                    >
                        <div className="select-none flex justify-center content-center p-4">
                            <span>
                                <Image
                                    className="invert"
                                    src="/reel.png"
                                    alt="Cinema reel"
                                    width={25}
                                    height={25}
                                />
                            </span>

                            <h2
                                id={thumbnailsCategory.category}
                                className="scroll-mt-36 mx-2 text-xl font-mono"
                            >
                                {keyToCategory[thumbnailsCategory.category]}
                            </h2>

                            <span>
                                <Image
                                    className="invert scale-x-[-1]"
                                    src="/reel.png"
                                    alt="Cinema reel"
                                    width={25}
                                    height={25}
                                />
                            </span>
                        </div>

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

            {isLoading && <Loader label="Loading more thumbnails" />}

            <div ref={loaderRef} />
        </div>
    )
}

export default Thumbnails
