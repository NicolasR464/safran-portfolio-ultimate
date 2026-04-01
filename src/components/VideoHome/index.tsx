'use client'

import useIsMobile from '@/hooks/useIsMobile'
import { ScreenSize } from '@/types/video'
import { VideoSchema } from '@/types/video/schema'
import { searchParamsNames } from '@/utils/constants'
import { localApiEndpoints } from '@/utils/constants/endpoints'

import { apiClientSide } from '@/utils/ky'
import { useEffect, useState } from 'react'
import LoaderCinemaReel from '@/components/LoaderCinemaReel'
import VideoPlr from '@/components/VideoPlr'

/** Video displayed on the home page */
const VideoHome = () => {
    const [videoID, setVideoID] = useState<VideoSchema['vidId']>('')
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const isMobile = useIsMobile()

    console.log('isMobile: ' + isMobile.toString())

    useEffect(() => {
        const getVideoID = async () => {
            setIsLoading(true)

            const screenSize = isMobile
                ? ScreenSize.enum['1:1']
                : ScreenSize.enum['16:9']

            const apiResponse = await apiClientSide<VideoSchema['vidId']>(
                `${localApiEndpoints.VIDEOS}?${searchParamsNames.SCREEN_SIZE}=${screenSize}`,
            )

            setIsLoading(false)

            if (!apiResponse.ok) {
                return
            }

            const videoID = await apiResponse.json()

            setVideoID(videoID)
        }

        getVideoID()
    }, [isMobile])

    return (
        <div className="flex justify-center items-center w-screen h-screen">
            {isLoading && <LoaderCinemaReel size={100} />}

            {videoID && <VideoPlr videoID={videoID} />}
        </div>
    )
}

export default VideoHome
