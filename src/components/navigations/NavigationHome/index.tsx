'use client'

import ButtonIG from '@/components/buttons/ButtonIG'
import ButtonLink from '@/components/buttons/ButtonLink'
import ButtonMail from '@/components/buttons/ButtonMail'
import { urls } from '@/utils/constants/urls'

/** Links for the home page */
const IslandHomeLinks = () => {
    return (
        <div className="w-full flex justify-center">
            <div className="fixed bottom-2 flex flex-wrap justify-center items-center gap-4">
                <ButtonLink text="Portfolio" href={urls.visitor.PORTFOLIO} />

                <ButtonLink text="About" href={urls.visitor.ABOUT} />

                <ButtonMail />

                <ButtonIG />
            </div>
        </div>
    )
}

export default IslandHomeLinks
