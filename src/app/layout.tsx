import type { Metadata } from 'next'
import { Poiret_One, Cairo } from 'next/font/google'
import './globals.css'
import { Separator } from '@/components/Separator'
import Link from 'next/link'
import StagingCapsule from '@/components/StagingCapsule'

const poiretOne = Poiret_One({
    variable: '--font-poiret-one',
    subsets: ['latin'],
    weight: '400',
})

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
                <header className="sticky top-0 z-[100] h-(--header-height) backdrop-blur-[2px]">
                    <div className="flex w-screen justify-between">
                        <Link href={'/'}>
                            <h1 className="ml-4 font-semibold h-full text-2xl text-white font-poiret ">
                                Safran Lecuivre
                            </h1>
                        </Link>

                        {process.env.IS_STAGING && <StagingCapsule />}
                    </div>
                    <Separator />
                </header>

                {children}
            </body>
        </html>
    )
}
