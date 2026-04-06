'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

import { urls } from '@/utils/constants/urls'
import { Thumbnail } from '@/types/apiResponses/portfolio'

const ThumbnailCard = ({ metadata }: { metadata: Thumbnail }) => {
    const { title, _id, imageUrl } = metadata

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
        <Link href={`${urls.visitor.PORTFOLIO}/${_id}`}>
            <div
                ref={ref}
                className="p-4 mx-2 cursor-pointer transition-opacity duration-200 flex h-full flex-col"
            >
                {title && (
                    <div className="flex-1 flex items-center justify-center">
                        <Image
                            className="mx-auto h-auto max-w-full"
                            src={imageUrl}
                            alt={title}
                            width={500}
                            height={500}
                            loading="eager"
                        />
                    </div>
                )}

                <h3
                    style={{ opacity }}
                    className="mt-auto truncate pt-2 text-center text-sm leading-tight text-white font-poiret-one"
                >
                    {title}
                </h3>
            </div>
        </Link>
    )
}

export default ThumbnailCard
