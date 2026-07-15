import {
    TextField as AriaTextField,
    type TextFieldProps as AriaTextFieldProps,
    type ValidationResult,
} from 'react-aria-components/TextField'
import { tv } from 'tailwind-variants'
import {
    Description,
    FieldError,
    Label,
    fieldBorderStyles,
} from '@/components/Field'

import { composeTailwindRenderProps, focusRing } from '@/utils/ui'
import Input from '@/components/Input'

const inputStyles = tv({
    extend: focusRing,
    base: 'border-1 rounded-lg min-h-9 font-sans text-sm py-0 px-3 box-border transition',
    variants: {
        isFocused: fieldBorderStyles.variants.isFocusWithin,
        isInvalid: fieldBorderStyles.variants.isInvalid,
        isDisabled: fieldBorderStyles.variants.isDisabled,
    },
})

interface TextFieldProps extends AriaTextFieldProps {
    label?: string
    description?: string
    placeholder?: string
    inputClassName?: string
    errorMessage?: string | ((validation: ValidationResult) => string)
}

const TextField = ({
    label,
    description,
    errorMessage,
    inputClassName,
    ...props
}: TextFieldProps) => {
    return (
        <AriaTextField
            {...props}
            className={composeTailwindRenderProps(
                props.className,
                'flex w-full flex-col gap-1 font-sans',
            )}
        >
            {label && <Label>{label}</Label>}

            <Input className={inputStyles({ className: inputClassName })} />

            {description && <Description>{description}</Description>}
            <FieldError>{errorMessage}</FieldError>
        </AriaTextField>
    )
}
export default TextField
