import { CldUploadWidget } from 'next-cloudinary'

const CloudinaryUpload = ({
    onReady,
}: {
    onReady: (open: () => void) => void
}) => {
    return (
        <CldUploadWidget uploadPreset='your_unsigned_upload_preset'>
            {({ open }) => {
                cloudinaryOpenRef.current = open

                return null
            }}
        </CldUploadWidget>
    )
}

export default CloudinaryUpload
