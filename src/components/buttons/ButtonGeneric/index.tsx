'use client'

import { ReactNode } from 'react'
import {
    Button as ReactAriaButton,
    ButtonProps as ReactAriaButtonProps,
} from 'react-aria-components'

type ButtonGenericProps = ReactAriaButtonProps & {
    children: ReactNode
    className?: string
    isDisabled?: boolean
    font?: string
    smallText?: boolean
    onPress?: () => void
}

const ButtonGeneric = ({
    children,
    className = '',
    onPress,
    font = 'poiret',
    smallText = false,
    isDisabled = false,
    ...props
}: ButtonGenericProps) => {
    return (
        <ReactAriaButton
            {...props}
            onPress={onPress}
            className={`     
                cursor-pointer
                m-1
                sm:m-2
                px-2
                sm:px-4

                py-2
                rounded-full
            
                border-[1.8px]
                border-white/20
                
                backdrop-blur-sm
                transition-all duration-700

                hover:-translate-y-[1px]
                hover:brightness-110
                
                text-white

                font-${font}
                font-mono  
                font-semibold  
                ${smallText ? 'text-l' : 'text-xl'}
                flex
                justify-center items-center

                ${className}
            `}
            isDisabled={isDisabled}
        >
            {children}
        </ReactAriaButton>
    )
}

export default ButtonGeneric
