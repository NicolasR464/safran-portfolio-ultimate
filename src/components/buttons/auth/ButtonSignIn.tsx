import { signIn } from '@/handlers/auth'

const ButtonSignIn = () => {
    return (
        <form
            action={async () => {
                'use server'
                await signIn('google')
            }}
        >
            <button type='submit'>Signin with Gmail</button>
        </form>
    )
}

export default ButtonSignIn
