'use client'

import { useEffect, useMemo, useState } from 'react'
import {
    Copy,
    Dot,
    Laptop,
    Save,
    Smartphone,
    Tablet,
    Trash,
} from 'lucide-react'

import ButtonGeneric from '@/components/buttons/ButtonGeneric'
import { Checkbox } from '@/components/Checkbox'
import { queue as toastQueue } from '@/components/Toast'
import { useHomeVideosStore } from '@/stores/admin/videosHome'
import { ToastColorVariant as ToastVariant } from '@/types/ui/toast'
import {
    ScreenTypeSchema,
    type ScreenType,
    type VideoHomeResponse,
    type VideosHomeListResponse,
} from '@/types/video/schema'

type VideoCellProps = {
    video: VideoHomeResponse
    videos: VideosHomeListResponse
}

const screenTypeOptions: Array<{
    value: ScreenType
    label: string
}> = [
    {
        value: 'phone',
        label: 'Phone',
    },
    {
        value: 'tablet',
        label: 'Tablet',
    },
    {
        value: 'computer',
        label: 'Computer',
    },
]

const VideoCell = ({ video, videos }: VideoCellProps) => {
    const updateVideo = useHomeVideosStore((state) => state.updateVideo)
    const deleteVideo = useHomeVideosStore((state) => state.deleteVideo)

    const isUpdating = useHomeVideosStore((state) =>
        state.updatingVideoIds.includes(video._id),
    )

    const isDeleting = useHomeVideosStore((state) =>
        state.deletingVideoIds.includes(video._id),
    )

    const [screenTypes, setScreenTypes] = useState<ScreenType[]>(
        video.screenTypes,
    )

    /*
     * Keep the local form synchronized when this video is updated
     * externally or replaced in the Zustand store.
     */
    useEffect(() => {
        setScreenTypes(video.screenTypes)
    }, [video.screenTypes])

    const screenTypesUsedByOtherVideos = useMemo(
        () =>
            new Set(
                videos
                    .filter((currentVideo) => currentVideo._id !== video._id)
                    .flatMap((currentVideo) => currentVideo.screenTypes),
            ),
        [video._id, videos],
    )

    const hasChanges = useMemo(() => {
        if (screenTypes.length !== video.screenTypes.length) {
            return true
        }

        return screenTypes.some(
            (screenType) => !video.screenTypes.includes(screenType),
        )
    }, [screenTypes, video.screenTypes])

    const isProcessing = isUpdating || isDeleting

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

    const handleUpdate = async () => {
        if (isProcessing || !hasChanges) {
            return
        }

        if (screenTypes.length === 0) {
            toastQueue.add(
                {
                    title: 'Select at least one screen type.',
                    variant: ToastVariant.enum.error,
                },
                { timeout: 5000 },
            )

            return
        }

        const unavailableScreenTypes = screenTypes.filter((screenType) =>
            screenTypesUsedByOtherVideos.has(screenType),
        )

        if (unavailableScreenTypes.length > 0) {
            toastQueue.add(
                {
                    title: `Already assigned: ${unavailableScreenTypes.join(
                        ', ',
                    )}`,
                    variant: ToastVariant.enum.error,
                },
                { timeout: 5000 },
            )

            return
        }

        const result = await updateVideo({
            _id: video._id,
            videoUrl: video.videoUrl,
            videoId: video.videoId,
            screenTypes,
        })

        toastQueue.add(
            {
                title: result.message,
                variant: result.success
                    ? ToastVariant.enum.success
                    : ToastVariant.enum.error,
            },
            { timeout: 5000 },
        )

        if (!result.success) {
            return
        }

        setScreenTypes(screenTypes)
    }

    const handleDelete = async () => {
        if (isProcessing) {
            return
        }

        const result = await deleteVideo({
            _id: video._id,
        })

        toastQueue.add(
            {
                title: result.message,
                variant: result.success
                    ? ToastVariant.enum.success
                    : ToastVariant.enum.error,
            },
            { timeout: 5000 },
        )
    }

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(video.videoUrl)

            toastQueue.add(
                {
                    title: 'Video URL copied',
                    variant: ToastVariant.enum.success,
                },
                { timeout: 3000 },
            )
        } catch {
            toastQueue.add(
                {
                    title: 'Could not copy the video URL.',
                    variant: ToastVariant.enum.error,
                },
                { timeout: 3000 },
            )
        }
    }

    return (
        <article className='flex min-w-0 flex-col gap-4 rounded-2xl border border-neutral-700 p-4'>
            <div className='flex w-full justify-center'>
                <Dot />

                {screenTypes.includes(ScreenTypeSchema.enum.phone) && (
                    <Smartphone />
                )}

                {screenTypes.includes(ScreenTypeSchema.enum.tablet) && (
                    <Tablet />
                )}

                {screenTypes.includes(ScreenTypeSchema.enum.computer) && (
                    <Laptop />
                )}

                <Dot />
            </div>

            <video
                src={video.videoUrl}
                controls
                preload='metadata'
                className='block h-auto max-h-96 w-full rounded-xl bg-black object-contain'
            />

            <div className='flex min-w-0 items-center gap-2'>
                <p
                    title={video.videoUrl}
                    className='min-w-0 flex-1 truncate text-xs text-neutral-400'
                >
                    {video.videoUrl}
                </p>

                <ButtonGeneric
                    type='button'
                    font='mono'
                    aria-label='Copy video URL'
                    onPress={() => {
                        void handleCopy()
                    }}
                    isDisabled={isProcessing}
                >
                    <Copy size={16} />
                </ButtonGeneric>
            </div>

            <fieldset
                className='flex min-w-0 flex-col gap-3'
                disabled={isProcessing}
            >
                <legend className='text-sm font-medium'>Screen types</legend>

                {screenTypeOptions.map((option) => {
                    const isUsedByAnotherVideo =
                        screenTypesUsedByOtherVideos.has(option.value)

                    return (
                        <Checkbox
                            key={option.value}
                            isSelected={screenTypes.includes(option.value)}
                            isDisabled={isProcessing || isUsedByAnotherVideo}
                            onChange={(isSelected) => {
                                handleScreenTypeChange(option.value, isSelected)
                            }}
                        >
                            <span className='flex flex-col'>
                                <span>{option.label}</span>

                                {isUsedByAnotherVideo && (
                                    <span className='text-xs text-neutral-500'>
                                        Assigned to another video
                                    </span>
                                )}
                            </span>
                        </Checkbox>
                    )
                })}
            </fieldset>

            <div className='flex flex-wrap gap-3'>
                <ButtonGeneric
                    type='button'
                    font='mono'
                    onPress={() => {
                        void handleUpdate()
                    }}
                    isDisabled={
                        isProcessing || !hasChanges || screenTypes.length === 0
                    }
                    className='flex items-center gap-2'
                >
                    <Save size={16} />

                    {isUpdating ? 'Updating...' : 'Update'}
                </ButtonGeneric>

                <ButtonGeneric
                    type='button'
                    font='mono'
                    onPress={() => {
                        void handleDelete()
                    }}
                    isDisabled={isProcessing}
                    className='flex items-center gap-2'
                >
                    <Trash size={16} />

                    {isDeleting ? 'Deleting...' : 'Delete'}
                </ButtonGeneric>
            </div>
        </article>
    )
}

export default VideoCell
