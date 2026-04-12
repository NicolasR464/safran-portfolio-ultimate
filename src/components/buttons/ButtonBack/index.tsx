'use client'

import { StepBack } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button as ReactAriaButton } from 'react-aria-components'

const ButtonBack = () => {
    const router = useRouter()

    return (
        <ReactAriaButton
            onPress={() => router.back()}
            className="fixed top-(--header-height) z-40 cursor-pointer mx-4 my-2 px-3 py-2 rounded-full border border-white/30 bg-white/[0.05] backdrop-blur-sm transition-all duration-700 hover:-translate-y-[1px] hover:brightness-110 flex items-center"
        >
            <StepBack className="h-5 w-5 text-white opacity-70" />

            <span className="font-mono font-bold opacity-70 transition-all duration-700 flex ml-1">
                Back
            </span>
        </ReactAriaButton>
    )
}

export default ButtonBack
