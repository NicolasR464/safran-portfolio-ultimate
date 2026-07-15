import {
    FieldError as RACFieldError,
    FieldErrorProps,
    Label as RACLabel,
    LabelProps,
    Text,
    TextProps,
    composeRenderProps,
} from 'react-aria-components'
import { twMerge } from 'tailwind-merge'
import { Group, type GroupProps } from 'react-aria-components/Group'

import { composeTailwindRenderProps, focusRing } from '@/utils/ui'
import { tv } from 'tailwind-variants'

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

export const fieldBorderStyles = tv({
    base: 'transition',
    variants: {
        isFocusWithin: {
            false: 'border-neutral-300 hover:border-neutral-400 dark:border-neutral-600 dark:hover:border-neutral-500 forced-colors:border-[ButtonBorder]',
            true: 'border-neutral-600 dark:border-neutral-300 forced-colors:border-[Highlight]',
        },
        isInvalid: {
            true: 'border-red-600 dark:border-red-600 forced-colors:border-[Mark]',
        },
        isDisabled: {
            true: 'border-neutral-200 dark:border-neutral-700 forced-colors:border-[GrayText]',
        },
    },
})

const fieldGroupStyles = tv({
    extend: focusRing,
    base: 'group flex items-center h-9 box-border bg-white dark:bg-neutral-900 forced-colors:bg-[Field] border rounded-lg overflow-hidden transition',
    variants: fieldBorderStyles.variants,
})

export const FieldGroup = (props: GroupProps) => {
    return (
        <Group
            {...props}
            className={composeRenderProps(
                props.className,
                (className, renderProps) =>
                    fieldGroupStyles({ ...renderProps, className }),
            )}
        />
    )
}
