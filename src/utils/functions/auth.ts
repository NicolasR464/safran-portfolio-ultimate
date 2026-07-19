// src/actions/auth.ts
'use server'

import { signOut } from '@/handlers/auth'

export const signOutAction = async () => {
    await signOut({
        redirectTo: '/',
    })
}
