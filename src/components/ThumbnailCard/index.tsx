'use client'

import Image from 'next/image'

import { VideoSchema } from '@/types/video/schema'

type ThumbnailCardProperties = {
    title: VideoSchema['title']
    imgUrl: VideoSchema['image']['url']
}

const ThumbnailCard = ({ title, imgUrl }: ThumbnailCardProperties) => {
    return (
        <div className="mw-[400px] p-4">
            <Image
                className="w-full h-auto"
                src={imgUrl}
                alt={title}
                width={400}
                height={400}
                loading="eager"
            />
        </div>
    )
}

export default ThumbnailCard
