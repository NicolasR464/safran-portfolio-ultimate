'use client'

import Link from 'next/link'
import { ReactNode } from 'react'
import ButtonGeneric from '../ButtonGeneric'

type ButtonProperties = {
    text?: string
    href: string
    logo?: ReactNode
    target?: '_blank' | '_self' | '_parent' | '_top'
}

const ButtonLink = ({
    text,
    href,
    logo: Logo,
    target = '_self',
}: ButtonProperties) => {
    return (
        <Link href={href} target={target}>
            <ButtonGeneric>
                {Logo && Logo}

                {text && text}
            </ButtonGeneric>
        </Link>
    )
}

export default ButtonLink
