import { localLogos } from '@/utils/constants'
import Image from 'next/image'

export default function LoaderCinemaReel({ size = 50 }): React.ReactElement {
    return (
        <div className="flex justify-center p-4">
            <Image
                src={localLogos.loaderCinemaReel.SRC}
                alt={localLogos.loaderCinemaReel.ALT}
                width={size}
                height={size}
                className="animate-spin [animation-duration:3s]"
            />
        </div>
    )
}
