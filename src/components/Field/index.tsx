import {
    FieldError as RACFieldError,
    FieldErrorProps,
    Label as RACLabel,
    LabelProps,
    Text,
    TextProps,
} from 'react-aria-components'
import { twMerge } from 'tailwind-merge'

import { composeTailwindRenderProps } from '@/utils/ui'

export const Label = (props: LabelProps) => {
    return (
        <RACLabel
            {...props}
            className={twMerge(
                'font-sans text-sm text-neutral-600 dark:text-neutral-300 font-medium cursor-default w-fit',
                props.className,
            )}
        />
    )
}

export const Description = (props: TextProps) => {
    return (
        <Text
            {...props}
            slot='description'
            className={twMerge('text-sm text-neutral-600', props.className)}
        />
    )
}

export const FieldError = (props: FieldErrorProps) => {
    return (
        <RACFieldError
            {...props}
            className={composeTailwindRenderProps(
                props.className,
                'text-sm text-red-600 forced-colors:text-[Mark]',
            )}
        />
    )
}
