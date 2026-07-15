import { XIcon } from 'lucide-react'
import React, { createContext, useContext } from 'react'
import {
    Tag as AriaTag,
    TagGroup as AriaTagGroup,
    type TagGroupProps as AriaTagGroupProps,
    type TagProps as AriaTagProps,
    Button,
    TagList,
    type TagListProps,
    Text,
} from 'react-aria-components/TagGroup'
import { composeRenderProps } from 'react-aria-components/composeRenderProps'
import { twMerge } from 'tailwind-merge'
import { tv } from 'tailwind-variants'
import { Description, Label } from '@/components/Field'
import { focusRing } from '@/utils/ui'

const colors = {
    gray: {
        default:
            'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-100 hover:border-neutral-400 dark:bg-neutral-900 dark:text-neutral-200 dark:border-neutral-600 dark:hover:bg-neutral-800',
        selected:
            'bg-neutral-700 text-white border-neutral-700 hover:bg-neutral-800 dark:bg-neutral-200 dark:text-neutral-950 dark:border-neutral-200 dark:hover:bg-white',
    },

    red: {
        default:
            'bg-red-100 text-red-700 border-red-300 hover:bg-red-200 hover:border-red-400 dark:bg-red-500/20 dark:text-red-300 dark:border-red-400/30 dark:hover:bg-red-500/30',
        selected:
            'bg-red-600 text-white border-red-600 hover:bg-red-700 dark:bg-red-500 dark:text-white dark:border-red-400',
    },

    orange: {
        default:
            'bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200 hover:border-orange-400 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-400/30 dark:hover:bg-orange-500/30',
        selected:
            'bg-orange-500 text-white border-orange-500 hover:bg-orange-600 dark:bg-orange-500 dark:text-white dark:border-orange-400',
    },

    amber: {
        default:
            'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200 hover:border-amber-400 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-400/30 dark:hover:bg-amber-500/30',
        selected:
            'bg-amber-500 text-neutral-950 border-amber-500 hover:bg-amber-600 dark:bg-amber-400 dark:text-neutral-950 dark:border-amber-300',
    },

    yellow: {
        default:
            'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200 hover:border-yellow-400 dark:bg-yellow-400/20 dark:text-yellow-300 dark:border-yellow-300/30 dark:hover:bg-yellow-400/30',
        selected:
            'bg-yellow-400 text-neutral-950 border-yellow-400 hover:bg-yellow-500 dark:bg-yellow-300 dark:text-neutral-950 dark:border-yellow-200',
    },

    lime: {
        default:
            'bg-lime-100 text-lime-800 border-lime-300 hover:bg-lime-200 hover:border-lime-400 dark:bg-lime-400/20 dark:text-lime-300 dark:border-lime-300/30 dark:hover:bg-lime-400/30',
        selected:
            'bg-lime-500 text-neutral-950 border-lime-500 hover:bg-lime-600 dark:bg-lime-400 dark:text-neutral-950 dark:border-lime-300',
    },

    green: {
        default:
            'bg-green-100 text-green-700 border-green-300 hover:bg-green-200 hover:border-green-400 dark:bg-green-500/20 dark:text-green-300 dark:border-green-400/30 dark:hover:bg-green-500/30',
        selected:
            'bg-green-600 text-white border-green-600 hover:bg-green-700 dark:bg-green-500 dark:text-white dark:border-green-400',
    },

    emerald: {
        default:
            'bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-200 hover:border-emerald-400 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-400/30 dark:hover:bg-emerald-500/30',
        selected:
            'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:text-white dark:border-emerald-400',
    },

    teal: {
        default:
            'bg-teal-100 text-teal-700 border-teal-300 hover:bg-teal-200 hover:border-teal-400 dark:bg-teal-500/20 dark:text-teal-300 dark:border-teal-400/30 dark:hover:bg-teal-500/30',
        selected:
            'bg-teal-600 text-white border-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:text-white dark:border-teal-400',
    },

    cyan: {
        default:
            'bg-cyan-100 text-cyan-700 border-cyan-300 hover:bg-cyan-200 hover:border-cyan-400 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-400/30 dark:hover:bg-cyan-500/30',
        selected:
            'bg-cyan-500 text-neutral-950 border-cyan-500 hover:bg-cyan-600 dark:bg-cyan-400 dark:text-neutral-950 dark:border-cyan-300',
    },

    sky: {
        default:
            'bg-sky-100 text-sky-700 border-sky-300 hover:bg-sky-200 hover:border-sky-400 dark:bg-sky-500/20 dark:text-sky-300 dark:border-sky-400/30 dark:hover:bg-sky-500/30',
        selected:
            'bg-sky-600 text-white border-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:text-white dark:border-sky-400',
    },

    blue: {
        default:
            'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200 hover:border-blue-400 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-400/30 dark:hover:bg-blue-500/30',
        selected:
            'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:text-white dark:border-blue-400',
    },

    indigo: {
        default:
            'bg-indigo-100 text-indigo-700 border-indigo-300 hover:bg-indigo-200 hover:border-indigo-400 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-400/30 dark:hover:bg-indigo-500/30',
        selected:
            'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:text-white dark:border-indigo-400',
    },

    violet: {
        default:
            'bg-violet-100 text-violet-700 border-violet-300 hover:bg-violet-200 hover:border-violet-400 dark:bg-violet-500/20 dark:text-violet-300 dark:border-violet-400/30 dark:hover:bg-violet-500/30',
        selected:
            'bg-violet-600 text-white border-violet-600 hover:bg-violet-700 dark:bg-violet-500 dark:text-white dark:border-violet-400',
    },

    purple: {
        default:
            'bg-purple-100 text-purple-700 border-purple-300 hover:bg-purple-200 hover:border-purple-400 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-400/30 dark:hover:bg-purple-500/30',
        selected:
            'bg-purple-600 text-white border-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:text-white dark:border-purple-400',
    },

    fuchsia: {
        default:
            'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-300 hover:bg-fuchsia-200 hover:border-fuchsia-400 dark:bg-fuchsia-500/20 dark:text-fuchsia-300 dark:border-fuchsia-400/30 dark:hover:bg-fuchsia-500/30',
        selected:
            'bg-fuchsia-600 text-white border-fuchsia-600 hover:bg-fuchsia-700 dark:bg-fuchsia-500 dark:text-white dark:border-fuchsia-400',
    },

    pink: {
        default:
            'bg-pink-100 text-pink-700 border-pink-300 hover:bg-pink-200 hover:border-pink-400 dark:bg-pink-500/20 dark:text-pink-300 dark:border-pink-400/30 dark:hover:bg-pink-500/30',
        selected:
            'bg-pink-600 text-white border-pink-600 hover:bg-pink-700 dark:bg-pink-500 dark:text-white dark:border-pink-400',
    },

    rose: {
        default:
            'bg-rose-100 text-rose-700 border-rose-300 hover:bg-rose-200 hover:border-rose-400 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-400/30 dark:hover:bg-rose-500/30',
        selected:
            'bg-rose-600 text-white border-rose-600 hover:bg-rose-700 dark:bg-rose-500 dark:text-white dark:border-rose-400',
    },
} as const

