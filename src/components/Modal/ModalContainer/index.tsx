'use client'

import { useState } from 'react'
import {
    Button,
    DialogTrigger,
    DialogTriggerProps,
} from 'react-aria-components'
import Image from 'next/image'

import ImagesCarousel from '@/components/ImagesCarousel'
import Dialog from '@/components/Modal/Dialog'
import Modal from '@/components/Modal'
import { ImageMetadata } from '@/types/project'

interface ModalGalleryProps extends Omit<DialogTriggerProps, 'children'> {
    images: ImageMetadata[]
}

const ModalContainer = ({ images }: ModalGalleryProps) => {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

    return (
        <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4'>
            {images.map((image, index) => (
                <Button
                    key={`${image.imageId}-${index}`}
                    onPress={() => setSelectedIndex(index)}
                    className='relative aspect-square overflow-hidden rounded-lg'
                >
                    <Image
                        src={image.url}
                        alt={image.imageId}
                        fill
                        className='object-cover'
                    />
                </Button>
            ))}

            {selectedIndex !== null && (
                <DialogTrigger
                    isOpen
                    onOpenChange={(open) => {
                        if (!open) setSelectedIndex(null)
                    }}
                >
                    {/* dummy trigger required by API */}
                    <span />

                    <Modal
                        isDismissable
                        size='gallery'
                    >
                        <Dialog className='flex h-full w-full items-center justify-center p-0 outline-none'>
                            <ImagesCarousel
                                imagesCarousel={images}
                                initialImageIndex={selectedIndex}
                            />
                        </Dialog>
                    </Modal>
                </DialogTrigger>
            )}
        </div>
    )
}

export default ModalContainer
