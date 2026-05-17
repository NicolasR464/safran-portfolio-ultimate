'use client'

import { VideoHomeSchema } from '@/types/video/schema'

const VideoPlr = ({ videoURL }: { videoURL: VideoHomeSchema['videoUrl'] }) => {
    return (
        <video
            autoPlay
            playsInline
            loop
            muted
            src={videoURL}
            className='w-full'
        />
    )
}

export default VideoPlr
