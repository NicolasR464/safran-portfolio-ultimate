'use server'

import cloudinary from 'cloudinary'

cloudinary.v2.config({
    secure: true,
})

export const cloudinaryImagesDelete = async (imageIds: Set<string>) => {
    cloudinary.v2.api
        .delete_resources(Array.from(imageIds), {
            resource_type: 'image',
        })
        // oxlint-disable-next-line no-console
        .catch((error) => console.error(error))
}
