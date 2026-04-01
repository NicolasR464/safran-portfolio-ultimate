'use client'
import { VideoSchema } from '@/types/video/schema'
import { CldVideoPlayer } from 'next-cloudinary'
import 'next-cloudinary/dist/cld-video-player.css'

const VideoPlr = ({ videoID }: { videoID: VideoSchema['vidId'] }) => {
    return (
        <CldVideoPlayer
            autoplay
            loop
            muted
            controls={false}
            bigPlayButton={false}
            src={videoID}
            className="w-full"
        />
    )
}

export default VideoPlr
