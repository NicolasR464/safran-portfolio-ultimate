import { auth } from '@/handlers/auth'
import ButtonSignIn from '@/components/buttons/auth/ButtonSignIn'
import TabsAdmin from '@/components/admin/TabsAdmin'

const Admin = async () => {
    const session = await auth()

    return (
        <div className='flex w-full justify-center'>
            {/* Signed in */}
            {session && session.user?.email && (
                <>
                    <TabsAdmin />
                </>
            )}

            {/* Not signed in */}
            {!session && <ButtonSignIn />}
        </div>
    )
}

export default Admin
