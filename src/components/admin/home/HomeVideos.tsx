'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { CldImage, CldUploadWidget } from 'next-cloudinary'
import {
    Copy,
    MonitorSmartphone,
    SquareArrowOutUpRight,
    Upload,
} from 'lucide-react'

import FormSeparator from '@/components/admin/projects/FormSeparator'
import ButtonGeneric from '@/components/buttons/ButtonGeneric'
import ButtonLink from '@/components/buttons/ButtonLink'
import { Checkbox } from '@/components/Checkbox'
import Form from '@/components/Form'
import { MyToastRegion, queue as toastQueue } from '@/components/Toast'
import { useHomeVideosStore } from '@/stores/admin/videosHome'
import { ToastColorVariant } from '@/types/ui/toast'

import { cloudinaryFolders } from '@/utils/constants'
import { phoneSizeIllustrationSRC, urls } from '@/utils/constants/urls'

import VideoCell from './VideoCell'
import { ScreenType } from '@/types/video/schema'

const MAX_VIDEO_FILE_SIZE = 100_000_000

const acceptedVideoFormats = ['mp4', 'webm', 'mov', 'm4v']

const screenTypeOptions: Array<{
    value: ScreenType
    label: string
    description: string
}> = [
    {
        value: 'phone',
        label: 'Phone',
        description: 'Vertical video intended for mobile screens.',
    },
    {
        value: 'tablet',
        label: 'Tablet',
        description: 'Video intended for tablet-sized screens.',
    },
    {
        value: 'computer',
        label: 'Computer',
        description: 'Landscape video intended for desktop screens.',
    },
]

