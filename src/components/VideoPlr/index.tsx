'use client'
import { VideoSchema } from '@/types/video/schema'

const VideoPlr = ({ videoID }: { videoID: VideoSchema['vidId'] }) => {
    return <video autoPlay loop muted src={videoID} className="w-full" />
}

export default VideoPlr
