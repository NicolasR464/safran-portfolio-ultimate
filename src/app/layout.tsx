import './globals.css'
import '@mdxeditor/editor/style.css'

import type { Metadata } from 'next'
import { Cairo, Poiret_One } from 'next/font/google'
import Link from 'next/link'

import { Separator } from '@/components/Separator'
import StagingCapsule from '@/components/StagingCapsule'
import { auth } from '@/handlers/auth'
import { urls } from '@/utils/constants/urls'
import { Cog } from 'lucide-react'

import ButtonLink from '@/components/buttons/ButtonLink'

// Main Font
const poiretOne = Poiret_One({
    variable: '--font-poiret-one',
    subsets: ['latin'],
    weight: '400',
})

// Secondary Font
const cairo = Cairo({
    variable: '--font-cairo',
    subsets: ['latin'],
})

export const metadata: Metadata = {
    title: 'Safran Lecuivre',
    description: 'Cinematography portfolio of Safran Lecuivre',
}

const RootLayout = async ({
    children,
}: Readonly<{
    children: React.ReactNode
}>) => {
    const session = await auth()

    return (
        <html
            className='bg-black'
            lang='en'
            suppressHydrationWarning={true}
        >
            <body
                className={`${poiretOne.variable} ${cairo.variable} antialiased`}
            >
                <header className='fixed top-0 z-[100] h-(--header-height) backdrop-blur-sm'>
                    <div className='flex w-screen h-full justify-between items-center p-3'>
                        <Link href={'/'}>
                            <h1 className='font-semibold text-2xl text-white font-poiret '>
                                Safran Lecuivre
                            </h1>
                        </Link>

                        {/* If staging environment */}
                        {process.env.IS_STAGING === 'true' && (
                            <StagingCapsule />
                        )}

                        {/* If user logged in */}
                        {session?.user && (
                            <ButtonLink
                                href={urls.admin.MAIN}
                                logo={<Cog size={24} />}
                            />
                        )}
                    </div>

                    <Separator />
                </header>

                <div className='mt-[var(--header-height)]'>{children}</div>
            </body>
        </html>
    )
}

export default RootLayout
