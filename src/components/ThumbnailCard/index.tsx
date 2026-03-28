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
    title,
    imgUrl,
}: ThumbnailCardProperties & { topCard?: string }) => {
    const ref = useRef<HTMLDivElement | null>(null)
    const [opacity, setOpacity] = useState(0)

    useEffect(() => {
        const updateTextOpacity = () => {
            const element = ref.current
            if (!element) return

            const rect = element.getBoundingClientRect()

            const elementCenter = rect.top + rect.height / 2
            const viewportCenter = window.innerHeight / 2

            const distance = Math.abs(elementCenter - viewportCenter)

            // Normalize distance → opacity
            const maxDistance = window.innerHeight / 1.8

            const value = 1 - distance / maxDistance

            // Clamp between 0 and 1
            setOpacity(Math.max(0, Math.min(1, value)))
        }

        updateTextOpacity()

        window.addEventListener('scroll', updateTextOpacity, { passive: true })
        window.addEventListener('resize', updateTextOpacity)

        return () => {
            window.removeEventListener('scroll', updateTextOpacity)
            window.removeEventListener('resize', updateTextOpacity)
        }
    }, [])

    return (
        <div
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
                className="block text-center text-white text-sm font-poiret-one"
            >
                {title}
            </h3>
        </div>
    )
}

export default ThumbnailCard
