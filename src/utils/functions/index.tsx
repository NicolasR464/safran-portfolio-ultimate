'use server'

import cloudinary from 'cloudinary'

cloudinary.v2.config({
    secure: true,
})

console.log(cloudinary.v2.config())

export const cloudinaryImagesDelete = async (imageIds: Set<string>) => {
    cloudinary.v2.api
        .delete_resources(Array.from(imageIds), {
            resource_type: 'image',
        })
        .then((result) => console.log(result))
}
