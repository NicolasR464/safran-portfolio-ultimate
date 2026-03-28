import type { Metadata } from 'next'
import { Poiret_One, Cairo } from 'next/font/google'
import './globals.css'
import { Separator } from '@/components/Separator'

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
                    <h1 className="ml-4 font-semibold flex h-full items-center text-2xl text-white font-poiret ">
                        Safran Lecuivre
                    </h1>

                    <Separator />
                </header>

                {children}
            </body>
        </html>
    )
}
