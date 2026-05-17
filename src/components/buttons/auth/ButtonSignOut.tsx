import { signOut } from '@/handlers/auth'
import ButtonGeneric from '@/components/buttons/ButtonGeneric'

const ButtonSignOut = () => {
    return (
        <form
            action={async () => {
                'use server'
                await signOut()
            }}
        >
            <ButtonGeneric type='submit'>Signout</ButtonGeneric>
        </form>
    )
}

export default ButtonSignOut
