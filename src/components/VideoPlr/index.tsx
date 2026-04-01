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
            id={videoID}
            height={500}
            width={500}
            className="w-full"
        />
    )
}

export default VideoPlr
