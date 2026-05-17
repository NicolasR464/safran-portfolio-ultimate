import { auth } from '@/handlers/auth'
import ButtonSignIn from '@/components/buttons/auth/ButtonSignIn'
import ButtonSignOut from '@/components/buttons/auth/ButtonSignOut'
import ProjectsTable from '@/components/admin/projects/ProjectsTable'

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
                        <ProjectsTable />
                    </div>
                </>
            )}

            {/* Not signed in */}
            {!session && <ButtonSignIn />}
        </>
    )
}

export default Admin
