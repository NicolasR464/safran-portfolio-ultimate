'use client'

import {
    ModalOverlay,
    type ModalOverlayProps,
    Modal as RACModal,
} from 'react-aria-components'
import { tv, type VariantProps } from 'tailwind-variants'

const overlayStyles = tv({
    base: 'fixed inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-lg',
    variants: {
        isEntering: {
            true: 'animate-in fade-in duration-200 ease-out',
        },
        isExiting: {
            true: 'animate-out fade-out duration-200 ease-in',
        },
    },
})

const modalBase =
    'rounded-2xl bg-neutral-800/70 bg-clip-padding border border-white/10 backdrop-blur-2xl backdrop-saturate-200 forced-colors:bg-[Canvas]'

const modalStyles = tv({
    base: 'relative font-sans text-left align-middle text-neutral-300 shadow-2xl outline-none',
    variants: {
        size: {
            default: `max-w-[90vw] ${modalBase}`,
            sm: `w-[350px] max-w-[90vw] ${modalBase}`,
            md: `w-[550px] max-w-[90vw] ${modalBase}`,
            lg: `w-[750px] max-w-[90vw] ${modalBase}`,
            gallery:
                'relative w-[95vw] sm:w-[min(66.666vw,_calc(66.666dvh*16/9))] max-w-none max-h-none border-0 bg-transparent shadow-none',
        },
    },
    defaultVariants: {
        size: 'default',
    },
})

type ModalProps = ModalOverlayProps &
    VariantProps<typeof modalStyles> & {
        children: React.ReactNode
    }

const Modal = ({
    size,
    isDismissable = true,
    children,
    ...props
}: ModalProps) => {
    return (
        <ModalOverlay
            {...props}
            isDismissable={isDismissable}
            shouldCloseOnInteractOutside={(element) => {
                return !element.closest('.mdxeditor-popup-container')
            }}
            className={overlayStyles}
        >
            <RACModal className={modalStyles({ size })}>{children}</RACModal>
        </ModalOverlay>
    )
}

export default Modal
