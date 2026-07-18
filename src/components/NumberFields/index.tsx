import { ChevronDown, ChevronUp } from 'lucide-react'
import {
    NumberField as AriaNumberField,
    type NumberFieldProps as AriaNumberFieldProps,
    Button,
    type ButtonProps,
    type ValidationResult,
} from 'react-aria-components/NumberField'
import {
    Description,
    FieldError,
    FieldGroup,
    Label,
    fieldBorderStyles,
} from '@/components/Field'
import { composeTailwindRenderProps } from '@/utils/ui'
import Input from '@/components/Input'

interface NumberFieldProps extends AriaNumberFieldProps {
    label?: string
    description?: string
    errorMessage?: string | ((validation: ValidationResult) => string)
    placeholder?: string
}

export const NumberField = ({
    label,
    description,
    errorMessage,
    placeholder,
    ...props
}: NumberFieldProps) => {
    return (
        <AriaNumberField
            {...props}
            className={composeTailwindRenderProps(
                props.className,
                'group flex flex-col gap-1 font-sans',
            )}
        >
            <Label>{label}</Label>

            <FieldGroup>
                {(renderProps) => (
                    <>
                        <Input
                            className='w-20'
                            placeholder={placeholder}
                        />

                        <div
                            className={fieldBorderStyles({
                                ...renderProps,
                                class: 'flex flex-col border-s h-full',
                            })}
                        >
                            <StepperButton slot='increment'>
                                <ChevronUp
                                    aria-hidden
                                    className='w-4 h-4'
                                />
                            </StepperButton>

                            <div
                                className={fieldBorderStyles({
                                    ...renderProps,
                                    class: 'border-b',
                                })}
                            />

                            <StepperButton slot='decrement'>
                                <ChevronDown
                                    aria-hidden
                                    className='w-4 h-4'
                                />
                            </StepperButton>
                        </div>
                    </>
                )}
            </FieldGroup>

            {description && <Description>{description}</Description>}

            <FieldError>{errorMessage}</FieldError>
        </AriaNumberField>
    )
}

const StepperButton = (props: ButtonProps) => {
    return (
        <Button
            {...props}
            className='flex border-0 py-0 px-0.5 flex-1 box-border cursor-default text-neutral-400 bg-transparent pressed:bg-neutral-800 group-disabled:text-neutral-600 forced-colors:group-disabled:text-[GrayText] [-webkit-tap-highlight-color:transparent]'
        />
    )
}
