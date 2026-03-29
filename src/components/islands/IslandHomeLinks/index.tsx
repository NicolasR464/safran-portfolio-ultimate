'use client'

import { BadgeInfo } from 'lucide-react'

import ButtonLink from '@/components/buttons/ButtonLink'
import ButtonMail from '@/components/buttons/ButtonMail'

const IslandHomeLinks = () => {
    return (
        <div className="w-full flex justify-center">
            <div className="fixed bottom-12 flex flex-wrap justify-center items-center gap-4">
                <ButtonLink name="Portfolio" href="/portfolio" />

                <ButtonLink logo={BadgeInfo} href="/about" />

                <ButtonMail />
            </div>
        </div>
    )
}

export default IslandHomeLinks
