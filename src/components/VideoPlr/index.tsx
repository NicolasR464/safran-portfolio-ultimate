'use client'

const VideoPlr = ({ videoID }: { videoID: string }) => {
    return (
        <video
            autoPlay
            playsInline
            loop
            muted
            src={videoID}
            className='w-full'
        />
    )
}

export default VideoPlr
