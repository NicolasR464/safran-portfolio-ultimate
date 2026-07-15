import { type FormProps, Form as RACForm } from 'react-aria-components/Form'
import { twMerge } from 'tailwind-merge'

const Form = ({ className, ...props }: FormProps) => {
    return (
        <RACForm
            {...props}
            className={twMerge('gap-6', className)}
        />
    )
}

export default Form
