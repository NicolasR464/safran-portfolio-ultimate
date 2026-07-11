import { localLogos } from '@/utils/constants'
import Image from 'next/image'

const FormSeparator = ({ title }: { title: string }) => {
    return (
        <div className='flex justify-center m-4'>
            <span>
                <Image
                    className='invert'
                    src={localLogos.reel.SRC}
                    alt={localLogos.reel.ALT}
                    width={25}
                    height={25}
                />
            </span>

            <h2 className='mx-2 text-white text-xl font-mono'>{title}</h2>

            <span>
                <Image
                    className='invert scale-x-[-1]'
                    src={localLogos.reel.SRC}
                    alt={localLogos.reel.ALT}
                    width={25}
                    height={25}
                />
            </span>
        </div>
    )
}

export default FormSeparator
