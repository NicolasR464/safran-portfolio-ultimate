import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'

const allowedEmails = process.env.AUTH_GOOGLE_ALLOWED_EMAILS?.split(',') ?? []

export const { handlers, signIn, signOut, auth } = NextAuth({
    trustHost: true,
    secret: process.env.AUTH_SECRET,
    providers: [
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
        }),
    ],

    callbacks: {
        signIn: async ({ profile }) =>
            !!profile?.email && allowedEmails.includes(profile.email),
    },
})
