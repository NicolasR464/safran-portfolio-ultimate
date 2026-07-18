import { type ReactNode } from 'react'
import { composeRenderProps } from 'react-aria-components/composeRenderProps'
import {
    RadioButton,
    RadioField,
    RadioGroup as RACRadioGroup,
    type RadioFieldProps,
    type RadioGroupProps as RACRadioGroupProps,
    type ValidationResult,
} from 'react-aria-components'
import { tv } from 'tailwind-variants'

import { Description, FieldError, Label } from '@/components/Field'
import { composeTailwindRenderProps, focusRing } from '@/utils/ui'

export interface RadioGroupProps extends Omit<RACRadioGroupProps, 'children'> {
    label?: string
    children?: ReactNode
    description?: string
    errorMessage?: string | ((validation: ValidationResult) => string)
}

export const RadioGroup = ({
    label,
    children,
    description,
    errorMessage,
    ...props
}: RadioGroupProps) => {
    return (
        <RACRadioGroup
            {...props}
            className={composeTailwindRenderProps(
                props.className,
                'group flex flex-col gap-2 font-sans',
            )}
        >
            {label && <Label>{label}</Label>}

            <div className='flex gap-2 group-orientation-vertical:flex-col group-orientation-horizontal:gap-4'>
                {children}
            </div>

            {description && <Description>{description}</Description>}

            <FieldError>{errorMessage}</FieldError>
        </RACRadioGroup>
    )
}

const styles = tv({
    extend: focusRing,
    base: [
        'h-4.5 w-4.5 flex-shrink-0',
        'box-border rounded-full border',
        'bg-white transition-all',
        'dark:bg-neutral-900',
    ],
    variants: {
        isSelected: {
            false: [
                'border-neutral-400',
                'group-pressed:border-neutral-500',
                'dark:border-neutral-400',
                'dark:group-pressed:border-neutral-300',
            ],
            true: [
                'border-[calc(var(--spacing)*1.5)]',
                'border-neutral-700',
                'group-pressed:border-neutral-800',
                'dark:border-neutral-300',
                'dark:group-pressed:border-neutral-200',
                'forced-colors:border-[Highlight]!',
            ],
        },
        isInvalid: {
            true: [
                'border-red-700',
                'group-pressed:border-red-800',
                'dark:border-red-600',
                'dark:group-pressed:border-red-700',
                'forced-colors:border-[Mark]!',
            ],
        },
        isDisabled: {
            true: [
                'border-neutral-200',
                'dark:border-neutral-700',
                'forced-colors:border-[GrayText]!',
            ],
        },
    },
})

export interface RadioProps extends RadioFieldProps {
    description?: string
}

export const Radio = ({ description, children, ...props }: RadioProps) => {
    return (
        <RadioField
            {...props}
            className='group flex flex-col gap-1'
        >
            <RadioButton
                className={composeTailwindRenderProps(
                    props.className,
                    [
                        'group relative flex items-center gap-2',
                        'text-sm text-neutral-800 transition',
                        'disabled:text-neutral-300',
                        'dark:text-neutral-200',
                        'dark:disabled:text-neutral-600',
                        'forced-colors:disabled:text-[GrayText]',
                        '[-webkit-tap-highlight-color:transparent]',
                    ].join(' '),
                )}
            >
                {composeRenderProps(
                    children,
                    (renderedChildren, renderProps) => (
                        <>
                            <div className={styles(renderProps)} />
                            {renderedChildren}
                        </>
                    ),
                )}
            </RadioButton>

            {description && (
                <Description className='ms-6.5'>{description}</Description>
            )}
        </RadioField>
    )
}
