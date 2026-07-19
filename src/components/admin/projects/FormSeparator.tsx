import Image from 'next/image'
import { type ReactNode } from 'react'

import { localLogos } from '@/utils/constants'

type FormSeparatorProps = {
    title: string
    icon?: ReactNode
}

const FormSeparator = ({ title, icon }: FormSeparatorProps) => {
    const SeparatorIcon = ({ mirrored = false }: { mirrored?: boolean }) => {
        if (icon) {
            return (
                <span className={mirrored ? 'scale-x-[-1]' : undefined}>
                    {icon}
                </span>
            )
        }

        return (
            <Image
                className={`invert ${mirrored ? 'scale-x-[-1]' : ''}`}
                src={localLogos.reel.SRC}
                alt={localLogos.reel.ALT}
                width={25}
                height={25}
            />
        )
    }

    return (
        <div className='mt-6 flex justify-center'>
            <SeparatorIcon />

            <h2 className='mx-2 text-xl font-mono text-white'>{title}</h2>

            <SeparatorIcon mirrored />
        </div>
    )
}

export default FormSeparator
