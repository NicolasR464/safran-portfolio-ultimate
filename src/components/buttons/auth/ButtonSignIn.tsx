import { signIn } from '@/handlers/auth'
import ButtonGeneric from '@/components/buttons/ButtonGeneric'

const ButtonSignIn = () => {
    return (
        <form
            action={async () => {
                'use server'
                await signIn('google')
            }}
        >
            <ButtonGeneric type='submit'>Signin with Gmail</ButtonGeneric>
        </form>
    )
}

export default ButtonSignIn
