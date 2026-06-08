'use client'

import { DialogTrigger, type DialogTriggerProps } from 'react-aria-components'

type AppDialogTriggerProps = Omit<DialogTriggerProps, 'children'> & {
    trigger?: React.ReactNode
    children: React.ReactNode
}

const ModalTrigger = ({
    trigger,
    children,
    ...props
}: AppDialogTriggerProps) => {
    return (
        <DialogTrigger {...props}>
            {trigger ?? <span />}

            {children}
        </DialogTrigger>
    )
}

export default ModalTrigger
