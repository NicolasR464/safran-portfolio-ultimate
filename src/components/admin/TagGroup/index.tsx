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
            'bg-neutral-900 text-neutral-200 border-neutral-600 hover:bg-neutral-800',
        selected:
            'bg-neutral-200 text-neutral-950 border-neutral-200 hover:bg-white',
    },

    red: {
        default:
            'bg-red-500/20 text-red-300 border-red-400/30 hover:bg-red-500/30',
        selected: 'bg-red-500 text-white border-red-400',
    },

    orange: {
        default:
            'bg-orange-500/20 text-orange-300 border-orange-400/30 hover:bg-orange-500/30',
        selected: 'bg-orange-500 text-white border-orange-400',
    },

    amber: {
        default:
            'bg-amber-500/20 text-amber-300 border-amber-400/30 hover:bg-amber-500/30',
        selected: 'bg-amber-400 text-neutral-950 border-amber-300',
    },

    yellow: {
        default:
            'bg-yellow-400/20 text-yellow-300 border-yellow-300/30 hover:bg-yellow-400/30',
        selected: 'bg-yellow-300 text-neutral-950 border-yellow-200',
    },

    lime: {
        default:
            'bg-lime-400/20 text-lime-300 border-lime-300/30 hover:bg-lime-400/30',
        selected: 'bg-lime-400 text-neutral-950 border-lime-300',
    },

    green: {
        default:
            'bg-green-500/20 text-green-300 border-green-400/30 hover:bg-green-500/30',
        selected: 'bg-green-500 text-white border-green-400',
    },

    emerald: {
        default:
            'bg-emerald-500/20 text-emerald-300 border-emerald-400/30 hover:bg-emerald-500/30',
        selected: 'bg-emerald-500 text-white border-emerald-400',
    },

    teal: {
        default:
            'bg-teal-500/20 text-teal-300 border-teal-400/30 hover:bg-teal-500/30',
        selected: 'bg-teal-500 text-white border-teal-400',
    },

    cyan: {
        default:
            'bg-cyan-500/20 text-cyan-300 border-cyan-400/30 hover:bg-cyan-500/30',
        selected: 'bg-cyan-400 text-neutral-950 border-cyan-300',
    },

    sky: {
        default:
            'bg-sky-500/20 text-sky-300 border-sky-400/30 hover:bg-sky-500/30',
        selected: 'bg-sky-500 text-white border-sky-400',
    },

    blue: {
        default:
            'bg-blue-500/20 text-blue-300 border-blue-400/30 hover:bg-blue-500/30',
        selected: 'bg-blue-500 text-white border-blue-400',
    },

    indigo: {
        default:
            'bg-indigo-500/20 text-indigo-300 border-indigo-400/30 hover:bg-indigo-500/30',
        selected: 'bg-indigo-500 text-white border-indigo-400',
    },

    violet: {
        default:
            'bg-violet-500/20 text-violet-300 border-violet-400/30 hover:bg-violet-500/30',
        selected: 'bg-violet-500 text-white border-violet-400',
    },

    purple: {
        default:
            'bg-purple-500/20 text-purple-300 border-purple-400/30 hover:bg-purple-500/30',
        selected: 'bg-purple-500 text-white border-purple-400',
    },

    fuchsia: {
        default:
            'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-400/30 hover:bg-fuchsia-500/30',
        selected: 'bg-fuchsia-500 text-white border-fuchsia-400',
    },

    pink: {
        default:
            'bg-pink-500/20 text-pink-300 border-pink-400/30 hover:bg-pink-500/30',
        selected: 'bg-pink-500 text-white border-pink-400',
    },

    rose: {
        default:
            'bg-rose-500/20 text-rose-300 border-rose-400/30 hover:bg-rose-500/30',
        selected: 'bg-rose-500 text-white border-rose-400',
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
                'bg-neutral-900 text-neutral-600 border-neutral-700',
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
    base: 'cursor-default rounded-full transition-[background-color] p-0.5 flex items-center justify-center bg-transparent text-[inherit] border-0 hover:bg-white/10 pressed:bg-white/20',
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
