import { Check, Minus } from 'lucide-react'

import {
    Checkbox as AriaCheckbox,
    type CheckboxProps,
} from 'react-aria-components'
import { composeRenderProps } from 'react-aria-components'
import { tv } from 'tailwind-variants'
import { focusRing } from '@/utils/ui'

const checkboxStyles = tv({
    base: 'flex gap-2 items-center group font-sans text-sm transition relative [-webkit-tap-highlight-color:transparent]',
    variants: {
        isDisabled: {
            false: 'text-neutral-200',
            true: 'text-neutral-600 forced-colors:text-[GrayText]',
        },
    },
})

const boxStyles = tv({
    extend: focusRing,
    base: 'w-4.5 h-4.5 box-border shrink-0 rounded-sm flex items-center justify-center border transition',
    variants: {
        isSelected: {
            false: 'bg-neutral-900 border-(--color) [--color:var(--color-neutral-400)] group-pressed:[--color:var(--color-neutral-300)]',
            true: 'bg-(--color) border-(--color) [--color:var(--color-neutral-300)] group-pressed:[--color:var(--color-neutral-200)] forced-colors:[--color:Highlight]!',
        },
        isInvalid: {
            true: '[--color:var(--color-red-600)] forced-colors:[--color:Mark]! group-pressed:[--color:var(--color-red-700)]',
        },
        isDisabled: {
            true: '[--color:var(--color-neutral-700)] forced-colors:[--color:GrayText]!',
        },
    },
})

const iconStyles =
    'w-3.5 h-3.5 text-neutral-900 group-disabled:text-neutral-600 forced-colors:text-[HighlightText] pointer-events-none'

export const Checkbox = (props: CheckboxProps) => {
    return (
        <AriaCheckbox
            {...props}
            className={composeRenderProps(
                props.className,
                (className, renderProps) =>
                    checkboxStyles({ ...renderProps, className }),
            )}
        >
            {composeRenderProps(
                props.children,
                (children, { isSelected, isIndeterminate, ...renderProps }) => (
                    <>
                        <div
                            className={boxStyles({
                                isSelected: isSelected || isIndeterminate,
                                ...renderProps,
                            })}
                        >
                            {isIndeterminate ? (
                                <Minus
                                    aria-hidden
                                    className={iconStyles}
                                />
                            ) : isSelected ? (
                                <Check
                                    aria-hidden
                                    className={iconStyles}
                                />
                            ) : null}
                        </div>

                        {children}
                    </>
                ),
            )}
        </AriaCheckbox>
    )
}
