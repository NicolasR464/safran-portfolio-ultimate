'use client'

import { Button as ReactAriaButton } from 'react-aria-components'
import { Mail } from 'lucide-react'

const handleClick = () => {
    window.location.href = `mailto:${process.env.NEXT_PUBLIC_MAIL_ADDRESS}`
}

const ButtonMail = () => {
    return (
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
            onClick={handleClick}
        >
            <Mail className="h-7 w-7 text-white" />
        </ReactAriaButton>
    )
}

export default ButtonMail
