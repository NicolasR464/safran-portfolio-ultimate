'use client'

import { useEffect, useState } from 'react'

import LoaderCinemaReel from '@/components/LoaderCinemaReel'
import VideoPlr from '@/components/VideoPlr'
import useIsMobile from '@/hooks/useIsMobile'
import { ScreenSize } from '@/types/project'
import { ProjectSchema } from '@/types/project/schema'
import { searchParamsNames } from '@/utils/constants'
import { localApiEndpoints } from '@/utils/constants/endpoints'
import { apiClientSide } from '@/utils/ky'

/** Video displayed on the home page */
const VideoHome = () => {
    const [video, setVideo] = useState<ProjectSchema['video']>()
    const [isLoading, setIsLoading] = useState<boolean>(true)

    const isMobile = useIsMobile()

    useEffect(() => {
        const getVideoID = async () => {
            const screenSize = isMobile
                ? ScreenSize.enum['1:1']
                : ScreenSize.enum['16:9']

            const apiResponse = await apiClientSide<ProjectSchema['video']>(
                `${localApiEndpoints.VIDEO}?${searchParamsNames.SCREEN_SIZE}=${screenSize}`,
            )

            setIsLoading(false)

            if (!apiResponse.ok) {
                return
            }

            const videoData = await apiResponse.json()

            setVideo(videoData)
        }

        getVideoID()
    }, [isMobile])

    return (
        <div className='flex justify-center items-center w-screen h-[80vh] sm:h-screen'>
            {isLoading && <LoaderCinemaReel size={100} />}

            {video && <VideoPlr videoID={video.videoId} />}
        </div>
    )
}

export default VideoHome
