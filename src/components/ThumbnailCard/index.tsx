'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

import { VideoSchema } from '@/types/video/schema'

type ThumbnailCardProperties = {
    title: VideoSchema['title']
    imgUrl: VideoSchema['image']['url']
    topCard?: string
}

const ThumbnailCard = ({
    topCard,
    title,
    imgUrl,
}: ThumbnailCardProperties & { topCard?: string }) => {
    const ref = useRef<HTMLDivElement | null>(null)
    const [opacity, setOpacity] = useState(0)

    useEffect(() => {
        const updateOpacity = () => {
            const el = ref.current
            if (!el) return

            const rect = el.getBoundingClientRect()

            const elementCenter = rect.top + rect.height / 2
            const viewportCenter = window.innerHeight / 2

            const distance = Math.abs(elementCenter - viewportCenter)

            // Normalize distance → opacity
            const maxDistance = window.innerHeight / 1.8

            const value = 1 - distance / maxDistance

            // Clamp between 0 and 1
            setOpacity(Math.max(0, Math.min(1, value)))
        }

        updateOpacity()

        window.addEventListener('scroll', updateOpacity, { passive: true })
        window.addEventListener('resize', updateOpacity)

        return () => {
            window.removeEventListener('scroll', updateOpacity)
            window.removeEventListener('resize', updateOpacity)
        }
    }, [])

    return (
        <div
            {...(topCard && { id: topCard })}
            ref={ref}
            className="p-4 mx-2 cursor-pointer transition-opacity duration-200"
        >
            <Image
                className="w-full h-auto"
                src={imgUrl}
                alt={title}
                width={500}
                height={500}
                loading="eager"
            />

            <h3
                style={{ opacity }}
                className="block text-center text-gray-600 text-sm font-poiret-one"
            >
                {title}
            </h3>
        </div>
    )
}

export default ThumbnailCard
