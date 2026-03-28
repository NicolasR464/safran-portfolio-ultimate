'use client'

import { Button as ReactAriaButton } from 'react-aria-components'
import { useRouter } from 'next/navigation'
import { StepBack } from 'lucide-react'

const BackButton = () => {
    const router = useRouter()

    return (
        <ReactAriaButton
            onPress={() => router.back()}
            className={`
                absolute left-4 top-(--header-height) z-20
                cursor-pointer
                m-2 px-5 py-2.5
                rounded-full

                border border-white/30
                bg-white/[0.05]
                backdrop-blur-sm
                transition-all duration-700

                hover:-translate-y-[1px]
                hover:brightness-110

                flex
            `}
        >
            <StepBack />

            <span
                className={`
                    font-mono
                    font-bold
                    opacity-60
                    transition-all duration-700
                    flex
                    ml-1
                `}
            >
                Back
            </span>
        </ReactAriaButton>
    )
}

export default BackButton
