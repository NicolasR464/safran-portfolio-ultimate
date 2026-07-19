'use client'

import { useEffect, useState } from 'react'

import LoaderCinemaReel from '@/components/LoaderCinemaReel'
import VideoHomePlr from '@/components/VideoPlr'

import {
    type VideoHomeResponse,
    VideoHomeResponseSchema,
} from '@/types/video/schema'
import { searchParamsNames } from '@/utils/constants'
import { localApiEndpoints } from '@/utils/constants/endpoints'
import { apiClientSide } from '@/utils/ky'
import useScreenType from '@/hooks/useIsMobile'

/** Video displayed on the home page */
const VideoHome = () => {
    const screenType = useScreenType()

    const [video, setVideo] = useState<VideoHomeResponse>()
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const getVideo = async () => {
            setIsLoading(true)
            setVideo(undefined)

            const searchParams = new URLSearchParams({
                [searchParamsNames.SCREEN_TYPE]: screenType,
            })

            const apiResponse = await apiClientSide(
                `${localApiEndpoints.VIDEO}?${searchParams.toString()}`,
            )

            if (!apiResponse.ok) {
                setIsLoading(false)
                return
            }

            const body: unknown = await apiResponse.json()
            const parsedVideo = VideoHomeResponseSchema.safeParse(body)

            if (!parsedVideo.success) {
                setIsLoading(false)
                return
            }

            setVideo(parsedVideo.data)
            setIsLoading(false)
        }

        void getVideo()
    }, [screenType])

    return (
        <section className='flex min-h-[80dvh] w-full items-center justify-center overflow-hidden sm:min-h-dvh'>
            {isLoading && <LoaderCinemaReel size={100} />}

            {!isLoading && video && (
                <div className='w-full'>
                    <VideoHomePlr videoURL={video.videoUrl} />
                </div>
            )}
        </section>
    )
}

export default VideoHome
