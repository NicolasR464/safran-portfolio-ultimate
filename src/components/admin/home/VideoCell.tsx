'use client'

import { useMemo, useState } from 'react'
import { Copy, Save, Trash } from 'lucide-react'

import ButtonGeneric from '@/components/buttons/ButtonGeneric'
import { Checkbox } from '@/components/Checkbox'
import { queue as toastQueue } from '@/components/Toast'
import { useHomeVideosStore } from '@/stores/admin/videosHome'

import { ToastColorVariant as ToastVariant } from '@/types/ui/toast'
import { ScreenType } from '@/types/video/schema'
import type {
    VideoHomeResponse,
    VideosHomeListResponse,
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
    const isLoading = useHomeVideosStore((state) => state.isLoading)

    const [screenTypes, setScreenTypes] = useState<ScreenType[]>(
        video.screenTypes,
    )

    const screenTypesUsedByOtherVideos = useMemo(
        () =>
            new Set(
                videos
                    .filter((currentVideo) => currentVideo._id !== video._id)
                    .flatMap((currentVideo) => currentVideo.screenTypes),
            ),
        [video._id, videos],
    )

    const hasChanges =
        screenTypes.length !== video.screenTypes.length ||
        screenTypes.some(
            (screenType) => !video.screenTypes.includes(screenType),
        )

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
    }

    const handleDelete = async () => {
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
        await navigator.clipboard.writeText(video.videoUrl)

        toastQueue.add(
            {
                title: 'Video URL copied',
                variant: ToastVariant.enum.success,
            },
            { timeout: 3000 },
        )
    }

    return (
        <article className='flex min-w-0 flex-col gap-4 rounded-2xl border border-neutral-700 p-4'>
            <video
                src={video.videoUrl}
                controls
                preload='metadata'
                className='aspect-video max-h-48 w-full rounded-xl bg-black object-contain'
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
                    aria-label='Copy video URL'
                    onPress={() => {
                        void handleCopy()
                    }}
                >
                    <Copy size={16} />
                </ButtonGeneric>
            </div>

            <fieldset className='flex min-w-0 flex-col gap-3'>
                <legend className='text-sm font-medium'>Screen types</legend>

                {screenTypeOptions.map((option) => {
                    const isUsedByAnotherVideo =
                        screenTypesUsedByOtherVideos.has(option.value)

                    return (
                        <Checkbox
                            key={option.value}
                            isSelected={screenTypes.includes(option.value)}
                            isDisabled={isUsedByAnotherVideo}
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
                    className='flex items-center gap-2'
                    isDisabled={
                        isLoading || !hasChanges || screenTypes.length === 0
                    }
                    onPress={() => {
                        void handleUpdate()
                    }}
                >
                    <Save size={17} />

                    {isLoading ? 'Updating' : 'Update'}
                </ButtonGeneric>

                <ButtonGeneric
                    type='button'
                    className='flex items-center gap-2'
                    isDisabled={isLoading}
                    onPress={() => {
                        void handleDelete()
                    }}
                >
                    <Trash size={17} />
                    Delete
                </ButtonGeneric>
            </div>
        </article>
    )
}

export default VideoCell
