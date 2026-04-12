import './globals.css'

import type { Metadata } from 'next'
import { Cairo, Poiret_One } from 'next/font/google'
import Link from 'next/link'

import { Separator } from '@/components/Separator'
import StagingCapsule from '@/components/StagingCapsule'

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
    title: 'Safran Lecuivre Portfolio',
    description: 'Cinematography portfolio of Safran Lecuivre',
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html className="bg-black" lang="en" suppressHydrationWarning={true}>
            <body
                className={`${poiretOne.variable} ${cairo.variable} antialiased`}
            >
                <header className="sticky top-0 z-[10] h-(--header-height) backdrop-blur-sm">
                    <div className="flex w-screen h-full justify-between items-center">
                        <Link href={'/'}>
                            <h1 className="ml-4 font-semibold text-2xl text-white font-poiret ">
                                Safran Lecuivre
                            </h1>
                        </Link>

                        {!!process.env.IS_STAGING && <StagingCapsule />}
                    </div>

                    <Separator />
                </header>

                {children}
            </body>
        </html>
    )
}
