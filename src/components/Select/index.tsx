import { ChevronUp } from 'lucide-react'
import React from 'react'
import {
    Select as AriaSelect,
    SelectProps as AriaSelectProps,
    Button,
    ListBox,
    ListBoxItemProps,
    SelectValue,
    ValidationResult,
} from 'react-aria-components'
import { tv } from 'tailwind-variants'
import { Description, FieldError, Label } from '@/components/Field'
import {
    DropdownItem,
    DropdownSection,
    DropdownSectionProps,
} from '@/components/ListBox'

import { composeTailwindRenderProps, focusRing } from '@/utils/ui'
import { Popover } from '@/components/PopOver'
import { useCategoriesStore } from '@/stores/portfolio/categories'
import { useThumbnailsStore } from '@/stores/portfolio/thumbnails'
import { keyToCategory } from '@/utils/constants'

const styles = tv({
    extend: focusRing,
    base: `
        flex w-full min-w-[180px] h-11 items-center gap-3
        rounded-full
        px-5 py-2.5
        text-left
        border border-white/30
        bg-white/[0.05]
        backdrop-blur-sm
        text-white
        transition-all duration-700
        [-webkit-tap-highlight-color:transparent]
    `,
    variants: {
        isDisabled: {
            false: `
                cursor-pointer
                hover:-translate-y-[1px]
                hover:brightness-110
            `,
            true: `
                cursor-not-allowed
                opacity-40
            `,
        },
    },
})

export interface SelectProps<
    T extends object,
    M extends 'single' | 'multiple',
> extends Omit<AriaSelectProps<T, M>, 'children'> {
    label?: string
    description?: string
    errorMessage?: string | ((validation: ValidationResult) => string)
    items?: Iterable<T>
    children: React.ReactNode | ((item: T) => React.ReactNode)
}

export function Select<
    T extends object,
    M extends 'single' | 'multiple' = 'single',
>({
    label,
    description,
    errorMessage,
    children,
    items,
    ...props
}: SelectProps<T, M>) {
    return (
        <AriaSelect
            {...props}
            className={composeTailwindRenderProps(
                props.className,
                'group relative flex flex-col gap-1',
            )}
        >
            {label && <Label>{label}</Label>}

            <Button className={styles}>
                <SelectValue className="flex-1 text-sm text-white/80">
                    {({ selectedText, defaultChildren }) =>
                        keyToCategory[selectedText] || defaultChildren
                    }
                </SelectValue>

                <ChevronUp
                    aria-hidden
                    className="h-4 w-4 shrink-0 text-white/70 transition-transform duration-700"
                />
            </Button>

            {description && <Description>{description}</Description>}
            <FieldError>{errorMessage}</FieldError>

            <Popover className="min-w-(--trigger-width)">
                <ListBox items={items}>{children}</ListBox>
            </Popover>
        </AriaSelect>
    )
}

export function SelectItem(props: ListBoxItemProps) {
    const setActiveCategory = useCategoriesStore(
        (state) => state.setActiveCategory,
    )
    const categoriesFetched = useThumbnailsStore(
        (state) => state.categoriesFetched,
    )
    const fetchNewCategory = useThumbnailsStore(
        (state) => state.fetchNewCategory,
    )

    const isCategoryAlreadyFetched = categoriesFetched.includes(props.children)

    const scrollToCategory = async () => {
        setActiveCategory(props.children)

        if (!isCategoryAlreadyFetched) {
            await fetchNewCategory(props.children)
        }

        const elementCategory = document.getElementById(props.children)
        if (!elementCategory) return

        const offset = 50

        const y =
            elementCategory.getBoundingClientRect().top +
            window.scrollY -
            offset

        window.scrollTo({
            top: y,
            behavior: 'smooth',
        })
    }

    return <DropdownItem onPress={scrollToCategory} {...props} />
}

export function SelectSection<T extends object>(
    props: DropdownSectionProps<T>,
) {
    return <DropdownSection {...props} />
}
