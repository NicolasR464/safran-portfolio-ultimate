import { composeTailwindRenderProps } from '@/utils/ui'

import { type InputProps, Input as RACInput } from 'react-aria-components/Input'

const Input = (props: InputProps) => {
    return (
        <RACInput
            {...props}
            className={composeTailwindRenderProps(
                props.className,
                'px-3 py-0 min-h-9 flex-1 min-w-0 border-0 outline outline-0 bg-white dark:bg-neutral-900 font-sans text-sm text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-600 dark:placeholder:text-neutral-400 disabled:text-neutral-200 dark:disabled:text-neutral-600 disabled:placeholder:text-neutral-200 dark:disabled:placeholder:text-neutral-600 [-webkit-tap-highlight-color:transparent]',
            )}
        />
    )
}

export default Input
