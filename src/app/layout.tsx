import type { Metadata } from 'next'
import { Poiret_One, Cairo } from 'next/font/google'
import './globals.css'

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
        <html lang="en" suppressHydrationWarning={true}>
            <body
                className={`${poiretOne.variable} ${cairo.variable} antialiased`}
            >
                <header className="sticky top-0">Safran Lecuivre</header>

                {children}
            </body>
        </html>
    )
}
