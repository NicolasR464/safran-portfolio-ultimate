import {
    FieldError as RACFieldError,
    type FieldErrorProps,
    Label as RACLabel,
    type LabelProps,
    Text,
    type TextProps,
    composeRenderProps,
} from 'react-aria-components'
import { Group, type GroupProps } from 'react-aria-components/Group'
import { twMerge } from 'tailwind-merge'
import { tv } from 'tailwind-variants'

import { composeTailwindRenderProps, focusRing } from '@/utils/ui'

export const Label = (props: LabelProps) => {
    return (
        <RACLabel
            {...props}
            className={twMerge(
                'font-sans text-sm text-neutral-300 font-medium cursor-default w-fit',
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
            false: 'border-neutral-600 hover:border-neutral-500 forced-colors:border-[ButtonBorder]',
            true: 'border-neutral-300 forced-colors:border-[Highlight]',
        },
        isInvalid: {
            true: 'border-red-600 forced-colors:border-[Mark]',
        },
        isDisabled: {
            true: 'border-neutral-700 forced-colors:border-[GrayText]',
        },
    },
})

const fieldGroupStyles = tv({
    extend: focusRing,
    base: 'group flex items-center h-9 box-border bg-neutral-900 forced-colors:bg-[Field] border rounded-lg overflow-hidden transition',
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
