'use client'

import { VideoHomeResponse } from '@/types/video/schema'

const VideoHomePlr = ({
    videoURL,
}: {
    videoURL: VideoHomeResponse['videoUrl']
}) => {
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

export default VideoHomePlr
