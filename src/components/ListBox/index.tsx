import { Check } from 'lucide-react'
import {
    composeRenderProps,
    ListBoxItem as AriaListBoxItem,
    ListBoxItemProps,
} from 'react-aria-components'
import { tv } from 'tailwind-variants'

import { keyToCategory } from '@/utils/constants'

const dropdownItemStyles = tv({
    base: `
        group flex items-center gap-4
        cursor-default select-none
        rounded-xl
        px-3 py-2
        text-sm text-white/80
        outline-none
        no-underline
        forced-color-adjust-none
        [-webkit-tap-highlight-color:transparent]
    `,
    variants: {
        isDisabled: {
            false: '',
            true: 'opacity-40',
        },
        isPressed: {
            true: '',
        },
        isFocused: {
            true: 'bg-white/10 text-white',
        },
        isOpen: {
            true: 'bg-white/10',
        },
    },
})

export const DropdownItem = (props: ListBoxItemProps) => {
    const textValue =
        props.textValue ||
        (typeof props.children === 'string' ? props.children : undefined)

    return (
        <AriaListBoxItem
            {...props}
            textValue={textValue}
            className={dropdownItemStyles}
        >
            {composeRenderProps(props.children, (_children, { isSelected }) => (
                <>
                    <span className='flex flex-1 items-center gap-2 truncate font-normal'>
                        {keyToCategory[textValue as keyof typeof keyToCategory]}
                    </span>
                    <span className='flex w-5 items-center justify-end'>
                        {isSelected && <Check className='h-4 w-4' />}
                    </span>
                </>
            ))}
        </AriaListBoxItem>
    )
}
