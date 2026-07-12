'use client'

import { Key, useMemo, useState } from 'react'
import { CldImage } from 'next-cloudinary'
import { Trash2, X } from 'lucide-react'

import { Tag, TagGroup } from '@/components/admin/TagGroup'
import { ImageCategory, ImageMetadata } from '@/types/project'
import { cloudinaryImagesDelete } from '@/utils/functions'

type ProjectImagesGridProps = {
    images: ImageMetadata[]
    onImagesChange: (images: ImageMetadata[]) => void
}

type Category = ImageMetadata['types'][number]

const categoryColors: Record<Category, string> = {
    background: '#f97316',
    carousel: '#6366f1',
    poster: '#22c55e',
    thumbnail: '#06b6d4',
}

const categories: Array<{
    id: Category
    color: 'orange' | 'indigo' | 'green' | 'cyan'
}> = [
    {
        id: ImageCategory.enum.thumbnail,
        color: 'cyan',
    },
    {
        id: ImageCategory.enum.poster,
        color: 'green',
    },
    {
        id: ImageCategory.enum.background,
        color: 'orange',
    },
    {
        id: ImageCategory.enum.carousel,
        color: 'indigo',
    },
]

const getBorderBackground = (types: Category[]) => {
    if (types.length === 0) {
        return 'rgb(255 255 255 / 0.2)'
    }

    if (types.length === 1) {
        return categoryColors[types[0]]
    }

    const segmentSize = 100 / types.length

    const segments = types.map((type, index) => {
        const start = index * segmentSize
        const end = (index + 1) * segmentSize

        return `${categoryColors[type]} ${start}% ${end}%`
    })

    return `conic-gradient(from -90deg, ${segments.join(', ')})`
}

