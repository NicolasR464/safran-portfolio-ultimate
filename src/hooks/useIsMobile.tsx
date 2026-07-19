import { useEffect, useState } from 'react'

import { type ScreenType } from '@/types/video/schema'

const getScreenType = (): ScreenType => {
    const width = window.innerWidth

    if (width < 500) {
        return 'phone'
    }

    if (width < 1024) {
        return 'tablet'
    }

    return 'computer'
}

const useScreenType = (): ScreenType => {
    const [screenType, setScreenType] = useState<ScreenType>('computer')

    useEffect(() => {
        const handleResize = () => {
            setScreenType(getScreenType())
        }

        handleResize()

        window.addEventListener('resize', handleResize)

        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    return screenType
}

export default useScreenType
