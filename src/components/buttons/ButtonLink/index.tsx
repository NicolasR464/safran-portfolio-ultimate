'use client'

import Link from 'next/link'
import { Button as ReactAriaButton } from 'react-aria-components'
import { ComponentType } from 'react'

type ButtonProperties = {
    name?: string
    href: string
    logo?: ComponentType<{ className?: string }>
}

const ButtonLink = ({ name, href, logo: Logo }: ButtonProperties) => {
    return (
        <Link href={href}>
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
                {Logo && <Logo className="h-7 w-7 text-white" />}

                {name && (
                    <span
                        className={`
                    font-poiret 
                    text-xl 
                    font-semibold
                    text-white

                    transition-all 
                    duration-700
                `}
                    >
                        {name}
                    </span>
                )}
            </ReactAriaButton>
        </Link>
    )
}

export default ButtonLink
