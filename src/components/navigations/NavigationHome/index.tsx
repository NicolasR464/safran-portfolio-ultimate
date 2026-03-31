'use client'

import ButtonIG from '@/components/buttons/ButtonIG'
import ButtonLink from '@/components/buttons/ButtonLink'
import ButtonMail from '@/components/buttons/ButtonMail'

const IslandHomeLinks = () => {
    return (
        <div className="w-full flex justify-center">
            <div className="fixed bottom-12 flex flex-wrap justify-center items-center gap-4">
                <ButtonLink text="Portfolio" href="/portfolio" />

                <ButtonLink text="About" href="/about" />

                <ButtonMail />

                <ButtonIG />
            </div>
        </div>
    )
}

export default IslandHomeLinks
