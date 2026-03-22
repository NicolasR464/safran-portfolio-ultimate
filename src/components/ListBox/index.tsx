import { Check } from 'lucide-react'
import {
    ListBox as AriaListBox,
    ListBoxItem as AriaListBoxItem,
    ListBoxProps as AriaListBoxProps,
    Collection,
    Header,
    ListBoxItemProps,
    ListBoxSection,
    SectionProps,
    composeRenderProps,
} from 'react-aria-components'
import { tv } from 'tailwind-variants'
import { composeTailwindRenderProps, focusRing } from '@/utils/ui'
import { keyToCategory } from '@/utils/constants'

interface ListBoxProps<T> extends Omit<
    AriaListBoxProps<T>,
    'layout' | 'orientation'
> {}

export function ListBox<T extends object>({
    children,
    ...props
}: ListBoxProps<T>) {
    return (
        <AriaListBox
            {...props}
            className={composeTailwindRenderProps(
                props.className,
                `
                    w-[200px]
                    rounded-2xl
                    border border-white/30
                    bg-white/10
                    p-2
                    text-white
                    outline-none
                    backdrop-blur-md
                    shadow-[0_8px_30px_rgba(0,0,0,0.25)]
                `,
            )}
        >
            {children}
        </AriaListBox>
    )
}

export const itemStyles = tv({
    extend: focusRing,
    base: `
        group relative flex items-center gap-8
        cursor-default select-none
        rounded-xl px-3 py-2
        text-sm text-white/80
        forced-color-adjust-none
    `,
    variants: {
        isSelected: {
            false: '',
            true: `
                bg-white/10
                text-white
                outline-white
            `,
        },
        isDisabled: {
            true: 'opacity-40',
        },
    },
})

export function ListBoxItem(props: ListBoxItemProps) {
    const textValue =
        props.textValue ||
        (typeof props.children === 'string' ? props.children : undefined)

    return (
        <AriaListBoxItem
            {...props}
            textValue={textValue}
            className={itemStyles}
        >
            {composeRenderProps(props.children, (children) => (
                <>
                    {children}
                    <div className="absolute right-4 bottom-0 left-4 hidden h-px bg-white/10 [.group[data-selected]:has(+[data-selected])_&]:block" />
                </>
            ))}
        </AriaListBoxItem>
    )
}

export const dropdownItemStyles = tv({
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

export function DropdownItem(props: ListBoxItemProps) {
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
                    <span className="flex flex-1 items-center gap-2 truncate font-normal">
                        {keyToCategory[textValue as keyof typeof keyToCategory]}
                    </span>
                    <span className="flex w-5 items-center justify-end">
                        {isSelected && <Check className="h-4 w-4" />}
                    </span>
                </>
            ))}
        </AriaListBoxItem>
    )
}

export interface DropdownSectionProps<T> extends SectionProps<T> {
    title?: string
    items?: any
}

export function DropdownSection<T extends object>(
    props: DropdownSectionProps<T>,
) {
    return (
        <ListBoxSection className="first:-mt-[5px] after:block after:h-[5px] after:content-[''] last:after:hidden">
            <Header
                className="
                    sticky top-0 z-10
                    -mx-1 -mt-px px-4 py-2
                    truncate
                    border-y border-white/10
                    bg-white/10
                    text-sm font-semibold text-white/70
                    backdrop-blur-md
                "
            >
                {props.title}
            </Header>

            <Collection items={props.items}>{props.children}</Collection>
        </ListBoxSection>
    )
}