const ProjectImagesGrid = ({
    images,
    onImagesChange,
}: ProjectImagesGridProps) => {
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(
        null,
    )

    const [isDeleteMode, setIsDeleteMode] = useState(false)

    const [selectedForDelete, setSelectedForDelete] = useState<Set<string>>(
        () => new Set(),
    )

    const selectedKeys = useMemo(
        () =>
            selectedCategory
                ? new Set<Key>([selectedCategory])
                : new Set<Key>(),
        [selectedCategory],
    )

    const handleSelectionChange = (keys: 'all' | Set<Key>) => {
        if (keys === 'all' || isDeleteMode) return

        const selected = Array.from(keys)[0]

        setSelectedCategory(selected ? (selected.toString() as Category) : null)
    }

    const toggleDeleteSelection = (imageId: string) => {
        setSelectedForDelete((current) => {
            const next = new Set(current)

            if (next.has(imageId)) {
                next.delete(imageId)
            } else {
                next.add(imageId)
            }

            return next
        })
    }

    const handleImageClick = (imageId: string) => {
        if (isDeleteMode) {
            toggleDeleteSelection(imageId)
            return
        }

        if (!selectedCategory) return

        const updatedImages = images.map((image) => {
            if (image.imageId !== imageId) {
                return image
            }

            const currentTypes = image.types ?? []
            const alreadyAssigned = currentTypes.includes(selectedCategory)

            return {
                ...image,
                types: alreadyAssigned
                    ? currentTypes.filter((type) => type !== selectedCategory)
                    : [...currentTypes, selectedCategory],
            }
        })

        onImagesChange(updatedImages)
    }

    const handleDeleteClick = async () => {
        if (!isDeleteMode) {
            setIsDeleteMode(true)
            setSelectedCategory(null)
            return
        }

        if (selectedForDelete.size === 0) {
            setIsDeleteMode(false)
            return
        }

        // Delete images on Cloudinary
        await cloudinaryImagesDelete(selectedForDelete)

        onImagesChange(
            images.filter((image) => !selectedForDelete.has(image.imageId)),
        )

        setSelectedForDelete(new Set())
        setIsDeleteMode(false)
    }

    const cancelDelete = () => {
        setSelectedForDelete(new Set())
        setIsDeleteMode(false)
    }

    return (
        <div>
            <div className='relative flex flex-col justify-center'>
                <TagGroup
                    label='Categories'
                    selectionMode='single'
                    selectedKeys={selectedKeys}
                    onSelectionChange={handleSelectionChange}
                    className='m-4'
                >
                    {categories.map((category) => (
                        <Tag
                            key={category.id}
                            id={category.id}
                            color={category.color}
                            isDisabled={isDeleteMode}
                            className='cursor-pointer'
                        >
                            {category.id}
                        </Tag>
                    ))}
                </TagGroup>

                <div className='mb-3 flex items-center justify-center gap-2'>
                    {isDeleteMode && selectedForDelete.size > 0 && (
                        <button
                            type='button'
                            onClick={cancelDelete}
                            className='cursor-pointer flex items-center gap-1 rounded-md border border-neutral-600 px-3 py-1.5 text-xs text-neutral-300 transition hover:border-neutral-400 hover:text-white'
                        >
                            <X className='size-4' />
                            Cancel delete
                        </button>
                    )}

                    <button
                        type='button'
                        onClick={handleDeleteClick}
                        aria-pressed={isDeleteMode}
                        className={[
                            'cursor-pointer flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs transition',
                            isDeleteMode
                                ? 'border-red-500 bg-red-500/20 text-red-300'
                                : 'border-neutral-600 text-neutral-300 hover:border-red-500 hover:text-red-400',
                        ].join(' ')}
                    >
                        <Trash2 className='size-4' />

                        {isDeleteMode && selectedForDelete.size > 0
                            ? `Delete ${selectedForDelete.size}`
                            : 'Delete'}
                    </button>
                </div>

                <p
                    className={[
                        'mb-3 text-center text-xs',
                        isDeleteMode ? 'text-red-300' : 'text-neutral-400',
                        selectedCategory && !isDeleteMode ? 'opacity-0' : '',
                    ].join(' ')}
                >
                    {isDeleteMode
                        ? 'ℹ️ Select images to delete, then click Delete again.'
                        : 'ℹ️ Select a category, then click an image.'}
                </p>
            </div>

            <div className='grid max-h-80 grid-cols-2 gap-3 overflow-y-auto pr-1'>
                {images.map((image) => {
                    const types = image.types ?? []
                    const isSelectedForDelete = selectedForDelete.has(
                        image.imageId,
                    )

                    return (
                        <button
                            key={image.imageId}
                            type='button'
                            onClick={() => handleImageClick(image.imageId)}
                            aria-pressed={
                                isDeleteMode ? isSelectedForDelete : undefined
                            }
                            aria-label={
                                isDeleteMode
                                    ? `${isSelectedForDelete ? 'Unselect' : 'Select'} image for deletion`
                                    : `Assign ${selectedCategory ?? 'a category'} to image`
                            }
                            className={[
                                'relative aspect-[4/3] rounded-lg p-[3px]',
                                'transition-transform',
                                isDeleteMode || selectedCategory
                                    ? 'cursor-pointer hover:scale-[1.02]'
                                    : 'cursor-default',
                                isSelectedForDelete
                                    ? 'shadow-[0_0_14px_rgb(239_68_68/0.55)]'
                                    : '',
                            ].join(' ')}
                            style={{
                                background: isSelectedForDelete
                                    ? '#ef4444'
                                    : getBorderBackground(types),
                            }}
                        >
                            <span className='relative block h-full w-full overflow-hidden rounded-[5px] bg-neutral-950'>
                                <CldImage
                                    src={image.imageId}
                                    alt=''
                                    fill
                                    crop='fit'
                                    format='auto'
                                    quality='auto'
                                    sizes='240px'
                                    className={[
                                        'object-contain transition-opacity',
                                        isSelectedForDelete ? 'opacity-60' : '',
                                    ].join(' ')}
                                />
                            </span>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

export default ProjectImagesGrid
