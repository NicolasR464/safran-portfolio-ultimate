'use client'

import Link from 'next/link'
import { Button as ReactAriaButton } from 'react-aria-components'
import Image from 'next/image'
import { localLogos } from '@/utils/constants'
import { urls } from '@/utils/constants/urls'

const ButtonIG = () => {
    return (
        <Link href={urls.INSTAGRAM} target="blank">
            <ReactAriaButton
                className={`
                cursor-pointer
                m-2 px-5 py-2.5
                rounded-full
            
                border 
                backdrop-blur-sm
                transition-all duration-700

                hover:-translate-y-[1px]
                hover:brightness-110
            `}
            >
                <Image
                    src={localLogos.instagramLogo.SRC}
                    height={30}
                    width={30}
                    alt={localLogos.instagramLogo.ALT}
                />
            </ReactAriaButton>
        </Link>
    )
}

export default ButtonIG
