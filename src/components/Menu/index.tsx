import React from 'react'
import { Check, ChevronRight } from 'lucide-react'
import {
    Menu as AriaMenu,
    MenuItem as AriaMenuItem,
    MenuTrigger as AriaMenuTrigger,
    Separator,
    type MenuItemProps,
    type MenuProps,
    type MenuTriggerProps as AriaMenuTriggerProps,
    type SeparatorProps,
    PopoverProps,
} from 'react-aria-components/Menu'
import { composeRenderProps } from 'react-aria-components/composeRenderProps'
import { Popover } from '@/components/PopOver'

import { tv } from 'tailwind-variants'

const dropdownItemStyles = tv({
    base: [
        'group',
        'flex',
        'items-center',
        'gap-2',
        'rounded-md',
        'px-3',
        'py-2',
        'cursor-default',
        'outline-none',
        'transition-colors',
        'data-[focused]:bg-neutral-200',
        'dark:data-[focused]:bg-neutral-700',
        'data-[disabled]:opacity-50',
    ],
})

export const Menu = <T extends object>(props: MenuProps<T>) => (
    <AriaMenu<T>
        {...props}
        className='font-sans p-1 outline outline-0 max-h-[inherit] overflow-auto [clip-path:inset(0_0_0_0_round_.75rem)] empty:text-center empty:pb-2'
    />
)

export const MenuItem = (props: MenuItemProps) => {
    const textValue =
        props.textValue ||
        (typeof props.children === 'string' ? props.children : undefined)

    return (
        <AriaMenuItem
            textValue={textValue}
            {...props}
            className={dropdownItemStyles}
        >
            {composeRenderProps(
                props.children,
                (children, { selectionMode, isSelected, hasSubmenu }) => (
                    <>
                        {selectionMode !== 'none' && (
                            <span className='flex w-4 items-center'>
                                {isSelected && (
                                    <Check
                                        aria-hidden
                                        className='h-4 w-4'
                                    />
                                )}
                            </span>
                        )}

                        <span className='flex flex-1 items-center gap-2 truncate font-normal group-selected:font-semibold'>
                            {children}
                        </span>

                        {hasSubmenu && (
                            <ChevronRight
                                aria-hidden
                                className='absolute right-2 h-4 w-4'
                            />
                        )}
                    </>
                ),
            )}
        </AriaMenuItem>
    )
}

export const MenuSeparator = (props: SeparatorProps) => (
    <Separator
        {...props}
        className='mx-3 my-1 border-b border-neutral-300 dark:border-neutral-700'
    />
)

interface MenuTriggerProps extends AriaMenuTriggerProps {
    placement?: PopoverProps['placement']
}

export const MenuTrigger = (props: MenuTriggerProps) => {
    const [trigger, menu] = React.Children.toArray(props.children) as [
        React.ReactElement,
        React.ReactElement,
    ]

    return (
        <AriaMenuTrigger {...props}>
            {trigger}

            <Popover
                placement={props.placement}
                className='min-w-[150px]'
            >
                {menu}
            </Popover>
        </AriaMenuTrigger>
    )
}
