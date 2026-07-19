'use server'

import cloudinary from 'cloudinary'

cloudinary.v2.config({
    secure: true,
})

export const cloudinaryImagesDelete = async (
    imageIds: Set<string>,
): Promise<void> => {
    if (imageIds.size === 0) {
        return
    }

    await cloudinary.v2.api
        .delete_resources([...imageIds], {
            resource_type: 'image',
        })
        .catch((error) => {
            // oxlint-disable-next-line no-console
            console.error('Cloudinary cleanup failed:', error)
            // oxlint-disable-next-line no-console
            console.error('Image IDs:', [...imageIds])
        })
}

export const cloudinaryVideoDelete = async (videoId: string): Promise<void> => {
    if (!videoId) {
        throw new Error('Missing Cloudinary video ID')
    }

    const result = await cloudinary.v2.uploader.destroy(videoId, {
        resource_type: 'video',
        invalidate: true,
    })

    if (result.result !== 'ok' && result.result !== 'not found') {
        throw new Error(`Cloudinary deletion failed: ${result.result}`)
    }
}
