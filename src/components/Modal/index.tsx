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

const modalStyles = tv({
    base: 'font-sans text-left align-middle text-neutral-700 shadow-2xl outline-none dark:text-neutral-300',
    variants: {
        size: {
            default:
                'w-full max-w-[min(90vw,450px)] max-h-[calc(var(--visual-viewport-height)*.9)] rounded-2xl bg-white bg-clip-padding border border-black/10 dark:border-white/10 dark:bg-neutral-800/70 dark:backdrop-blur-2xl dark:backdrop-saturate-200 forced-colors:bg-[Canvas]',
            gallery:
                'relative w-[95vw] sm:w-[min(66.666vw,calc(66.666dvh*16/9))] max-w-none max-h-none border-0 bg-transparent shadow-none',
        },
        isEntering: {
            true: 'animate-in zoom-in-105 ease-out duration-200',
        },
        isExiting: {
            true: 'animate-out zoom-out-95 ease-in duration-200',
        },
    },
    defaultVariants: {
        size: 'default',
    },
})

type ModalProps = ModalOverlayProps & VariantProps<typeof modalStyles>

const Modal = ({ size, ...props }: ModalProps) => {
    return (
        <ModalOverlay
            {...props}
            className={overlayStyles}
        >
            <RACModal
                {...props}
                className={modalStyles({ size })}
            />
        </ModalOverlay>
    )
}

export default Modal
