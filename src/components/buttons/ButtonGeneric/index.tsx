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
    onPress?: () => void
}

const ButtonGeneric = ({
    children,
    className = '',
    onPress,
    isDisabled = false,
    ...props
}: ButtonGenericProps) => {
    return (
        <ReactAriaButton
            {...props}
            onPress={onPress}
            className={`${className}     
                cursor-pointer
                m-2
                px-8
                sm:px-5 
                py-2
                rounded-full
            
                border-[1.8px]
                border-white/20
                
                backdrop-blur-sm
                transition-all duration-700

                hover:-translate-y-[1px]
                hover:brightness-110
                
                text-white
                font-poiret text-xl font-semibold
                `}
            isDisabled={isDisabled}
        >
            {children}
        </ReactAriaButton>
    )
}

export default ButtonGeneric