type Color = keyof typeof colors

const ColorContext = createContext<Color>('gray')

const colorNames = Object.keys(colors) as Color[]

const tagStyles = tv({
    extend: focusRing,
    base: [
        'flex max-w-fit items-center gap-1 rounded-full border',
        'px-3 py-0.5 text-xs font-sans',
        'cursor-default transition-colors duration-150',
        '[-webkit-tap-highlight-color:transparent]',
    ],
    variants: {
        color: Object.fromEntries(
            colorNames.map((color) => [color, '']),
        ) as Record<Color, string>,

        allowsRemoving: {
            true: 'pr-1',
        },

        isSelected: {
            true: '',
            false: '',
        },

        isDisabled: {
            true: [
                'cursor-not-allowed opacity-45',
                'bg-neutral-100 text-neutral-400 border-neutral-200',
                'dark:bg-neutral-900 dark:text-neutral-600 dark:border-neutral-700',
                'forced-colors:text-[GrayText]',
            ],
            false: '',
        },
    },

    compoundVariants: [
        ...colorNames.map((color) => ({
            color,
            isSelected: false,
            isDisabled: false,
            class: colors[color].default,
        })),

        ...colorNames.map((color) => ({
            color,
            isSelected: true,
            isDisabled: false,
            class: [
                colors[color].selected,
                'shadow-sm',
                'forced-colors:bg-[Highlight]',
                'forced-colors:text-[HighlightText]',
                'forced-color-adjust-none',
            ],
        })),
    ],
})

interface TagGroupProps<T>
    extends
        Omit<AriaTagGroupProps, 'children'>,
        Pick<TagListProps<T>, 'items' | 'children' | 'renderEmptyState'> {
    color?: Color
    label?: string
    description?: string
    errorMessage?: string
}

interface TagProps extends AriaTagProps {
    color?: Color
}

export const TagGroup = <T extends object>({
    label,
    description,
    errorMessage,
    items,
    children,
    renderEmptyState,
    ...props
}: TagGroupProps<T>) => {
    return (
        <AriaTagGroup
            {...props}
            className={twMerge(
                'flex flex-col gap-2 font-sans',
                props.className,
            )}
        >
            <Label>{label}</Label>
            <ColorContext.Provider value={props.color || 'gray'}>
                <TagList
                    items={items}
                    renderEmptyState={renderEmptyState}
                    className='flex flex-wrap gap-1'
                >
                    {children}
                </TagList>
            </ColorContext.Provider>
            {description && <Description>{description}</Description>}
            {errorMessage && (
                <Text
                    slot='errorMessage'
                    className='text-sm text-red-600'
                >
                    {errorMessage}
                </Text>
            )}
        </AriaTagGroup>
    )
}

const removeButtonStyles = tv({
    extend: focusRing,
    base: 'cursor-default rounded-full transition-[background-color] p-0.5 flex items-center justify-center bg-transparent text-[inherit] border-0 hover:bg-black/10 dark:hover:bg-white/10 pressed:bg-black/20 dark:pressed:bg-white/20',
})

export const Tag = ({ children, color, ...props }: TagProps) => {
    const textValue = typeof children === 'string' ? children : undefined
    const groupColor = useContext(ColorContext)

    return (
        <AriaTag
            textValue={textValue}
            {...props}
            className={composeRenderProps(
                props.className,
                (className, renderProps) =>
                    tagStyles({
                        ...renderProps,
                        className,
                        color: color || groupColor,
                    }),
            )}
        >
            {composeRenderProps(children, (children, { allowsRemoving }) => (
                <>
                    {children}
                    {allowsRemoving && (
                        <Button
                            slot='remove'
                            className={removeButtonStyles}
                        >
                            <XIcon
                                aria-hidden
                                className='w-3 h-3'
                            />
                        </Button>
                    )}
                </>
            ))}
        </AriaTag>
    )
}
