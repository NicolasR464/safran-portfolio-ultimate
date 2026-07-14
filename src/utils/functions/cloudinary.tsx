// oxlint-disable no-console
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
            console.error('Cloudinary cleanup failed:', error)
            console.error('Image IDs:', [...imageIds])
        })
}
