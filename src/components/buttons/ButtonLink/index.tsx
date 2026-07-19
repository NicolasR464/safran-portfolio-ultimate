'use client'

import Link from 'next/link'
import { ReactNode } from 'react'

import ButtonGeneric from '@/components/buttons/ButtonGeneric'

type ButtonProperties = {
    text?: string
    href: string
    logo?: ReactNode
    font?: string
    smallText?: boolean
    target?: '_blank' | '_self' | '_parent' | '_top'
}

const ButtonLink = ({
    text,
    href,
    font,
    smallText,
    logo: Logo,
    target = '_self',
}: ButtonProperties) => {
    return (
        <Link
            href={href}
            target={target}
        >
            <ButtonGeneric
                smallText={smallText}
                font={font}
            >
                {Logo && Logo}

                {text && <span className={Logo ? 'ml-2' : ''}> {text}</span>}
            </ButtonGeneric>
        </Link>
    )
}

export default ButtonLink