const HomeVideos = () => {
    const videos = useHomeVideosStore((state) => state.videos)
    const isFetching = useHomeVideosStore((state) => state.isFetching)
    const isCreating = useHomeVideosStore((state) => state.isCreating)
    const initialized = useHomeVideosStore((state) => state.initialized)
    const fetchVideos = useHomeVideosStore((state) => state.fetchVideos)
    const createVideo = useHomeVideosStore((state) => state.createVideo)

    const uploadWidgetOpenRef = useRef<null | (() => void)>(null)

    const [videoUrl, setVideoUrl] = useState('')
    const [videoId, setVideoId] = useState('')
    const [screenTypes, setScreenTypes] = useState<ScreenType[]>([])
    const [isUploadWidgetOpen, setIsUploadWidgetOpen] = useState(false)

    useEffect(() => {
        if (!initialized) {
            void fetchVideos()
        }
    }, [fetchVideos, initialized])

    const usedScreenTypes = useMemo(
        () => new Set(videos.flatMap((video) => video.screenTypes)),
        [videos],
    )

    const availableScreenTypes = useMemo(
        () =>
            screenTypeOptions.filter(
                (option) => !usedScreenTypes.has(option.value),
            ),
        [usedScreenTypes],
    )

    const allScreenTypesUsed = availableScreenTypes.length === 0

    const handleScreenTypeChange = (
        screenType: ScreenType,
        isSelected: boolean,
    ) => {
        setScreenTypes((currentScreenTypes) => {
            if (isSelected) {
                return currentScreenTypes.includes(screenType)
                    ? currentScreenTypes
                    : [...currentScreenTypes, screenType]
            }

            return currentScreenTypes.filter(
                (currentScreenType) => currentScreenType !== screenType,
            )
        })
    }

    const openUploadWidget = () => {
        setIsUploadWidgetOpen(true)

        setTimeout(() => {
            uploadWidgetOpenRef.current?.()
        }, 0)
    }

    const handleSubmit = async () => {
        if (!videoUrl) {
            toastQueue.add(
                {
                    title: 'Upload a video first.',
                    variant: ToastColorVariant.enum.error,
                },
                { timeout: 5000 },
            )

            return
        }

        if (screenTypes.length === 0) {
            toastQueue.add(
                {
                    title: 'Select at least one screen type.',
                    variant: ToastColorVariant.enum.error,
                },
                { timeout: 5000 },
            )

            return
        }

        const unavailableScreenTypes = screenTypes.filter((screenType) =>
            usedScreenTypes.has(screenType),
        )

        if (unavailableScreenTypes.length > 0) {
            toastQueue.add(
                {
                    title: `Already assigned: ${unavailableScreenTypes.join(
                        ', ',
                    )}`,
                    variant: ToastColorVariant.enum.error,
                },
                { timeout: 5000 },
            )

            return
        }

        const result = await createVideo({
            videoUrl,
            videoId,
            screenTypes,
        })

        toastQueue.add(
            {
                title: result.message,
                variant: result.success
                    ? ToastColorVariant.enum.success
                    : ToastColorVariant.enum.error,
            },
            { timeout: 5000 },
        )

        if (!result.success) {
            return
        }

        setVideoUrl('')
        setVideoId('')
        setScreenTypes([])
    }

    return (
        <div className='flex w-full min-w-0 flex-col items-center gap-6 px-4 pb-10'>
            <MyToastRegion />

            <ButtonLink
                text='Home'
                href={urls.visitor.PORTFOLIO}
                logo={<SquareArrowOutUpRight size={24} />}
                target='_blank'
            />

            <div className='w-full min-w-0'>
                <FormSeparator title='Home Videos' />
            </div>

            <div className='w-full max-w-3xl overflow-hidden flex justify-center '>
                <CldImage
                    src={phoneSizeIllustrationSRC}
                    alt='Supported video formats for phone, tablet and computer screens'
                    width={400}
                    height={400}
                    crop='fit'
                    format='auto'
                    quality='auto'
                    sizes='(max-width: 768px) 100vw, 768px'
                    className='h-auto w-full max-w-[320] object-contain'
                />
            </div>

            <div className='grid w-full min-w-0 max-w-5xl grid-cols-1 gap-8 lg:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.2fr)]'>
                <section className='min-w-0 rounded-2xl border border-neutral-700 p-4 sm:p-5'>
                    <h2 className='mb-5 text-lg font-semibold flex'>
                        Add a home video
                    </h2>

                    {allScreenTypesUsed ? (
                        <p className='text-sm text-neutral-400'>
                            Every screen type is already assigned to a video.
                        </p>
                    ) : (
                        <Form
                            action={handleSubmit}
                            className='flex min-w-0 flex-col gap-5'
                        >
                            <div className='flex min-w-0 flex-col gap-3'>
                                <span className='text-sm'>Video</span>

                                <ButtonGeneric
                                    type='button'
                                    className='flex w-full items-center justify-center gap-2'
                                    onPress={openUploadWidget}
                                >
                                    <Upload size={18} />

                                    {videoUrl
                                        ? 'Replace video'
                                        : 'Upload video'}
                                </ButtonGeneric>

                                {videoUrl && (
                                    <div className='min-w-0 rounded-xl border border-neutral-700 p-3'>
                                        <video
                                            src={videoUrl}
                                            controls
                                            preload='metadata'
                                            className='aspect-video w-full rounded-lg bg-black object-contain'
                                        />

                                        <div className='mt-3 flex min-w-0 items-center gap-2'>
                                            <p className='min-w-0 flex-1 truncate text-xs text-neutral-400'>
                                                {videoUrl}
                                            </p>

                                            <ButtonGeneric
                                                type='button'
                                                aria-label='Copy uploaded video URL'
                                                onPress={() => {
                                                    void navigator.clipboard.writeText(
                                                        videoUrl,
                                                    )

                                                    toastQueue.add(
                                                        {
                                                            title: 'Video URL copied',
                                                            variant:
                                                                ToastColorVariant
                                                                    .enum
                                                                    .success,
                                                        },
                                                        { timeout: 3000 },
                                                    )
                                                }}
                                            >
                                                <Copy size={16} />
                                            </ButtonGeneric>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <fieldset className='min-w-0'>
                                <legend className='text-sm font-medium flex'>
                                    <MonitorSmartphone />
                                    <span className='ml-2'>Screen types</span>
                                </legend>

                                <p className='mt-1 text-sm text-neutral-400'>
                                    Select one or more screen types for this
                                    video.
                                </p>

                                <div className='mt-4 flex flex-col gap-4'>
                                    {screenTypeOptions.map((option) => {
                                        const isAlreadyUsed =
                                            usedScreenTypes.has(option.value)

                                        return (
                                            <Checkbox
                                                key={option.value}
                                                isSelected={screenTypes.includes(
                                                    option.value,
                                                )}
                                                isDisabled={isAlreadyUsed}
                                                onChange={(isSelected) => {
                                                    handleScreenTypeChange(
                                                        option.value,
                                                        isSelected,
                                                    )
                                                }}
                                                className='min-w-0 items-start'
                                            >
                                                <span className='flex min-w-0 flex-1 flex-col'>
                                                    <span>{option.label}</span>

                                                    <span className='break-words text-xs text-neutral-500'>
                                                        {isAlreadyUsed
                                                            ? 'A video already exists for this screen type.'
                                                            : option.description}
                                                    </span>
                                                </span>
                                            </Checkbox>
                                        )
                                    })}
                                </div>
                            </fieldset>

                            <ButtonGeneric
                                type='submit'
                                className='w-full sm:w-fit'
                                isDisabled={
                                    isCreating ||
                                    !videoUrl ||
                                    screenTypes.length === 0
                                }
                            >
                                {isCreating ? 'Creating...' : 'Create video'}
                            </ButtonGeneric>
                        </Form>
                    )}
                </section>

                <section className='flex min-w-0 flex-col gap-4'>
                    <h2 className='text-lg font-semibold'>Configured videos</h2>

                    {!initialized && isFetching && (
                        <p className='text-sm text-neutral-400'>
                            Loading videos...
                        </p>
                    )}

                    {initialized && videos.length === 0 && (
                        <p className='text-sm text-neutral-400'>
                            No home video has been configured.
                        </p>
                    )}

                    <div className='flex min-w-0 flex-col gap-5'>
                        {videos.map((video) => (
                            <VideoCell
                                key={video._id}
                                video={video}
                                videos={videos}
                            />
                        ))}
                    </div>
                </section>
            </div>

            <CldUploadWidget
                uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!}
                options={{
                    multiple: false,
                    sources: ['local', 'dropbox', 'google_drive'],
                    folder:
                        cloudinaryFolders.MAIN +
                        cloudinaryFolders.HOME_PAGE_VIDEO,
                    resourceType: 'video',
                    clientAllowedFormats: acceptedVideoFormats,
                    maxFileSize: MAX_VIDEO_FILE_SIZE,
                    maxFiles: 1,
                }}
                onSuccess={(result) => {
                    if (!result?.info || typeof result.info === 'string') {
                        return
                    }

                    if (result.info.resource_type !== 'video') {
                        toastQueue.add(
                            {
                                title: 'The uploaded asset is not a video.',
                                variant: ToastColorVariant.enum.error,
                            },
                            { timeout: 5000 },
                        )

                        return
                    }

                    if (
                        result.info.bytes &&
                        result.info.bytes > MAX_VIDEO_FILE_SIZE
                    ) {
                        toastQueue.add(
                            {
                                title: 'The video must not exceed 100 MB.',
                                variant: ToastColorVariant.enum.error,
                            },
                            { timeout: 5000 },
                        )

                        return
                    }

                    setVideoUrl(result.info.secure_url)
                    setVideoId(result.info.public_id)
                }}
                onClose={() => {
                    setIsUploadWidgetOpen(false)
                }}
                onError={(error) => {
                    toastQueue.add(
                        {
                            title: error?.toString() ?? 'Video upload failed',
                            variant: ToastColorVariant.enum.error,
                        },
                        { timeout: 5000 },
                    )
                }}
            >
                {({ open, error, isLoading: isWidgetLoading }) => {
                    uploadWidgetOpenRef.current =
                        !isWidgetLoading && !error && isUploadWidgetOpen
                            ? open
                            : null

                    return null
                }}
            </CldUploadWidget>
        </div>
    )
}

export default HomeVideos
