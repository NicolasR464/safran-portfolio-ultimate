import { auth } from '@/handlers/auth'
import ButtonSignIn from '@/components/buttons/auth/ButtonSignIn'
import ButtonSignOut from '@/components/buttons/auth/ButtonSignOut'
import TableProjects from '@/components/admin/projects/TableProjects'

const Admin = async () => {
    const session = await auth()

    return (
        <>
            {/* Signed in */}
            {session && session.user?.email && (
                <>
                    <div className='fixed right-0 top-(--header-height)'>
                        <ButtonSignOut />
                    </div>

                    <div className='text-white'>
                        <TableProjects />
                    </div>
                </>
            )}

            {/* Not signed in */}
            {!session && <ButtonSignIn />}
        </>
    )
}

export default Admin
