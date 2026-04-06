'use client'

import ButtonGeneric from '@/components/buttons/ButtonGeneric'
import ButtonLink from '@/components/buttons/ButtonLink'
import { localLogos } from '@/utils/constants'
import { urls } from '@/utils/constants/urls'
import Image from 'next/image'
import { Mail } from 'lucide-react'
import ButtonsGroup from '@/components/buttons/ButtonsGroup'

const handleMailPress = () => {
    window.location.href = `mailto:${process.env.NEXT_PUBLIC_MAIL_ADDRESS}`
}

/** Links on the Home page */
const NavigationsHome = () => {
    return (
        <ButtonsGroup>
            {/* Portfolio */}
            <ButtonLink text="Portfolio" href={urls.visitor.PORTFOLIO} />

            {/* About */}
            <ButtonLink text="About" href={urls.visitor.ABOUT} />

            {/* Mail */}
            <ButtonGeneric onPress={handleMailPress}>
                <Mail className="h-7 w-7 text-white" />
            </ButtonGeneric>

            {/* Instagram */}
            <ButtonLink
                logo={
                    <Image
                        src={localLogos.instagramLogo.SRC}
                        height={30}
                        width={30}
                        alt={localLogos.instagramLogo.ALT}
                    />
                }
                href={urls.INSTAGRAM}
            />
        </ButtonsGroup>
    )
}

export default NavigationsHome
