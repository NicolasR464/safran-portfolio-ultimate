'use client'

import { useState } from 'react'
import { Button, DialogTriggerProps } from 'react-aria-components'
import Image from 'next/image'

import ImagesCarousel from '@/components/ImagesCarousel'

import Modal from '@/components/Modal'
import { ImageMetadata } from '@/types/project'
import ModalTrigger from '@/components/Modal/ModalTrigger'

interface ModalGalleryProps extends Omit<DialogTriggerProps, 'children'> {
    images: ImageMetadata[]
}

const ModalContainerImages = ({ images }: ModalGalleryProps) => {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

    return (
        <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4'>
            {images.map((image, index) => (
                <Button
                    key={`${image.imageId}-${index}`}
                    onPress={() => setSelectedIndex(index)}
                    className='relative aspect-video overflow-hidden rounded-lg cursor-pointer'
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
                <ModalTrigger
                    isOpen
                    onOpenChange={(open) => {
                        if (!open) setSelectedIndex(null)
                    }}
                >
                    <Modal size='gallery'>
                        <ImagesCarousel
                            imagesCarousel={images}
                            initialImageIndex={selectedIndex}
                        />
                    </Modal>
                </ModalTrigger>
            )}
        </div>
    )
}

export default ModalContainerImages
