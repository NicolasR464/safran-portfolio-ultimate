'use client'

import useIsMobile from '@/hooks/useIsMobile'
import { urls } from '@/utils/constants/urls'

/** Video displayed on the home page */
const VideoHome = () => {
    const isMobile = useIsMobile()

    console.log('isMobile: ' + isMobile.toString())

    return (
        <div className="flex justify-center items-center w-screen h-screen">
            {!isMobile && (
                <video autoPlay loop muted playsInline className="w-full">
                    <source src={urls.videoHome.WIDE_SCREEN} type="video/mp4" />
                </video>
            )}

            {isMobile && (
                <video autoPlay loop muted playsInline className="w-full">
                    <source
                        src={urls.videoHome.SMALL_SCREEN}
                        type="video/mp4"
                    />
                </video>
            )}
        </div>
    )
}

export default VideoHome
